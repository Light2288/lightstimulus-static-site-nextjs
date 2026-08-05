import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageTitle from './PageTitle'

/**
 * Example test — simple presentational component (no context).
 * Proves the harness renders a plain component and asserts on output.
 */
describe('PageTitle', () => {
  it('renders its children inside a level-1 heading', () => {
    render(<PageTitle>Hello World</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Hello World')
  })

  it('renders the gradient variant with a gradient text span', () => {
    render(<PageTitle gradient>Gradient Title</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1, name: 'Gradient Title' })
    const span = heading.querySelector('span')
    expect(span).not.toBeNull()
    expect(span).toHaveClass('bg-clip-text')
    expect(span).toHaveTextContent('Gradient Title')
  })
})
