import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from 'motion/react'
import { mockMatchMedia, mockReducedMotion, resetMatchMedia } from './mockMatchMedia'

/**
 * Verifies the per-test `matchMedia` override.
 *
 * The global stub in `test/setup.ts` always reports `matches: false`, which
 * makes reduced-motion and mobile-breakpoint branches unreachable. These
 * helpers let a test opt specific queries into `matches: true`.
 */
afterEach(() => {
  resetMatchMedia()
})

describe('mockMatchMedia', () => {
  it('reports matches: true only for the configured queries', () => {
    mockMatchMedia(['(max-width: 1239px)'])

    expect(window.matchMedia('(max-width: 1239px)').matches).toBe(true)
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
  })

  it('accepts a predicate for flexible matching', () => {
    mockMatchMedia((query) => query.includes('max-width'))

    expect(window.matchMedia('(max-width: 600px)').matches).toBe(true)
    expect(window.matchMedia('(min-width: 600px)').matches).toBe(false)
  })

  it('echoes the query back on the returned MediaQueryList', () => {
    mockMatchMedia([])

    expect(window.matchMedia('(min-width: 42px)').media).toBe('(min-width: 42px)')
  })

  it('supports addEventListener/removeEventListener for change listeners', () => {
    mockMatchMedia(['(max-width: 1239px)'])
    const mql = window.matchMedia('(max-width: 1239px)')
    const listener = () => {}

    // TextAnimation subscribes to 'change'; the calls must not throw.
    expect(() => mql.addEventListener('change', listener)).not.toThrow()
    expect(() => mql.removeEventListener('change', listener)).not.toThrow()
  })

  it('restores the default all-false behaviour on reset', () => {
    mockMatchMedia(['(max-width: 1239px)'])
    resetMatchMedia()

    expect(window.matchMedia('(max-width: 1239px)').matches).toBe(false)
  })
})

describe('mockReducedMotion', () => {
  it('sets prefers-reduced-motion matching at the matchMedia level', () => {
    mockReducedMotion()

    // framer-motion queries "(prefers-reduced-motion)" with no value.
    expect(window.matchMedia('(prefers-reduced-motion)').matches).toBe(true)
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
    expect(window.matchMedia('(max-width: 1239px)').matches).toBe(false)
  })

  it('makes useReducedMotion() report true', () => {
    mockReducedMotion()

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(true)
  })

  it('leaves useReducedMotion() false when reduced motion is not mocked', () => {
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)
  })

  it('can switch back to motion-allowed after being mocked', () => {
    mockReducedMotion()
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true)

    resetMatchMedia()

    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
  })
})
