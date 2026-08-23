import { vi } from 'vitest'
// Aliased in vitest.config.mts to framer-motion's internal reduced-motion
// state module. A direct deep import is impossible: the package's `exports`
// map does not expose the subpath.
import {
  prefersReducedMotion,
  hasReducedMotionListener,
  // @ts-expect-error -- alias-only module with no type declarations.
} from 'framer-motion-reduced-motion-state'

/**
 * Per-test `window.matchMedia` override.
 *
 * ## Why this is needed
 * The global stub in `test/setup.ts` always reports `matches: false`. That is
 * a safe default, but it makes two important branches unreachable:
 *
 * - `useReducedMotion()` from `motion/react` always resolves to "motion
 *   allowed", so the reduced-motion paths in `Taglines`,
 *   `FixedAnalogyParagraph`, `LogoAnimation` and `TextAnimation` never run.
 * - `TextAnimation`'s `(max-width: 1239px)` query always resolves desktop.
 *
 * These helpers let a test opt specific queries into `matches: true`.
 * Always pair with `resetMatchMedia()` in `afterEach`.
 *
 * ## Caveat: `useReducedMotion()` latches on first read
 * `motion/react` keeps its reduced-motion state in a module-level singleton
 * initialised the *first* time it is read. Once read, it never re-reads
 * `window.matchMedia`, so `mockReducedMotion()` has no effect afterwards and
 * `resetMatchMedia()` cannot undo it.
 *
 * Practical rules for testing reduced-motion branches:
 *
 * 1. Call `mockReducedMotion()` **before** the first render that reads it —
 *    ideally in a `beforeEach`, at the top of the file.
 * 2. Use `vi.resetModules()` (or a dedicated test file) to get a fresh
 *    `motion/react` instance when a single file needs both branches.
 *
 * Components that read `window.matchMedia` directly (e.g. `TextAnimation`'s
 * `(max-width: 1239px)` query) are unaffected and reset normally.
 *
 * @example
 * mockMatchMedia(['(max-width: 1239px)'])   // mobile branch
 *
 * @example
 * mockReducedMotion()                        // reduced-motion branch
 */

/** Queries to treat as matching: an explicit list or a predicate. */
type MatchSpec = string[] | ((query: string) => boolean)

/** The default stub behaviour: nothing matches. */
const NO_MATCHES: MatchSpec = () => false

let currentSpec: MatchSpec = NO_MATCHES

function matchesQuery(query: string): boolean {
  return typeof currentSpec === 'function' ? currentSpec(query) : currentSpec.includes(query)
}

function install() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: matchesQuery(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }),
  })
}

/**
 * Treat the given queries as matching for the current test.
 *
 * @param spec Either an array of exact query strings or a predicate.
 */
export function mockMatchMedia(spec: MatchSpec) {
  currentSpec = spec
  install()
}

/**
 * Convenience wrapper: make the reduced-motion query match, so
 * `useReducedMotion()` reports `true`.
 *
 * Note `framer-motion` queries `"(prefers-reduced-motion)"` without a value,
 * so the predicate matches on the prefix rather than an exact string.
 */
export function mockReducedMotion() {
  mockMatchMedia((query) => query.includes('prefers-reduced-motion'))
  resetMotionReducedMotionState()
}

/**
 * Clear `framer-motion`'s latched reduced-motion singletons so the next
 * `useReducedMotion()` re-reads `window.matchMedia`.
 *
 * `framer-motion` stores `prefersReducedMotion` / `hasReducedMotionListener`
 * as module-level refs (see `utils/reduced-motion/state.mjs`) and initialises
 * them only once, guarded by `hasReducedMotionListener`. Those refs survive
 * `vi.resetModules()`, so tests must reset them explicitly to switch branches.
 */
export function resetMotionReducedMotionState() {
  prefersReducedMotion.current = null
  hasReducedMotionListener.current = false
}

/** Restore the all-false default. Call from `afterEach`. */
export function resetMatchMedia() {
  currentSpec = NO_MATCHES
  install()
  resetMotionReducedMotionState()
}
