import { vi } from 'vitest'

/**
 * Configurable state + spies backing the global `next/navigation` mock.
 *
 * ## Why this is needed
 * In jsdom there is no Next.js router context, so the real
 * `useSearchParams()` returns `null`. Any component calling
 * `useSearchParams().get(...)` therefore throws
 * `Cannot read properties of null (reading 'get')`. This affects
 * `layouts/ListWithTagsLayout.tsx`, `components/blog/BlogListClient.tsx`,
 * `components/projects/ProjectsListClient.tsx` and
 * `components/search/SearchProvider.tsx`.
 *
 * ## Why the mock factory lives in `test/setup.ts`
 * `vi.mock` is only hoisted within the file that calls it — a `vi.mock` in
 * this module would not affect test files that merely import from it. So
 * `setup.ts` (which runs for every test file) registers the mock and reads
 * the mutable state exported here.
 *
 * @example
 * mockNavigation({ pathname: '/blog/page/2', searchParams: { tag: 'react' } })
 *
 * @example
 * const { push } = mockNavigation()
 * // ...interact...
 * expect(push).toHaveBeenCalledWith('/projects/certflow')
 */

/** Search params accepted as a plain record or a raw query string. */
type SearchParamsInit = Record<string, string> | string

interface NavigationOptions {
  /** Value returned by `usePathname()`. Defaults to `'/'`. */
  pathname?: string
  /** Values exposed via `useSearchParams()`. Defaults to empty. */
  searchParams?: SearchParamsInit
}

/** Router spies, stable across a test so assertions can reference them. */
export const navigationRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}

/** Mutable state the mocked hooks read from. Consumed by `test/setup.ts`. */
export const navigationState = {
  pathname: '/',
  searchParams: new URLSearchParams(),
}

/**
 * Configure the mocked navigation hooks for the current test.
 *
 * @returns the router spies (`push`, `replace`, `back`, ...) for assertions.
 */
export function mockNavigation(options: NavigationOptions = {}) {
  const { pathname = '/', searchParams } = options

  navigationState.pathname = pathname
  navigationState.searchParams =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : new URLSearchParams(searchParams ?? {})

  return navigationRouter
}

/**
 * Restore defaults and clear router call history. Call from `afterEach` in
 * suites that configure navigation, so state never leaks between tests.
 */
export function resetNavigationMock() {
  navigationState.pathname = '/'
  navigationState.searchParams = new URLSearchParams()
  Object.values(navigationRouter).forEach((spy) => spy.mockClear())
}
