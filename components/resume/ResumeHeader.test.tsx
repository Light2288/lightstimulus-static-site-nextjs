import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { ResumeHeader } from './ResumeHeader'
import en from '@/locales/en.json'
// Aliased so it cannot shadow Vitest's `it()`.
import itLocale from '@/locales/it.json'

/**
 * Behaviour tests for the resume page header.
 *
 * This component owns the page's single `h1` and the CV download action. It is
 * intentionally separate from `AboutProfile` (which renders an `h2` and
 * about-specific highlight bullets) so `/resume` can own its heading hierarchy
 * without `/about` having to change.
 *
 * Note: `BASE_PATH` is read at *render* time, so mutating `process.env` before
 * rendering is sufficient — same approach as CVDownloadCard.test.tsx.
 */

const cv = { url: '/static/cv/cv.pdf' }

const PROPS = {
  name: 'Davide Aliti',
  occupation: 'Senior Application Architect',
  company: 'IBM',
  cv,
}

describe('ResumeHeader', () => {
  describe('heading', () => {
    it('renders the page title as the single h1', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      const headings = await screen.findAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent(en.resume.title)
    })

    it('translates the page title', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />, { locale: 'it' })

      expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
        itLocale.resume.title
      )
    })
  })

  describe('identity', () => {
    it('renders the name', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      expect(await screen.findByText('Davide Aliti')).toBeInTheDocument()
    })

    it('renders the occupation and company', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      expect(await screen.findByText(/Senior Application Architect/)).toBeInTheDocument()
      expect(screen.getByText(/IBM/)).toBeInTheDocument()
    })

    it('omits the occupation when absent', () => {
      renderWithProviders(<ResumeHeader name="Davide Aliti" cv={cv} />)

      expect(screen.queryByText(/Senior Application Architect/)).not.toBeInTheDocument()
    })

    it('omits the company when absent', () => {
      renderWithProviders(<ResumeHeader name="Davide Aliti" cv={cv} />)

      expect(screen.queryByText(/IBM/)).not.toBeInTheDocument()
    })

    it('does not render the name as a second h1', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      const name = await screen.findByText('Davide Aliti')
      expect(name.tagName).not.toBe('H1')
    })
  })

  describe('CV download', () => {
    it('renders a download link labelled in English', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      const link = await screen.findByRole('link', { name: en.resume.cv.download })
      expect(link).toBeInTheDocument()
    })

    it('renders a download link labelled in Italian', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />, { locale: 'it' })

      expect(
        await screen.findByRole('link', { name: itLocale.resume.cv.download })
      ).toBeInTheDocument()
    })

    it('carries the download attribute', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      const link = await screen.findByRole('link', { name: en.resume.cv.download })
      expect(link).toHaveAttribute('download')
    })

    it('links straight to cv.url when BASE_PATH is unset', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} />)

      const link = await screen.findByRole('link', { name: en.resume.cv.download })
      expect(link).toHaveAttribute('href', '/static/cv/cv.pdf')
    })

    it('prefixes the href with BASE_PATH when it is set', async () => {
      const previous = process.env.BASE_PATH
      process.env.BASE_PATH = '/portfolio'
      try {
        renderWithProviders(<ResumeHeader {...PROPS} />)

        const link = await screen.findByRole('link', { name: en.resume.cv.download })
        expect(link).toHaveAttribute('href', '/portfolio/static/cv/cv.pdf')
      } finally {
        process.env.BASE_PATH = previous
      }
    })
  })

  describe('graceful degradation without a CV asset', () => {
    it('renders no download link when cv is undefined', () => {
      renderWithProviders(<ResumeHeader {...PROPS} cv={undefined} />)

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renders no download link when cv.url is empty', () => {
      renderWithProviders(<ResumeHeader {...PROPS} cv={{ url: '' }} />)

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('still renders the heading and name without a CV', async () => {
      renderWithProviders(<ResumeHeader {...PROPS} cv={undefined} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText('Davide Aliti')).toBeInTheDocument()
    })
  })
})
