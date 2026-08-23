import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import BlogError from './error'
import { itBehavesLikeAnErrorBoundary } from '../../test/errorBoundaryContract'

/**
 * Characterisation tests for the `/blog` `error.tsx` route-segment boundary.
 *
 * The shared contract (logging, heading, copy, `reset` wiring) lives in
 * `test/errorBoundaryContract.tsx`; the assertions below pin the blog-specific
 * copy and layout.
 */
describe('blog Error', () => {
  itBehavesLikeAnErrorBoundary({
    Component: BlogError,
    heading: 'Failed to load blog posts',
    message: 'An error occurred while loading the blog.',
  })

  it('constrains the panel to the shared page max width', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<BlogError error={new Error('boom')} reset={vi.fn()} />)

    expect(container.firstElementChild).toHaveClass('mx-auto', 'max-w-6xl', 'px-6')

    spy.mockRestore()
  })
})
