# Plan: Comprehensive Test Suite for Existing Codebase

| Field       | Value                                          |
| ----------- | ---------------------------------------------- |
| **Title**   | Comprehensive Test Suite for Existing Codebase |
| **Spec**    | specs/comprehensive-test-suite.md              |
| **Type**    | chore                                          |
| **Branch**  | chore/comprehensive-test-suite                 |
| **Created** | 2026-08-22 00:37:23                            |
| **Status**  | IMPLEMENTED                                    |

## Context

The Vitest harness from `specs/test-infrastructure-setup.md` shipped with
only 2 test files / 4 cases as proof-of-harness. This plan adds
characterisation tests across Tiers 1–3 (pure logic, presentational
components, interactive components), documenting what the code does today
rather than what it arguably should do. The work is purely additive: no
production source file is modified, and suspected bugs plus dead code are
reported in a findings section instead of being fixed.

## Pre-Implementation Findings

Empirical probes were run against the live harness before planning. Four
Task-0 items the spec anticipated turned out to be **unnecessary**, which
materially shrinks the harness work:

| Spec assumption         | Verified reality                                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next/navigation` mock  | **Needed.** `useSearchParams()` returns `null` outside a router context; `ListWithTagsLayout` throws `Cannot read properties of null (reading 'get')`.          |
| SVG import handling     | **Needed.** `@/data/logo.svg` resolves to the string `"/data/logo.svg"`, so `LogoStatic` throws `InvalidCharacterError: ... did not match the Name production`. |
| CSS import handling     | **Not needed.** No CSS imports exist in `components/`, `layouts/`, `lib/`, `utils/`, `contexts/` — only in Tier 4 `app/` pages, which are out of scope.         |
| `pliny` stubs           | **Not needed.** `BlogPostHeaderClient` and `SearchButton` render successfully with `pliny` inlined as configured.                                               |
| `body-scroll-lock` mock | **Not needed to render** — `MobileNav` renders fine. Still added in Task 3 to make lock/unlock calls assertable.                                                |
| `ResizeObserver`        | **Not needed.** Zero occurrences anywhere in the codebase.                                                                                                      |
| `requestAnimationFrame` | **Not needed.** Already implemented natively by jsdom.                                                                                                          |

Baseline confirmed green: `npm test` → 2 files, 4 tests passing.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `chore/comprehensive-test-suite`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b chore/comprehensive-test-suite
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping: chore → `chore/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Matching the repo's existing history (e.g.
`chore(test): set up vitest test infrastructure`,
`fix(test): pin vitest to vite 5 line`), all commits here use the `test`
scope with type `test` for test authorship and `chore(test)` for harness
changes.

## Build & Test Commands

| Action     | Command                 |
| ---------- | ----------------------- |
| Test       | `npm test`              |
| Test watch | `npm run test:watch`    |
| Coverage   | `npm run test:coverage` |
| Typecheck  | `npx tsc --noEmit`      |
| Build      | `npm run build`         |

## Conventions (apply to every task)

- Tests are **co-located** beside their source as `*.test.ts` / `*.test.tsx`,
  matching `components/PageTitle.test.tsx` and `components/Tag.test.tsx`.
- Bare presentational components use `render`/`screen` from
  `@testing-library/react` (see `PageTitle.test.tsx`).
- Anything consuming `useLanguage` or `useTheme` uses `renderWithProviders`
  from `test/renderWithProviders`, importing all Testing Library helpers
  from that module.
- Locale-dependent assertions **must** use `findBy*`/`waitFor` — the
  provider applies locale in a mount effect.
- Assert **actual** behaviour. If something looks wrong, encode current
  behaviour and record it for the Task 31 findings report.
- Freeze the clock (`vi.setSystemTime`) for any date-reading code.
- Never assert exact `Intl`-formatted date strings; use stable substrings.

---

## Tasks

### Task 1: Add `next/navigation` mock helper `[S]`

**Goal**: Make `usePathname`, `useSearchParams` and `useRouter` controllable
per test so router-dependent components can render.

**Files**:

| File                     | Action | Description                                                           |
| ------------------------ | ------ | --------------------------------------------------------------------- |
| `test/mockNavigation.ts` | create | Helper exposing configurable pathname/search params + spyable `push`. |

**Reuse**:

| File                           | What to reuse                            |
| ------------------------------ | ---------------------------------------- |
| `test/setup.ts`                | `vi.mock` factory style used for `gsap`. |
| `test/renderWithProviders.tsx` | Export/re-export conventions.            |

**Steps**:

1. Export `mockNavigation({ pathname, searchParams })` returning
   `{ push }` spies, backed by a `vi.mock('next/navigation')` factory.
2. Return a real `URLSearchParams` from `useSearchParams` so `.get()` works
   (the verified failure mode is a `null` return).
3. Provide a reset so mocks do not leak between tests.

**Tests**: Self-verified via Task 25; add a focused
`test/mockNavigation.test.ts` asserting the helper yields a working
`useSearchParams().get()` and a spyable `push`.

**Acceptance criteria covered**: Task 0 — `next/navigation` mock.

**Commit**: `chore(test): add configurable next/navigation mock helper`

---

### Task 2: Add SVG import handling `[S]`

**Goal**: Let `@/data/logo.svg` import as a React component so `LogoStatic`
(and transitively `Header`) render.

**Files**:

| File                | Action | Description                                                                               |
| ------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `test/svgStub.tsx`  | create | Stub forwarding props to a `<svg data-testid="svg-mock">`.                                |
| `vitest.config.mts` | modify | Alias `\.svg$` to the stub, placed so it does not disturb `aliasFromTsconfig()` ordering. |

**Reuse**:

| File                | What to reuse                                                 |
| ------------------- | ------------------------------------------------------------- |
| `vitest.config.mts` | Existing `resolve.alias` array and longest-prefix-first sort. |
| `next.config.js`    | `@svgr/webpack` rule (lines 122–123) — mirror its behaviour.  |

**Steps**:

1. Create a stub component spreading props onto an `<svg>`.
2. Add the alias **before** the tsconfig-derived entries so `@/data/logo.svg`
   matches the SVG rule rather than the `@/data/*` path alias.
3. Confirm `npx tsc --noEmit` still passes.

**Tests**: Verified by the `LogoStatic` test in Task 12.

**Acceptance criteria covered**: Task 0 — SVG import handling.

**Commit**: `chore(test): resolve svg imports to a react stub in tests`

---

### Task 3: Add matchMedia override, fetch and body-scroll-lock helpers `[M]`

**Goal**: Make reduced-motion and mobile-breakpoint branches reachable, and
make `fetch` and body-scroll calls assertable.

**Files**:

| File                     | Action | Description                                                                 |
| ------------------------ | ------ | --------------------------------------------------------------------------- |
| `test/mockMatchMedia.ts` | create | Override `matchMedia` per test by query → `matches`, with listener support. |
| `test/mockFetch.ts`      | create | Helper returning a `vi.fn()` fetch with ok/failure/reject modes.            |
| `test/setup.ts`          | modify | Add `body-scroll-lock` mock with assertable spies.                          |

**Reuse**:

| File            | What to reuse                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `test/setup.ts` | Existing `matchMedia` stub (lines 63–76) as the default to override; its `afterEach` reset block. |

**Steps**:

1. `mockMatchMedia` accepts a map/predicate of queries returning `matches:
true`, defaulting others to `false`; support `addEventListener('change')`
   so `TextAnimation`'s listener path works.
2. Add a reduced-motion convenience wrapper for
   `(prefers-reduced-motion: reduce)`.
3. `mockFetch` installs on `globalThis.fetch` and restores in teardown.
4. Mock `body-scroll-lock` in `setup.ts` (rendering already works; this is
   purely for assertions in Task 23).

**Tests**: Small `test/mockMatchMedia.test.ts` asserting an overridden query
reports `matches: true` while others stay `false`.

**Acceptance criteria covered**: Task 0 — matchMedia override, fetch mock,
body-scroll-lock mock.

**Commit**: `chore(test): add matchMedia, fetch and body-scroll-lock helpers`

---

### Task 4: Add opt-in SearchProvider to renderWithProviders `[S]`

**Goal**: Allow `Header` and `Layout` to render inside the full provider
stack without changing existing call sites.

**Files**:

| File                           | Action | Description                                                                |
| ------------------------------ | ------ | -------------------------------------------------------------------------- |
| `test/renderWithProviders.tsx` | modify | Add `withSearch?: boolean` (default `false`) wrapping in `SearchProvider`. |

**Reuse**:

| File                                   | What to reuse                                   |
| -------------------------------------- | ----------------------------------------------- |
| `test/renderWithProviders.tsx`         | Existing `AllProviders` + locale-seeding logic. |
| `components/common/Layout.tsx`         | Canonical provider nesting order.               |
| `components/search/SearchProvider.tsx` | The component to wrap with.                     |

**Steps**:

1. Extend `ProviderRenderOptions` with `withSearch`, defaulting to `false`
   so all existing tests are unaffected.
2. Nest as `ThemeProviders > LanguageProvider > SearchProvider`, matching
   `Layout.tsx`.
3. Keep the locale-seeding behaviour and JSDoc note about async queries.

**Tests**: Existing `Tag.test.tsx` / `PageTitle.test.tsx` must still pass;
exercised properly in Tasks 24 and 30.

**Acceptance criteria covered**: Task 0 — opt-in `SearchProvider`; existing
tests still pass.

**Commit**: `chore(test): support opt-in SearchProvider in render helper`

---

### Task 5: Test certification grouping logic `[M]`

**Goal**: Cover `groupCertifications` across both modes and all ordering
rules.

**Files**:

| File                                             | Action | Description                     |
| ------------------------------------------------ | ------ | ------------------------------- |
| `components/about/certificationGrouping.test.ts` | create | Unit tests for the pure module. |

**Reuse**:

| File                                        | What to reuse                                                |
| ------------------------------------------- | ------------------------------------------------------------ |
| `components/about/certificationGrouping.ts` | Exported `Certification`, `GroupingMode` types for fixtures. |
| `data/authors/default.mdx`                  | Realistic certification shapes.                              |

**Steps**:

1. Build fixtures covering dated, undated, shared-issuer and accented-issuer
   certifications.
2. `'year'` mode: groups descending by year; within-year sort issuer→title.
3. `'issuer'` mode: within-issuer sort year-desc→title; accent-insensitive
   (`sensitivity: 'base'`) comparison.
4. Undated items land in the `'__undated__'` bucket, always last, labelled
   with `undatedLabel` (default `'Other'`, plus a custom label case).
5. Empty input → `[]`.

**Tests**: This task is the tests. No DOM, no mocks, no fake timers.

**Acceptance criteria covered**: Tier 1 — `certificationGrouping.ts`.

**Commit**: `test(about): cover certification grouping and ordering rules`

---

### Task 6: Test preferences and refresh detection `[S]`

**Goal**: Cover the two storage-backed utility modules.

**Files**:

| File                                         | Action | Description                           |
| -------------------------------------------- | ------ | ------------------------------------- |
| `lib/preferences/PreferencesService.test.ts` | create | Namespacing, round-trip, SSR guard.   |
| `utils/detectRefreshOrFirstLoad.test.ts`     | create | Threshold behaviour with fake timers. |

**Reuse**:

| File            | What to reuse                                                    |
| --------------- | ---------------------------------------------------------------- |
| `test/setup.ts` | `MemoryStorage` for local/sessionStorage + `afterEach` clearing. |

**Steps**:

1. `PreferencesService`: assert the `lightstimulus.` key prefix is written
   to `localStorage`; `null` for missing keys; round-trip for `theme`,
   `lang`, `certGrouping`; SSR guard returns `null`/no-ops when `window` is
   undefined.
2. `detectRefreshOrFirstLoad`: no prior timestamp → `true`; elapsed >100ms →
   `true`; ≤100ms → `false`; distinct keys stay independent. Use
   `vi.useFakeTimers()` + `vi.setSystemTime`.
3. Restore real timers in teardown.

**Tests**: This task is the tests.

**Acceptance criteria covered**: Tier 1 — `PreferencesService`,
`detectRefreshOrFirstLoad`.

**Commit**: `test(lib): cover preferences service and refresh detection`

---

### Task 7: Test SEO metadata, robots and sitemap `[M]`

**Goal**: Cover the three pure metadata modules deterministically.

**Files**:

| File                  | Action | Description                                  |
| --------------------- | ------ | -------------------------------------------- |
| `app/seo.test.ts`     | create | `genPageMetadata` composition and overrides. |
| `app/robots.test.ts`  | create | Sitemap/host URL derivation.                 |
| `app/sitemap.test.ts` | create | Route list, draft filtering, `lastModified`. |

**Reuse**:

| File                   | What to reuse                                        |
| ---------------------- | ---------------------------------------------------- |
| `data/siteMetadata.js` | `siteUrl`, `socialBanner`, `title` for expectations. |

**Steps**:

1. `seo`: URL with and without `slug`; `image` omitted → `socialBanner`
   fallback; `openGraph.title` equals `"<title> | <siteTitle>"`; `...rest`
   overrides earlier fields.
2. `robots`: sitemap and host derive from `siteMetadata.siteUrl`.
3. `sitemap`: mock `contentlayer/generated` with fixture posts/projects;
   assert draft blog posts excluded, projects **not** draft-filtered,
   `lastModified` prefers `lastmod` over `date`, and the static route list.
   Freeze the system time.
4. Record the `/tags` route (no such route exists) for the findings report.

**Tests**: This task is the tests. Contentlayer is mocked — never rely on
real generated output.

**Acceptance criteria covered**: Tier 1 — `app/seo.tsx`, `app/robots.ts`,
`app/sitemap.ts`.

**Commit**: `test(app): cover seo metadata, robots and sitemap generation`

---

### Task 8: Test search static pages and EN/IT locale parity `[M]`

**Goal**: Validate the static search fixtures and guarantee the two locale
files stay structurally identical.

**Files**:

| File                            | Action | Description                           |
| ------------------------------- | ------ | ------------------------------------- |
| `lib/searchStaticPages.test.ts` | create | Locale completeness + unique URLs.    |
| `locales/locales.test.ts`       | create | EN/IT key-set and placeholder parity. |

**Reuse**:

| File                                 | What to reuse                                  |
| ------------------------------------ | ---------------------------------------------- |
| `locales/en.json`, `locales/it.json` | Imported directly (`resolveJsonModule` is on). |
| `contexts/LanguageContext.tsx`       | The `/\{\{(\w+)\}\}/g` placeholder pattern.    |

**Steps**:

1. `searchStaticPages`: all 3 entries have `en` and `it` title+summary; URLs
   unique; `type === 'Page'`.
2. Locale parity: recursively flatten both JSON files to dot-paths; assert
   identical key sets (report extras on either side), no empty/whitespace
   values, and identical `{{var}}` placeholder sets per key.
3. Write the flattening helper inside the test file — do not add a shared
   utility to production code.

**Tests**: This task is the tests. Pure data; no DOM.

**Acceptance criteria covered**: Tier 1 — `searchStaticPages.ts`, EN/IT
locale parity.

**Commit**: `test(i18n): verify locale parity and static search pages`

---

### Task 9: Test link, image and social icon branching `[M]`

**Goal**: Cover the three branch-heavy presentational primitives.

**Files**:

| File                                     | Action | Description                                 |
| ---------------------------------------- | ------ | ------------------------------------------- |
| `components/Link.test.tsx`               | create | Internal / anchor / external paths.         |
| `components/Image.test.tsx`              | create | All three `<picture>`/fallthrough branches. |
| `components/social-icons/index.test.tsx` | create | Null guards, `sr-only` label, size classes. |

**Reuse**:

| File                            | What to reuse                   |
| ------------------------------- | ------------------------------- |
| `components/PageTitle.test.tsx` | Bare `render`/`screen` pattern. |

**Steps**:

1. `Link`: `/`-prefixed → internal link; `#`-prefixed → plain `<a href>`;
   otherwise `target="_blank"` + `rel="noopener noreferrer"`.
2. `Image`: small image (<200px, `/static/images/`, jpg/png) → `<picture>`
   with 144w/200w srcset; static image → `<picture>` with webp srcset; other
   → bare `NextImage`. Control `process.env.BASE_PATH` and restore after.
3. `SocialIcon`: `null` without `href`; `null` for `kind="mail"` with a
   non-`mailto:` href; valid `mailto:` renders; `sr-only` span contains
   `kind`; `size` drives `h-*`/`w-*` classes.

**Tests**: This task is the tests. No providers needed.

**Acceptance criteria covered**: Tier 1 — `Link.tsx`, `Image.tsx`,
`social-icons/index.tsx`.

**Commit**: `test(components): cover link, image and social icon branches`

---

### Task 10: Test LanguageContext translation and detection `[M]`

**Goal**: Cover `t()` lookup/interpolation and the language-resolution
precedence rules.

**Files**:

| File                                | Action | Description                             |
| ----------------------------------- | ------ | --------------------------------------- |
| `contexts/LanguageContext.test.tsx` | create | `t()` behaviour + detection precedence. |

**Reuse**:

| File                           | What to reuse                                                    |
| ------------------------------ | ---------------------------------------------------------------- |
| `test/setup.ts`                | `MemoryStorage` for seeding/clearing `lightstimulus.lang`.       |
| `test/renderWithProviders.tsx` | Locale-seeding approach (may render the provider directly here). |

**Steps**:

1. Use a small probe component calling `useLanguage()` to expose `lang`,
   `t`, `switchLang`.
2. `t()`: valid dot-path resolves; missing key returns the key verbatim;
   non-string resolved value returns the key; `{{var}}` interpolation;
   undefined vars become `''`.
3. Detection precedence: stored `'en'`/`'it'` short-circuits detection;
   invalid stored value falls through to detection and is **not** persisted;
   `navigator.language` of `it`, `it-IT`, absent/empty, and other values.
   Override `navigator.language` per test and restore.
4. `switchLang` updates `lang` and persists via `PreferencesService`.
5. Consumer rendered **without** the provider echoes keys (default context).

**Tests**: This task is the tests. Async queries throughout — locale lands
in an effect.

**Acceptance criteria covered**: Tier 1 — `contexts/LanguageContext.tsx`.

**Commit**: `test(i18n): cover translation lookup and language detection`

---

### Task 11: Test shared primitives and MDX helpers `[M]`

**Goal**: Cover the small wrappers plus `SearchButton`'s provider branching.

**Files**:

| File                                   | Action | Description                          |
| -------------------------------------- | ------ | ------------------------------------ |
| `components/SectionContainer.test.tsx` | create | Renders children in a `<section>`.   |
| `components/TableWrapper.test.tsx`     | create | Wraps children in `div > table`.     |
| `components/MDXComponents.test.ts`     | create | Exported component-map shape.        |
| `components/SearchButton.test.tsx`     | create | `algolia` / `kbar` / neither.        |
| `components/mdx/Lang.test.tsx`         | create | Null on mismatch, children on match. |

**Reuse**:

| File                      | What to reuse                        |
| ------------------------- | ------------------------------------ |
| `components/Tag.test.tsx` | Provider-render pattern for `Lang`.  |
| `data/siteMetadata.js`    | `search.provider` value to override. |

**Steps**:

1. `SectionContainer` / `TableWrapper`: children render inside the expected
   element.
2. `MDXComponents`: assert the map exposes `Image`, `TOCInline`, `a`, `pre`,
   `table`, `Lang`.
3. `SearchButton`: mock `siteMetadata` for `algolia`, `kbar`, and an absent
   provider (→ `null`). No pliny stub needed — verified to render.
4. `Lang`: `value` matching active locale renders children; mismatch →
   `null`. Test in both EN and IT.

**Acceptance criteria covered**: Tier 2 — `SectionContainer`,
`TableWrapper`, `MDXComponents`, `SearchButton`, `mdx/Lang`.

**Commit**: `test(components): cover shared primitives and mdx helpers`

---

### Task 12: Test common presentational components `[S]`

**Goal**: Cover `SectionHeader`, `Footer` (clock-dependent) and
`LogoStatic` (SVG-dependent).

**Files**:

| File                                       | Action | Description                             |
| ------------------------------------------ | ------ | --------------------------------------- |
| `components/common/SectionHeader.test.tsx` | create | Localised heading via `t(labelKey)`.    |
| `components/common/Footer.test.tsx`        | create | Frozen year, social icons, author.      |
| `components/common/LogoStatic.test.tsx`    | create | Renders SVG stub + LIGHT/STIMULUS text. |

**Reuse**:

| File                   | What to reuse                                    |
| ---------------------- | ------------------------------------------------ |
| `test/svgStub.tsx`     | SVG stub from Task 2 (`data-testid="svg-mock"`). |
| `data/siteMetadata.js` | Expected author/title/social values.             |

**Steps**:

1. `SectionHeader`: renders a level-2 heading with the resolved translation
   in EN and IT.
2. `Footer`: freeze the clock and assert the copyright year; assert 3 social
   icons and the author/title text.
3. `LogoStatic`: assert the stub renders and the LIGHT/STIMULUS spans are
   present — this is the acceptance check for Task 2.

**Acceptance criteria covered**: Tier 2 — `SectionHeader`, `Footer`,
`LogoStatic`.

**Commit**: `test(common): cover section header, footer and logo`

---

### Task 13: Test about-section presentational components `[M]`

**Goal**: Cover the five about components and their null guards.

**Files**:

| File                                           | Action | Description                             |
| ---------------------------------------------- | ------ | --------------------------------------- |
| `components/about/AboutContactBridge.test.tsx` | create | Localised text + `/contact` link.       |
| `components/about/AboutProfile.test.tsx`       | create | Avatar + per-social conditionals.       |
| `components/about/CVDownloadCard.test.tsx`     | create | `null` without `cv.url`; download link. |
| `components/about/ExploringNow.test.tsx`       | create | `null` when empty; localised items.     |
| `components/about/FocusAreas.test.tsx`         | create | `null` when empty; localised fields.    |

**Reuse**:

| File                       | What to reuse                                  |
| -------------------------- | ---------------------------------------------- |
| `data/authors/default.mdx` | Realistic prop shapes for all five components. |
| `components/Tag.test.tsx`  | Provider-render + `findBy*` pattern.           |

**Steps**:

1. `AboutContactBridge`: `about.contact_bridge.text`/`.link` render; link
   targets `/contact`.
2. `AboutProfile`: avatar rendered only when `avatar` set; mail/github/
   linkedin icons appear only for provided fields; 4 highlight keys render.
   `motion` renders natively — no mock needed.
3. `CVDownloadCard`: `null` when `cv` missing or `cv.url` empty; otherwise
   the download anchor honours `BASE_PATH` and has `download`.
4. `ExploringNow` / `FocusAreas`: `null` on empty arrays; localised values
   in EN and IT.

**Acceptance criteria covered**: Tier 2 — all five about components.

**Commit**: `test(about): cover about section presentational components`

---

### Task 14: Test blog presentational components `[M]`

**Goal**: Cover the three blog display components, including `reading_time`
interpolation.

**Files**:

| File                                                | Action | Description                                 |
| --------------------------------------------------- | ------ | ------------------------------------------- |
| `components/blog/BlogCardSmall.test.tsx`            | create | Locale date, conditional tags.              |
| `components/blog/BlogPostHeaderClient.test.tsx`     | create | Title fallback, reading-time interpolation. |
| `components/blog/BlogPostNavigationClient.test.tsx` | create | Prev/next conditionals + interpolation.     |

**Reuse**:

| File                 | What to reuse                                           |
| -------------------- | ------------------------------------------------------- |
| `locales/en.json`    | `blog.reading_time`, `blog.previous_article` templates. |
| `components/Tag.tsx` | Tag fixture shape (`{id, label:{en,it}}`).              |

**Steps**:

1. `BlogCardSmall`: renders title/summary and a `/blog/<slug>` link; tags
   only when non-empty; date formatted per locale (assert stable substrings,
   not exact `Intl` output).
2. `BlogPostHeaderClient`: `title?.[lang] ?? .en` fallback; summary
   conditional; `Math.ceil` applied to reading time and interpolated into
   `blog.reading_time`; tags only when present.
3. `BlogPostNavigationClient`: neither / prev only / next only / both;
   interpolated prev/next titles.

**Acceptance criteria covered**: Tier 2 — the three blog components.

**Commit**: `test(blog): cover blog card, header and navigation`

---

### Task 15: Test contact presentational components `[S]`

**Goal**: Cover the two static contact components.

**Files**:

| File                                         | Action | Description                  |
| -------------------------------------------- | ------ | ---------------------------- |
| `components/contact/ContactIntro.test.tsx`   | create | Localised title + intro.     |
| `components/contact/ContactMethods.test.tsx` | create | Email/linkedin conditionals. |

**Reuse**:

| File              | What to reuse                          |
| ----------------- | -------------------------------------- |
| `locales/it.json` | `contact.*` strings for IT assertions. |

**Steps**:

1. `ContactIntro`: `contact.title` and `contact.intro` render in EN and IT.
2. `ContactMethods`: `mailto:` link only when `email` given; LinkedIn icon
   and `contact.linkedin_hint` only when `linkedin` given; neither → hint
   text absent.

**Acceptance criteria covered**: Tier 2 — `ContactIntro`, `ContactMethods`.

**Commit**: `test(contact): cover contact intro and methods`

---

### Task 16: Test project card components `[M]`

**Goal**: Cover `ProjectCardBase` branching and its two thin wrappers.

**Files**:

| File                                            | Action | Description                                  |
| ----------------------------------------------- | ------ | -------------------------------------------- |
| `components/projects/ProjectCardBase.test.tsx`  | create | Cover/date/`small`/`priority`/tags branches. |
| `components/projects/ProjectCardGrid.test.tsx`  | create | Forwards props without `small`.              |
| `components/projects/ProjectCardSmall.test.tsx` | create | Forwards props with `small`.                 |

**Reuse**:

| File                  | What to reuse                     |
| --------------------- | --------------------------------- |
| `data/projects/*.mdx` | Realistic project fixture shapes. |

**Steps**:

1. `ProjectCardBase`: `coverImage` present wraps the image in a `Link`, absent
   omits it; `date` renders a locale-formatted badge; `small` toggles
   `h-40`/`h-48`; `priority` sets `fetchpriority="high"`; tags only when
   non-empty. Assert in EN and IT.
2. `ProjectCardGrid` / `ProjectCardSmall`: assert pass-through, with `small`
   only on the latter.

**Acceptance criteria covered**: Tier 2 — the three project card components.

**Commit**: `test(projects): cover project card variants and branches`

---

### Task 17: Test project header, links and layout client `[M]`

**Goal**: Cover the conditional-heavy project header and the link-filtering
logic.

**Files**:

| File                                               | Action | Description                             |
| -------------------------------------------------- | ------ | --------------------------------------- |
| `components/projects/ProjectHeader.test.tsx`       | create | Per-field meta gates, `stack` fallback. |
| `components/projects/ProjectLinks.test.tsx`        | create | Null guards + unknown-key filtering.    |
| `components/projects/ProjectLayoutClient.test.tsx` | create | Back link + `projects.back` label.      |

**Reuse**:

| File                  | What to reuse                                           |
| --------------------- | ------------------------------------------------------- |
| `locales/en.json`     | `projects.meta.*`, `projects.links.*`, `projects.back`. |
| `data/projects/*.mdx` | Project fixture shapes.                                 |

**Steps**:

1. `ProjectHeader`: title/summary `?.[lang] ?? .en`; `coverImage` and tag
   gates; `projectType` and `status` mapped through
   `projects.meta.types.*` / `projects.meta.statuses.*`; `date` localised;
   `stack` non-empty lists items, empty renders `—`. Note the component
   takes a `project` prop.
2. `ProjectLinks`: takes `project` (not `links`); `null` when `project.links`
   absent; unknown keys outside `ICON_MAP` dropped; `null` when no entries
   survive; known keys labelled via `projects.links.<key>`.
3. `ProjectLayoutClient`: back link to `/projects` with `projects.back` as
   both `aria-label` and text.

**Acceptance criteria covered**: Tier 2 — `ProjectHeader`, `ProjectLinks`,
`ProjectLayoutClient`.

**Commit**: `test(projects): cover project header, links and layout client`

---

### Task 18: Test home preview sections `[S]`

**Goal**: Cover the two preview sections and document the asymmetric empty
guard.

**Files**:

| File                                       | Action | Description                               |
| ------------------------------------------ | ------ | ----------------------------------------- |
| `components/home/BlogPreview.test.tsx`     | create | `null` when empty; cards + view-all link. |
| `components/home/ProjectsPreview.test.tsx` | create | Current behaviour with an empty list.     |

**Reuse**:

| File                                | What to reuse                     |
| ----------------------------------- | --------------------------------- |
| `components/blog/BlogCardSmall.tsx` | Post fixture shape.               |
| `locales/en.json`                   | `home.blog.*`, `home.projects.*`. |

**Steps**:

1. `BlogPreview`: `null` on empty posts; otherwise section header, a
   `/blog` view-all link, and one card per post with
   `title[lang] ?? .en`.
2. `ProjectsPreview`: assert **actual** behaviour with an empty array (no
   guard exists). Record the asymmetry versus `BlogPreview` for Task 31.

**Acceptance criteria covered**: Tier 2 — `BlogPreview`, `ProjectsPreview`.

**Commit**: `test(home): cover blog and projects preview sections`

---

### Task 19: Test app-level not-found, loading and error states `[M]`

**Goal**: Cover the seven route-state components.

**Files**:

| File                            | Action | Description                                   |
| ------------------------------- | ------ | --------------------------------------------- |
| `app/not-found.test.tsx`        | create | 404 heading + home link.                      |
| `app/loading.test.tsx`          | create | Spinner skeleton.                             |
| `app/blog/loading.test.tsx`     | create | 3 list skeleton rows.                         |
| `app/projects/loading.test.tsx` | create | 4 card skeletons.                             |
| `app/error.test.tsx`            | create | `console.error` on mount, `reset()` on click. |
| `app/blog/error.test.tsx`       | create | Same contract, blog copy.                     |
| `app/projects/error.test.tsx`   | create | Same contract, projects copy.                 |

**Reuse**:

| File                            | What to reuse                                  |
| ------------------------------- | ---------------------------------------------- |
| `components/PageTitle.test.tsx` | Bare-render pattern (these need no providers). |
| `test/renderWithProviders.tsx`  | `userEvent` for the "Try again" clicks.        |

**Steps**:

1. `not-found`: "404" heading and a `/` link.
2. Three `loading` components: assert skeleton element counts/structure.
3. Three `error` components: spy on `console.error` (restore after) and
   assert it receives the error; click "Try again" and assert `reset` is
   called. Share a parametrised helper across the three files since they are
   near-identical.

**Acceptance criteria covered**: Tier 2 — `not-found`, 3 `loading`, 3
`error`.

**Commit**: `test(app): cover not-found, loading and error states`

---

### Task 20: Test server layout composition `[S]`

**Goal**: Cover the two server layouts' composition and conditionals.

**Files**:

| File                              | Action | Description                            |
| --------------------------------- | ------ | -------------------------------------- |
| `layouts/BlogPostLayout.test.tsx` | create | Composition + conditional hero image.  |
| `layouts/ProjectLayout.test.tsx`  | create | Composition of header/children/footer. |

**Reuse**:

| File                           | What to reuse                               |
| ------------------------------ | ------------------------------------------- |
| `layouts/BlogPostLayout.tsx`   | Content prop shape.                         |
| `test/renderWithProviders.tsx` | Needed for the client children they render. |

**Steps**:

1. `BlogPostLayout`: header, MDX children and navigation all render; hero
   image appears only when `content.images` is set; `title` derives from
   `content.title?.en || 'Blog post'` for alt text.
2. `ProjectLayout`: `ProjectHeader`, children and `ProjectLayoutClient` all
   render inside a `SectionContainer`.

**Acceptance criteria covered**: Tier 2 — `BlogPostLayout`, `ProjectLayout`.

**Commit**: `test(layouts): cover blog post and project layout composition`

---

### Task 21: Test contact form validation and submission `[M]`

**Goal**: Cover the richest interactive component end to end.

**Files**:

| File                                      | Action | Description                          |
| ----------------------------------------- | ------ | ------------------------------------ |
| `components/contact/ContactForm.test.tsx` | create | Validation, submission, a11y wiring. |

**Reuse**:

| File                           | What to reuse                         |
| ------------------------------ | ------------------------------------- |
| `test/mockFetch.ts`            | Fetch mock from Task 3.               |
| `test/renderWithProviders.tsx` | `userEvent` from the render helper.   |
| `locales/en.json`              | `contact.form.*` error/label strings. |

**Steps**:

1. Validation: name required; email required and rejected by
   `/^\S+@\S+\.\S+$/`; message required and min length 10 — each message
   sourced from `t`.
2. `onBlur` validates a single field; `onChange` clears only that field's
   error.
3. Invalid submit does not call `fetch`.
4. Valid submit POSTs to `/__forms.html` with
   `application/x-www-form-urlencoded`, `form-name=contact`, trimmed values
   and the `bot-field` honeypot.
5. Non-`ok` response → error status; success → form replaced by the
   `role="status" aria-live="polite"` panel.
6. Re-entrancy: a second submit while `submitting` is ignored; submit button
   disabled and label switches to `contact.form.submitting`.
7. A11y: `aria-invalid` and `aria-describedby="{field}-error"` wiring,
   `noValidate`, hidden honeypot.

**Acceptance criteria covered**: Tier 3 — `ContactForm`.

**Commit**: `test(contact): cover contact form validation and submission`

---

### Task 22: Test language and theme toggles `[M]`

**Goal**: Cover both mount-guarded toggles including persistence.

**Files**:

| File                                        | Action | Description                                   |
| ------------------------------------------- | ------ | --------------------------------------------- |
| `components/common/LanguageToggle.test.tsx` | create | Mount guard, aria-label, toggle, persistence. |
| `components/common/ThemeToggle.test.tsx`    | create | Mount guard, 3-way cycle, persistence.        |

**Reuse**:

| File                                    | What to reuse                            |
| --------------------------------------- | ---------------------------------------- |
| `test/renderWithProviders.tsx`          | Provides `ThemeProviders` + `userEvent`. |
| `lib/preferences/PreferencesService.ts` | Assert persisted `lightstimulus.*` keys. |

**Steps**:

1. `LanguageToggle`: renders `null` before mount (await appearance);
   `aria-label` is `'Switch to Italian'` in EN and `"Passa all'inglese"` in
   IT; clicking toggles en↔it, updates flag/label, and persists via
   `PreferencesService`.
2. `ThemeToggle`: `null` before mount; clicking cycles
   `light → dark → system → light`; icon and `aria-label` match each state;
   each change writes `lightstimulus.theme`.
3. Wrap state-changing clicks so no `act()` warnings are emitted.

**Acceptance criteria covered**: Tier 3 — `LanguageToggle`, `ThemeToggle`.

**Commit**: `test(common): cover language and theme toggles`

---

### Task 23: Test certifications grid interaction `[M]`

**Goal**: Cover the radiogroup keyboard navigation, persistence and expiry
formatting.

**Files**:

| File                                           | Action | Description                            |
| ---------------------------------------------- | ------ | -------------------------------------- |
| `components/about/CertificationsGrid.test.tsx` | create | Radiogroup, keyboard nav, expiry info. |

**Reuse**:

| File                                             | What to reuse               |
| ------------------------------------------------ | --------------------------- |
| `components/about/certificationGrouping.test.ts` | Fixtures from Task 5.       |
| `lib/preferences/PreferencesService.ts`          | Seed/assert `certGrouping`. |

**Steps**:

1. `null` when `items` is empty.
2. Initial grouping hydrates from a seeded `certGrouping` preference.
3. `role="radiogroup"` with two `role="radio"` buttons and correct
   `aria-checked`.
4. Keyboard: ArrowRight/ArrowDown advance, ArrowLeft/ArrowUp retreat, both
   wrapping around; Enter/Space select; roving `tabIndex` follows focus.
5. Selecting a mode persists it via `PreferencesService`.
6. `getExpiryInfo` via rendered output with a frozen clock: valid, expired
   (strictly after expiry), and invalid date (→ no expiry info), in EN and
   IT. Assert stable substrings, not exact `Intl` output.

**Acceptance criteria covered**: Tier 3 — `CertificationsGrid`.

**Commit**: `test(about): cover certifications grid keyboard interaction`

---

### Task 24: Test mobile nav, scroll button and header `[M]`

**Goal**: Cover the three scroll/lock-driven interactive components.

**Files**:

| File                                      | Action | Description                              |
| ----------------------------------------- | ------ | ---------------------------------------- |
| `components/MobileNav.test.tsx`           | create | Toggle, body-scroll lock, cleanup.       |
| `components/ScrollTopAndComment.test.tsx` | create | 50px threshold, scroll-to-top, cleanup.  |
| `components/common/Header.test.tsx`       | create | Solid/hidden states, nav links, cleanup. |

**Reuse**:

| File                           | What to reuse                                |
| ------------------------------ | -------------------------------------------- |
| `test/setup.ts`                | `body-scroll-lock` mock from Task 3.         |
| `test/renderWithProviders.tsx` | `withSearch: true` from Task 4 for `Header`. |
| `data/headerNavLinks.ts`       | Expected nav link set.                       |

**Steps**:

1. `MobileNav`: toggle opens/closes; `disableBodyScroll`/`enableBodyScroll`
   called on open/close; `clearAllBodyScrollLocks` on unmount; all 5 nav
   links localised via `nav.*`.
2. `ScrollTopAndComment`: hidden until `scrollY > 50` (set `window.scrollY`
   and dispatch `scroll`); scroll-to-top calls `window.scrollTo`; listener
   removed on unmount. Note the comment button is absent because
   `siteMetadata.comments` is commented out — assert current behaviour.
3. `Header`: solid state past 40px; hides past 80px on scroll-down and
   reappears on scroll-up, respecting the 6px jitter threshold; nav excludes
   `/`; listeners cleaned up on unmount. Render with `withSearch: true`;
   `MobileNav` arrives via `next/dynamic` with `ssr:false`, so await its
   fallback/real button.

**Acceptance criteria covered**: Tier 3 — `MobileNav`,
`ScrollTopAndComment`, `Header`.

**Commit**: `test(common): cover mobile nav, scroll button and header`

---

### Task 25: Test list layout filtering and pagination `[M]`

**Goal**: Cover the most logic-dense layout in the codebase.

**Files**:

| File                                  | Action | Description                                 |
| ------------------------------------- | ------ | ------------------------------------------- |
| `layouts/ListWithTagsLayout.test.tsx` | create | Tag filtering, paging, sidebar, pagination. |

**Reuse**:

| File                     | What to reuse                                   |
| ------------------------ | ----------------------------------------------- |
| `test/mockNavigation.ts` | Router mock from Task 1 — **required** here.    |
| `locales/en.json`        | `common.all`, `common.previous`, `common.next`. |

**Steps**:

1. `activeTag` derives from `?tag=`; `currentPage` from a `/page/N`
   pathname.
2. Filtering uses `getItemTags(item)?.some(t => t.id === activeTag)`;
   `pageSize` and slicing behave as computed; `totalPages` recomputes after
   filtering.
3. Pagination renders only when `totalPages > 1`.
4. Sidebar: "All" link strips `/page/N`; tag labels use
   `label[lang] ?? label.en` with counts; tag ids not present among items
   are skipped; clicking the active tag toggles it off.
5. Prev/next hrefs preserve `?tag=`; page 1 collapses to `basePath`;
   disabled states render `aria-disabled="true"` spans.
6. Record for Task 31: disabled controls use hardcoded English
   `← Previous`/`Next →` while enabled ones use `t()`; empty state is a
   hardcoded `"No items found."`.

**Acceptance criteria covered**: Tier 3 — `ListWithTagsLayout`.

**Commit**: `test(layouts): cover list layout filtering and pagination`

---

### Task 26: Test blog and projects list clients `[M]`

**Goal**: Cover the two adapters feeding `ListWithTagsLayout`.

**Files**:

| File                                              | Action | Description                         |
| ------------------------------------------------- | ------ | ----------------------------------- |
| `components/blog/BlogListClient.test.tsx`         | create | Localised field mapping + tag data. |
| `components/projects/ProjectsListClient.test.tsx` | create | Grid layout + first-item priority.  |

**Reuse**:

| File                     | What to reuse                                    |
| ------------------------ | ------------------------------------------------ |
| `test/mockNavigation.ts` | Router mock (these render `ListWithTagsLayout`). |

**Steps**:

1. Mock the statically imported `app/blog-tag-data.json` and
   `app/project-tag-data.json` so tests do not depend on live content
   counts.
2. `BlogListClient`: assert the `titleIt`/`titleEn`/`summaryIt`/`summaryEn`
   contentlayer field shape is mapped correctly per locale, and dates are
   locale-formatted.
3. `ProjectsListClient`: `contentLayout="grid"`; `priority` set on the first
   project only.

**Acceptance criteria covered**: Tier 3 — `BlogListClient`,
`ProjectsListClient`.

**Commit**: `test(components): cover blog and projects list clients`

---

### Task 27: Test search provider action mapping `[S]`

**Goal**: Cover the kbar document mapper and language-scoped filtering.

**Files**:

| File                                        | Action | Description                         |
| ------------------------------------------- | ------ | ----------------------------------- |
| `components/search/SearchProvider.test.tsx` | create | Filtering, action mapping, remount. |

**Reuse**:

| File                       | What to reuse                       |
| -------------------------- | ----------------------------------- |
| `test/mockNavigation.ts`   | `useRouter().push` spy from Task 1. |
| `lib/searchStaticPages.ts` | Realistic search-entry fixtures.    |

**Steps**:

1. Capture the `onSearchDocumentsLoad` callback passed to the kbar provider
   and invoke it with a mixed-language fixture.
2. Assert only entries matching the active `lang` survive, and each maps to
   `{id, name, keywords, section, subtitle, perform}` with `keywords`
   falling back to `''`.
3. `perform()` calls `router.push(entry.url)`.
4. Changing language changes the `key`, forcing a remount.

**Acceptance criteria covered**: Tier 3 — `SearchProvider`.

**Commit**: `test(search): cover kbar action mapping and language filtering`

---

### Task 28: Test tagline rotation and reduced motion `[M]`

**Goal**: Cover the timer-driven rotation and its reduced-motion
short-circuit.

**Files**:

| File                                | Action | Description                                      |
| ----------------------------------- | ------ | ------------------------------------------------ |
| `components/home/Taglines.test.tsx` | create | Interval cycling, reduced motion, duration math. |

**Reuse**:

| File                     | What to reuse                                       |
| ------------------------ | --------------------------------------------------- |
| `test/mockMatchMedia.ts` | Reduced-motion override from Task 3 — **required**. |
| `locales/en.json`        | `hero.taglines.0..6`.                               |

**Steps**:

1. With fake timers, advance the 5000ms interval and 500ms fade and assert
   the tagline index advances through all 7 and wraps.
2. With reduced motion enabled, assert the interval never runs and a single
   static tagline renders.
3. Assert `typeDuration = max(nonWhitespaceChars * 0.04, 0.3)` via observable
   output.
4. Clear/flush all timers in teardown so no timer leaks or `act()` warnings
   occur.

**Acceptance criteria covered**: Tier 3 — `Taglines`.

**Commit**: `test(home): cover tagline rotation and reduced motion`

---

### Task 29: Test highlighted paragraph rendering and hover `[M]`

**Goal**: Cover the HTML builder and hover listeners through the public
render surface.

**Files**:

| File                                             | Action | Description                                        |
| ------------------------------------------------ | ------ | -------------------------------------------------- |
| `components/home/FixedAnalogyParagraph.test.tsx` | create | Escaping, highlight ranges, hover, reduced motion. |

**Reuse**:

| File                          | What to reuse                                  |
| ----------------------------- | ---------------------------------------------- |
| `test/mockMatchMedia.ts`      | Reduced-motion override from Task 3.           |
| `locales/en.json` / `it.json` | `hero.fixed_paragraph` for EN and IT variants. |

**Steps**:

1. Assert `& < > " '` are HTML-escaped in the rendered output.
2. Assert word and sentence highlights wrap in
   `span.highlight-word[data-text]`, that sentence matches take precedence,
   that ranges never overlap, and that newlines become `<p>`.
3. Verify IT highlight variants apply when locale is IT.
4. Hover: `mousemove`/`mouseenter`/`mouseleave` set `--cursor-x/y`,
   `--ripple-x/y/-opacity` and toggle `.is-hovered`; listeners removed on
   unmount. `getBoundingClientRect` is stubbed to zeros — assert relative
   behaviour, not pixel values.
5. With reduced motion, assert no listeners are attached and hover has no
   effect.
6. Test only through the rendered component — do **not** export the private
   helpers.

**Acceptance criteria covered**: Tier 3 — `FixedAnalogyParagraph`.

**Commit**: `test(home): cover highlighted paragraph rendering and hover`

---

### Task 30: Test app shell composition `[S]`

**Goal**: Cover `Layout`'s provider composition and landmark structure.

**Files**:

| File                                | Action | Description                          |
| ----------------------------------- | ------ | ------------------------------------ |
| `components/common/Layout.test.tsx` | create | Header, `main#main-content`, footer. |

**Reuse**:

| File                           | What to reuse                                                     |
| ------------------------------ | ----------------------------------------------------------------- |
| `test/mockNavigation.ts`       | Router mock (Header/SearchProvider need it).                      |
| `test/renderWithProviders.tsx` | May render `Layout` directly since it supplies its own providers. |

**Steps**:

1. Render `Layout` with child content.
2. Assert the header (`aria-label="Main Navigation"`), `main#main-content`
   containing the children, and the footer all render.
3. Assert `Layout` supplies its own providers — a `useLanguage` consumer
   inside it resolves translations without extra wrapping.

**Acceptance criteria covered**: Tier 3 — `Layout`.

**Commit**: `test(common): cover app shell layout composition`

---

### Task 31: Verify suite and record findings `[S]`

**Goal**: Confirm suite-level criteria and deliver the findings report.

**Files**:

| File                                | Action | Description                              |
| ----------------------------------- | ------ | ---------------------------------------- |
| `specs/comprehensive-test-suite.md` | modify | Append a "Findings (as-tested)" section. |

**Reuse**:

| File                                 | What to reuse                                     |
| ------------------------------------ | ------------------------------------------------- |
| `specs/test-infrastructure-setup.md` | "Implementation Notes (as-built)" section format. |

**Steps**:

1. Run `npm test` and confirm exit 0 with no unhandled rejections,
   open-timer warnings or `act()` warnings.
2. Run `npm run test:coverage` (must complete; not gated) and
   `npx tsc --noEmit`.
3. Re-run the suite and run it in a randomised file order to prove
   order-independence.
4. Append the findings section: confirmed suspected bugs (each with file,
   observed behaviour, why it looks wrong) and the flagged dead code
   (`ProjectsGrid.tsx`, `AuthorLayout.tsx`, `data/projectsData.ts`,
   `Comments.tsx`, `AboutContent.tsx`) — untouched and untested.
5. Note which spec-anticipated Task-0 items proved unnecessary (CSS
   handling, pliny stubs, `ResizeObserver`, `requestAnimationFrame`).

**Acceptance criteria covered**: All suite-level criteria; both findings
criteria.

**Commit**: `test: verify suite determinism and record findings`

---

**Task ordering**:

- **Tasks 1–4 (harness) must come first.** Task 2 gates Task 12; Task 1
  gates Tasks 25, 26, 27, 30; Task 3 gates Tasks 21, 23, 24, 28, 29; Task 4
  gates Tasks 24 and 30.
- **Tasks 5–10 (Tier 1)** depend only on Tasks 1–4 and are mutually
  independent — parallelisable.
- **Tasks 11–20 (Tier 2)** are mutually independent. Task 5's fixtures are
  reused by Task 23.
- **Tasks 21–30 (Tier 3)** are mutually independent given the harness.
  Task 25 should precede Task 26 (shared layout understanding).
- **Task 31 must be last** — it verifies the whole suite.
- Each tier should be green before starting the next, per the spec's Notes.

## Edge Cases & Error Handling

- **Locale applied in an effect**: all locale assertions use
  `findBy*`/`waitFor` (Tasks 10–30).
- **Mount-guarded components**: `LanguageToggle`/`ThemeToggle` return `null`
  until mounted; tests await appearance (Task 22).
- **`matchMedia` stub returns `matches: false`**: reduced-motion and mobile
  branches need explicit per-test overrides (Tasks 3, 28, 29).
- **Date/time dependence**: clock frozen for `Footer` (12), `sitemap` (7),
  `getExpiryInfo` (23), `detectRefreshOrFirstLoad` (6).
- **Locale-dependent `Intl` formatting**: assert stable substrings only
  (Tasks 14, 16, 17, 23, 26).
- **Timer leakage**: `Taglines` nests `setTimeout` in `setInterval`; timers
  flushed and cleared in teardown (Task 28).
- **Real generated JSON**: `blog-tag-data.json` / `project-tag-data.json`
  mocked rather than depended on (Task 26).
- **Contentlayer output**: mocked with fixtures; never requires
  `next build` (Tasks 7, 26).
- **Storage isolation**: `setup.ts` clears both storages in `afterEach`; no
  cross-test persistence assumed (Tasks 6, 10, 22, 23).
- **Missing locale key**: `t()` returns the key verbatim — asserted as
  documented behaviour (Task 10).
- **SVG alias ordering**: the `\.svg$` alias must precede tsconfig-derived
  `@/data/*` entries or `@/data/logo.svg` mis-resolves (Task 2).
- **`act()` warnings**: state-changing interactions wrapped properly;
  verified suite-wide (Task 31).

## Verification

1. `npm test` — exits 0; all new and existing tests pass; no unhandled
   rejections, open-timer warnings or `act()` warnings.
2. `npx tsc --noEmit` — passes with all new test files type-checked
   (`tsconfig.json` already includes `**/*.ts`/`**/*.tsx`).
3. `npm run test:coverage` — completes and reports coverage; no threshold
   gating.
4. Re-run `npm test` and run with randomised file order — results identical,
   proving order-independence.
5. `npm run build` — still succeeds, confirming no production code was
   affected.
6. `git diff --stat` — confirms changes are limited to `test/`,
   `*.test.ts(x)` files, `vitest.config.mts`, and the spec's findings
   section. **No production source file is modified.**
7. Walk the spec's per-module checklist and confirm every Tier 1–3 module
   has a co-located test file.
