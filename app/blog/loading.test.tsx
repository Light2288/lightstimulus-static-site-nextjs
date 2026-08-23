import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from './loading'

/**
 * Characterisation tests for the `/blog` `loading` route segment.
 *
 * A props-less server component with no context consumers, so no providers are
 * needed and everything is synchronous.
 *
 * Documented behaviour (blog variant = skeleton rows, not a spinner):
 * - A single title placeholder bar (`h-10 w-48`) above the list.
 * - Exactly 3 skeleton rows (`[1, 2, 3].map(...)`), each a bordered card
 *   holding 3 grey bars (date, title, excerpt).
 * - So 4 `animate-pulse` elements in total: the title bar plus one per row.
 * - No text, headings, links or `status` role: it is purely decorative markup.
 */
const EXPECTED_ROWS = 3

describe('blog Loading', () => {
  it('renders exactly three skeleton rows', () => {
    const { container } = render(<Loading />)

    const rows = container.querySelectorAll('.animate-pulse.rounded-lg.border')
    expect(rows).toHaveLength(EXPECTED_ROWS)
  })

  it('renders a title placeholder bar above the rows', () => {
    const { container } = render(<Loading />)

    const titleBar = container.querySelector('.animate-pulse.h-10')
    expect(titleBar).toBeInTheDocument()
    expect(titleBar).toHaveClass('w-48', 'rounded')
  })

  it('renders four pulsing elements in total (title bar + one per row)', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(EXPECTED_ROWS + 1)
  })

  it('renders three grey bars inside every skeleton row', () => {
    const { container } = render(<Loading />)

    const rows = Array.from(container.querySelectorAll('.animate-pulse.rounded-lg.border'))
    expect(rows).toHaveLength(EXPECTED_ROWS)
    for (const row of rows) {
      expect(row.children).toHaveLength(3)
    }
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

  it('stacks the rows vertically rather than in a grid', () => {
    const { container } = render(<Loading />)

    const list = container.querySelector('.space-y-6')
    expect(list).toBeInTheDocument()
    expect(container.querySelector('.grid')).not.toBeInTheDocument()
  })
})
