# Test Infrastructure Setup (Vitest + Testing Library)

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| **Title**   | Test Infrastructure Setup (Vitest + Testing Library) |
| **Type**    | chore                                                |
| **Scope**   | project tooling / test harness                       |
| **Created** | 2026-08-06 00:00:00                                  |
| **Status**  | IMPLEMENTED                                          |

## Problem Statement

The project currently has zero testing setup: no test runner, no test
config, no test files, and no `test` script in `package.json`. The
implementation workflow is TDD-based (write failing tests first, then
code), so a working test runner is a hard prerequisite before any feature
spec can be implemented. Without it, `spec-implement`'s test-runner
detection has nothing to invoke, and no red/green cycle is possible.

This is foundational, enabling work: the goal is a proven, ready-to-use
harness — not tests for any particular feature.

## Desired Outcome

A fully working unit + component/DOM test harness built on **Vitest**,
integrated with the existing Next.js 15 (App Router, `output: 'export'`) /
React 19 / TypeScript / Tailwind v4 / Contentlayer2 stack, such that:

- A developer (or `spec-implement`) can run `yarn test` (and equivalently
  under npm) and see a green suite.
- New tests can render `'use client'` components in jsdom, including
  components that consume the bilingual `LanguageContext` and
  `next-themes`, without hitting browser-API errors.
- tsconfig path aliases (`@/components/*`, `@/lib/*`,
  `contentlayer/generated`, etc.) resolve inside tests exactly as they do
  in the app.
- The harness needs no running Next.js server, keeping it compatible with
  the static-export model.

## Acceptance Criteria

### Runner & libraries

- [ ] Vitest is installed and configured as the test runner.
- [ ] `@testing-library/react`, `@testing-library/jest-dom`, and
      `@testing-library/user-event` are installed and wired up.
- [ ] The test environment is `jsdom`.
- [ ] Dev dependencies are added via Yarn 3.6.1 (the repo's
      `packageManager`), and all test scripts also run correctly under
      npm (matching `netlify.toml`'s npm-based build). Both invocations
      are documented.

### Configuration & aliases

- [ ] A Vitest config exists (e.g. `vitest.config.ts` or Vite config with
      a `test` block).
- [ ] All tsconfig `paths` aliases resolve in tests (e.g. via
      `vite-tsconfig-paths` or explicit `resolve.alias`), including
      `@/components/*`, `@/lib/*`, `@/contexts/*`, `@/locales/*`, and
      `contentlayer/generated`.
- [ ] ESM-only dependencies used by client components (`motion/react`,
      Contentlayer2 output, GSAP) are importable in tests without
      transform/ESM errors.
- [ ] `contentlayer/generated` imports do not break test collection (via
      alias to real generated output or a lightweight mock/stub).

### Scripts

- [ ] `package.json` has a `test` script that runs the suite once
      (non-watch) so `spec-implement`'s test-runner detection works.
- [ ] A watch variant is available (e.g. `test:watch`).
- [ ] A coverage variant is available (e.g. `test:coverage`) using
      Vitest's coverage provider. Coverage reports are produced but no
      minimum threshold is enforced (the suite must not fail solely due
      to low coverage).

### Global test setup & mocks

- [ ] A global setup file registers `@testing-library/jest-dom` matchers
      and applies mocks so client components render in jsdom without
      errors, covering at minimum:
  - [ ] `window.matchMedia`
  - [ ] `localStorage` / `sessionStorage`
  - [ ] `IntersectionObserver`
  - [ ] `Element.prototype.getBoundingClientRect` (safe default rect)
  - [ ] GSAP and `motion/react` (mocked/neutralized so animations don't
        break rendering or leave timers running)
- [ ] `next-themes` works (or is mocked) so themed components render.

### Providers & conventions

- [ ] A reusable render helper (e.g. `renderWithProviders`) wraps
      components in `LanguageProvider` and the theme provider, and
      re-exports Testing Library utilities. It supports selecting the
      active locale (EN/IT) for the language context.
- [ ] The test-file convention is documented and applied: tests are
      **co-located** with source as `*.test.tsx` / `*.test.ts`.

### Proof-of-harness example tests (must actually pass)

- [ ] At least two real example tests run against **existing** components:
  - [ ] One simple presentational component (no context dependency) that
        renders and asserts on output.
  - [ ] One component that consumes `useLanguage` / the `t()` dot-notation
        lookup, asserting that the correct localized string renders (and,
        ideally, that switching locale changes the rendered text).
- [ ] `yarn test` (and the npm equivalent) exits 0 with the example tests
      passing, demonstrating the harness works end-to-end.

## Edge Cases & Error Handling

- **ESM interop failures**: Contentlayer2 / `motion/react` / GSAP are ESM;
  config must transform/allow them. If a dep cannot load in jsdom, mock it
  at the setup level rather than skipping tests.
- **Missing Contentlayer generated output**: tests must not require a full
  `next build` / contentlayer generation to run. Either alias
  `contentlayer/generated` to a stub or ensure generation is not on the
  test path.
- **Path-alias drift**: alias resolution should derive from `tsconfig.json`
  so tests stay in sync if aliases change.
- **Timer/animation leakage**: GSAP/Motion mocks must not leave open timers
  that hang the runner or cause flaky teardown.
- **Locale key not found**: a `t()` call with a missing key should be
  observable in tests (documented behavior), not silently crash the render.
- **Yarn vs npm parity**: scripts must behave identically under both;
  document any lockfile/PnP considerations for Yarn 3.6.1.

## Dependencies & Constraints

- Next.js `^15.5.4` (App Router, `output: 'export'` static), React
  `19.0.0`, TypeScript `^5.1.3`, Tailwind v4, Contentlayer2 `0.5.5`,
  GSAP `^3.13.0`, `motion` `^12.23.24`, `next-themes` `^0.4.6`.
- Package manager Yarn 3.6.1; Netlify builds with npm — both must work.
- Bilingual EN/IT via `contexts/LanguageContext.tsx` + `locales/en.json` /
  `locales/it.json`; components under test consume this context.
- Must run without a live Next.js server (static-export compatible).
- Existing Husky + lint-staged config must not be broken by the changes.

## Out of Scope

- **End-to-end (E2E) testing** (Playwright/Cypress against the built static
  site) — noted as future work, not part of this spec.
- **CI wiring**: no GitHub Actions workflow is added in this spec.
- **Git-hook wiring**: tests are NOT added to the Husky pre-commit hook or
  lint-staged in this spec; only `package.json` scripts are added.
- **Enforced coverage thresholds**: coverage is measurable but not gated.
- **Broad test authorship**: only the proof-of-harness example tests are in
  scope; comprehensive component coverage is future work per feature spec.

## Notes

- Recommended library set to consider during planning: `vitest`,
  `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`,
  `@testing-library/jest-dom`, `@testing-library/user-event`,
  `vite-tsconfig-paths`, and a Vitest coverage provider
  (`@vitest/coverage-v8`).
- The implementer chooses which existing components back the example
  tests (criteria captured above rather than named files).
- Future follow-ups likely: adding CI (GitHub Actions), wiring tests into
  pre-commit, introducing an E2E layer, and setting a coverage threshold
  once the suite matures.

## Implementation Notes (as-built)

These record decisions made during implementation that deviate from the
original spec/plan. All were driven by the actual environment and TDD
red→green cycles; none weakened the acceptance criteria.

- **Package manager: npm, not Yarn.** The implementation environment had
  no `yarn` / `corepack` on PATH — only Node 26 + npm 11. The repo already
  ships a `package-lock.json` and Netlify builds with `npm ci`, so npm is
  the effective package manager. Dependencies were installed and the suite
  is run with npm; `yarn.lock` was left untouched. The Yarn/npm parity
  criterion still holds (scripts run identically under either), and Yarn
  remains usable once `corepack` is enabled.
- **React transform: `@vitejs/plugin-react-swc`** instead of the
  Babel-based `@vitejs/plugin-react`. The Babel plugin pulled a Babel 8 RC
  that produced an unresolvable peer conflict; the SWC plugin is
  conflict-free and mirrors Next.js's own SWC transforms.
- **Test toolchain pinned to the Vitest 2 / Vite 5 line** (`vitest@2.1.9`,
  `@vitest/coverage-v8@2.1.9`, `@vitejs/plugin-react-swc@3.11.0`). The
  initial Vitest 4 install pulled Vite 8, which declares a strict
  `esbuild ^0.27||^0.28` peer that conflicts with the app's pinned
  `esbuild@0.25.2`. That conflict is invisible to a flagged local install
  but breaks Netlify's bare `npm ci` (`ERESOLVE`). Vite 5 has no such
  esbuild peer, so `npm ci` now resolves cleanly with no flags.
- **Path aliases derived from `tsconfig.json` in the Vitest config**
  (a small `aliasFromTsconfig()` helper builds `resolve.alias` entries).
  `vite-tsconfig-paths` was tried and removed: it silently failed to
  resolve several aliases in this tsconfig (`@/app/*`, `@/contexts/*`)
  while resolving others. Deriving aliases directly keeps them in sync
  with tsconfig and is deterministic across Vite versions.
- **Config file is `vitest.config.mts`** (not `.ts`): the config uses ESM
  and the project's `package.json` has no `"type": "module"`, so the
  `.mts` extension forces ESM loading. `**/*.mts` was added to the
  tsconfig `include` so lint/typecheck cover it.
- **Path aliases: Vite native `resolve.tsconfigPaths`** — superseded; see
  the tsconfig-derived alias note above.
- **`@testing-library/dom` added explicitly** as a direct dev dependency —
  it is a required peer of `@testing-library/react` / `jest-dom` that was
  not auto-installed under npm's `--legacy-peer-deps`.
- **Install used `--legacy-peer-deps`** because the app pins
  `esbuild@0.25.2` while Vite 8 declares a newer esbuild peer range; the
  app's esbuild pin was intentionally left unchanged.
- **In-memory `Storage` mock in `test/setup.ts`** — under Node 26,
  jsdom's `localStorage`/`sessionStorage` are shadowed by Node's disabled
  native storage, so a small in-memory implementation is installed in
  setup. This satisfies the storage-mock acceptance criterion and keeps
  tests isolated.
- **`motion/react` is NOT globally mocked**; it renders fine in jsdom.
  GSAP _is_ mocked (it touches timers/measurements). This still satisfies
  the "animations don't break rendering or leave timers running"
  criterion.
- **Chosen example components**: `components/PageTitle.tsx` (presentational)
  and `components/Tag.tsx` (consumes `useLanguage`, asserted in EN and IT).
- **Actual dependency versions installed**: `vitest ^2.1.9`,
  `@vitejs/plugin-react-swc ^3.11.0`, `jsdom ^30`,
  `@testing-library/react ^16.3.2`, `@testing-library/jest-dom ^7`,
  `@testing-library/user-event ^14.6.3`, `@testing-library/dom`,
  `@vitest/coverage-v8 ^2.1.9`.
- **Netlify parity verified**: the full `npm ci && npm run build` sequence
  (Netlify's build command) completes with exit 0, and `npm test`,
  `npm run test:coverage`, and `npx tsc --noEmit` all pass.
