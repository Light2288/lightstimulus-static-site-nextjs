import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { CVDownloadCard } from './CVDownloadCard'

/**
 * Characterisation tests for `CVDownloadCard`.
 *
 * Covers:
 * - the `if (!cv?.url) return null` guard: no `cv` prop, an explicitly
 *   `undefined` prop, and a `cv` whose `url` is the empty string all render
 *   nothing at all,
 * - the happy path: a gradient level-2 heading (`about.cv.title`), the
 *   description (`about.cv.description`) and a download anchor
 *   (`about.cv.download`) carrying the boolean `download` attribute,
 * - the href, which is `${process.env.BASE_PATH || ''}${cv.url}`. `BASE_PATH` is
 *   unset in the test environment, so the href equals `cv.url` verbatim; a
 *   dedicated test stubs the variable to pin the prefixing behaviour.
 *
 * Note: `BASE_PATH` is read at *render* time (not module load), so mutating
 * `process.env` before rendering is enough — no module re-import needed.
 */

const cv = { url: '/static/cv/cv.pdf' }

/**
 * `ThemeProviders` (next-themes) injects its own no-flash `<script>` into the
 * render container, so a container wrapped in the app providers is never
 * literally empty. Assert instead that the component under test contributed no
 * markup of its own.
 */
function expectRenderedNothing(container: HTMLElement) {
  expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
}

describe('CVDownloadCard', () => {
  describe('null guard', () => {
    it('renders nothing when no cv prop is passed', () => {
      const { container } = renderWithProviders(<CVDownloadCard />)

      expectRenderedNothing(container)
    })

    it('renders nothing when cv is explicitly undefined', () => {
      const { container } = renderWithProviders(<CVDownloadCard cv={undefined} />)

      expectRenderedNothing(container)
    })

    it('renders nothing when cv.url is an empty string', () => {
      const { container } = renderWithProviders(<CVDownloadCard cv={{ url: '' }} />)

      expectRenderedNothing(container)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('English locale', () => {
    it('renders the card title as a level-2 heading', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Curriculum Vitae' })
      ).toBeInTheDocument()
    })

    it('renders the description', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'en' })

      expect(
        await screen.findByText(
          'A concise overview of my experience, skills, and selected projects.'
        )
      ).toBeInTheDocument()
    })

    it('labels the download link in English', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'en' })

      expect(await screen.findByRole('link', { name: 'Download CV' })).toBeInTheDocument()
    })
  })

  describe('Italian locale', () => {
    it('keeps the untranslated "Curriculum Vitae" title', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Curriculum Vitae' })
      ).toBeInTheDocument()
    })

    it('renders the Italian description', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'it' })

      expect(
        await screen.findByText(
          'Una sintesi della mia esperienza, delle mie competenze e dei miei progetti principali.'
        )
      ).toBeInTheDocument()
    })

    it('labels the download link in Italian', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'it' })

      expect(await screen.findByRole('link', { name: 'Scarica CV' })).toBeInTheDocument()
    })
  })

  describe('download anchor', () => {
    it('carries the download attribute', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('download')
    })

    it('links straight to cv.url when BASE_PATH is unset', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', '/static/cv/cv.pdf')
    })

    it('prefixes the href with BASE_PATH when it is set', async () => {
      const previous = process.env.BASE_PATH
      process.env.BASE_PATH = '/portfolio'
      try {
        renderWithProviders(<CVDownloadCard cv={cv} />)

        const link = await screen.findByRole('link')
        expect(link).toHaveAttribute('href', '/portfolio/static/cv/cv.pdf')
      } finally {
        if (previous === undefined) delete process.env.BASE_PATH
        else process.env.BASE_PATH = previous
      }
    })

    it('does not open in a new tab', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link')
      expect(link).not.toHaveAttribute('target')
    })
  })
})
