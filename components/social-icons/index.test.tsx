import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SocialIcon from './index'

/**
 * Characterisation tests for `SocialIcon`, whose value is mostly in its two
 * null guards and its dynamic size classes.
 */
describe('SocialIcon', () => {
  describe('null guards', () => {
    it('renders nothing without an href', () => {
      const { container } = render(<SocialIcon kind="github" href={undefined} />)

      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing for an empty href', () => {
      const { container } = render(<SocialIcon kind="github" href="" />)

      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing for a mail icon whose href is not a valid mailto', () => {
      const { container } = render(<SocialIcon kind="mail" href="https://example.com" />)

      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing for a mailto missing a top-level domain', () => {
      const { container } = render(<SocialIcon kind="mail" href="mailto:someone@localhost" />)

      expect(container).toBeEmptyDOMElement()
    })

    it('renders a valid mailto address', () => {
      render(<SocialIcon kind="mail" href="mailto:hello@example.com" />)

      expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:hello@example.com')
    })

    it('accepts a mailto with dots and plus signs in the local part', () => {
      render(<SocialIcon kind="mail" href="mailto:first.last+tag@example.co.uk" />)

      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('does not apply the mailto check to non-mail kinds', () => {
      render(<SocialIcon kind="github" href="https://github.com/x" />)

      expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/x')
    })
  })

  describe('rendered anchor', () => {
    it('opens in a new tab with a safe rel', () => {
      render(<SocialIcon kind="linkedin" href="https://linkedin.com/in/x" />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('exposes the kind as screen-reader-only text', () => {
      const { container } = render(<SocialIcon kind="linkedin" href="https://linkedin.com/in/x" />)

      // The icon SVG contributes its own <title> ("Linkedin"), so the anchor's
      // full accessible name is the sr-only kind plus the SVG title. Assert on
      // the sr-only span directly to pin the intended label.
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly).toHaveTextContent('linkedin')
    })

    it('includes the icon title in the accessible name', () => {
      render(<SocialIcon kind="linkedin" href="https://linkedin.com/in/x" />)

      // Documents current behaviour: the name is the concatenation of the
      // sr-only text and the SVG <title>.
      expect(screen.getByRole('link', { name: 'linkedinLinkedin' })).toBeInTheDocument()
    })
  })

  describe('size classes', () => {
    it('defaults to size 8', () => {
      const { container } = render(<SocialIcon kind="github" href="https://github.com/x" />)

      expect(container.querySelector('svg')).toHaveClass('h-8', 'w-8')
    })

    it('honours an explicit size', () => {
      const { container } = render(
        <SocialIcon kind="github" href="https://github.com/x" size={6} />
      )

      expect(container.querySelector('svg')).toHaveClass('h-6', 'w-6')
    })
  })

  it.each(['mail', 'github', 'linkedin', 'twitter', 'x', 'bluesky'] as const)(
    'renders an svg for the %s icon',
    (kind) => {
      const href = kind === 'mail' ? 'mailto:a@b.com' : 'https://example.com'
      const { container } = render(<SocialIcon kind={kind} href={href} />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    }
  )
})
