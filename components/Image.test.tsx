import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Image from './Image'

/**
 * Characterisation tests for the responsive image component's three branches:
 *
 * 1. Small static jpg/png (<200px) → `<picture>` with 144w/200w thumbnails.
 * 2. Other static jpg/png → `<picture>` with 640/800/1000w variants.
 * 3. Anything else → a bare `next/image`.
 *
 * `BASE_PATH` is read once at module load, so it is not manipulated here;
 * the tests assert paths relative to the default (empty) base path.
 */
describe('Image', () => {
  describe('small static images (< 200px)', () => {
    it('renders a picture element with webp and fallback sources', () => {
      const { container } = render(
        <Image src="/static/images/avatar.jpg" alt="Avatar" width={100} height={100} />
      )

      const sources = container.querySelectorAll('picture source')
      expect(sources).toHaveLength(2)
      expect(sources[0]).toHaveAttribute('type', 'image/webp')
      expect(sources[1]).toHaveAttribute('type', 'image/jpeg')
    })

    it('builds a 144w/200w srcset from the responsive directory', () => {
      const { container } = render(
        <Image src="/static/images/avatar.jpg" alt="Avatar" width={100} height={100} />
      )

      const webp = container.querySelector('source[type="image/webp"]')
      expect(webp?.getAttribute('srcSet')).toBe(
        '/static/images/responsive/avatar-144w.webp 144w, /static/images/responsive/avatar-200w.webp 200w'
      )
    })

    it('uses 200px sizes when displayed at 100px or above', () => {
      const { container } = render(
        <Image src="/static/images/avatar.jpg" alt="Avatar" width={150} height={150} />
      )

      expect(container.querySelector('source')).toHaveAttribute('sizes', '200px')
    })

    it('uses 144px sizes when displayed below 100px', () => {
      const { container } = render(
        <Image src="/static/images/avatar.jpg" alt="Avatar" width={64} height={64} />
      )

      expect(container.querySelector('source')).toHaveAttribute('sizes', '144px')
    })

    it('prefers an explicit sizes prop', () => {
      const { container } = render(
        <Image src="/static/images/avatar.jpg" alt="Avatar" width={64} height={64} sizes="50vw" />
      )

      expect(container.querySelector('source')).toHaveAttribute('sizes', '50vw')
    })

    it('reports png fallbacks as image/png', () => {
      const { container } = render(
        <Image src="/static/images/icon.png" alt="Icon" width={64} height={64} />
      )

      const sources = container.querySelectorAll('picture source')
      expect(sources[1]).toHaveAttribute('type', 'image/png')
    })

    it('treats an image as small when only the height is below 200', () => {
      const { container } = render(
        <Image src="/static/images/banner.jpg" alt="Banner" width={800} height={100} />
      )

      // 144w/200w srcset proves the small-image branch was taken.
      const webp = container.querySelector('source[type="image/webp"]')
      expect(webp?.getAttribute('srcSet')).toContain('-144w.webp')
    })
  })

  describe('regular static images', () => {
    it('renders a picture element with 640/800/1000w variants', () => {
      const { container } = render(
        <Image src="/static/images/hero.jpg" alt="Hero" width={1200} height={800} />
      )

      const webp = container.querySelector('source[type="image/webp"]')
      const srcSet = webp?.getAttribute('srcSet') ?? ''
      expect(srcSet).toContain('/static/images/responsive/hero-640w.webp 640w')
      expect(srcSet).toContain('/static/images/responsive/hero-800w.webp 800w')
      expect(srcSet).toContain('/static/images/responsive/hero-1000w.webp 1000w')
    })

    it('emits a matching jpeg fallback srcset', () => {
      const { container } = render(
        <Image src="/static/images/hero.jpg" alt="Hero" width={1200} height={800} />
      )

      const fallback = container.querySelector('source[type="image/jpeg"]')
      expect(fallback?.getAttribute('srcSet')).toContain(
        '/static/images/responsive/hero-1000w.jpg 1000w'
      )
    })

    it('takes this branch when no dimensions are given', () => {
      const { container } = render(<Image src="/static/images/hero.jpg" alt="Hero" fill />)

      const webp = container.querySelector('source[type="image/webp"]')
      expect(webp?.getAttribute('srcSet')).toContain('-640w.webp')
    })
  })

  describe('fallthrough', () => {
    it('renders a bare image for non-static sources', () => {
      const { container } = render(
        <Image src="/uploads/photo.jpg" alt="Photo" width={800} height={600} />
      )

      expect(container.querySelector('picture')).toBeNull()
      expect(container.querySelector('img')).toBeInTheDocument()
    })

    it('renders a bare image for unsupported extensions', () => {
      const { container } = render(
        <Image src="/static/images/anim.gif" alt="Anim" width={800} height={600} />
      )

      expect(container.querySelector('picture')).toBeNull()
      expect(container.querySelector('img')).toBeInTheDocument()
    })

    it('renders a bare image for svg sources', () => {
      const { container } = render(
        <Image src="/static/images/logo.svg" alt="Logo" width={800} height={600} />
      )

      expect(container.querySelector('picture')).toBeNull()
    })
  })

  describe('shared behaviour', () => {
    it('keeps the alt text on the inner image', () => {
      const { container } = render(
        <Image src="/static/images/hero.jpg" alt="Descriptive alt" width={1200} height={800} />
      )

      expect(container.querySelector('img')).toHaveAttribute('alt', 'Descriptive alt')
    })

    it('maps fetchpriority to the DOM fetchpriority attribute', () => {
      const { container } = render(
        <Image src="/uploads/photo.jpg" alt="Photo" width={800} height={600} fetchpriority="high" />
      )

      expect(container.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
    })

    it('omits fetchpriority when not requested', () => {
      const { container } = render(
        <Image src="/uploads/photo.jpg" alt="Photo" width={800} height={600} />
      )

      expect(container.querySelector('img')).not.toHaveAttribute('fetchpriority')
    })
  })
})
