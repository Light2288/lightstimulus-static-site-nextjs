import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderWithProviders, act, cleanup, screen } from '../../test/renderWithProviders'
import { mockReducedMotion, resetMatchMedia } from '../../test/mockMatchMedia'
import Taglines from './Taglines'
import en from '@/locales/en.json'
import itLocale from '@/locales/it.json'

/**
 * Characterisation tests for `Taglines` — the hero's rotating one-liner.
 *
 * ## What the component does
 * It reads `hero.taglines.0..6` from the active locale, shows one at a time,
 * and every `INTERVAL` (5000 ms) fades the current line out, then after a
 * nested `FADE_DURATION` (500 ms) `setTimeout` advances the index modulo 7 and
 * fades the next one in. The incoming line is revealed by a `clip-path` wipe
 * whose duration is `max(nonWhitespaceChars * 0.04, 0.3)` seconds. With
 * `prefers-reduced-motion` the interval is never started and the wipe is
 * instant.
 *
 * ## How these tests drive time
 * Three independent clocks have to line up, which dictates the harness:
 *
 * 1. **The component's own `setInterval` / `setTimeout`** — faked so the
 *    5000 ms cycle is instant.
 * 2. **`motion`'s frameloop**, which is driven by `requestAnimationFrame` and
 *    timestamped with `performance.now()`. Both are faked *as well*, otherwise
 *    `rAF` never fires under `vi.advanceTimersByTime` and the `clip-path` wipe
 *    stays frozen at its initial value. See `FAKED_CLOCKS`.
 * 3. **React's commit phase** — every advance therefore happens inside
 *    `act()`, which is also what keeps the suite free of `act(...)` warnings.
 *
 * Time is always advanced in small fixed steps (`advanceBy`) rather than one
 * big jump: a single `advanceTimersByTime(5500)` runs the interval callback and
 * the nested fade timeout without ever letting the frameloop tick in between,
 * so `AnimatePresence` never completes its exit and the tagline appears not to
 * change at all. Stepping keeps the frameloop and the component clock in sync
 * and makes every assertion below reproducible.
 *
 * `afterEach` drains any timer still queued **while the fake clock is still
 * installed** (a `motion` frameloop batch usually survives unmount by one
 * frame), so nothing leaks into the next test.
 *
 * ## Deliberate limitation
 * The `0.3` s floor in `typeDuration` is unreachable with the shipped copy: the
 * shortest tagline (`hero.taglines.1`, EN) has 23 non-whitespace characters →
 * 0.92 s, so `Math.max` always picks the per-character term. The floor is
 * therefore *not* asserted; only the per-character scaling is.
 */

/**
 * Everything the component *and* `motion`'s frameloop need faked.
 *
 * `Date` is intentionally left real: nothing here depends on wall-clock time
 * and faking it adds no value.
 */
const FAKED_CLOCKS = [
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'performance',
] as const

const INTERVAL = 5000
const FADE_MS = 500
const CHAR_DELAY = 0.04

/** The seven taglines per locale, in index order. */
const TAGLINES = {
  en: Array.from({ length: 7 }, (_, i) => en.hero.taglines[String(i) as '0']),
  it: Array.from({ length: 7 }, (_, i) => itLocale.hero.taglines[String(i) as '0']),
}

/** `typeDuration` in ms for a given tagline, per the source formula. */
function expectedWipeMs(tagline: string) {
  return Math.max(tagline.replace(/\s/g, '').length * CHAR_DELAY, 0.3) * 1000
}

function installFakeClocks() {
  vi.useFakeTimers({ toFake: [...FAKED_CLOCKS] })
}

/**
 * Advance the fake clock in small steps, flushing React after each one so the
 * `motion` frameloop gets to run between the interval tick and the nested fade
 * timeout.
 */
async function advanceBy(total: number, step = 10) {
  for (let elapsed = 0; elapsed < total; elapsed += step) {
    await act(async () => {
      vi.advanceTimersByTime(Math.min(step, total - elapsed))
    })
  }
}

/** Render and hand back accessors for the section, its text and the wipe node. */
function renderTaglines(locale: 'en' | 'it' = 'en') {
  const view = renderWithProviders(<Taglines />, { locale })
  const section = () => view.container.querySelector('section') as HTMLElement
  return {
    ...view,
    section,
    /** The currently displayed tagline (empty string while nothing is mounted). */
    text: () => section().textContent ?? '',
    /** The inner element carrying the `clip-path` typewriter wipe. */
    wipe: () => section().querySelector('div > div') as HTMLElement | null,
  }
}

/** The revealed-from-the-right inset percentage of the wipe, or `NaN`. */
function wipePercent(el: HTMLElement | null) {
  if (!el) return NaN
  const match = /inset\(0 ([\d.]+)% 0 0\)/.exec(el.style.clipPath)
  return match ? parseFloat(match[1]) : NaN
}

/**
 * Step time forward until the displayed tagline changes, returning the new
 * text. Throws rather than hanging if the cycle never fires.
 */
async function advanceToNextTagline(view: ReturnType<typeof renderTaglines>) {
  const before = view.text()
  for (let i = 0; i < 200; i++) {
    await advanceBy(50, 10)
    const now = view.text()
    if (now && now !== before) return now
  }
  throw new Error(`the tagline never advanced away from "${before}"`)
}

/**
 * Measure how long the `clip-path` wipe takes for `tagline`, from the first
 * sampled frame where it has left 100% to the frame it reaches 0%.
 *
 * Measuring the *span* (rather than "time since mount") makes the result
 * independent of when the wipe happened to start, which matters for taglines
 * reached after a fade transition.
 */
async function measureWipeMs(view: ReturnType<typeof renderTaglines>, tagline: string) {
  let start = -1
  for (let t = 0; t <= 12000; t += 10) {
    await advanceBy(10, 10)
    if (view.wipe()?.textContent !== tagline) continue
    const percent = wipePercent(view.wipe())
    if (start < 0 && percent < 100 && percent > 0) start = t
    if (start >= 0 && percent <= 0.5) return t - start
  }
  throw new Error(`the wipe for "${tagline}" never completed`)
}

afterEach(async () => {
  // Unmount first, then let any frameloop batch still queued on the fake clock
  // run to completion, so no timer survives into the next test.
  cleanup()
  if (vi.isFakeTimers()) {
    await act(async () => {
      vi.advanceTimersByTime(20_000)
    })
    expect(vi.getTimerCount()).toBe(0)
  }
  vi.useRealTimers()
  resetMatchMedia()
})

describe('Taglines', () => {
  describe('initial render', () => {
    it('shows the first English tagline', async () => {
      renderTaglines('en')

      expect(await screen.findByText(TAGLINES.en[0])).toBeInTheDocument()
    })

    it('shows the first Italian tagline once the locale effect applies', async () => {
      renderTaglines('it')

      expect(await screen.findByText(TAGLINES.it[0])).toBeInTheDocument()
    })

    it('shows exactly one tagline at a time', async () => {
      const view = renderTaglines('en')

      await screen.findByText(TAGLINES.en[0])
      expect(view.section().children).toHaveLength(1)
      for (const other of TAGLINES.en.slice(1)) {
        expect(screen.queryByText(other)).not.toBeInTheDocument()
      }
    })

    it('starts the wipe fully clipped when motion is allowed', () => {
      installFakeClocks()
      const view = renderTaglines('en')

      expect(view.wipe()).toHaveStyle({ clipPath: 'inset(0 100% 0 0)' })
    })
  })

  describe('cycling on the 5000ms interval', () => {
    it('keeps the current tagline during the 500ms fade-out', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      // The interval has fired (fade-out started) but the nested fade timeout
      // that swaps the index has not.
      await advanceBy(INTERVAL + 250)

      expect(view.text()).toBe(TAGLINES.en[0])
    })

    it('swaps to the next tagline only after the nested fade timeout', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      await advanceBy(INTERVAL + FADE_MS - 10)
      expect(view.text()).toBe(TAGLINES.en[0])

      await advanceBy(500)
      expect(view.text()).toBe(TAGLINES.en[1])
    })

    it('walks through all seven English taglines and wraps to the first', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      const seen = [view.text()]
      // Seven transitions: taglines 1..6 plus the wrap back to 0.
      for (let i = 0; i < 7; i++) seen.push(await advanceToNextTagline(view))

      expect(seen).toEqual([...TAGLINES.en, TAGLINES.en[0]])
    })

    it('walks through all seven Italian taglines and wraps to the first', async () => {
      installFakeClocks()
      const view = renderTaglines('it')

      // The locale lands in a mount effect; the first frame still shows EN.
      await advanceBy(100)
      expect(view.text()).toBe(TAGLINES.it[0])

      const seen = [view.text()]
      for (let i = 0; i < 7; i++) seen.push(await advanceToNextTagline(view))

      expect(seen).toEqual([...TAGLINES.it, TAGLINES.it[0]])
    })

    it('never renders more than one tagline while transitioning', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      for (let t = 0; t < 12_000; t += 10) {
        await advanceBy(10, 10)
        expect(view.section().children.length).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('typeDuration = max(nonWhitespaceChars * 0.04, 0.3)', () => {
    /**
     * The computed duration is only observable through how long `motion` takes
     * to animate `clip-path` from `inset(0 100% 0 0)` to `inset(0 0% 0 0)`.
     * Sampling every 10 ms means the measured span lands within one 10 ms
     * bucket plus one frame (~17 ms) of the nominal value, hence the tolerance.
     */
    const TOLERANCE_MS = 60

    it('scales the wipe with the first English tagline length (43 chars → 1.72s)', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      const measured = await measureWipeMs(view, TAGLINES.en[0])

      expect(expectedWipeMs(TAGLINES.en[0])).toBe(1720)
      expect(Math.abs(measured - 1720)).toBeLessThanOrEqual(TOLERANCE_MS)
    })

    it('gives the shorter second English tagline a shorter wipe (23 chars → 0.92s)', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      const measured = await measureWipeMs(view, TAGLINES.en[1])

      expect(expectedWipeMs(TAGLINES.en[1])).toBe(920)
      expect(Math.abs(measured - 920)).toBeLessThanOrEqual(TOLERANCE_MS)
    })

    it('gives the longer Italian first tagline a longer wipe (50 chars → 2.0s)', async () => {
      installFakeClocks()
      const view = renderTaglines('it')

      const measured = await measureWipeMs(view, TAGLINES.it[0])

      expect(expectedWipeMs(TAGLINES.it[0])).toBe(2000)
      expect(Math.abs(measured - 2000)).toBeLessThanOrEqual(TOLERANCE_MS)
    })

    it('reveals the wipe monotonically left-to-right', async () => {
      installFakeClocks()
      const view = renderTaglines('en')

      let previous = 100
      for (let t = 0; t < 2000; t += 10) {
        await advanceBy(10, 10)
        const percent = wipePercent(view.wipe())
        expect(percent).toBeLessThanOrEqual(previous)
        previous = percent
      }
      expect(previous).toBeLessThanOrEqual(1)
    })
  })

  describe('prefers-reduced-motion', () => {
    it('renders a single static tagline', async () => {
      mockReducedMotion()

      renderTaglines('en')

      expect(await screen.findByText(TAGLINES.en[0])).toBeInTheDocument()
    })

    it('never starts the cycling interval, so advancing time changes nothing', async () => {
      mockReducedMotion()
      installFakeClocks()
      const view = renderTaglines('en')

      expect(view.text()).toBe(TAGLINES.en[0])

      await advanceBy(60_000, 500)

      // No `setInterval` was ever registered, so once the mount-time frameloop
      // batch has drained there is nothing left to fire.
      expect(vi.getTimerCount()).toBe(0)
      expect(view.text()).toBe(TAGLINES.en[0])
      for (const other of TAGLINES.en.slice(1)) {
        expect(screen.queryByText(other)).not.toBeInTheDocument()
      }
    })

    it('skips the typewriter wipe entirely', async () => {
      mockReducedMotion()
      installFakeClocks()
      const view = renderTaglines('en')

      expect(view.wipe()).toHaveStyle({ clipPath: 'inset(0 0% 0 0)' })

      await advanceBy(1000, 50)

      expect(view.wipe()).toHaveStyle({ clipPath: 'inset(0 0% 0 0)' })
    })

    it('still honours the Italian locale', async () => {
      mockReducedMotion()

      renderTaglines('it')

      expect(await screen.findByText(TAGLINES.it[0])).toBeInTheDocument()
    })

    it('restores the cycling branch once matchMedia is reset', async () => {
      // Guards the mockMatchMedia contract: both reduced-motion directions must
      // work inside one file, in either order.
      installFakeClocks()
      const view = renderTaglines('en')

      expect(await advanceToNextTagline(view)).toBe(TAGLINES.en[1])
    })
  })

  describe('teardown', () => {
    it('clears the interval on unmount and stops advancing', async () => {
      installFakeClocks()
      const view = renderTaglines('en')
      await advanceBy(3000, 50)

      view.unmount()
      // One frameloop batch may still be queued; draining it must leave nothing.
      await advanceBy(200, 10)

      expect(vi.getTimerCount()).toBe(0)
      await advanceBy(20_000, 500)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('leaves no timer pending when unmounted mid-transition', async () => {
      installFakeClocks()
      const view = renderTaglines('en')
      // Unmount while the fade-out timeout is in flight.
      await advanceBy(INTERVAL + 100)

      view.unmount()
      await advanceBy(1000, 10)

      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
