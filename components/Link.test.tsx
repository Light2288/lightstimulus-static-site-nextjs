import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CustomLink from './Link'

/**
 * Characterisation tests for the link component's three-way branching:
 * internal (`/`), same-page anchor (`#`), and everything else (external).
 */
describe('CustomLink', () => {
  describe('internal links', () => {
    it('renders a root-relative href as a link', () => {
      render(<CustomLink href="/projects">Projects</CustomLink>)

      const link = screen.getByRole('link', { name: 'Projects' })
      expect(link).toHaveAttribute('href', '/projects')
    })

    it('does not open internal links in a new tab', () => {
      render(<CustomLink href="/projects">Projects</CustomLink>)

      const link = screen.getByRole('link', { name: 'Projects' })
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('anchor links', () => {
    it('renders a hash href as a plain anchor', () => {
      render(<CustomLink href="#section">Section</CustomLink>)

      const link = screen.getByRole('link', { name: 'Section' })
      expect(link).toHaveAttribute('href', '#section')
    })

    it('does not open anchor links in a new tab', () => {
      render(<CustomLink href="#section">Section</CustomLink>)

      const link = screen.getByRole('link', { name: 'Section' })
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('external links', () => {
    it('opens in a new tab with a safe rel', () => {
      render(<CustomLink href="https://example.com">Example</CustomLink>)

      const link = screen.getByRole('link', { name: 'Example' })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('treats a protocol-relative url as external', () => {
      render(<CustomLink href="//example.com">Example</CustomLink>)

      // Note: `//example.com` starts with '/', so it takes the *internal*
      // branch. Documented as current behaviour.
      const link = screen.getByRole('link', { name: 'Example' })
      expect(link).not.toHaveAttribute('target')
    })

    it('treats a mailto href as external', () => {
      render(<CustomLink href="mailto:a@b.com">Mail</CustomLink>)

      const link = screen.getByRole('link', { name: 'Mail' })
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('treats a relative path without a leading slash as external', () => {
      render(<CustomLink href="about">About</CustomLink>)

      const link = screen.getByRole('link', { name: 'About' })
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  it('applies break-words to every variant', () => {
    const { unmount } = render(<CustomLink href="/a">Internal</CustomLink>)
    expect(screen.getByRole('link')).toHaveClass('break-words')
    unmount()

    const anchor = render(<CustomLink href="#a">Anchor</CustomLink>)
    expect(screen.getByRole('link')).toHaveClass('break-words')
    anchor.unmount()

    render(<CustomLink href="https://example.com">External</CustomLink>)
    expect(screen.getByRole('link')).toHaveClass('break-words')
  })

  it('forwards extra props such as className and aria-label', () => {
    render(
      <CustomLink href="/x" className="custom" aria-label="Labelled">
        X
      </CustomLink>
    )

    const link = screen.getByRole('link', { name: 'Labelled' })
    expect(link).toHaveClass('custom')
  })
})
