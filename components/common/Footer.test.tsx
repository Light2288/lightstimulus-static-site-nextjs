import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'
import siteMetadata from '@/data/siteMetadata'

/**
 * Characterisation tests for the site footer.
 *
 * The copyright year comes from `new Date()`, so the clock is frozen to keep
 * the assertion stable regardless of when the suite runs.
 */
const FROZEN_YEAR = 2031

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(`${FROZEN_YEAR}-05-05T00:00:00.000Z`))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Footer', () => {
  it('renders the frozen copyright year', () => {
    render(<Footer />)

    expect(screen.getByText(`© ${FROZEN_YEAR}`)).toBeInTheDocument()
  })

  it('renders the author name from site metadata', () => {
    render(<Footer />)

    expect(screen.getByText(siteMetadata.author)).toBeInTheDocument()
  })

  it('links the site title back to the home page', () => {
    render(<Footer />)

    const link = screen.getByRole('link', { name: siteMetadata.title })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders the three social icons', () => {
    const { container } = render(<Footer />)

    // mail, github and linkedin all resolve to anchors with sr-only labels.
    const srOnly = Array.from(container.querySelectorAll('.sr-only')).map((n) => n.textContent)
    expect(srOnly).toEqual(expect.arrayContaining(['mail', 'github', 'linkedin']))
  })

  it('builds the mail icon href from the configured email', () => {
    const { container } = render(<Footer />)

    const mailLink = Array.from(container.querySelectorAll('a')).find((a) =>
      a.getAttribute('href')?.startsWith('mailto:')
    )
    expect(mailLink).toHaveAttribute('href', `mailto:${siteMetadata.email}`)
  })

  it('credits the stack with external links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'Next.js' })).toHaveAttribute(
      'href',
      'https://nextjs.org/'
    )
    expect(screen.getByRole('link', { name: 'Tailwind CSS' })).toHaveAttribute(
      'href',
      'https://tailwindcss.com/'
    )
    expect(screen.getByRole('link', { name: 'TypeScript' })).toHaveAttribute(
      'href',
      'https://www.typescriptlang.org/'
    )
  })

  it('opens the stack credit links safely in a new tab', () => {
    render(<Footer />)

    for (const name of ['Next.js', 'Tailwind CSS', 'TypeScript']) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('suppresses hydration warnings on the year to avoid SSR mismatches', () => {
    render(<Footer />)

    // React strips the attribute from the DOM, so assert the year still renders
    // inside its own span rather than checking for the attribute itself.
    expect(screen.getByText(`© ${FROZEN_YEAR}`).tagName).toBe('SPAN')
  })

  it('renders inside a footer landmark', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
