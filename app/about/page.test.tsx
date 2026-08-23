import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ThemeProviders } from '@/app/theme-providers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import en from '@/locales/en.json'

/**
 * Composition tests for the About page.
 *
 * These cover what the per-component suites structurally cannot: the *order* of
 * the bands, the paired row's collapse behaviour, the centralised rhythm scale,
 * and the narrowed bio measure.
 *
 * ## Why the module is mocked the way it is
 *
 * - `contentlayer/generated` is a build artifact, so `allAuthors` is replaced
 *   with fixtures (same approach as `app/sitemap.test.ts`). A mutable
 *   `authorOverrides` lets each test reshape the author to exercise the
 *   empty-section branches without re-mocking.
 * - `MDXLayoutRenderer` compiles MDX at runtime from `author.body.code`; the
 *   fixture has no real compiled body, so it is stubbed with a marker element.
 * - `next/navigation` is not needed: the page is a server component and the
 *   `Link` children only render hrefs.
 *
 * The page is an async-free server component (it just reads `allAuthors`), so it
 * can be invoked as a plain function and its element tree rendered directly.
 */

const BASE_AUTHOR = {
  slug: 'default',
  name: 'Davide Aliti',
  avatar: '/static/images/avatar.png',
  occupation: 'Senior Application Architect',
  company: 'Acme',
  email: 'a@b.c',
  github: 'https://github.com/x',
  linkedin: 'https://linkedin.com/in/x',
  focusAreas: [
    {
      title: { en: 'Frontend Architecture', it: 'Architettura Frontend' },
      description: { en: 'Design systems at scale.', it: 'Design system su larga scala.' },
    },
  ],
  exploringNow: [{ id: 'xr', en: 'Spatial computing', it: 'Spatial computing' }],
  certifications: [{ title: 'AWS SAA', issuer: 'Amazon', year: 2024 }],
  cv: { url: '/static/cv/cv.pdf' },
  body: { code: 'noop' },
}

/** Per-test author reshaping, applied on top of the base fixture. */
let authorOverrides: Record<string, unknown> = {}

vi.mock('contentlayer/generated', () => ({
  get allAuthors() {
    return [{ ...BASE_AUTHOR, ...authorOverrides }]
  },
}))

vi.mock('pliny/mdx-components', () => ({
  MDXLayoutRenderer: () => <p data-testid="mdx-bio">bio body</p>,
}))

beforeEach(() => {
  authorOverrides = {}
})

async function renderAboutPage() {
  const { default: AboutPage } = await import('./page')
  return render(
    <ThemeProviders>
      <LanguageProvider>{AboutPage()}</LanguageProvider>
    </ThemeProviders>
  )
}

/**
 * The element that owns vertical rhythm: the single flex column wrapping the
 * bands. Identified by its test id so the assertions do not hard-code a
 * particular gap value beyond the responsive contract.
 */
function rhythmContainer(container: HTMLElement): HTMLElement {
  const node = container.querySelector('[data-testid="about-rhythm"]')
  if (!node) throw new Error('expected a rhythm container on the About page')
  return node as HTMLElement
}

function pairedRow(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="about-paired-row"]')
}

describe('About page composition', () => {
  describe('band order', () => {
    it('orders the bands profile, bio, focus, paired row, certifications, bridge', async () => {
      const { container } = await renderAboutPage()

      const order = Array.from(
        container.querySelectorAll(
          '[data-testid="about-profile"], [data-testid="about-bio"], [data-testid="about-focus"], [data-testid="about-paired-row"], [data-testid="about-certifications"], [data-testid="about-bridge"]'
        )
      ).map((node) => node.getAttribute('data-testid'))

      expect(order).toEqual([
        'about-profile',
        'about-bio',
        'about-focus',
        'about-paired-row',
        'about-certifications',
        'about-bridge',
      ])
    })

    it('places the certifications band after the paired row', async () => {
      const { container } = await renderAboutPage()

      const row = pairedRow(container)!
      const certs = container.querySelector('[data-testid="about-certifications"]')!

      expect(row.compareDocumentPosition(certs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  describe('rhythm ownership', () => {
    it('wraps the bands in a single flex column that owns the gaps', async () => {
      const { container } = await renderAboutPage()

      const rhythm = rhythmContainer(container)
      expect(rhythm).toHaveClass('flex')
      expect(rhythm).toHaveClass('flex-col')
    })

    it('declares a responsive gap that grows on larger viewports', async () => {
      const { container } = await renderAboutPage()

      const classes = Array.from(rhythmContainer(container).classList)
      const base = classes.filter((name) => /^gap-\d+$/.test(name))
      const responsive = classes.filter((name) => /^(sm|md|lg):gap-\d+$/.test(name))

      expect(base).not.toEqual([])
      expect(responsive).not.toEqual([])
    })
  })

  describe('paired row', () => {
    it('is a single column by default and two columns at lg', async () => {
      const { container } = await renderAboutPage()

      const row = pairedRow(container)!
      expect(row).toHaveClass('grid')
      expect(row).toHaveClass('grid-cols-1')
      expect(row).toHaveClass('lg:grid-cols-2')
    })

    it('contains both the exploring and credentials sections', async () => {
      const { container } = await renderAboutPage()

      const row = pairedRow(container)!
      expect(
        within(row).getByRole('heading', { name: en.about.exploring.title })
      ).toBeInTheDocument()
      expect(within(row).getByRole('heading', { name: en.about.cv.title })).toBeInTheDocument()
    })

    /**
     * Equal-height contract: side by side, the two cards must agree on height
     * even when the exploring list is the taller of the two. Each section is a
     * full-height flex column whose glass shell takes `flex-1`, so the shorter
     * card's interior absorbs the difference instead of leaving a ragged bottom
     * edge. (`h-full` on the shell would overflow the cell by the heading's
     * height, so it is explicitly ruled out.)
     */
    it('stretches both paired sections to a common height', async () => {
      const { container } = await renderAboutPage()

      const row = pairedRow(container)!
      const sections = Array.from(row.querySelectorAll(':scope > section'))
      expect(sections).toHaveLength(2)

      for (const section of sections) {
        expect(section).toHaveClass('h-full')
        expect(section).toHaveClass('flex-col')

        const shell = section.querySelector('.glass-bg')
        expect(shell).toHaveClass('flex-1')
        expect(shell).not.toHaveClass('h-full')
      }
    })

    it('keeps the row items stretched rather than top-aligned', async () => {
      const { container } = await renderAboutPage()

      const row = pairedRow(container)!
      expect(
        Array.from(row.classList).some((name) => /^items-(start|center|end)$/.test(name))
      ).toBe(false)
    })

    it('uses a tighter gap within the row than the page uses between bands', async () => {
      const { container } = await renderAboutPage()

      const gapOf = (element: HTMLElement) => {
        const match = Array.from(element.classList).find((name) => /^gap-\d+$/.test(name))
        return match ? Number(match.replace('gap-', '')) : NaN
      }

      expect(gapOf(pairedRow(container)!)).toBeLessThan(gapOf(rhythmContainer(container)))
    })

    it('does not force two columns when only the credentials card renders', async () => {
      authorOverrides = { exploringNow: [] }
      const { container } = await renderAboutPage()

      const row = pairedRow(container)
      expect(row).not.toHaveClass('lg:grid-cols-2')
    })
  })

  describe('bio measure', () => {
    it('constrains the prose rather than letting it run the full container', async () => {
      const { container } = await renderAboutPage()

      const article = container.querySelector('[data-testid="about-bio"] article')!
      expect(article).not.toHaveClass('max-w-none')
      expect(Array.from(article.classList).some((name) => /^max-w-/.test(name))).toBe(true)
    })

    it('centers the bio block within the rhythm container', async () => {
      const { container } = await renderAboutPage()

      const article = container.querySelector('[data-testid="about-bio"] article')!
      expect(article).toHaveClass('mx-auto')
    })

    it('still renders the MDX bio body', async () => {
      await renderAboutPage()

      expect(screen.getByTestId('mdx-bio')).toBeInTheDocument()
    })
  })

  describe('absent sections', () => {
    /**
     * The paired row has no "fully empty" state: `CVDownloadCard` renders the
     * `/resume` pointer unconditionally (that pointer is independent of the CV
     * asset), so the credentials half is always present. The spec's original
     * "both paired items absent" edge case is therefore unreachable by design —
     * this test pins the row down to its single surviving column instead.
     */
    it('keeps a single-column row when exploring and the CV asset are both absent', async () => {
      authorOverrides = { exploringNow: [], cv: undefined }
      const { container } = await renderAboutPage()

      const row = pairedRow(container)
      expect(row).not.toBeNull()
      expect(row).not.toHaveClass('lg:grid-cols-2')
      expect(
        within(row!).getByRole('link', { name: `${en.about.cv.resume_link} →` })
      ).toBeInTheDocument()
    })

    it('omits the certifications band when there are no certifications', async () => {
      authorOverrides = { certifications: [] }
      const { container } = await renderAboutPage()

      expect(container.querySelector('[data-testid="about-certifications"]')).toBeNull()
    })

    it('omits the focus band when there are no focus areas', async () => {
      authorOverrides = { focusAreas: [] }
      const { container } = await renderAboutPage()

      expect(container.querySelector('[data-testid="about-focus"]')).toBeNull()
    })
  })
})
