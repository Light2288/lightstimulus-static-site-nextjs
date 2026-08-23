import { describe, it, expect, afterEach } from 'vitest'
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test/renderWithProviders'
import { mockReducedMotion, resetMatchMedia } from '../../test/mockMatchMedia'
import FixedAnalogyParagraph from './FixedAnalogyParagraph'
import en from '@/locales/en.json'
import itLocale from '@/locales/it.json'

/**
 * Characterisation tests for `FixedAnalogyParagraph` — the hero's analogy copy
 * with cursor-reactive highlighted words.
 *
 * ## What the component does
 * It takes `hero.fixed_paragraph` from the active locale and, in three
 * module-private helpers (`buildHighlightRanges`, `buildHighlightedHtml`,
 * `escapeHtml`), turns it into an HTML string injected via
 * `dangerouslySetInnerHTML`: matched sentences and words become
 * `<span class="highlight-word" data-text="…">`, and each `\n`-separated line
 * becomes its own `<p>`. A mount effect then attaches native
 * `mousemove` / `mouseenter` / `mouseleave` listeners to every
 * `.highlight-word`, which write CSS custom properties and toggle
 * `is-hovered`. Under `prefers-reduced-motion` neither the effect nor the
 * React-level container handlers do anything.
 *
 * ## Testing approach
 * Per the spec the helpers are **not** exported, so everything below is
 * asserted through the rendered DOM only. The locale copy is the sole input, so
 * the expectations are derived from `locales/*.json` at test time rather than
 * being hard-coded prose.
 *
 * Hover is driven with `fireEvent` rather than `userEvent`: the listeners are
 * attached imperatively with `addEventListener` for `mouseenter`/`mouseleave`,
 * which do not bubble, and `fireEvent` dispatches them directly on the target.
 *
 * `Element.prototype.getBoundingClientRect` is stubbed to an all-zero rect in
 * `test/setup.ts`, so the coordinate assertions check *that* the variables were
 * written and that they track the event's client coordinates relative to that
 * zero origin — never real layout numbers.
 *
 * ## Deliberate limitations
 * - **HTML escaping is not directly exercisable.** Neither locale's
 *   `hero.fixed_paragraph` contains `& < > " '` (asserted below as a guard), so
 *   `escapeHtml` is a no-op on the real copy and the locale files must not be
 *   modified. What *is* asserted instead: the injected markup contains no HTML
 *   entities and no element other than `<p>`/`<span>`, i.e. nothing from the
 *   source text was interpreted as markup, and the rendered text is a
 *   character-for-character round-trip of the locale string.
 * - **`overlaps()` rejecting a *sentence* range is unreachable** with the real
 *   copy: the four configured sentences never overlap each other. Only the
 *   word-vs-sentence precedence is observable, and it is asserted.
 */

const EN_TEXT = en.hero.fixed_paragraph
const IT_TEXT = itLocale.hero.fixed_paragraph

/** The English sentence highlight that also contains the word "vision". */
const EN_SENTENCE =
  'My work spans augmented and extended reality, computer vision, machine learning, generative-AI workflows, mobile engineering, data pipelines, and experimental interfaces.'
const EN_SENTENCE_2 = 'I treat technology as a living laboratory'
const IT_SENTENCE =
  'Il mio lavoro abbraccia realtà aumentata ed estesa, computer vision, machine learning, flussi di lavoro di AI generativa, ingegneria mobile, pipeline di dati e interfacce sperimentali.'
const IT_SENTENCE_2 = 'Considero la tecnologia un laboratorio vivente'

/** Render and hand back accessors for the injected container. */
function renderParagraph(locale: 'en' | 'it' = 'en') {
  const view = renderWithProviders(<FixedAnalogyParagraph />, { locale })
  const container = () => view.container.querySelector('.glass-ripple') as HTMLElement
  return {
    ...view,
    /** The `<div>` carrying the injected HTML and the ripple variables. */
    rippleContainer: container,
    /** All highlight spans, in document order. */
    highlights: () => Array.from(container().querySelectorAll('.highlight-word')) as HTMLElement[],
    /** The text of every highlight span, in document order. */
    highlightTexts: () =>
      Array.from(container().querySelectorAll('.highlight-word')).map((el) => el.textContent),
    /** The highlight span whose text starts with `prefix`. */
    highlight: (prefix: string) => {
      const found = Array.from(container().querySelectorAll('.highlight-word')).find((el) =>
        el.textContent?.startsWith(prefix)
      )
      if (!found) throw new Error(`no .highlight-word starting with "${prefix}"`)
      return found as HTMLElement
    },
  }
}

/** Wait for the locale effect to swap the copy, then return the accessors. */
async function renderSettled(locale: 'en' | 'it' = 'en') {
  const view = renderParagraph(locale)
  const expected = locale === 'en' ? EN_TEXT : IT_TEXT
  await waitFor(() =>
    expect(view.rippleContainer().textContent).toBe(expected.replaceAll('\n', ''))
  )
  return view
}

/** Read a CSS custom property off an element's inline style. */
function cssVar(el: HTMLElement, name: string) {
  return el.style.getPropertyValue(name)
}

afterEach(() => {
  resetMatchMedia()
})

describe('FixedAnalogyParagraph', () => {
  describe('locale copy', () => {
    it('renders the English paragraph text verbatim', async () => {
      const view = await renderSettled('en')

      // Newlines are consumed by the paragraph split, everything else survives.
      expect(view.rippleContainer().textContent).toBe(EN_TEXT.replaceAll('\n', ''))
    })

    it('renders the Italian paragraph text verbatim', async () => {
      const view = await renderSettled('it')

      expect(view.rippleContainer().textContent).toBe(IT_TEXT.replaceAll('\n', ''))
    })
  })

  describe('paragraph splitting on newlines', () => {
    it('emits one <p> per newline-separated line (EN)', async () => {
      const view = await renderSettled('en')

      const lines = EN_TEXT.split('\n')
      const paragraphs = Array.from(view.rippleContainer().querySelectorAll('p'))
      expect(paragraphs).toHaveLength(lines.length)
      expect(paragraphs.map((p) => p.textContent)).toEqual(lines)
    })

    it('emits one <p> per newline-separated line (IT)', async () => {
      const view = await renderSettled('it')

      const lines = IT_TEXT.split('\n')
      const paragraphs = Array.from(view.rippleContainer().querySelectorAll('p'))
      expect(paragraphs).toHaveLength(lines.length)
      expect(paragraphs.map((p) => p.textContent)).toEqual(lines)
    })

    it('keeps the blank line between the two parts as an empty <p>', async () => {
      const view = await renderSettled('en')

      // The source uses '\n\n', so the middle line is the empty string.
      const paragraphs = Array.from(view.rippleContainer().querySelectorAll('p'))
      expect(paragraphs[1].textContent).toBe('')
      expect(paragraphs[1].childNodes).toHaveLength(0)
    })

    it('nests every highlight inside a paragraph', async () => {
      const view = await renderSettled('en')

      for (const span of view.highlights()) {
        expect(span.parentElement?.tagName).toBe('P')
      }
    })
  })

  describe('escaping the injected HTML', () => {
    it('the shipped copy contains no characters escapeHtml would rewrite', () => {
      // Guard for the limitation documented at the top of this file: if the
      // copy ever gains a `&`, `<`, `>`, `"` or `'`, this test fails and the
      // escaping assertions below should be strengthened.
      expect(EN_TEXT).not.toMatch(/[&<>"']/)
      expect(IT_TEXT).not.toMatch(/[&<>"']/)
    })

    it('injects no HTML entities for the real copy', async () => {
      const view = await renderSettled('en')

      expect(view.rippleContainer().innerHTML).not.toMatch(/&[a-z]+;|&#\d+;/)
    })

    it('injects only <p> and <span> elements — nothing from the text is markup', async () => {
      const view = await renderSettled('en')

      const tags = new Set(
        Array.from(view.rippleContainer().querySelectorAll('*')).map((el) => el.tagName)
      )
      expect([...tags].sort()).toEqual(['P', 'SPAN'])
    })

    it('gives every highlight a data-text attribute equal to its text', async () => {
      const view = await renderSettled('en')

      for (const span of view.highlights()) {
        expect(span.getAttribute('data-text')).toBe(span.textContent)
      }
    })
  })

  describe('word and sentence highlights (English)', () => {
    it('highlights the configured words and sentences, in source order', async () => {
      const view = await renderSettled('en')

      expect(view.highlightTexts()).toEqual([
        'limulus',
        'vision',
        'light',
        'finding structure in complexity',
        EN_SENTENCE,
        EN_SENTENCE_2,
      ])
    })

    it('highlights each configured term at most once', async () => {
      const view = await renderSettled('en')

      // "light" appears three times and "vision" twice in the copy, but the
      // builder uses a non-global regex, so only the first match is wrapped.
      expect(view.highlightTexts().filter((t) => t === 'light')).toHaveLength(1)
      expect(view.highlightTexts().filter((t) => t === 'vision')).toHaveLength(1)
    })

    it('wraps the whole sentence rather than the "vision" inside it', async () => {
      const view = await renderSettled('en')

      const sentence = view.highlight('My work spans')
      expect(sentence.textContent).toBe(EN_SENTENCE)
      // Sentence ranges are pushed first, so the later word pass sees an
      // overlap and skips it: no nested highlight is produced.
      expect(sentence.querySelectorAll('.highlight-word')).toHaveLength(0)
      // The standalone "vision" highlight is the earlier occurrence, well
      // before the sentence.
      const standalone = view.highlight('vision')
      expect(sentence.contains(standalone)).toBe(false)
    })

    it('produces non-overlapping, strictly ordered, non-nested ranges', async () => {
      const view = await renderSettled('en')

      const spans = view.highlights()
      for (const span of spans) {
        expect(span.querySelectorAll('.highlight-word')).toHaveLength(0)
      }
      // Document order must match the position of each match in the raw text.
      const positions = spans.map((span) => EN_TEXT.indexOf(span.textContent ?? ''))
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
      expect(new Set(positions).size).toBe(positions.length)
    })

    it('does not highlight the Italian variants under the English locale', async () => {
      const view = await renderSettled('en')

      expect(view.highlightTexts()).not.toContain('limulo')
      expect(view.highlightTexts()).not.toContain('luce')
      expect(view.highlightTexts()).not.toContain('visione')
    })

    it('exposes the highlighted terms as findable text', async () => {
      await renderSettled('en')

      expect(await screen.findByText('limulus')).toHaveClass('highlight-word')
      expect(screen.getByText('finding structure in complexity')).toHaveClass('highlight-word')
      expect(screen.getByText(EN_SENTENCE_2)).toHaveClass('highlight-word')
    })
  })

  describe('word and sentence highlights (Italian)', () => {
    it('applies the Italian variants under the Italian locale', async () => {
      const view = await renderSettled('it')

      expect(view.highlightTexts()).toEqual([
        'limulo',
        'visione',
        'luce',
        IT_SENTENCE,
        IT_SENTENCE_2,
      ])
    })

    it('does not highlight the English variants', async () => {
      const view = await renderSettled('it')

      expect(view.highlightTexts()).not.toContain('limulus')
      expect(view.highlightTexts()).not.toContain('light')
      // "computer vision" occurs inside the Italian sentence highlight, but the
      // bare word never gets its own span.
      expect(view.highlightTexts()).not.toContain('vision')
    })

    it('does NOT highlight "trovare struttura nella complessità" even though the copy contains it', async () => {
      const view = await renderSettled('it')

      // Candidate bug — see the report. `buildHighlightRanges` anchors the word
      // regex with `\b`, and `à` is not a `\w` character in a non-unicode
      // regex, so the trailing `\b` cannot match after "complessità".
      expect(IT_TEXT).toContain('trovare struttura nella complessità')
      expect(view.highlightTexts()).not.toContain('trovare struttura nella complessità')
      expect(screen.queryByText('trovare struttura nella complessità')).not.toBeInTheDocument()
    })

    it('still wraps the Italian sentence without nesting "computer vision"', async () => {
      const view = await renderSettled('it')

      const sentence = view.highlight('Il mio lavoro abbraccia')
      expect(sentence.textContent).toBe(IT_SENTENCE)
      expect(sentence.textContent).toContain('computer vision')
      expect(sentence.querySelectorAll('.highlight-word')).toHaveLength(0)
    })
  })

  describe('hovering a highlight (motion allowed)', () => {
    it('adds is-hovered on mouseenter and removes it on mouseleave', async () => {
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      fireEvent.mouseEnter(span)
      expect(span).toHaveClass('is-hovered')

      fireEvent.mouseLeave(span)
      expect(span).not.toHaveClass('is-hovered')
      expect(span).toHaveClass('highlight-word')
    })

    it('shows the container ripple on enter and hides it on leave', async () => {
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      fireEvent.mouseEnter(span)
      expect(cssVar(view.rippleContainer(), '--ripple-opacity')).toBe('1')

      fireEvent.mouseLeave(span)
      expect(cssVar(view.rippleContainer(), '--ripple-opacity')).toBe('0')
    })

    it('writes --cursor-x/y from the pointer position on mousemove', async () => {
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      fireEvent.mouseMove(span, { clientX: 120, clientY: 45 })

      // getBoundingClientRect is stubbed to a zero rect, so the offsets equal
      // the client coordinates; only the fact they were written and that they
      // track the event is meaningful here.
      expect(cssVar(span, '--cursor-x')).toBe('120px')
      expect(cssVar(span, '--cursor-y')).toBe('45px')

      fireEvent.mouseMove(span, { clientX: 7, clientY: 9 })

      expect(cssVar(span, '--cursor-x')).toBe('7px')
      expect(cssVar(span, '--cursor-y')).toBe('9px')
    })

    it('also drives the container ripple while over a highlight', async () => {
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      fireEvent.mouseMove(span, { clientX: 120, clientY: 45 })

      const container = view.rippleContainer()
      expect(cssVar(container, '--ripple-x')).toBe('120px')
      expect(cssVar(container, '--ripple-y')).toBe('45px')
      expect(cssVar(container, '--ripple-opacity')).toBe('1')
    })

    it('tracks each highlight independently', async () => {
      const view = await renderSettled('en')
      const first = view.highlight('limulus')
      const second = view.highlight('finding structure')

      fireEvent.mouseEnter(first)
      fireEvent.mouseMove(first, { clientX: 10, clientY: 20 })

      expect(first).toHaveClass('is-hovered')
      expect(second).not.toHaveClass('is-hovered')
      expect(cssVar(second, '--cursor-x')).toBe('')

      fireEvent.mouseLeave(first)
      fireEvent.mouseEnter(second)

      expect(first).not.toHaveClass('is-hovered')
      expect(second).toHaveClass('is-hovered')
    })

    it('attaches listeners to every highlight', async () => {
      const view = await renderSettled('en')

      for (const span of view.highlights()) {
        fireEvent.mouseEnter(span)
        expect(span).toHaveClass('is-hovered')
        fireEvent.mouseMove(span, { clientX: 5, clientY: 6 })
        expect(cssVar(span, '--cursor-x')).toBe('5px')
        fireEvent.mouseLeave(span)
        expect(span).not.toHaveClass('is-hovered')
      }
    })

    it('leaks the ripple across instances because the effect queries the whole document', async () => {
      // Candidate bug — see the report. The effect uses
      // `document.querySelectorAll('.highlight-word')` instead of scoping to
      // `containerRef`, so with two instances mounted every span carries a
      // listener bound to *each* container. Hovering a span in the first
      // instance therefore lights up the second instance's ripple too.
      const view = renderWithProviders(
        <>
          <FixedAnalogyParagraph />
          <FixedAnalogyParagraph />
        </>
      )
      const containers = () =>
        Array.from(view.container.querySelectorAll('.glass-ripple')) as HTMLElement[]
      await waitFor(() =>
        expect(view.container.querySelectorAll('.highlight-word')).toHaveLength(12)
      )

      const [first, second] = containers()
      fireEvent.mouseEnter(first.querySelector('.highlight-word') as HTMLElement)

      expect(cssVar(first, '--ripple-opacity')).toBe('1')
      expect(cssVar(second, '--ripple-opacity')).toBe('1')
    })
  })

  describe('container-level ripple handlers (motion allowed)', () => {
    it('moves the ripple with the cursor over the container', async () => {
      const view = await renderSettled('en')
      const container = view.rippleContainer()

      fireEvent.mouseMove(container, { clientX: 33, clientY: 77 })

      expect(cssVar(container, '--ripple-x')).toBe('33px')
      expect(cssVar(container, '--ripple-y')).toBe('77px')
      expect(cssVar(container, '--ripple-opacity')).toBe('1')
    })

    it('fades the ripple out when the cursor leaves the container', async () => {
      const view = await renderSettled('en')
      const container = view.rippleContainer()

      fireEvent.mouseMove(container, { clientX: 33, clientY: 77 })
      fireEvent.mouseLeave(container)

      expect(cssVar(container, '--ripple-opacity')).toBe('0')
      // The last position is retained; only opacity is reset.
      expect(cssVar(container, '--ripple-x')).toBe('33px')
    })
  })

  describe('teardown', () => {
    it('removes the per-highlight listeners on unmount', async () => {
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      view.unmount()
      fireEvent.mouseEnter(span)
      fireEvent.mouseMove(span, { clientX: 42, clientY: 43 })

      expect(span).not.toHaveClass('is-hovered')
      expect(cssVar(span, '--cursor-x')).toBe('')
    })
  })

  describe('prefers-reduced-motion', () => {
    it('still renders the full paragraph and all highlights', async () => {
      mockReducedMotion()

      const view = await renderSettled('en')

      expect(view.rippleContainer().textContent).toBe(EN_TEXT.replaceAll('\n', ''))
      expect(view.highlightTexts()).toEqual([
        'limulus',
        'vision',
        'light',
        'finding structure in complexity',
        EN_SENTENCE,
        EN_SENTENCE_2,
      ])
    })

    it('attaches no per-highlight listeners, so hovering does nothing', async () => {
      mockReducedMotion()
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      fireEvent.mouseEnter(span)
      fireEvent.mouseMove(span, { clientX: 120, clientY: 45 })

      expect(span).not.toHaveClass('is-hovered')
      expect(span.getAttribute('style')).toBeNull()
      fireEvent.mouseLeave(span)
      expect(span).not.toHaveClass('is-hovered')
    })

    it('leaves the container ripple variables unset', async () => {
      mockReducedMotion()
      const view = await renderSettled('en')
      const container = view.rippleContainer()

      fireEvent.mouseMove(container, { clientX: 33, clientY: 77 })
      fireEvent.mouseLeave(container)

      expect(container.getAttribute('style')).toBeNull()
    })

    it('re-attaches listeners once matchMedia is reset', async () => {
      // Guards the mockMatchMedia contract: both branches must work in one
      // file, in either order.
      const view = await renderSettled('en')
      const span = view.highlight('limulus')

      fireEvent.mouseEnter(span)

      expect(span).toHaveClass('is-hovered')
    })
  })
})
