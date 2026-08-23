import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

/**
 * Characterisation tests for the root `not-found` route segment.
 *
 * It is a server component with no props, no context consumers and no
 * translation lookups: the copy is hardcoded English, so no providers are
 * needed and every assertion is synchronous.
 *
 * Documented behaviour:
 * - The "404" text is a level-1 heading.
 * - Two paragraphs of fixed English copy follow it.
 * - A single internal link ("Back to homepage") points at `/`.
 */
describe('NotFound', () => {
  it('renders 404 as the level-1 heading', () => {
    render(<NotFound />)

    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument()
  })

  it('renders the hardcoded English apology copy', () => {
    render(<NotFound />)

    expect(screen.getByText("Sorry we couldn't find this page.")).toBeInTheDocument()
  })

  it('renders the hardcoded English homepage hint', () => {
    render(<NotFound />)

    expect(
      screen.getByText('But dont worry, you can find plenty of other things on our homepage.')
    ).toBeInTheDocument()
  })

  it('renders a single link back to the home page', () => {
    render(<NotFound />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('Back to homepage')
    expect(links[0]).toHaveAttribute('href', '/')
  })

  it('renders the homepage link as an internal (same-tab) link', () => {
    render(<NotFound />)

    const link = screen.getByRole('link', { name: 'Back to homepage' })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('renders no localisation keys (copy is not translated)', () => {
    const { container } = render(<NotFound />)

    expect(container.textContent).not.toMatch(/[a-z]+\.[a-z_]+\.[a-z_]+/)
  })
})
