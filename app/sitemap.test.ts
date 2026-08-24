import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import siteMetadata from '@/data/siteMetadata'

/**
 * Characterisation tests for the static sitemap route.
 *
 * `contentlayer/generated` is mocked with fixtures so the test never depends on
 * real generated output (a build artifact) and stays stable as content changes.
 * The clock is frozen because static routes stamp today's date.
 */
vi.mock('contentlayer/generated', () => ({
  allBlogs: [
    { path: 'blog/published', date: '2024-01-01', lastmod: '2024-06-01', draft: false },
    { path: 'blog/no-lastmod', date: '2024-02-02' },
    { path: 'blog/drafted', date: '2024-03-03', draft: true },
  ],
  allProjects: [
    { slug: 'certflow', date: '2025-01-01' },
    { slug: 'drafted-project', date: '2025-02-02', draft: true },
  ],
}))

const FROZEN_NOW = new Date('2026-08-22T12:34:56.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

/** Import lazily so the mocked contentlayer module is in place first. */
async function loadSitemap() {
  const { default: sitemap } = await import('./sitemap')
  return sitemap()
}

describe('sitemap', () => {
  it('includes the fixed static routes', async () => {
    const urls = (await loadSitemap()).map((entry) => entry.url)

    expect(urls).toEqual(
      expect.arrayContaining([
        `${siteMetadata.siteUrl}/`,
        `${siteMetadata.siteUrl}/blog`,
        `${siteMetadata.siteUrl}/projects`,
        `${siteMetadata.siteUrl}/about`,
        `${siteMetadata.siteUrl}/contact`,
      ])
    )
  })

  it('includes the resume route so it is discoverable by crawlers', async () => {
    const urls = (await loadSitemap()).map((entry) => entry.url)

    expect(urls).toContain(`${siteMetadata.siteUrl}/resume`)
  })

  it('emits a /tags route even though no tags route exists in the app', async () => {
    // Documented as-is: `app/tags` does not exist. Recorded as a finding.
    const urls = (await loadSitemap()).map((entry) => entry.url)

    expect(urls).toContain(`${siteMetadata.siteUrl}/tags`)
  })

  it('stamps static routes with today in YYYY-MM-DD form', async () => {
    const entries = await loadSitemap()
    const staticEntry = entries.find((e) => e.url === `${siteMetadata.siteUrl}/blog`)

    expect(staticEntry?.lastModified).toBe('2026-08-22')
  })

  it('excludes draft blog posts', async () => {
    const urls = (await loadSitemap()).map((entry) => entry.url)

    expect(urls).not.toContain(`${siteMetadata.siteUrl}/blog/drafted`)
    expect(urls).toContain(`${siteMetadata.siteUrl}/blog/published`)
  })

  it('prefers a blog post lastmod over its date', async () => {
    const entries = await loadSitemap()
    const entry = entries.find((e) => e.url === `${siteMetadata.siteUrl}/blog/published`)

    expect(entry?.lastModified).toBe('2024-06-01')
  })

  it('falls back to the blog post date when lastmod is absent', async () => {
    const entries = await loadSitemap()
    const entry = entries.find((e) => e.url === `${siteMetadata.siteUrl}/blog/no-lastmod`)

    expect(entry?.lastModified).toBe('2024-02-02')
  })

  it('does not draft-filter projects, unlike blog posts', async () => {
    // Asymmetry preserved from the source: projects have no draft filter.
    const urls = (await loadSitemap()).map((entry) => entry.url)

    expect(urls).toContain(`${siteMetadata.siteUrl}/projects/drafted-project`)
  })

  it('builds project urls under /projects/<slug> using the project date', async () => {
    const entries = await loadSitemap()
    const entry = entries.find((e) => e.url === `${siteMetadata.siteUrl}/projects/certflow`)

    expect(entry?.lastModified).toBe('2025-01-01')
  })

  it('orders static routes before blog and project routes', async () => {
    const urls = (await loadSitemap()).map((entry) => entry.url)
    const lastStatic = urls.indexOf(`${siteMetadata.siteUrl}/contact`)
    const firstBlog = urls.indexOf(`${siteMetadata.siteUrl}/blog/published`)

    expect(lastStatic).toBeLessThan(firstBlog)
  })

  it('returns one entry per static route plus non-draft blogs plus all projects', async () => {
    // 7 static + 2 non-draft blogs + 2 projects
    expect(await loadSitemap()).toHaveLength(11)
  })
})
