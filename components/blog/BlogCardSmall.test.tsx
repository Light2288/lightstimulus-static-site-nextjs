import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import BlogCardSmall from './BlogCardSmall'
import type { LocalizedTag } from '@/types/localizedTag'

/**
 * Characterisation tests for `BlogCardSmall` — the compact blog teaser used by
 * the home-page preview grid.
 *
 * Documented behaviour:
 * - The whole card body is a single `Link` pointing at `/blog/<slug>`.
 * - Title and summary are rendered verbatim (they are pre-localised by the
 *   caller; this component does not resolve `{ en, it }` shapes itself).
 * - The tag list is only rendered when `tags.length > 0`.
 * - The date goes through `Intl.DateTimeFormat(lang, { year, month: 'short',
 *   day })`, so the output changes with the active locale.
 *
 * Note on dates: the formatted output depends on the ICU data bundled with the
 * running Node build, so no literal date string is asserted. Instead we assert
 * a stable substring (the year) and, for the locale-sensitivity check, compare
 * against `Intl.DateTimeFormat` evaluated in the test itself.
 *
 * `useLanguage` resolves the locale in a mount effect, so every
 * locale-dependent assertion is async.
 */

/** ISO timestamp shaped like a Contentlayer `date` field. Midday UTC keeps the
 * calendar day stable across the timezones CI is likely to run in. */
const DATE = '2024-03-15T12:00:00.000Z'

const tags: LocalizedTag[] = [
  { id: 'automation', label: { en: 'Automation', it: 'Automazione' } },
  { id: 'ai-agents', label: { en: 'AI Agents', it: 'Agenti AI' } },
]

function renderCard(
  overrides: Partial<React.ComponentProps<typeof BlogCardSmall>> = {},
  locale: 'en' | 'it' = 'en'
) {
  return renderWithProviders(
    <BlogCardSmall
      slug="deriving-ols-estimator"
      date={DATE}
      title="Deriving the OLS estimator"
      summary="A short walk through the algebra behind ordinary least squares."
      tags={[]}
      {...overrides}
    />,
    { locale }
  )
}

describe('BlogCardSmall', () => {
  it('renders the title and the summary', async () => {
    renderCard()

    expect(await screen.findByText('Deriving the OLS estimator')).toBeInTheDocument()
    expect(
      screen.getByText('A short walk through the algebra behind ordinary least squares.')
    ).toBeInTheDocument()
  })

  it('renders the title inside a level-3 heading', async () => {
    renderCard()

    expect(
      await screen.findByRole('heading', { level: 3, name: 'Deriving the OLS estimator' })
    ).toBeInTheDocument()
  })

  it('links the whole card to /blog/<slug>', async () => {
    renderCard({ slug: 'my-fancy-title' })

    const links = await screen.findAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/blog/my-fancy-title')
  })

  describe('tags', () => {
    it('renders a tag list when at least one tag is provided', async () => {
      renderCard({ tags })

      const list = await screen.findByRole('list')
      expect(list).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      expect(screen.getByText('Automation')).toBeInTheDocument()
      expect(screen.getByText('AI Agents')).toBeInTheDocument()
    })

    it('renders no list at all when tags is empty', async () => {
      renderCard({ tags: [] })

      expect(await screen.findByText('Deriving the OLS estimator')).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('renders the Italian tag labels under the Italian locale', async () => {
      renderCard({ tags }, 'it')

      expect(await screen.findByText('Automazione')).toBeInTheDocument()
      expect(screen.getByText('Agenti AI')).toBeInTheDocument()
    })
  })

  describe('date', () => {
    it('renders a <time> element containing the year', async () => {
      const { container } = renderCard()

      const time = container.querySelector('time')
      expect(time).toBeInTheDocument()
      expect(time).toHaveTextContent('2024')
    })

    it('does not set a dateTime attribute on the <time> element', async () => {
      const { container } = renderCard()

      // Current behaviour: the machine-readable `dateTime` attribute is omitted.
      expect(container.querySelector('time')).not.toHaveAttribute('datetime')
    })

    it('formats the date with the English locale under locale "en"', async () => {
      const { container } = renderCard({}, 'en')

      const expected = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(DATE))

      await waitFor(() => {
        expect(container.querySelector('time')).toHaveTextContent(expected)
      })
    })

    it('formats the date with the Italian locale under locale "it"', async () => {
      const { container } = renderCard({}, 'it')

      const expected = new Intl.DateTimeFormat('it', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(DATE))

      await waitFor(() => {
        expect(container.querySelector('time')).toHaveTextContent(expected)
      })
    })
  })
})
