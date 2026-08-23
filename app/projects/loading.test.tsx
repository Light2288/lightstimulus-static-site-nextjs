import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from './loading'

/**
 * Characterisation tests for the `/projects` `loading` route segment.
 *
 * A props-less server component with no context consumers, so no providers are
 * needed and everything is synchronous.
 *
 * Documented behaviour (projects variant = a 2-column card grid):
 * - A single title placeholder bar (`h-10 w-48`) above the grid.
 * - Exactly 4 skeleton cards (`[1, 2, 3, 4].map(...)`), each a bordered card
 *   holding an image block (`h-48`) plus a padded body with 2 grey bars.
 * - So 5 `animate-pulse` elements in total: the title bar plus one per card.
 * - Laid out as a grid (1 column, 2 from `sm`), unlike the blog variant which
 *   stacks rows vertically.
 * - No text, headings, links or `status` role: purely decorative markup.
 */
const EXPECTED_CARDS = 4

describe('projects Loading', () => {
  it('renders exactly four skeleton cards', () => {
    const { container } = render(<Loading />)

    const cards = container.querySelectorAll('.animate-pulse.rounded-lg.border')
    expect(cards).toHaveLength(EXPECTED_CARDS)
  })

  it('renders a title placeholder bar above the grid', () => {
    const { container } = render(<Loading />)

    const titleBar = container.querySelector('.animate-pulse.h-10')
    expect(titleBar).toBeInTheDocument()
    expect(titleBar).toHaveClass('w-48', 'rounded')
  })

  it('renders five pulsing elements in total (title bar + one per card)', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(EXPECTED_CARDS + 1)
  })

  it('gives every card an image block and a padded body', () => {
    const { container } = render(<Loading />)

    const cards = Array.from(container.querySelectorAll('.animate-pulse.rounded-lg.border'))
    expect(cards).toHaveLength(EXPECTED_CARDS)
    for (const card of cards) {
      expect(card.children).toHaveLength(2)
      expect(card.querySelector('.h-48')).toBeInTheDocument()
      expect(card.querySelector('.p-5')).toBeInTheDocument()
    }
  })

  it('renders two grey bars inside every card body', () => {
    const { container } = render(<Loading />)

    const bodies = Array.from(container.querySelectorAll('.p-5'))
    expect(bodies).toHaveLength(EXPECTED_CARDS)
    for (const body of bodies) {
      expect(body.children).toHaveLength(2)
    }
  })

  it('lays the cards out in a responsive two-column grid', () => {
    const { container } = render(<Loading />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2')
  })

  it('renders no spinner (that is the root loading variant)', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.animate-spin')).toHaveLength(0)
  })

  it('renders no text content at all', () => {
    const { container } = render(<Loading />)

    expect(container.textContent).toBe('')
  })

  it('exposes no status role, heading or link', () => {
    render(<Loading />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('constrains the skeleton to the shared max-w-6xl page width', () => {
    const { container } = render(<Loading />)

    expect(container.firstElementChild).toHaveClass('mx-auto', 'max-w-6xl', 'px-6', 'py-12')
  })
})
