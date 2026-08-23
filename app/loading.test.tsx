import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from './loading'

/**
 * Characterisation tests for the root `loading` route segment.
 *
 * It is a props-less server component with no context consumers, so no
 * providers are needed and everything is synchronous.
 *
 * Documented behaviour (root variant = spinner, not skeleton rows):
 * - One spinner element: a `div` carrying `animate-spin` and the circular
 *   border classes.
 * - The literal English text "Loading..." in a paragraph.
 * - No headings, links or ARIA live/status roles are used, so the state is
 *   not announced to assistive technology.
 */
describe('root Loading', () => {
  it('renders the literal "Loading..." copy', () => {
    render(<Loading />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('puts the copy in a paragraph', () => {
    render(<Loading />)

    expect(screen.getByText('Loading...').tagName).toBe('P')
  })

  it('renders exactly one spinner', () => {
    const { container } = render(<Loading />)

    const spinners = container.querySelectorAll('.animate-spin')
    expect(spinners).toHaveLength(1)
  })

  it('styles the spinner as a circular 12x12 ring with a transparent segment', () => {
    const { container } = render(<Loading />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12', 'w-12', 'rounded-full', 'border-4', 'border-r-transparent')
  })

  it('renders no skeleton pulse blocks (that is the per-route variant)', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0)
  })

  it('exposes no status role, heading or link', () => {
    render(<Loading />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('centres the spinner in a min-height viewport block', () => {
    const { container } = render(<Loading />)

    expect(container.firstElementChild).toHaveClass(
      'flex',
      'min-h-[50vh]',
      'items-center',
      'justify-center'
    )
  })
})
