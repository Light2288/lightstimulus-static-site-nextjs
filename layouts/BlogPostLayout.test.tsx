import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor, within } from '../test/renderWithProviders'
import BlogPostLayout from './BlogPostLayout'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

/**
 * Characterisation tests for `BlogPostLayout` — the server component that
 * composes a single blog post page.
 *
 * It is a pure composition shell: it renders
 * `ScrollTopAndComment` → `<article>` → `<header>` (optional hero `Image` +
 * `BlogPostHeaderClient`) → the MDX `children` → `BlogPostNavigationClient`.
 * The localised title/summary/metadata and the prev/next labels are produced by
 * those client children, which have their own test files; here we only pin the
 * wiring and the branches the layout itself owns:
 *
 * - The hero image is gated on `content.images?.[0]` being truthy, so a missing
 *   or empty `images` array renders no image at all.
 * - The hero `alt` text is computed **server-side** as
 *   `content.title?.en || 'Blog post'`. It is therefore always English (never
 *   the active locale) and falls back to the literal string `'Blog post'` when
 *   the English title is missing or empty.
 * - `next` / `prev` are passed straight through to
 *   `BlogPostNavigationClient`, which turns them into `/blog/<slug>` links.
 * - `children` are wrapped in the prose container, untouched.
 *
 * Notes on the environment:
 * - `siteMetadata.comments` is commented out in `data/siteMetadata.js`, so
 *   `ScrollTopAndComment` renders only the "Scroll To Top" button.
 * - The client children call `useLanguage`, whose locale is applied in a mount
 *   effect, so every locale-dependent assertion is async.
 * - Dates are formatted with `toLocaleDateString(lang)`; only the year (a
 *   stable substring across ICU builds) is asserted.
 */

/** Midday UTC keeps the calendar day stable across CI timezones. */
const DATE = '2024-03-15T12:00:00.000Z'
/** A `/static/images/*.jpg` src makes `Image` take its `<picture>` branch. */
const HERO = '/static/images/canada/mountains.jpg'

function makeContent(overrides: Partial<CoreContent<Blog>> = {}): CoreContent<Blog> {
  return {
    type: 'Blog',
    title: { en: 'Deriving the OLS estimator', it: 'Derivare lo stimatore OLS' },
    summary: { en: 'The algebra behind OLS.', it: "L'algebra dietro OLS." },
    date: DATE,
    tags: [],
    images: undefined,
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

/** Minimal neighbour post: the navigation only reads `slug` and `title`. */
function makeNeighbour(slug: string, title: Record<string, string>): CoreContent<Blog> {
  return makeContent({
    slug,
    title,
    path: `blog/${slug}`,
    filePath: `blog/${slug}.mdx`,
    titleEn: title.en ?? '',
    titleIt: title.it ?? '',
  })
}

const Body = () => (
  <>
    <h2>A section of the post</h2>
    <p>The rendered MDX body paragraph.</p>
  </>
)

describe('BlogPostLayout', () => {
  describe('composition', () => {
    it('renders the header, the children and the navigation together', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>,
        { locale: 'en' }
      )

      // Header (BlogPostHeaderClient)
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Deriving the OLS estimator' })
      ).toBeInTheDocument()
      // Children (MDX body)
      expect(screen.getByText('The rendered MDX body paragraph.')).toBeInTheDocument()
      // Navigation (BlogPostNavigationClient)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('wraps everything in a single <article> element', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>
      )

      const article = await screen.findByRole('article')
      expect(within(article).getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(within(article).getByText('The rendered MDX body paragraph.')).toBeInTheDocument()
      expect(within(article).getByRole('navigation')).toBeInTheDocument()
    })

    it('places the header before the children and the navigation last', async () => {
      const { container } = renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>
      )

      await screen.findByRole('heading', { level: 1 })
      const article = screen.getByRole('article')
      const order = Array.from(article.children).map((el) => el.tagName)
      expect(order).toEqual(['HEADER', 'DIV', 'NAV'])
      // The prose wrapper is the middle child and holds the children.
      expect(container.querySelector('.prose')).toHaveTextContent(
        'The rendered MDX body paragraph.'
      )
    })

    it('renders the ScrollTopAndComment control outside the article', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>
      )

      const scrollTop = await screen.findByRole('button', { name: 'Scroll To Top' })
      expect(scrollTop).toBeInTheDocument()
      expect(screen.getByRole('article').contains(scrollTop)).toBe(false)
    })

    it('renders no "Scroll To Comment" button because no comments provider is configured', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('button', { name: 'Scroll To Top' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Scroll To Comment' })).not.toBeInTheDocument()
    })
  })

  describe('children', () => {
    it('renders arbitrary JSX children in the prose container', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <section data-testid="mdx-body">
            <p>First paragraph.</p>
            <p>Second paragraph.</p>
          </section>
        </BlogPostLayout>
      )

      const body = await screen.findByTestId('mdx-body')
      expect(body).toBeInTheDocument()
      expect(body.parentElement).toHaveClass('prose')
      expect(within(body).getByText('First paragraph.')).toBeInTheDocument()
      expect(within(body).getByText('Second paragraph.')).toBeInTheDocument()
    })

    it('renders headings coming from the children as level-2 headings', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>
      )

      expect(
        await screen.findByRole('heading', { level: 2, name: 'A section of the post' })
      ).toBeInTheDocument()
    })

    it('renders the prose container even when children are empty', async () => {
      const { container } = renderWithProviders(
        <BlogPostLayout content={makeContent()}>{null}</BlogPostLayout>
      )

      await screen.findByRole('heading', { level: 1 })
      const prose = container.querySelector('.prose')
      expect(prose).toBeInTheDocument()
      expect(prose?.childElementCount).toBe(0)
    })
  })

  describe('hero image', () => {
    it('renders the hero image when content.images has a first entry', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      expect(
        await screen.findByRole('img', { name: 'Deriving the OLS estimator' })
      ).toBeInTheDocument()
    })

    it('renders no image at all when content.images is undefined', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ images: undefined })}>
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders no image when content.images is an empty array', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ images: [] })}>
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('uses only the first entry when several images are provided', async () => {
      renderWithProviders(
        <BlogPostLayout
          content={makeContent({ images: [HERO, '/static/images/canada/toronto.jpg'] })}
        >
          <Body />
        </BlogPostLayout>
      )

      const images = await screen.findAllByRole('img')
      expect(images).toHaveLength(1)
      expect(images[0].getAttribute('src')).toContain('mountains')
    })

    it('marks the hero image as an eager, high-priority fetch', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      const img = await screen.findByRole('img', { name: 'Deriving the OLS estimator' })
      expect(img).toHaveAttribute('fetchpriority', 'high')
      expect(img).toHaveAttribute('loading', 'eager')
    })

    it('renders the hero image inside the header, above the title', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      const img = await screen.findByRole('img', { name: 'Deriving the OLS estimator' })
      const header = screen.getByRole('article').querySelector('header') as HTMLElement
      expect(header.contains(img)).toBe(true)
      const heading = within(header).getByRole('heading', { level: 1 })
      expect(img.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  describe('hero alt text', () => {
    it('derives the alt text from the English title', async () => {
      renderWithProviders(
        <BlogPostLayout
          content={makeContent({
            images: [HERO],
            title: { en: 'English hero title', it: 'Titolo italiano' },
          })}
        >
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('img', { name: 'English hero title' })).toBeInTheDocument()
    })

    it('keeps the English alt text even under the Italian locale', async () => {
      // The alt text is computed in the server component, so it never reacts to
      // the client-side language selection: the heading is Italian while the
      // image alt stays English.
      renderWithProviders(
        <BlogPostLayout
          content={makeContent({
            images: [HERO],
            title: { en: 'English hero title', it: 'Titolo italiano' },
          })}
        >
          <Body />
        </BlogPostLayout>,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Titolo italiano' })
      ).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'English hero title' })).toBeInTheDocument()
    })

    it('falls back to "Blog post" when the title object is missing', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ title: undefined, images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('img', { name: 'Blog post' })).toBeInTheDocument()
    })

    it('falls back to "Blog post" when the English title is missing', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ title: { it: 'Solo italiano' }, images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('img', { name: 'Blog post' })).toBeInTheDocument()
    })

    it('falls back to "Blog post" when the English title is an empty string', async () => {
      // `||` (not `??`) is used, so an empty string also takes the fallback.
      renderWithProviders(
        <BlogPostLayout content={makeContent({ title: { en: '' }, images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      expect(await screen.findByRole('img', { name: 'Blog post' })).toBeInTheDocument()
    })

    it('still renders the (empty) heading when the title is missing entirely', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent({ title: undefined, images: [HERO] })}>
          <Body />
        </BlogPostLayout>
      )

      // The client header renders PageTitle with an undefined child, so the h1
      // exists but has no text.
      const heading = await screen.findByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('')
    })
  })

  describe('prev / next wiring', () => {
    const prev = makeNeighbour('the-time-machine', {
      en: 'The Time Machine',
      it: 'La macchina del tempo',
    })
    const next = makeNeighbour('pictures-of-canada', {
      en: 'Pictures of Canada',
      it: 'Immagini del Canada',
    })

    it('renders no navigation links when neither neighbour is provided', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>
      )

      const nav = await screen.findByRole('navigation')
      expect(within(nav).queryAllByRole('link')).toHaveLength(0)
    })

    it('passes prev through to the navigation', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()} prev={prev}>
          <Body />
        </BlogPostLayout>,
        { locale: 'en' }
      )

      const link = await screen.findByRole('link', {
        name: '← Previous article: The Time Machine',
      })
      expect(link).toHaveAttribute('href', '/blog/the-time-machine')
      expect(screen.getByRole('navigation').contains(link)).toBe(true)
    })

    it('passes next through to the navigation', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()} next={next}>
          <Body />
        </BlogPostLayout>,
        { locale: 'en' }
      )

      const link = await screen.findByRole('link', { name: 'Next article: Pictures of Canada →' })
      expect(link).toHaveAttribute('href', '/blog/pictures-of-canada')
    })

    it('renders both neighbour links, previous first in DOM order', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()} prev={prev} next={next}>
          <Body />
        </BlogPostLayout>,
        { locale: 'en' }
      )

      const nav = await screen.findByRole('navigation')
      await waitFor(() => {
        expect(within(nav).getAllByRole('link')).toHaveLength(2)
      })
      const links = within(nav).getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/blog/the-time-machine')
      expect(links[1]).toHaveAttribute('href', '/blog/pictures-of-canada')
    })

    it('localises the neighbour labels from the active language', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()} prev={prev} next={next}>
          <Body />
        </BlogPostLayout>,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('link', { name: '← Articolo precedente: La macchina del tempo' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Articolo successivo: Immagini del Canada →' })
      ).toBeInTheDocument()
    })
  })

  describe('delegated header content', () => {
    it('renders the localised summary from the client header', async () => {
      renderWithProviders(
        <BlogPostLayout content={makeContent()}>
          <Body />
        </BlogPostLayout>,
        { locale: 'it' }
      )

      expect(await screen.findByText("L'algebra dietro OLS.")).toBeInTheDocument()
    })

    it('renders the reading time and the post date', async () => {
      const { container } = renderWithProviders(
        <BlogPostLayout content={makeContent({ readingTime: { minutes: 4.2 } })}>
          <Body />
        </BlogPostLayout>,
        { locale: 'en' }
      )

      expect(await screen.findByText('Reading time: 5 min')).toBeInTheDocument()
      const time = container.querySelector('time')
      expect(time).toHaveAttribute('datetime', DATE)
      expect(time).toHaveTextContent('2024')
    })

    it('renders the post tags from the client header', async () => {
      renderWithProviders(
        <BlogPostLayout
          content={makeContent({
            tags: [{ id: 'math', label: { en: 'Math', it: 'Matematica' } }],
          })}
        >
          <Body />
        </BlogPostLayout>,
        { locale: 'en' }
      )

      expect(await screen.findByText('Math')).toBeInTheDocument()
    })
  })
})
