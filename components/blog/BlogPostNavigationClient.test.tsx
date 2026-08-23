import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import BlogPostNavigationClient from './BlogPostNavigationClient'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

/**
 * Characterisation tests for `BlogPostNavigationClient` — the prev/next footer
 * links of a blog post.
 *
 * Documented behaviour:
 * - Always renders a two-column `<nav>` grid; each slot is an empty `<div>`
 *   when its neighbour is absent, so there are four observable cases:
 *   neither, prev only, next only, both.
 * - Each link targets `/blog/<slug>` and its label is the neighbour's title
 *   resolved as `title?.[lang] ?? title?.en`, interpolated into
 *   `blog.previous_article` / `blog.next_article`.
 * - The arrow glyphs are plain text siblings: `←` precedes the previous label,
 *   `→` follows the next label.
 *
 * `useLanguage` applies the locale in a mount effect, so every assertion that
 * depends on translated text is async.
 */

/** Minimal `CoreContent<Blog>` neighbour: the component only reads slug/title. */
function makeNeighbour(slug: string, title: Record<string, string>) {
  return {
    type: 'Blog',
    slug,
    title,
    summary: { en: 'Summary.' },
    date: '2024-03-15T12:00:00.000Z',
    tags: [],
    readingTime: { minutes: 3 },
    path: `blog/${slug}`,
    filePath: `blog/${slug}.mdx`,
    toc: [],
    titleEn: title.en ?? '',
    titleIt: title.it ?? '',
    summaryEn: 'Summary.',
    summaryIt: 'Summary.',
    structuredData: {},
  } as CoreContent<Blog>
}

const prev = makeNeighbour('the-time-machine', {
  en: 'The Time Machine',
  it: 'La macchina del tempo',
})
const next = makeNeighbour('pictures-of-canada', {
  en: 'Pictures of Canada',
  it: 'Immagini del Canada',
})

describe('BlogPostNavigationClient', () => {
  describe('when neither neighbour is provided', () => {
    it('renders the nav element but no links', async () => {
      renderWithProviders(<BlogPostNavigationClient />)

      expect(await screen.findByRole('navigation')).toBeInTheDocument()
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })

    it('still renders both (empty) grid slots', async () => {
      renderWithProviders(<BlogPostNavigationClient />)

      const nav = await screen.findByRole('navigation')
      expect(nav.querySelectorAll(':scope > div')).toHaveLength(2)
    })
  })

  describe('when only prev is provided', () => {
    it('renders a single link to the previous article', async () => {
      renderWithProviders(<BlogPostNavigationClient prev={prev} />)

      const links = await screen.findAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute('href', '/blog/the-time-machine')
    })

    it('interpolates the previous title into the English label', async () => {
      renderWithProviders(<BlogPostNavigationClient prev={prev} />, { locale: 'en' })

      expect(
        await screen.findByRole('link', { name: '← Previous article: The Time Machine' })
      ).toBeInTheDocument()
    })

    it('interpolates the previous title into the Italian label', async () => {
      renderWithProviders(<BlogPostNavigationClient prev={prev} />, { locale: 'it' })

      expect(
        await screen.findByRole('link', {
          name: '← Articolo precedente: La macchina del tempo',
        })
      ).toBeInTheDocument()
    })

    it('falls back to the English title when the Italian one is missing', async () => {
      renderWithProviders(
        <BlogPostNavigationClient prev={makeNeighbour('code-sample', { en: 'Code Sample' })} />,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('link', { name: '← Articolo precedente: Code Sample' })
      ).toBeInTheDocument()
    })
  })

  describe('when only next is provided', () => {
    it('renders a single link to the next article', async () => {
      renderWithProviders(<BlogPostNavigationClient next={next} />)

      const links = await screen.findAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute('href', '/blog/pictures-of-canada')
    })

    it('interpolates the next title into the English label', async () => {
      renderWithProviders(<BlogPostNavigationClient next={next} />, { locale: 'en' })

      expect(
        await screen.findByRole('link', { name: 'Next article: Pictures of Canada →' })
      ).toBeInTheDocument()
    })

    it('interpolates the next title into the Italian label', async () => {
      renderWithProviders(<BlogPostNavigationClient next={next} />, { locale: 'it' })

      expect(
        await screen.findByRole('link', { name: 'Articolo successivo: Immagini del Canada →' })
      ).toBeInTheDocument()
    })

    it('falls back to the English title when the Italian one is missing', async () => {
      renderWithProviders(
        <BlogPostNavigationClient next={makeNeighbour('code-sample', { en: 'Code Sample' })} />,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('link', { name: 'Articolo successivo: Code Sample →' })
      ).toBeInTheDocument()
    })
  })

  describe('when both neighbours are provided', () => {
    it('renders both links, previous first in DOM order', async () => {
      renderWithProviders(<BlogPostNavigationClient prev={prev} next={next} />, { locale: 'en' })

      const links = await screen.findAllByRole('link')
      expect(links).toHaveLength(2)
      expect(links[0]).toHaveTextContent('← Previous article: The Time Machine')
      expect(links[1]).toHaveTextContent('Next article: Pictures of Canada →')
    })

    it('points each link at its own slug', async () => {
      renderWithProviders(<BlogPostNavigationClient prev={prev} next={next} />)

      const links = await screen.findAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/blog/the-time-machine')
      expect(links[1]).toHaveAttribute('href', '/blog/pictures-of-canada')
    })

    it('renders both Italian labels under locale "it"', async () => {
      renderWithProviders(<BlogPostNavigationClient prev={prev} next={next} />, { locale: 'it' })

      expect(
        await screen.findByRole('link', { name: '← Articolo precedente: La macchina del tempo' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Articolo successivo: Immagini del Canada →' })
      ).toBeInTheDocument()
    })
  })
})
