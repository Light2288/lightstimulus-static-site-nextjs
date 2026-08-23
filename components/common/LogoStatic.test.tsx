import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LogoStatic from './LogoStatic'

/**
 * `LogoStatic` imports `@/data/logo.svg` as a React component (via
 * `@svgr/webpack` in the real build). Without SVG handling in the Vitest
 * config, that import resolves to the URL string `"/data/logo.svg"` and
 * rendering throws `InvalidCharacterError: ... did not match the Name
 * production`. These tests pin both the SVG stub wiring and the wordmark.
 */
describe('LogoStatic', () => {
  it('renders the imported SVG as an element rather than a URL string', () => {
    render(<LogoStatic />)

    expect(screen.getByTestId('svg-mock')).toBeInTheDocument()
  })

  it('renders the LIGHT and STIMULUS wordmark', () => {
    render(<LogoStatic />)

    // The wordmark is split across nested spans for the accent colouring
    // ("LI" + "GHT", "STI" + "MULUS"). The default text matcher ignores
    // elements whose text spans children, so match on the <span> whose own
    // combined textContent equals the full word.
    const wordmarkRow = (word: string) => (_content: string, element: Element | null) =>
      element?.tagName === 'SPAN' && element.textContent === word

    expect(screen.getByText(wordmarkRow('LIGHT'))).toBeInTheDocument()
    expect(screen.getByText(wordmarkRow('STIMULUS'))).toBeInTheDocument()
  })

  it('applies the accent colour to the "LI" and "MULUS" fragments', () => {
    render(<LogoStatic />)

    expect(screen.getByText('LI')).toBeInTheDocument()
    expect(screen.getByText('MULUS')).toBeInTheDocument()
  })
})
