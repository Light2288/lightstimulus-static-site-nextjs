import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  renderWithProviders,
  screen,
  waitFor,
  fireEvent,
  act,
  waitForKbarIndex,
} from '../../test/renderWithProviders'
import { mockNavigation, resetNavigationMock } from '../../test/mockNavigation'
import { mockFetch, restoreFetch } from '../../test/mockFetch'
import Header from './Header'
import headerNavLinks from '@/data/headerNavLinks'
import siteMetadata from '@/data/siteMetadata'
import en from '@/locales/en.json'
import itLocale from '@/locales/it.json'

/**
 * Characterisation tests for the sticky site header.
 *
 * ## What the two scroll effects actually do
 * Despite the doc comment on the component, there is **no IntersectionObserver
 * and no hero sentinel** in the implementation. Two independent `scroll`
 * listeners (both `{ passive: true }`) drive two independent pieces of state:
 *
 * 1. **solid/glass** — `setIsSolid(window.scrollY > 40)`. Runs once eagerly on
 *    mount, then on every scroll. Swaps `bg-transparent` for
 *    `backdrop-blur-… bg-… shadow-md`.
 * 2. **hide/show** — coalesced through one `requestAnimationFrame`. Compares the
 *    current `scrollY` against the previous one and only acts when
 *    `Math.abs(delta) > 6` (so a 6px move is ignored). Within that, it hides
 *    (`-translate-y-full`) only when scrolling *down* **and** already past
 *    80px; anything else shows the header (`translate-y-0`).
 *
 * The rAF coalescing means several scroll events inside one frame collapse into
 * a single comparison against the *latest* `scrollY`, so tests advance one frame
 * per logical scroll step.
 *
 * ## Harness notes
 * - `SearchButton` needs kbar's context, so `withSearch: true` is mandatory and
 *   `fetch` must be stubbed (kbar loads `/search.json` on mount).
 * - `MobileNav` arrives via `next/dynamic({ ssr: false })`, so the header first
 *   renders the loading fallback (one `Toggle Menu` button) and only later the
 *   real component (two — the hamburger plus the panel close button). Tests wait
 *   for the second button before asserting anything about it.
 */

/** Set `window.scrollY` without dispatching anything. */
function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y, writable: true })
}

/** Move to `y`, fire a scroll event and let the rAF callback run. */
async function scrollTo(y: number) {
  setScrollY(y)
  await act(async () => {
    fireEvent.scroll(window)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

const header = () => screen.getByRole('banner')

/** hrefs of the desktop nav anchors, in document order. */
const navHrefs = () =>
  Array.from(screen.getByRole('navigation').querySelectorAll('a')).map((a) =>
    a.getAttribute('href')
  )

/** Visible labels of the desktop nav anchors, in document order. */
const navLabels = () =>
  Array.from(screen.getByRole('navigation').querySelectorAll('a')).map((a) => a.textContent ?? '')

const isHidden = () => header().className.includes('-translate-y-full')
const isSolid = () => header().className.includes('shadow-md')

/** Mount the header and wait for the dynamic `MobileNav` chunk to land. */
async function mountHeader(locale: 'en' | 'it' = 'en') {
  const view = renderWithProviders(<Header />, { withSearch: true, locale })
  await waitFor(() => expect(screen.getAllByLabelText('Toggle Menu')).toHaveLength(2))
  await waitForKbarIndex()
  return view
}

beforeEach(() => {
  mockNavigation({ pathname: '/' })
  mockFetch({ body: '[]' })
  setScrollY(0)
})

afterEach(() => {
  resetNavigationMock()
  restoreFetch()
  setScrollY(0)
})

describe('Header', () => {
  describe('structure and accessibility', () => {
    it('renders a banner landmark labelled "Main Navigation"', async () => {
      await mountHeader()

      expect(header()).toHaveAttribute('aria-label', 'Main Navigation')
    })

    it('is fixed to the top of the viewport', async () => {
      await mountHeader()

      expect(header()).toHaveClass('fixed', 'left-0', 'right-0', 'z-50')
      expect(header()).toHaveStyle({ top: '0px' })
    })

    it('links the logo home with the site header title as its label', async () => {
      await mountHeader()

      const logoLink = screen.getByRole('link', { name: siteMetadata.headerTitle })
      expect(logoLink).toHaveAttribute('href', '/')
    })

    it('renders the static logo mark inside the home link', async () => {
      await mountHeader()

      const logoLink = screen.getByRole('link', { name: siteMetadata.headerTitle })
      expect(logoLink.querySelector('[data-testid="svg-mock"]')).toBeInTheDocument()
    })

    it('renders the desktop nav, hidden below the sm breakpoint', async () => {
      await mountHeader()

      expect(screen.getByRole('navigation')).toHaveClass('hidden', 'sm:flex')
    })
  })

  describe('desktop nav links', () => {
    it('excludes the home link', async () => {
      await mountHeader()

      expect(navHrefs()).not.toContain('/')
    })

    it('renders every non-home link from headerNavLinks', async () => {
      await mountHeader()

      expect(navHrefs()).toEqual(
        headerNavLinks.filter((link) => link.href !== '/').map((link) => link.href)
      )
    })

    it('renders exactly four desktop links, one fewer than headerNavLinks', async () => {
      await mountHeader()

      expect(navHrefs()).toHaveLength(headerNavLinks.length - 1)
    })

    it('labels the links with their English translations', async () => {
      await mountHeader()

      expect(navLabels()).toEqual([en.nav.projects, en.nav.blog, en.nav.about, en.nav.contact])
    })

    it('labels the links with their Italian translations', async () => {
      await mountHeader('it')

      await waitFor(() =>
        expect(navLabels()).toEqual([
          itLocale.nav.projects,
          itLocale.nav.blog,
          itLocale.nav.about,
          itLocale.nav.contact,
        ])
      )
    })

    it('keeps the hrefs identical across locales', async () => {
      await mountHeader('it')
      await waitFor(() => expect(navLabels()).toContain(itLocale.nav.projects))

      expect(navHrefs()).toEqual(['/projects', '/blog', '/about', '/contact'])
    })

    it('never leaks a raw translation key', async () => {
      await mountHeader()

      expect(navLabels().some((label) => label.startsWith('nav.'))).toBe(false)
    })
  })

  describe('action controls', () => {
    it('renders the kbar search button', async () => {
      await mountHeader()

      expect(screen.getByLabelText('Search')).toBeInTheDocument()
    })

    it('renders the language toggle', async () => {
      await mountHeader()

      expect(screen.getByLabelText('Switch to Italian')).toBeInTheDocument()
    })

    it('renders the Italian-flavoured language toggle label under the it locale', async () => {
      await mountHeader('it')

      expect(await screen.findByLabelText("Passa all'inglese")).toBeInTheDocument()
    })

    it('renders the theme toggle', async () => {
      await mountHeader()

      // The default theme is `system`, whose next step is light mode.
      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
    })

    it('renders the dynamically imported mobile nav trigger', async () => {
      await mountHeader()

      const toggles = screen.getAllByLabelText('Toggle Menu')
      expect(toggles[0]).toHaveClass('sm:hidden')
    })

    it('renders all four controls together', async () => {
      await mountHeader()

      expect(
        Array.from(header().querySelectorAll('button')).map((b) => b.getAttribute('aria-label'))
      ).toEqual(['Search', 'Switch to Italian', 'Switch to light mode', 'Toggle Menu'])
    })
  })

  describe('solid / glass background', () => {
    it('starts transparent at the top of the page', async () => {
      await mountHeader()

      expect(header()).toHaveClass('bg-transparent')
      expect(isSolid()).toBe(false)
    })

    it('stays transparent at exactly 40px, because the check is strictly greater', async () => {
      await mountHeader()

      await scrollTo(40)

      expect(header()).toHaveClass('bg-transparent')
      expect(isSolid()).toBe(false)
    })

    it('becomes solid at 41px', async () => {
      await mountHeader()

      await scrollTo(41)

      expect(isSolid()).toBe(true)
      expect(header()).not.toHaveClass('bg-transparent')
    })

    it('applies the glass background tokens when solid', async () => {
      await mountHeader()

      await scrollTo(200)

      expect(header()).toHaveClass(
        'backdrop-blur-[var(--glass-blur)]',
        'bg-[color:var(--glass-bg-solid)]',
        'shadow-md'
      )
    })

    it('returns to transparent when scrolled back to the top', async () => {
      await mountHeader()

      await scrollTo(300)
      expect(isSolid()).toBe(true)

      await scrollTo(0)
      expect(isSolid()).toBe(false)
      expect(header()).toHaveClass('bg-transparent')
    })

    it('reads the scroll position eagerly on mount, unlike the hide/show effect', async () => {
      setScrollY(500)

      await mountHeader()

      // `onScrollSolid()` is invoked once directly inside the effect.
      expect(isSolid()).toBe(true)
      expect(isHidden()).toBe(false)
    })
  })

  describe('hide on scroll down / show on scroll up', () => {
    it('starts visible', async () => {
      await mountHeader()

      expect(header()).toHaveClass('translate-y-0')
      expect(isHidden()).toBe(false)
    })

    it('hides when scrolling down past 80px', async () => {
      await mountHeader()

      await scrollTo(200)

      expect(isHidden()).toBe(true)
      expect(header()).not.toHaveClass('translate-y-0')
    })

    it('shows again when scrolling up', async () => {
      await mountHeader()

      await scrollTo(200)
      expect(isHidden()).toBe(true)

      await scrollTo(120)
      expect(isHidden()).toBe(false)
      expect(header()).toHaveClass('translate-y-0')
    })

    it('stays visible when scrolling down but still at or below 80px', async () => {
      await mountHeader()

      // Delta is 80 (> 6), direction is down, but `current > 80` is false.
      await scrollTo(80)

      expect(isHidden()).toBe(false)
    })

    it('hides as soon as the position clears 80px', async () => {
      await mountHeader()

      await scrollTo(81)

      expect(isHidden()).toBe(true)
    })

    it('ignores a 6px downward jitter', async () => {
      await mountHeader()

      await scrollTo(200)
      expect(isHidden()).toBe(true)
      await scrollTo(150)
      expect(isHidden()).toBe(false)

      // Delta of exactly +6 fails `Math.abs(delta) > 6`, so nothing changes.
      await scrollTo(156)

      expect(isHidden()).toBe(false)
    })

    it('acts on a 7px downward move', async () => {
      await mountHeader()

      await scrollTo(200)
      await scrollTo(150)
      expect(isHidden()).toBe(false)

      await scrollTo(157)

      expect(isHidden()).toBe(true)
    })

    it('ignores a 6px upward jitter', async () => {
      await mountHeader()

      await scrollTo(200)
      expect(isHidden()).toBe(true)

      // Delta of exactly -6: still below the jitter threshold.
      await scrollTo(194)

      expect(isHidden()).toBe(true)
    })

    it('acts on a 7px upward move', async () => {
      await mountHeader()

      await scrollTo(200)
      expect(isHidden()).toBe(true)

      await scrollTo(193)

      expect(isHidden()).toBe(false)
    })

    /**
     * The `ticking` flag drops every scroll event until the queued rAF fires,
     * and the callback then reads `window.scrollY` fresh. A burst of events in
     * one frame therefore collapses to a single comparison against the final
     * position — the intermediate values are never seen.
     */
    it('coalesces a burst of scroll events into one rAF comparison', async () => {
      await mountHeader()

      setScrollY(500)
      fireEvent.scroll(window)
      setScrollY(0)
      fireEvent.scroll(window)
      await act(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      })

      // Only the final position (0) is compared against the last known 0, so
      // the delta is 0 and the header stays visible.
      expect(isHidden()).toBe(false)
      expect(isSolid()).toBe(false)
    })

    it('treats a mount at a deep scroll position as "scrolled up"', async () => {
      setScrollY(600)

      await mountHeader()
      // `lastScrollYRef` starts at 0, so the first event reads delta +600 and
      // hides the header — the position at mount is never a baseline.
      await scrollTo(600)

      expect(isHidden()).toBe(true)
    })

    it('keeps the hide/show state independent of the solid state', async () => {
      await mountHeader()

      await scrollTo(300)
      expect(isHidden()).toBe(true)
      expect(isSolid()).toBe(true)

      await scrollTo(200)
      // Scrolling up reveals the header while it remains solid.
      expect(isHidden()).toBe(false)
      expect(isSolid()).toBe(true)
    })

    it('always keeps the transform transition classes', async () => {
      await mountHeader()

      await scrollTo(400)

      expect(header()).toHaveClass(
        'transition-transform',
        'duration-300',
        'ease-out',
        'will-change-transform'
      )
    })
  })

  describe('listener lifecycle', () => {
    it('registers two passive scroll listeners', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      await mountHeader()

      const scrollCalls = addSpy.mock.calls.filter(([event]) => event === 'scroll')
      expect(scrollCalls).toHaveLength(2)
      expect(scrollCalls.map(([, , options]) => options)).toEqual([
        { passive: true },
        { passive: true },
      ])
      addSpy.mockRestore()
    })

    it('removes both scroll listeners on unmount', async () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = await mountHeader()
      unmount()

      expect(removeSpy.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(2)
      removeSpy.mockRestore()
    })

    it('removes exactly the handlers it registered', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = await mountHeader()
      const added = addSpy.mock.calls.filter(([event]) => event === 'scroll').map(([, fn]) => fn)
      unmount()
      const removed = removeSpy.mock.calls
        .filter(([event]) => event === 'scroll')
        .map(([, fn]) => fn)

      expect(new Set(removed)).toEqual(new Set(added))
      addSpy.mockRestore()
      removeSpy.mockRestore()
    })

    it('does not re-register listeners across re-renders', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      const { rerender } = await mountHeader()
      rerender(<Header />)

      // Both effects have empty dependency arrays.
      expect(addSpy.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(2)
      addSpy.mockRestore()
    })

    it('stops responding to scroll events once unmounted', async () => {
      const { unmount } = await mountHeader()
      unmount()

      await act(async () => {
        setScrollY(900)
        fireEvent.scroll(window)
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      })

      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })
  })
})
