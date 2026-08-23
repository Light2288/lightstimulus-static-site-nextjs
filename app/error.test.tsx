import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootError from './error'
import { itBehavesLikeAnErrorBoundary } from '../test/errorBoundaryContract'

/**
 * Characterisation tests for the root `error.tsx` route-segment boundary.
 *
 * The shared contract (logging, heading, copy, `reset` wiring) lives in
 * `test/errorBoundaryContract.tsx` because the three error boundaries in this
 * app are behaviourally identical; only the copy and container classes differ.
 * The variant-specific assertions below pin what makes this one the root one.
 */
describe('root Error', () => {
  itBehavesLikeAnErrorBoundary({
    Component: RootError,
    heading: 'Something went wrong!',
    message: 'An error occurred while loading this page.',
  })

  it('uses the generic page-level copy rather than a section-specific message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<RootError error={new Error('boom')} reset={vi.fn()} />)

    expect(screen.queryByText(/blog/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/projects/i)).not.toBeInTheDocument()

    spy.mockRestore()
  })

  it('centres the panel without constraining it to the page max width', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<RootError error={new Error('boom')} reset={vi.fn()} />)

    // The root variant has no `mx-auto max-w-6xl` wrapper, unlike the blog and
    // projects variants.
    expect(container.firstElementChild).toHaveClass('flex', 'min-h-[50vh]', 'px-4')
    expect(container.firstElementChild).not.toHaveClass('max-w-6xl')

    spy.mockRestore()
  })
})
