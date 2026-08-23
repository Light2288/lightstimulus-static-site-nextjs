import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import ProjectCardBase from './ProjectCardBase'
import type { LocalizedTag } from '@/types/localizedTag'

/**
 * Characterisation tests for `ProjectCardBase` — the shared project card used
 * by both the grid and the compact home-page variants.
 *
 * Documented behaviour:
 * - `coverImage` gates an entire block: when present the image is wrapped in a
 *   `Link` with `aria-label={title}`; when absent no image and no second link
 *   are rendered (only the title link in the body remains).
 * - `date` renders a floating badge with a `<time dateTime>` element inside the
 *   cover-image block. Because it lives inside that block, the badge is only
 *   reachable when `coverImage` is also set.
 * - `small` toggles the image height class between `h-40` (true) and `h-48`
 *   (false / default).
 * - `priority` forwards to `next/image`'s `priority` and sets the DOM
 *   attribute `fetchpriority="high"`; otherwise `fetchpriority="auto"`.
 * - `tags` defaults to `[]` and the list is only rendered when non-empty.
 *
 * Dates go through `Intl.DateTimeFormat(lang, { year, month: 'short' })`, whose
 * exact output depends on the running Node build's ICU data, so only stable
 * substrings (the year) or values recomputed in the test are asserted.
 *
 * `useLanguage` applies the locale in a mount effect, so locale-dependent
 * assertions are async.
 */

/** Midday UTC keeps the calendar month stable across CI timezones. */
const DATE = '2026-07-27T12:00:00.000Z'
/** A `/static/images/*.png` src makes `Image` take its `<picture>` branch. */
const COVER = '/static/images/projects/blog-writer.png'

const tags: LocalizedTag[] = [
  { id: 'opencode', label: { en: 'opencode', it: 'opencode' } },
  { id: 'automation', label: { en: 'Automation', it: 'Automazione' } },
]

function renderCard(
  overrides: Partial<React.ComponentProps<typeof ProjectCardBase>> = {},
  locale: 'en' | 'it' = 'en'
) {
  return renderWithProviders(
    <ProjectCardBase
      href="/projects/blog-writer"
      title="Blog-Writer"
      summary="An opencode automation project that writes bilingual MDX articles."
      {...overrides}
    />,
    { locale }
  )
}

describe('ProjectCardBase', () => {
  describe('title and summary', () => {
    it('renders the title as a level-2 heading linking to href', async () => {
      renderCard()

      const heading = await screen.findByRole('heading', { level: 2, name: 'Blog-Writer' })
      expect(heading).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Blog-Writer' })).toHaveAttribute(
        'href',
        '/projects/blog-writer'
      )
    })

    it('renders the summary verbatim (the caller pre-localises it)', async () => {
      renderCard({ summary: 'Un progetto di automazione opencode.' }, 'it')

      expect(await screen.findByText('Un progetto di automazione opencode.')).toBeInTheDocument()
    })
  })

  describe('coverImage', () => {
    it('wraps the image in a Link labelled with the title when present', async () => {
      renderCard({ coverImage: COVER })

      const links = await screen.findAllByRole('link', { name: 'Blog-Writer' })
      // Two links share the accessible name: the cover-image link (aria-label)
      // and the heading link (text content).
      expect(links).toHaveLength(2)
      expect(links[0]).toHaveAttribute('href', '/projects/blog-writer')
      expect(links[0].querySelector('img')).toBeInTheDocument()
    })

    it('renders the image with the title as its alt text', async () => {
      renderCard({ coverImage: COVER })

      expect(await screen.findByRole('img', { name: 'Blog-Writer' })).toBeInTheDocument()
    })

    it('omits the image and its wrapping link when absent', async () => {
      renderCard({ coverImage: undefined })

      expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      // Only the heading link survives.
      expect(screen.getAllByRole('link')).toHaveLength(1)
    })
  })

  describe('date badge', () => {
    it('renders a time element carrying the raw ISO date', async () => {
      const { container } = renderCard({ coverImage: COVER, date: DATE })

      const time = container.querySelector('time')
      expect(time).toBeInTheDocument()
      expect(time).toHaveAttribute('datetime', DATE)
    })

    it('renders the year in the badge text', async () => {
      const { container } = renderCard({ coverImage: COVER, date: DATE })

      expect(container.querySelector('time')).toHaveTextContent('2026')
    })

    it('renders no badge when date is omitted', async () => {
      const { container } = renderCard({ coverImage: COVER })

      expect(await screen.findByRole('img', { name: 'Blog-Writer' })).toBeInTheDocument()
      expect(container.querySelector('time')).not.toBeInTheDocument()
    })

    it('renders no badge when coverImage is missing, even with a date', async () => {
      // The badge lives inside the coverImage block, so a date alone is inert.
      const { container } = renderCard({ date: DATE })

      expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(container.querySelector('time')).not.toBeInTheDocument()
    })

    it('formats the badge with the English locale under locale "en"', async () => {
      const { container } = renderCard({ coverImage: COVER, date: DATE }, 'en')

      const expected = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
      }).format(new Date(DATE))

      await waitFor(() => {
        expect(container.querySelector('time')).toHaveTextContent(expected)
      })
    })

    it('formats the badge with the Italian locale under locale "it"', async () => {
      const { container } = renderCard({ coverImage: COVER, date: DATE }, 'it')

      const expected = new Intl.DateTimeFormat('it', {
        year: 'numeric',
        month: 'short',
      }).format(new Date(DATE))

      await waitFor(() => {
        expect(container.querySelector('time')).toHaveTextContent(expected)
      })
    })
  })

  describe('small', () => {
    it('uses h-48 on the image by default', async () => {
      renderCard({ coverImage: COVER })

      const img = await screen.findByRole('img', { name: 'Blog-Writer' })
      expect(img).toHaveClass('h-48')
      expect(img).not.toHaveClass('h-40')
    })

    it('uses h-40 on the image when small is true', async () => {
      renderCard({ coverImage: COVER, small: true })

      const img = await screen.findByRole('img', { name: 'Blog-Writer' })
      expect(img).toHaveClass('h-40')
      expect(img).not.toHaveClass('h-48')
    })

    it('keeps h-48 when small is explicitly false', async () => {
      renderCard({ coverImage: COVER, small: false })

      expect(await screen.findByRole('img', { name: 'Blog-Writer' })).toHaveClass('h-48')
    })
  })

  describe('priority', () => {
    it('sets fetchpriority="high" when priority is true', async () => {
      renderCard({ coverImage: COVER, priority: true })

      expect(await screen.findByRole('img', { name: 'Blog-Writer' })).toHaveAttribute(
        'fetchpriority',
        'high'
      )
    })

    it('sets fetchpriority="auto" by default', async () => {
      renderCard({ coverImage: COVER })

      expect(await screen.findByRole('img', { name: 'Blog-Writer' })).toHaveAttribute(
        'fetchpriority',
        'auto'
      )
    })
  })

  describe('tags', () => {
    it('renders one list item per tag when non-empty', async () => {
      renderCard({ tags })

      expect(await screen.findByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      expect(screen.getByText('Automation')).toBeInTheDocument()
    })

    it('renders the Italian tag labels under locale "it"', async () => {
      renderCard({ tags }, 'it')

      expect(await screen.findByText('Automazione')).toBeInTheDocument()
    })

    it('renders no list when tags is an empty array', async () => {
      renderCard({ tags: [] })

      expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('renders no list when tags is omitted (defaults to [])', async () => {
      renderCard()

      expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })
})
