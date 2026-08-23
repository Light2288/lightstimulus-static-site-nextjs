import type { ComponentType } from 'react'
import { expect, it, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Shared contract for the three `error.tsx` route-segment boundaries
 * (`app/error.tsx`, `app/blog/error.tsx`, `app/projects/error.tsx`).
 *
 * All three are `'use client'` components with an identical contract — log the
 * error on mount, render a heading plus explanatory copy, and expose a
 * "Try again" button wired to `reset` — differing only in their copy and
 * container classes. This helper keeps the behavioural assertions in one place
 * while each component still owns its own test file.
 *
 * `console.error` is stubbed per test (the component deliberately calls it) and
 * always restored, so a genuine unexpected error elsewhere stays visible.
 */

/** Props shared by every route-segment error boundary. */
type ErrorBoundaryProps = {
  error: Error & { digest?: string }
  reset: () => void
}

interface ErrorBoundaryContract {
  /** The component under test. */
  Component: ComponentType<ErrorBoundaryProps>
  /** Exact heading text rendered by this variant. */
  heading: string
  /** Exact explanatory copy rendered by this variant. */
  message: string
}

/**
 * Register the shared behavioural tests for one error boundary.
 * Call inside a `describe` block in the component's own test file.
 */
export function itBehavesLikeAnErrorBoundary({
  Component,
  heading,
  message,
}: ErrorBoundaryContract) {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  /** Stub console.error, render, and hand back the reset spy. */
  function renderBoundary() {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const reset = vi.fn()
    const error = Object.assign(new Error('boom'), { digest: 'abc123' })
    const view = render(<Component error={error} reset={reset} />)
    return { ...view, reset, error }
  }

  afterEach(() => {
    consoleErrorSpy?.mockRestore()
  })

  it('logs the error on mount', () => {
    const { error } = renderBoundary()

    expect(consoleErrorSpy).toHaveBeenCalledWith(error)
  })

  it('logs the error exactly once for a stable error prop', () => {
    renderBoundary()

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
  })

  it('renders the heading at level 2', () => {
    renderBoundary()

    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument()
  })

  it('renders the explanatory copy', () => {
    renderBoundary()

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('renders a "Try again" button', () => {
    renderBoundary()

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('calls reset when "Try again" is clicked', async () => {
    const user = userEvent.setup()
    const { reset } = renderBoundary()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(reset).toHaveBeenCalledOnce()
  })

  it('does not call reset before the button is clicked', () => {
    const { reset } = renderBoundary()

    expect(reset).not.toHaveBeenCalled()
  })

  it('calls reset once per click', async () => {
    const user = userEvent.setup()
    const { reset } = renderBoundary()

    const button = screen.getByRole('button', { name: 'Try again' })
    await user.click(button)
    await user.click(button)

    expect(reset).toHaveBeenCalledTimes(2)
  })

  it('does not render the error message to the user', () => {
    renderBoundary()

    // The raw error text stays in the console; users only see the friendly copy.
    expect(screen.queryByText('boom')).not.toBeInTheDocument()
  })

  it('renders no link (recovery is the button, not navigation)', () => {
    renderBoundary()

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
}
