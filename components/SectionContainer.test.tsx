import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionContainer from './SectionContainer'

/** Characterisation tests for the page-width section wrapper. */
describe('SectionContainer', () => {
  it('renders children inside a section element', () => {
    render(
      <SectionContainer>
        <p>Content</p>
      </SectionContainer>
    )

    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toContainElement(screen.getByText('Content'))
  })

  it('constrains width and centres the section', () => {
    render(<SectionContainer>x</SectionContainer>)

    expect(document.querySelector('section')).toHaveClass('mx-auto', 'w-full', 'max-w-5xl')
  })

  it('renders multiple children in order', () => {
    render(
      <SectionContainer>
        <p>First</p>
        <p>Second</p>
      </SectionContainer>
    )

    const section = document.querySelector('section')
    expect(section?.textContent).toBe('FirstSecond')
  })
})
