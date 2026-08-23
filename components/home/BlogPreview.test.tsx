import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import BlogPreview from './BlogPreview'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

/**
 * Characterisation tests for `BlogPreview` — the "latest posts" block on the
 * home page.
 *
 * Documented behaviour:
 * - It short-circuits to `null` when `posts` is empty (`if (!posts.length)`),
 *   so neither the section heading nor the "view all" link is rendered.
 * - Otherwise it renders a `<section>` containing a `SectionHeader` for
 *   `home.blog.title`, a `/blog` link labelled `home.blog.view_all` (with a
 *   trailing `→` glyph appended in JSX, so the accessible name includes it),
 *   and one `BlogCardSmall` per post.
 * - Bilingual `title` / `summary` fields are resolved as
 *   `post.<field>[lang] ?? post.<field>.en`, so a missing Italian value
 *   silently falls back to English.
 * - `tags` is passed through as `post.tags ?? []`.
 *
 * `useLanguage` resolves the locale in a mount effect, so every
 * locale-dependent assertion is async. Dates go through `Intl.DateTimeFormat`
 * inside `BlogCardSmall`, so only stable substrings (the year) are asserted.
 */

/** Midday UTC keeps the calendar day stable across CI timezones. */
const DATE = '2024-03-15T12:00:00.000Z'

function makePost(overrides: Partial<CoreContent<Blog>> = {}): CoreContent<Blog> {
  return {
    type: 'Blog',
    title: { en: 'Deriving the OLS estimator', it: 'Derivare lo stimatore OLS' },
    summary: {
      en: 'A short walk through the algebra behind ordinary least squares.',
      it: 'Una breve passeggiata nell’algebra dei minimi quadrati.',
    },
    date: DATE,
    tags: [],
    readingTime: { minutes: 5 },
    slug: 'deriving-ols-estimator',
    path: 'blog/deriving-ols-estimator',
    filePath: 'blog/deriving-ols-estimator.mdx',
    toc: [],
    titleEn: 'Deriving the OLS estimator',
    titleIt: 'Derivare lo stimatore OLS',
    summaryEn: 'A short walk through the algebra behind ordinary least squares.',
    summaryIt: 'Una breve passeggiata nell’algebra dei minimi quadrati.',
    structuredData: {},
    ...overrides,
  } as CoreContent<Blog>
}

const SECOND_POST = makePost({
  title: { en: 'Why agents fail', it: 'Perché gli agenti falliscono' },
  summary: { en: 'Notes on brittle tool use.', it: 'Note sull’uso fragile dei tool.' },
  slug: 'why-agents-fail',
})

describe('BlogPreview', () => {
  describe('empty guard', () => {
    it('renders none of its own elements when posts is empty', async () => {
      const { container } = renderWithProviders(<BlogPreview posts={[]} />)

      // Wait for the locale effect to settle so this is not a false negative
      // taken before the provider has re-rendered.
      await waitFor(() => {
        expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      })
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(container.querySelector('section')).not.toBeInTheDocument()
    })

    it('leaves only the theme provider script behind when posts is empty', async () => {
      const { container } = renderWithProviders(<BlogPreview posts={[]} />)

      await waitFor(() => {
        // next-themes injects a <script> into the container, so the container is
        // never strictly empty even though BlogPreview returned null.
        expect(Array.from(container.children).map((n) => n.tagName)).toEqual(['SCRIPT'])
      })
    })
  })

  describe('with posts', () => {
    it('renders the section header for home.blog.title', async () => {
      renderWithProviders(<BlogPreview posts={[makePost()]} />)

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Latest blog posts' })
      ).toBeInTheDocument()
    })

    it('renders a view-all link pointing at /blog', async () => {
      renderWithProviders(<BlogPreview posts={[makePost()]} />)

      const link = await screen.findByRole('link', { name: /View all posts/ })
      expect(link).toHaveAttribute('href', '/blog')
    })

    it('appends the arrow glyph to the view-all label', async () => {
      renderWithProviders(<BlogPreview posts={[makePost()]} />)

      expect(await screen.findByText('View all posts →')).toBeInTheDocument()
    })

    it('renders one card per post', async () => {
      renderWithProviders(<BlogPreview posts={[makePost(), SECOND_POST]} />)

      expect(
        await screen.findByRole('heading', { level: 3, name: 'Deriving the OLS estimator' })
      ).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Why agents fail' })).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
    })

    it('links each card to /blog/<slug>', async () => {
      renderWithProviders(<BlogPreview posts={[makePost(), SECOND_POST]} />)

      expect(
        await screen.findByRole('link', { name: /Deriving the OLS estimator/ })
      ).toHaveAttribute('href', '/blog/deriving-ols-estimator')
      expect(screen.getByRole('link', { name: /Why agents fail/ })).toHaveAttribute(
        'href',
        '/blog/why-agents-fail'
      )
    })

    it('renders the post summary', async () => {
      renderWithProviders(<BlogPreview posts={[makePost()]} />)

      expect(
        await screen.findByText('A short walk through the algebra behind ordinary least squares.')
      ).toBeInTheDocument()
    })

    it('renders the post date inside a <time> element', async () => {
      const { container } = renderWithProviders(<BlogPreview posts={[makePost()]} />)

      await waitFor(() => {
        expect(container.querySelector('time')).toHaveTextContent('2024')
      })
    })

    it('renders the post tags when present', async () => {
      const post = makePost({
        tags: [{ id: 'automation', label: { en: 'Automation', it: 'Automazione' } }],
      })
      renderWithProviders(<BlogPreview posts={[post]} />)

      expect(await screen.findByText('Automation')).toBeInTheDocument()
    })

    it('tolerates a post without tags (defaults to an empty list)', async () => {
      const post = makePost({ tags: undefined as unknown as CoreContent<Blog>['tags'] })
      renderWithProviders(<BlogPreview posts={[post]} />)

      expect(
        await screen.findByRole('heading', { level: 3, name: 'Deriving the OLS estimator' })
      ).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('locales', () => {
    it('renders the English header, link label and post title under locale "en"', async () => {
      renderWithProviders(<BlogPreview posts={[makePost()]} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Latest blog posts' })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /View all posts/ })).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 3, name: 'Deriving the OLS estimator' })
      ).toBeInTheDocument()
    })

    it('renders the Italian header, link label and post title under locale "it"', async () => {
      renderWithProviders(<BlogPreview posts={[makePost()]} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Ultimi articoli dal blog' })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Vedi tutti gli articoli/ })).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 3, name: 'Derivare lo stimatore OLS' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Una breve passeggiata nell’algebra dei minimi quadrati.')
      ).toBeInTheDocument()
    })

    it('falls back to the English title/summary when the Italian value is missing', async () => {
      const post = makePost({
        title: { en: 'English only title' },
        summary: { en: 'English only summary.' },
      })
      renderWithProviders(<BlogPreview posts={[post]} />, { locale: 'it' })

      // The header still switches to Italian, proving the locale did apply.
      expect(
        await screen.findByRole('heading', { level: 2, name: 'Ultimi articoli dal blog' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 3, name: 'English only title' })
      ).toBeInTheDocument()
      expect(screen.getByText('English only summary.')).toBeInTheDocument()
    })
  })
})
