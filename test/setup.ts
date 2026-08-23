import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * Global test setup.
 *
 * Registers jest-dom matchers and polyfills/mocks the browser APIs that
 * `'use client'` components in this project rely on but that jsdom does not
 * implement (or implements incompletely). Without these, rendering themed
 * or animated components in jsdom throws at import/render time.
 *
 * Anything stateful (storage, observers, timers) is reset in `afterEach`
 * so tests stay isolated and nothing leaks between them.
 */

// Unmount React trees rendered by Testing Library after every test.
afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.sessionStorage.clear()
  vi.clearAllMocks()
})

// --- localStorage / sessionStorage -----------------------------------------
// Under Node 26 + Vitest's jsdom environment, jsdom's Storage is shadowed by
// Node's native (disabled) localStorage. Provide a simple in-memory Storage
// implementation so PreferencesService and the providers work and stay
// isolated between tests (cleared in afterEach above).
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length(): number {
    return this.store.size
  }
  clear(): void {
    this.store.clear()
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
})
Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  value: new MemoryStorage(),
})

// --- window.matchMedia -----------------------------------------------------
// Required by next-themes (and prefers-reduced-motion checks). jsdom does not
// implement it, so provide a no-op MediaQueryList.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated but still referenced by some libs
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }),
})

// --- IntersectionObserver ---------------------------------------------------
// Used by scroll/reveal components. jsdom has no implementation; a no-op
// class is enough for components that only construct/observe it.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// --- Element.getBoundingClientRect -----------------------------------------
// jsdom returns an all-zero rect; make that explicit and stable so layout-
// reading code (GSAP measurements, scroll math) gets a safe default.
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  writable: true,
  configurable: true,
  value: (): DOMRect => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  }),
})

// --- GSAP -------------------------------------------------------------------
// Neutralize GSAP so animations do not run, throw, or leave timers open in
// jsdom. Tweens/timelines become inert chainable no-ops.
vi.mock('gsap', () => {
  const tween = {
    kill: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    progress: vi.fn(),
    revert: vi.fn(),
  }
  const timeline = {
    to: vi.fn(() => timeline),
    from: vi.fn(() => timeline),
    fromTo: vi.fn(() => timeline),
    set: vi.fn(() => timeline),
    add: vi.fn(() => timeline),
    kill: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    progress: vi.fn(),
    revert: vi.fn(),
  }
  const gsap = {
    to: vi.fn(() => tween),
    from: vi.fn(() => tween),
    fromTo: vi.fn(() => tween),
    set: vi.fn(),
    timeline: vi.fn(() => timeline),
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn(), kill: vi.fn() })),
    matchMedia: vi.fn(() => ({ add: vi.fn(), revert: vi.fn() })),
    killTweensOf: vi.fn(),
  }
  return { gsap, default: gsap }
})

vi.mock('gsap/all', () => ({
  DrawSVGPlugin: {},
  MotionPathPlugin: {},
  ScrollTrigger: { create: vi.fn(), refresh: vi.fn(), getAll: vi.fn(() => []) },
}))

// --- body-scroll-lock -------------------------------------------------------
// `MobileNav` renders fine with the real library, but it mutates document
// styles and its calls are behaviour worth asserting (open locks, close
// unlocks, unmount clears). Spies make that observable and keep jsdom clean.
vi.mock('body-scroll-lock', () => ({
  disableBodyScroll: vi.fn(),
  enableBodyScroll: vi.fn(),
  clearAllBodyScrollLocks: vi.fn(),
}))

// --- next/navigation --------------------------------------------------------
// jsdom has no Next.js router context, so the real `useSearchParams()` returns
// null and `.get()` throws. The mock reads mutable state from
// `test/mockNavigation.ts`, which tests configure via `mockNavigation({...})`.
//
// `vi.mock` is only hoisted within the file that calls it, so registering it
// here (a setup file that runs for every test file) is what makes it global.
vi.mock('next/navigation', async () => {
  const { navigationState, navigationRouter } = await import('./mockNavigation')
  return {
    usePathname: vi.fn(() => navigationState.pathname),
    // Returning a real URLSearchParams (never null) is the whole point.
    useSearchParams: vi.fn(() => navigationState.searchParams),
    useRouter: vi.fn(() => navigationRouter),
    useParams: vi.fn(() => ({})),
    useSelectedLayoutSegment: vi.fn(() => null),
    useSelectedLayoutSegments: vi.fn(() => []),
    notFound: vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND')
    }),
    redirect: vi.fn(),
  }
})
