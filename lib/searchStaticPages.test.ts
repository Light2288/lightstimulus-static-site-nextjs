import { describe, it, expect } from 'vitest'
import { staticSearchPages } from './searchStaticPages'

/**
 * Characterisation tests for the hand-authored static search entries.
 * These back the `/contact`, `/projects` and `/blog` routes in the kbar index.
 */
describe('staticSearchPages', () => {
  it('contains the three static routes', () => {
    expect(staticSearchPages.map((page) => page.url)).toEqual(['/contact', '/projects', '/blog'])
  })

  it('uses unique urls', () => {
    const urls = staticSearchPages.map((page) => page.url)

    expect(new Set(urls).size).toBe(urls.length)
  })

  it('marks every entry as a Page', () => {
    for (const page of staticSearchPages) {
      expect(page.type).toBe('Page')
    }
  })

  it('provides a non-empty English and Italian title for every entry', () => {
    for (const page of staticSearchPages) {
      expect(page.title.en.trim()).not.toBe('')
      expect(page.title.it.trim()).not.toBe('')
    }
  })

  it('provides a non-empty English and Italian summary for every entry', () => {
    for (const page of staticSearchPages) {
      expect(page.summary.en.trim()).not.toBe('')
      expect(page.summary.it.trim()).not.toBe('')
    }
  })

  it('uses root-relative urls', () => {
    for (const page of staticSearchPages) {
      expect(page.url.startsWith('/')).toBe(true)
    }
  })

  it('translates titles rather than duplicating English, except for "Blog"', () => {
    const contact = staticSearchPages.find((page) => page.url === '/contact')
    const projects = staticSearchPages.find((page) => page.url === '/projects')
    const blog = staticSearchPages.find((page) => page.url === '/blog')

    expect(contact?.title.it).toBe('Contatti')
    expect(projects?.title.it).toBe('Progetti')
    // "Blog" is intentionally identical in both locales.
    expect(blog?.title.it).toBe('Blog')
  })
})
