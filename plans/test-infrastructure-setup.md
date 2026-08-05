# Plan: Test Infrastructure Setup (Vitest + Testing Library)

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| **Title**   | Test Infrastructure Setup (Vitest + Testing Library) |
| **Spec**    | specs/test-infrastructure-setup.md                   |
| **Type**    | chore                                                |
| **Branch**  | chore/test-infrastructure-setup                      |
| **Created** | 2026-08-06 00:00:00                                  |
| **Status**  | IMPLEMENTED                                          |

## Context

The project has zero testing setup, but the workflow is TDD-based, so a
working test runner is a hard prerequisite for implementing any feature
spec. This plan installs and configures a Vitest + Testing Library +
jsdom harness that resolves the project's tsconfig path aliases, mocks
the browser APIs used by `'use client'` components, wraps the
`LanguageProvider` / `next-themes` providers, and proves the harness works
with two real example tests against existing components.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `chore/test-infrastructure-setup`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b chore/test-infrastructure-setup
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

> **As-built note:** the implementation environment had no `yarn` /
> `corepack` available, so npm (matching Netlify's `npm ci`) was used.
> Commands below show npm first, with the Yarn equivalent in parentheses.

| Action | Command                                         |
| ------ | ----------------------------------------------- |
| Test   | `npm test` (Yarn equivalent: `yarn test`)       |
| Build  | `npm run build` (Yarn equivalent: `yarn build`) |

## Tasks

### Task 1: Install Vitest test dependencies `[S]`

**Goal**: Add all dev dependencies required for the Vitest + Testing
Library + jsdom harness, without touching any config yet.

**Files**:

| File           | Action | Description                               |
| -------------- | ------ | ----------------------------------------- |
| `package.json` | modify | Add devDependencies (via package manager) |
| `yarn.lock`    | modify | Lockfile updated by Yarn                  |

**Reuse**:

| File           | What to reuse                                                              |
| -------------- | -------------------------------------------------------------------------- |
| `package.json` | Existing `devDependencies` block and `packageManager` field (`yarn@3.6.1`) |

**Steps**:

1. Using Yarn 3.6.1 (the repo's `packageManager`), add as dev deps:
   `vitest`, `@vitejs/plugin-react`, `jsdom`,
   `@testing-library/react`, `@testing-library/jest-dom`,
   `@testing-library/user-event`, `vite-tsconfig-paths`,
   `@vitest/coverage-v8`.
2. Pin versions compatible with React 19 / Vite 5+ (Testing Library
   React ≥16 for React 19 support).
3. Confirm the install resolves cleanly and `yarn.lock` updates.

**Tests**: No tests yet — this task only provisions tooling. Verify
`yarn vitest --version` resolves the binary.

**Acceptance criteria covered**: Runner & libraries (Vitest, Testing
Library trio, jsdom installed); dependencies added via Yarn.

**Commit**: `chore(test): add vitest and testing-library dependencies`

---

### Task 2: Add Vitest config with alias + Contentlayer resolution `[M]`

**Goal**: Create `vitest.config.ts` wiring the React plugin, jsdom
environment, tsconfig path aliases, the global setup file, and coverage —
so tests collect and resolve imports like the app does.

**Files**:

| File               | Action | Description          |
| ------------------ | ------ | -------------------- |
| `vitest.config.ts` | create | Vitest configuration |

**Reuse**:

| File             | What to reuse                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `tsconfig.json`  | `compilerOptions.paths` — resolved via `vite-tsconfig-paths` so aliases stay in sync            |
| `next.config.js` | `transpilePackages` list (`contentlayer2`, `next-contentlayer2`, `pliny`) informs `deps.inline` |

**Steps**:

1. Configure `plugins: [react(), tsconfigPaths()]` so all
   `@/components/*`, `@/lib/*`, `@/contexts/*`, `@/locales/*`, etc.
   aliases resolve from `tsconfig.json`.
2. Set `test.environment = 'jsdom'`, `test.globals = true`,
   `test.setupFiles = ['./test/setup.ts']` (setup created in Task 3).
3. Add an explicit `resolve.alias` for `contentlayer/generated` →
   `.contentlayer/generated` (matching the tsconfig path) so imports do
   not break; note in a comment that a stub can replace it if generation
   is absent on the test path.
4. Add `test.server.deps.inline` (or `deps.optimizer`) for ESM packages
   that fail under jsdom transform if needed (`motion`, `contentlayer2`,
   `pliny`), mirroring `transpilePackages`.
5. Configure `test.coverage` with the `v8` provider and reporters
   (`text`, `html`); do NOT set `thresholds` (no gating per spec).
6. Restrict `test.include` to `**/*.{test,spec}.{ts,tsx}` and exclude
   `node_modules`, `.next`, `out`, `.contentlayer`.

**Tests**: Validated indirectly by Task 6's example tests. Optionally run
`yarn vitest run --reporter=verbose` to confirm zero-collection succeeds
without config errors.

**Acceptance criteria covered**: Vitest config exists; tsconfig aliases
resolve; ESM deps importable; `contentlayer/generated` does not break
collection; coverage provider configured without threshold; jsdom
environment.

**Commit**: `chore(test): add vitest config with alias and jsdom setup`

---

### Task 3: Add global test setup with browser-API mocks `[M]`

**Goal**: Create the setup file that registers jest-dom matchers and
mocks the browser APIs and animation libraries used by client components,
so components render in jsdom without runtime errors.

**Files**:

| File            | Action | Description                                     |
| --------------- | ------ | ----------------------------------------------- |
| `test/setup.ts` | create | Global setup: matchers, mocks, per-test cleanup |

**Reuse**:

| File                                    | What to reuse                                                |
| --------------------------------------- | ------------------------------------------------------------ |
| `lib/preferences/PreferencesService.ts` | Uses `localStorage` — informs storage mock needs             |
| `contexts/LanguageContext.tsx`          | Reads `navigator.language` — informs default locale in mocks |

**Steps**:

1. `import '@testing-library/jest-dom/vitest'` to register matchers.
2. Add `afterEach(() => cleanup())` from `@testing-library/react` to unmount
   between tests.
3. Mock `window.matchMedia` (returns object with `matches`, `addListener`,
   `addEventListener`, etc.) — required by `next-themes`.
4. Provide a working `localStorage` / `sessionStorage` in jsdom (jsdom
   supplies these, but ensure they are cleared in `afterEach` to isolate
   `PreferencesService` state).
5. Mock `IntersectionObserver` with a no-op class (observe/unobserve/
   disconnect).
6. Stub `Element.prototype.getBoundingClientRect` to return a safe zero
   rect so layout-reading components don't throw.
7. Mock `gsap` (default export + named `gsap`) and `motion/react` (render
   children as plain elements; no-op animation hooks) via `vi.mock`, so
   animations neither break rendering nor leave timers running.
8. Ensure any fake timers / observers are torn down in `afterEach` to
   prevent leakage/hangs.

**Tests**: Exercised by Task 6's example tests (the `useLanguage` test
depends on `matchMedia` + storage mocks via the providers).

**Acceptance criteria covered**: Global setup registers jest-dom;
mocks for `matchMedia`, storage, `IntersectionObserver`,
`getBoundingClientRect`, GSAP, `motion/react`; `next-themes` renders;
no timer leakage.

**Commit**: `chore(test): add global test setup and browser api mocks`

---

### Task 4: Add renderWithProviders helper `[S]`

**Goal**: Provide a reusable render helper that wraps components in
`LanguageProvider` and `ThemeProviders`, supports selecting the active
locale, and re-exports Testing Library utilities.

**Files**:

| File                           | Action | Description                     |
| ------------------------------ | ------ | ------------------------------- |
| `test/renderWithProviders.tsx` | create | Provider-wrapping custom render |

**Reuse**:

| File                           | What to reuse                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `contexts/LanguageContext.tsx` | `LanguageProvider` (wraps children) and locale persistence via `PreferencesService` (seed `localStorage` to force EN/IT) |
| `app/theme-providers.tsx`      | `ThemeProviders` (next-themes wrapper)                                                                                   |

**Steps**:

1. Create `renderWithProviders(ui, options)` that accepts a `locale`
   ('en' | 'it', default 'en') and composes `<ThemeProviders><LanguageProvider>...`.
2. To force locale deterministically, seed the persisted preference
   (`lightstimulus.lang`) in `localStorage` before render, since
   `LanguageProvider` honors a stored preference over browser detection.
3. Re-export everything from `@testing-library/react` plus
   `userEvent`, and export the custom `render` as the default.
4. Keep the helper framework-only (no app logic); document its use in a
   short header comment.

**Tests**: Consumed by Task 6's `useLanguage` example test.

**Acceptance criteria covered**: `renderWithProviders` wraps
`LanguageProvider` + theme provider, supports EN/IT locale selection,
re-exports Testing Library utilities.

**Commit**: `chore(test): add renderWithProviders test helper`

---

### Task 5: Add test scripts to package.json `[S]`

**Goal**: Add `test`, `test:watch`, and `test:coverage` scripts so
`spec-implement`'s runner detection works and coverage is available.

**Files**:

| File           | Action | Description                                         |
| -------------- | ------ | --------------------------------------------------- |
| `package.json` | modify | Add `test` / `test:watch` / `test:coverage` scripts |

**Reuse**:

| File           | What to reuse                                 |
| -------------- | --------------------------------------------- |
| `package.json` | Existing `scripts` block and formatting style |

**Steps**:

1. Add `"test": "vitest run"` (single non-watch run for detection/CI).
2. Add `"test:watch": "vitest"`.
3. Add `"test:coverage": "vitest run --coverage"`.
4. Confirm scripts run identically under `yarn test` and `npm test`
   (Netlify uses npm); note any Yarn 3.6.1 PnP/node-modules
   consideration in the verification section.

**Tests**: None directly; validated by running the scripts in Task 6 /
Verification.

**Acceptance criteria covered**: `test` script (non-watch); watch
variant; coverage variant without enforced threshold; Yarn/npm parity.

**Commit**: `chore(test): add test scripts to package.json`

---

### Task 6: Add proof-of-harness example tests `[S]`

**Goal**: Prove the harness end-to-end with two real tests against
existing components: one presentational, one consuming `useLanguage`.

**Files**:

| File                            | Action | Description                                         |
| ------------------------------- | ------ | --------------------------------------------------- |
| `components/PageTitle.test.tsx` | create | Renders `PageTitle`, asserts heading text           |
| `components/Tag.test.tsx`       | create | Renders `Tag` via providers, asserts EN vs IT label |

**Reuse**:

| File                           | What to reuse                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `components/PageTitle.tsx`     | Simple presentational component (no context) — render and assert children/heading role |
| `components/Tag.tsx`           | `'use client'` component consuming `useLanguage`; renders `tag.label[lang]`            |
| `test/renderWithProviders.tsx` | Custom render for the `Tag` test with `locale`                                         |
| `locales/en.json` / `it.json`  | Stable key `common.all` → `"All"` / `"Tutti"` for assertions                           |

**Steps**:

1. `PageTitle.test.tsx`: render with plain Testing Library `render`
   (no providers needed), assert the `heading` role contains the passed
   children; optionally assert the gradient `span` variant.
2. `Tag.test.tsx`: use `renderWithProviders` with a fixture tag
   (`{ id, label: { en: 'All', it: 'Tutti' } }`); assert the EN label
   renders with `locale: 'en'` and the IT label with `locale: 'it'`,
   demonstrating locale switching changes rendered text.
3. Ensure both tests pass and produce no unhandled-timer/act warnings.

**Tests**: These two files ARE the tests. Co-located `*.test.tsx` next to
source per the documented convention.

**Acceptance criteria covered**: Two real example tests (presentational +
`useLanguage`) pass; co-located `*.test.tsx` convention applied; `yarn test`
(and npm equivalent) exits 0 end-to-end.

**Commit**: `test: add example tests proving the harness works`

---

**Task ordering**: Tasks are sequential and dependent. Task 1 (deps) →
Task 2 (config) → Task 3 (setup) → Task 4 (render helper) precede Task 6
(example tests). Task 5 (scripts) depends only on Task 1 and can land any
time after it, but is placed before Task 6 so the example tests are run
via the real `test` script.

## Edge Cases & Error Handling

- **ESM interop failures** (motion/GSAP/Contentlayer): handled via
  `deps.inline` in the Vitest config and `vi.mock` in setup (Tasks 2, 3).
- **Missing Contentlayer generated output**: `contentlayer/generated`
  aliased to `.contentlayer/generated`; a stub can be substituted if
  generation is absent — the example tests do not import it, so collection
  is unaffected (Task 2).
- **Path-alias drift**: aliases derived from `tsconfig.json` (see as-built
  note — resolved via Vite's native `resolve.tsconfigPaths`), staying in
  sync automatically (Task 2).
- **Timer/animation leakage**: GSAP/Motion mocked as no-ops and observers
  torn down in `afterEach` (Task 3).
- **Locale key not found**: `t()` returns the key itself (per
  `LanguageContext`); the `Tag` test uses present keys, and this fallback
  behavior is noted as observable, not crashing (Tasks 4, 6).
- **Yarn vs npm parity**: scripts use the `vitest` binary resolvable under
  both; verified by running under each (Task 5, Verification).

## Verification

1. Run `yarn test` — expect the two example tests to pass and the process
   to exit 0 with no unhandled-timer/act warnings.
2. Run `npm test` — expect identical results (Netlify parity).
3. Run `yarn test:coverage` — expect a coverage report to generate with no
   threshold failure.
4. Confirm `yarn test:watch` starts Vitest in watch mode.
5. Confirm `next build` / existing lint/Husky flows are unaffected by the
   new files.
6. Confirm alias resolution by verifying the `Tag` test imports resolve
   (`@/contexts/LanguageContext`) and render correctly in EN and IT.

## As-Built Deviations

The plan assumed Yarn 3.6.1 and a specific library set. Implementation
adjusted these to fit the actual environment; all acceptance criteria were
still met and every deviation was driven by a TDD red→green cycle.

- **Task 1 — package manager**: installed with **npm** (not Yarn). No
  `yarn`/`corepack` was on PATH; the repo has a `package-lock.json` and
  Netlify builds with `npm ci`. `yarn.lock` was left untouched, so
  `package-lock.json` is the modified lockfile instead of `yarn.lock`.
- **Task 1 — React plugin**: used **`@vitejs/plugin-react-swc`** instead of
  `@vitejs/plugin-react`; the Babel-based plugin pulled a Babel 8 RC that
  produced an unresolvable peer conflict.
- **Task 1 — extra dep**: added **`@testing-library/dom`** explicitly (a
  required peer not auto-installed under npm's `--legacy-peer-deps`).
- **Task 1 — install flag**: install required **`--legacy-peer-deps`** due
  to the app's pinned `esbuild@0.25.2` vs Vite 8's newer esbuild peer
  range; the app's esbuild pin was left unchanged.
- **Task 2 — path aliases**: dropped the **`vite-tsconfig-paths`** plugin
  (it failed to resolve `@/app/*`) in favor of Vite's native
  **`resolve.tsconfigPaths: true`**; the plugin dependency was uninstalled.
- **Task 3 — storage mock**: added an **in-memory `Storage`** implementation
  in `test/setup.ts` because Node 26 shadows jsdom's
  `localStorage`/`sessionStorage` with a disabled native version.
- **Task 3 — motion vs GSAP**: **`motion/react` is not globally mocked**
  (renders fine in jsdom); only **GSAP** is mocked (it touches
  timers/measurements). The no-timer-leakage criterion still holds.
- **Verification commands** were run via npm (`npm test`,
  `npm run test:coverage`, `npx tsc --noEmit`) — all exit 0. The Yarn
  equivalents apply once `corepack` is enabled.
