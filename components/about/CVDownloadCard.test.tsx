import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { CVDownloadCard } from './CVDownloadCard'

/**
 * Characterisation tests for `CVDownloadCard`.
 *
 * The card carries two actions:
 * - the **primary** CV download anchor, rendered only when `cv.url` is present,
 *   whose href is `${process.env.BASE_PATH || ''}${cv.url}`, and
 * - the **secondary** pointer to `/resume`, which always renders because it is
 *   independent of the CV asset.
 *
 * Because the resume pointer is unconditional, the card no longer returns
 * `null` when the CV is missing — it degrades to a resume-pointer-only card.
 *
 * Note: `BASE_PATH` is read at *render* time (not module load), so mutating
 * `process.env` before rendering is enough — no module re-import needed.
 */

const cv = { url: '/static/cv/cv.pdf' }

const EN_DOWNLOAD = 'Download CV'
const IT_DOWNLOAD = 'Scarica CV'
// The trailing arrow glyph is appended in JSX (mirroring the homepage's
// "View all posts →"), so it forms part of the link's accessible name.
const EN_RESUME = 'View full experience →'
const IT_RESUME = 'Vedi esperienza completa →'

describe('CVDownloadCard', () => {
  describe('missing CV asset', () => {
    it('renders no download anchor when no cv prop is passed', async () => {
      renderWithProviders(<CVDownloadCard />)

      expect(await screen.findByRole('link', { name: EN_RESUME })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: EN_DOWNLOAD })).not.toBeInTheDocument()
    })

    it('renders no download anchor when cv is explicitly undefined', async () => {
      renderWithProviders(<CVDownloadCard cv={undefined} />)

      expect(await screen.findByRole('link', { name: EN_RESUME })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: EN_DOWNLOAD })).not.toBeInTheDocument()
    })

    it('renders no download anchor when cv.url is an empty string', async () => {
      renderWithProviders(<CVDownloadCard cv={{ url: '' }} />)

      expect(await screen.findByRole('link', { name: EN_RESUME })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: EN_DOWNLOAD })).not.toBeInTheDocument()
    })

    it('still renders the card heading so the resume pointer stays discoverable', async () => {
      renderWithProviders(<CVDownloadCard />)

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Curriculum Vitae' })
      ).toBeInTheDocument()
    })

    it('exposes exactly one link when the CV is absent', async () => {
      renderWithProviders(<CVDownloadCard />)

      await screen.findByRole('link', { name: EN_RESUME })
      expect(screen.getAllByRole('link')).toHaveLength(1)
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

      expect(await screen.findByRole('link', { name: EN_DOWNLOAD })).toBeInTheDocument()
    })

    it('labels the resume pointer in English', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'en' })

      expect(await screen.findByRole('link', { name: EN_RESUME })).toBeInTheDocument()
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

      expect(await screen.findByRole('link', { name: IT_DOWNLOAD })).toBeInTheDocument()
    })

    it('labels the resume pointer in Italian', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'it' })

      expect(await screen.findByRole('link', { name: IT_RESUME })).toBeInTheDocument()
    })
  })

  describe('download anchor', () => {
    it('carries the download attribute', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_DOWNLOAD })
      expect(link).toHaveAttribute('download')
    })

    it('links straight to cv.url when BASE_PATH is unset', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_DOWNLOAD })
      expect(link).toHaveAttribute('href', '/static/cv/cv.pdf')
    })

    it('prefixes the href with BASE_PATH when it is set', async () => {
      const previous = process.env.BASE_PATH
      process.env.BASE_PATH = '/portfolio'
      try {
        renderWithProviders(<CVDownloadCard cv={cv} />)

        const link = await screen.findByRole('link', { name: EN_DOWNLOAD })
        expect(link).toHaveAttribute('href', '/portfolio/static/cv/cv.pdf')
      } finally {
        if (previous === undefined) delete process.env.BASE_PATH
        else process.env.BASE_PATH = previous
      }
    })

    it('does not open in a new tab', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_DOWNLOAD })
      expect(link).not.toHaveAttribute('target')
    })
  })

  describe('resume pointer', () => {
    it('links to the /resume route', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_RESUME })
      expect(link).toHaveAttribute('href', '/resume')
    })

    it('is treated as an internal link (no new tab)', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_RESUME })
      expect(link).not.toHaveAttribute('target')
    })

    it('does not carry the download attribute', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_RESUME })
      expect(link).not.toHaveAttribute('download')
    })

    it('renders alongside the download action when a CV exists', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      await screen.findByRole('link', { name: EN_RESUME })
      expect(screen.getAllByRole('link')).toHaveLength(2)
    })

    it('appends the arrow glyph like the homepage "View all posts →" link', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const link = await screen.findByRole('link', { name: EN_RESUME })
      expect(link.textContent).toMatch(/→\s*$/)
    })

    it('keeps the arrow out of the locale string so both locales share the glyph', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />, { locale: 'it' })

      const link = await screen.findByRole('link', { name: IT_RESUME })
      expect(link.textContent).toMatch(/→\s*$/)
    })
  })

  describe('layout', () => {
    /**
     * The card has two blocks: an upper row pairing the description with the
     * right-aligned download button, and the resume pointer pinned underneath.
     * The `mt-auto` on the pointer is what pushes it to the bottom once the card
     * is stretched to match its neighbour's height.
     */
    it('places the resume pointer after the download button in document order', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const download = await screen.findByRole('link', { name: EN_DOWNLOAD })
      const resume = await screen.findByRole('link', { name: EN_RESUME })

      expect(
        download.compareDocumentPosition(resume) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })

    it('puts the description and the download button in the same row', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const download = await screen.findByRole('link', { name: EN_DOWNLOAD })
      const description = await screen.findByText(
        'A concise overview of my experience, skills, and selected projects.'
      )

      expect(download.parentElement).toBe(description.parentElement)
    })

    it('lays that row out horizontally with the button pushed to the right', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const download = await screen.findByRole('link', { name: EN_DOWNLOAD })
      const row = download.parentElement!

      expect(row).toHaveClass('flex')
      // Narrow viewports stack; from `sm` up the pair shares a line with the
      // button trailing at the far edge.
      expect(row).toHaveClass('sm:flex-row')
      expect(row).toHaveClass('sm:justify-between')
      expect(row).toHaveClass('sm:items-center')
    })

    it('keeps the resume pointer out of the description row', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const download = await screen.findByRole('link', { name: EN_DOWNLOAD })
      const resume = await screen.findByRole('link', { name: EN_RESUME })

      expect(resume.parentElement).not.toBe(download.parentElement)
    })

    it('pushes the resume pointer to the bottom of a stretched card', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const resume = await screen.findByRole('link', { name: EN_RESUME })
      const footer = resume.parentElement!

      expect(footer).toHaveClass('mt-auto')
    })

    it('stretches the card shell to fill its grid cell', async () => {
      const { container } = renderWithProviders(<CVDownloadCard cv={cv} />)

      const section = container.querySelector('section')!
      expect(section).toHaveClass('h-full')
      expect(section).toHaveClass('flex-col')

      const shell = section.querySelector('.glass-bg')!
      // `flex-1`, not `h-full`: the latter resolves against the section and
      // ignores the heading above, overflowing the cell by the heading height.
      expect(shell).toHaveClass('flex-1')
      expect(shell).not.toHaveClass('h-full')
      expect(shell).toHaveClass('flex-col')
    })
  })
})
