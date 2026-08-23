import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import ProjectsError from './error'
import { itBehavesLikeAnErrorBoundary } from '../../test/errorBoundaryContract'

/**
 * Characterisation tests for the `/projects` `error.tsx` route-segment
 * boundary.
 *
 * The shared contract (logging, heading, copy, `reset` wiring) lives in
 * `test/errorBoundaryContract.tsx`; the assertions below pin the
 * projects-specific copy and layout.
 */
describe('projects Error', () => {
  itBehavesLikeAnErrorBoundary({
    Component: ProjectsError,
    heading: 'Failed to load projects',
    message: 'An error occurred while loading the projects.',
  })

  it('constrains the panel to the shared page max width', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<ProjectsError error={new Error('boom')} reset={vi.fn()} />)

    expect(container.firstElementChild).toHaveClass('mx-auto', 'max-w-6xl', 'px-6')

    spy.mockRestore()
  })
})
