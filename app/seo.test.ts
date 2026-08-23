import { describe, it, expect } from 'vitest'
import { genPageMetadata } from './seo'
import siteMetadata from '@/data/siteMetadata'

/**
 * Characterisation tests for `genPageMetadata`, the shared page-metadata
 * builder used by the about/contact/blog/projects routes.
 */
describe('genPageMetadata', () => {
  describe('canonical url', () => {
    it('uses the bare site url when no slug is given', () => {
      const metadata = genPageMetadata({ title: 'Home' })

      expect(metadata.openGraph?.url).toBe(siteMetadata.siteUrl)
    })

    it('appends the slug to the site url when given', () => {
      const metadata = genPageMetadata({ title: 'About', slug: 'about' })

      expect(metadata.openGraph?.url).toBe(`${siteMetadata.siteUrl}/about`)
    })

    it('supports nested slugs', () => {
      const metadata = genPageMetadata({ title: 'CertFlow', slug: 'projects/certflow' })

      expect(metadata.openGraph?.url).toBe(`${siteMetadata.siteUrl}/projects/certflow`)
    })
  })

  describe('og image', () => {
    it('falls back to the social banner when no image is given', () => {
      const metadata = genPageMetadata({ title: 'About' })

      expect(metadata.openGraph?.images).toEqual([
        `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`,
      ])
    })

    it('prefixes a provided image with the site url', () => {
      const metadata = genPageMetadata({ title: 'About', image: '/static/img/x.png' })

      expect(metadata.openGraph?.images).toEqual([`${siteMetadata.siteUrl}/static/img/x.png`])
    })

    it('uses the same image for twitter and openGraph', () => {
      const metadata = genPageMetadata({ title: 'About', image: '/static/img/x.png' })

      expect(metadata.twitter?.images).toEqual(metadata.openGraph?.images)
    })
  })

  describe('titles', () => {
    it('keeps the bare title at the top level', () => {
      const metadata = genPageMetadata({ title: 'About' })

      expect(metadata.title).toBe('About')
    })

    it('suffixes the site title in openGraph and twitter', () => {
      const metadata = genPageMetadata({ title: 'About' })

      expect(metadata.openGraph?.title).toBe(`About | ${siteMetadata.title}`)
      expect(metadata.twitter?.title).toBe(`About | ${siteMetadata.title}`)
    })
  })

  describe('description', () => {
    it('falls back to the site description', () => {
      const metadata = genPageMetadata({ title: 'About' })

      expect(metadata.description).toBe(siteMetadata.description)
      expect(metadata.openGraph?.description).toBe(siteMetadata.description)
    })

    it('uses an explicit description when provided', () => {
      const metadata = genPageMetadata({ title: 'About', description: 'Custom' })

      expect(metadata.description).toBe('Custom')
      expect(metadata.openGraph?.description).toBe('Custom')
    })

    it('treats an empty description as absent', () => {
      const metadata = genPageMetadata({ title: 'About', description: '' })

      expect(metadata.description).toBe(siteMetadata.description)
    })
  })

  describe('static openGraph and twitter fields', () => {
    it('sets locale, type and site name on openGraph', () => {
      const metadata = genPageMetadata({ title: 'About' })

      expect(metadata.openGraph).toMatchObject({
        locale: 'en_US',
        type: 'website',
        siteName: siteMetadata.title,
      })
    })

    it('uses a large summary card for twitter', () => {
      const metadata = genPageMetadata({ title: 'About' })

      // `card` is only present on the resolving Twitter variant, so narrow
      // before asserting.
      expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' })
    })
  })

  describe('rest spread', () => {
    it('passes extra metadata fields through', () => {
      const metadata = genPageMetadata({
        title: 'About',
        alternates: { canonical: 'https://example.com/x' },
      })

      expect(metadata.alternates?.canonical).toBe('https://example.com/x')
    })

    it('lets rest override earlier fields because it is spread last', () => {
      // `rest` is spread after the computed fields, so a description supplied
      // through it wins over the destructured `description` argument.
      const metadata = genPageMetadata({
        title: 'About',
        ...({ description: 'Override' } as { description: string }),
      })

      expect(metadata.description).toBe('Override')
    })

    it('allows rest to replace the whole openGraph object', () => {
      const metadata = genPageMetadata({
        title: 'About',
        openGraph: { title: 'Replaced' },
      })

      expect(metadata.openGraph?.title).toBe('Replaced')
      // The computed images are lost — the object is replaced, not merged.
      expect(metadata.openGraph?.images).toBeUndefined()
    })
  })
})
