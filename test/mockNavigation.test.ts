import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { mockNavigation, resetNavigationMock } from './mockNavigation'

/**
 * Verifies the `next/navigation` mock helper itself.
 *
 * Without this mock, `useSearchParams()` returns `null` in jsdom and any
 * `.get()` call throws `Cannot read properties of null (reading 'get')` —
 * which is exactly what breaks `ListWithTagsLayout` and the list clients.
 */
afterEach(() => {
  resetNavigationMock()
})

describe('mockNavigation', () => {
  it('makes useSearchParams().get() work instead of returning null', () => {
    mockNavigation({ searchParams: { tag: 'react' } })

    const { result } = renderHook(() => useSearchParams())

    expect(result.current).not.toBeNull()
    expect(result.current?.get('tag')).toBe('react')
    expect(result.current?.get('missing')).toBeNull()
  })

  it('returns the configured pathname', () => {
    mockNavigation({ pathname: '/blog/page/2' })

    const { result } = renderHook(() => usePathname())

    expect(result.current).toBe('/blog/page/2')
  })

  it('defaults to "/" and empty search params when nothing is configured', () => {
    mockNavigation()

    const { result: pathname } = renderHook(() => usePathname())
    const { result: params } = renderHook(() => useSearchParams())

    expect(pathname.current).toBe('/')
    expect(params.current?.get('anything')).toBeNull()
  })

  it('exposes a spyable router push', () => {
    const { push } = mockNavigation()

    const { result } = renderHook(() => useRouter())
    result.current.push('/projects/certflow')

    expect(push).toHaveBeenCalledWith('/projects/certflow')
  })

  it('accepts a query string for search params', () => {
    mockNavigation({ searchParams: 'tag=nextjs&page=3' })

    const { result } = renderHook(() => useSearchParams())

    expect(result.current?.get('tag')).toBe('nextjs')
    expect(result.current?.get('page')).toBe('3')
  })

  it('resets configuration between tests', () => {
    mockNavigation({ pathname: '/about', searchParams: { tag: 'x' } })
    resetNavigationMock()

    const { result: pathname } = renderHook(() => usePathname())
    const { result: params } = renderHook(() => useSearchParams())

    expect(pathname.current).toBe('/')
    expect(params.current?.get('tag')).toBeNull()
  })

  it('clears push call history on reset', () => {
    const { push } = mockNavigation()
    const { result } = renderHook(() => useRouter())
    result.current.push('/one')
    expect(push).toHaveBeenCalledTimes(1)

    resetNavigationMock()

    expect(push).toHaveBeenCalledTimes(0)
  })

  it('provides the other router methods as spies', () => {
    const router = mockNavigation()

    const { result } = renderHook(() => useRouter())
    result.current.replace('/r')
    result.current.back()
    result.current.forward()
    result.current.refresh()
    result.current.prefetch('/p')

    expect(router.replace).toHaveBeenCalledWith('/r')
    expect(router.back).toHaveBeenCalled()
    expect(router.forward).toHaveBeenCalled()
    expect(router.refresh).toHaveBeenCalled()
    expect(router.prefetch).toHaveBeenCalledWith('/p')
  })

  it('is wired through vi.mock so components importing next/navigation get the mock', () => {
    // The module is mocked at the factory level, so the imported symbols are spies.
    expect(vi.isMockFunction(usePathname)).toBe(true)
    expect(vi.isMockFunction(useSearchParams)).toBe(true)
    expect(vi.isMockFunction(useRouter)).toBe(true)
  })
})
