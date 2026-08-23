import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import BlogPostHeaderClient from './BlogPostHeaderClient'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

/**
 * Characterisation tests for `BlogPostHeaderClient` — the localised title /
 * summary / metadata block at the top of a blog post.
 *
 * Documented behaviour:
 * - `title` and `summary` are bilingual JSON fields resolved as
 *   `content.<field>?.[lang] ?? content.<field>?.en`, so a missing Italian
 *   value silently falls back to English.
 * - The summary paragraph is only rendered when the resolved value is truthy.
 * - `readingTime.minutes` is passed through `Math.ceil` and interpolated into
 *   the `blog.reading_time` translation. The whole block is skipped when
 *   `readingTime` is falsy.
 * - The tag row is only rendered when `tags?.length > 0`.
 *
 * Dates are formatted with `toLocaleDateString(lang)`, whose exact output
 * depends on the ICU data of the running Node build, so only stable substrings
 * (the year) and the `dateTime` attribute are asserted.
 *
 * `useLanguage` applies the locale in a mount effect, so all
 * locale-dependent assertions are async.
 */

/** Midday UTC keeps the calendar day stable across CI timezones. */
const DATE = '2024-03-15T12:00:00.000Z'

/**
 * Minimal but complete `CoreContent<Blog>` fixture. Contentlayer types the
 * bilingual fields as `any`, so overriding them with partial `{ en }` objects
 * is type-safe and mirrors real frontmatter that is missing a translation.
 */
function makeContent(overrides: Partial<CoreContent<Blog>> = {}): CoreContent<Blog> {
  return {
    type: 'Blog',
    title: { en: 'Deriving the OLS estimator', it: 'Derivare lo stimatore OLS' },
    summary: { en: 'The algebra behind OLS.', it: "L'algebra dietro OLS." },
    date: DATE,
    tags: [],
    readingTime: { text: '5 min read', minutes: 4.2, time: 252000, words: 840 },
    slug: 'deriving-ols-estimator',
    path: 'blog/deriving-ols-estimator',
    filePath: 'blog/deriving-ols-estimator.mdx',
    toc: [],
    titleEn: 'Deriving the OLS estimator',
    titleIt: 'Derivare lo stimatore OLS',
    summaryEn: 'The algebra behind OLS.',
    summaryIt: "L'algebra dietro OLS.",
    structuredData: {},
    ...overrides,
  }
}

describe('BlogPostHeaderClient', () => {
  describe('title', () => {
    it('renders the English title as the page heading under locale "en"', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent()} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Deriving the OLS estimator' })
      ).toBeInTheDocument()
    })

    it('renders the Italian title under locale "it"', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent()} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Derivare lo stimatore OLS' })
      ).toBeInTheDocument()
    })

    it('falls back to the English title when the Italian one is missing', async () => {
      renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ title: { en: 'English only title' } })} />,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: 'English only title' })
      ).toBeInTheDocument()
    })
  })

  describe('summary', () => {
    it('renders the localised summary paragraph when present', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent()} />, { locale: 'it' })

      expect(await screen.findByText("L'algebra dietro OLS.")).toBeInTheDocument()
    })

    it('falls back to the English summary when the Italian one is missing', async () => {
      renderWithProviders(
        <BlogPostHeaderClient
          content={makeContent({ summary: { en: 'English only summary.' } })}
        />,
        { locale: 'it' }
      )

      expect(await screen.findByText('English only summary.')).toBeInTheDocument()
    })

    it('renders no summary paragraph when the summary is absent', async () => {
      const { container } = renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ summary: undefined })} />
      )

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      // The only <p> the component can render in this configuration is the
      // summary, so its absence is observable structurally.
      expect(container.querySelectorAll('p')).toHaveLength(0)
    })

    it('renders no summary paragraph when the summary is an empty string', async () => {
      const { container } = renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ summary: { en: '' } })} />
      )

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(container.querySelectorAll('p')).toHaveLength(0)
    })
  })

  describe('reading time', () => {
    it('rounds the minutes up and interpolates them into the English string', async () => {
      renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ readingTime: { minutes: 4.2 } })} />,
        { locale: 'en' }
      )

      expect(await screen.findByText('Reading time: 5 min')).toBeInTheDocument()
    })

    it('interpolates the rounded minutes into the Italian string', async () => {
      renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ readingTime: { minutes: 4.2 } })} />,
        { locale: 'it' }
      )

      expect(await screen.findByText('Tempo di lettura: 5 min')).toBeInTheDocument()
    })

    it('leaves whole minutes untouched', async () => {
      renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ readingTime: { minutes: 7 } })} />
      )

      expect(await screen.findByText('Reading time: 7 min')).toBeInTheDocument()
    })

    it('renders 1 min for any sub-minute reading time', async () => {
      renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ readingTime: { minutes: 0.4 } })} />
      )

      expect(await screen.findByText('Reading time: 1 min')).toBeInTheDocument()
    })

    it('omits the reading-time span entirely when readingTime is absent', async () => {
      renderWithProviders(
        <BlogPostHeaderClient content={makeContent({ readingTime: undefined })} />
      )

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByText(/Reading time/)).not.toBeInTheDocument()
    })
  })

  describe('tags', () => {
    const tags = [
      { id: 'statistics', label: { en: 'Statistics', it: 'Statistica' } },
      { id: 'math', label: { en: 'Mathematics', it: 'Matematica' } },
    ]

    it('renders one Tag per entry when tags is non-empty', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent({ tags })} />, {
        locale: 'en',
      })

      expect(await screen.findByText('Statistics')).toBeInTheDocument()
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    })

    it('renders the Italian tag labels under locale "it"', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent({ tags })} />, {
        locale: 'it',
      })

      expect(await screen.findByText('Statistica')).toBeInTheDocument()
      expect(screen.getByText('Matematica')).toBeInTheDocument()
    })

    it('renders no tags when the array is empty', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent({ tags: [] })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByText('Statistics')).not.toBeInTheDocument()
    })

    it('does not throw when tags is undefined', async () => {
      renderWithProviders(<BlogPostHeaderClient content={makeContent({ tags: undefined })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('date', () => {
    it('exposes the raw ISO date on the time element dateTime attribute', async () => {
      const { container } = renderWithProviders(<BlogPostHeaderClient content={makeContent()} />)

      expect(container.querySelector('time')).toHaveAttribute('datetime', DATE)
    })

    it('renders the year in the visible date text', async () => {
      const { container } = renderWithProviders(<BlogPostHeaderClient content={makeContent()} />)

      expect(container.querySelector('time')).toHaveTextContent('2024')
    })

    it('formats the date with the active locale', async () => {
      const { container } = renderWithProviders(<BlogPostHeaderClient content={makeContent()} />, {
        locale: 'it',
      })

      await waitFor(() => {
        expect(container.querySelector('time')).toHaveTextContent(
          new Date(DATE).toLocaleDateString('it')
        )
      })
    })
  })
})
