# Comprehensive Test Suite for Existing Codebase

| Field       | Value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| **Title**   | Comprehensive Test Suite for Existing Codebase                             |
| **Type**    | chore                                                                      |
| **Scope**   | test coverage across components, lib, utils, contexts, layouts, app routes |
| **Created** | 2026-08-22 00:00:00                                                        |
| **Status**  | IMPLEMENTED                                                                |

## Problem Statement

The Vitest + Testing Library harness landed via `test-infrastructure-setup`
(Status: IMPLEMENTED), but it deliberately shipped only two
proof-of-harness tests: `components/PageTitle.test.tsx` and
`components/Tag.test.tsx` — 4 test cases total. That spec explicitly
deferred "comprehensive component coverage" as future work.

The result is a project with a proven harness and effectively zero
coverage. ~53 components, 6 `lib`/`utils` modules, the bilingual
`LanguageContext`, 4 layouts and 20 `app` route files are all unverified.
Regressions in localisation, tag filtering, form validation, or preference
persistence would ship silently. This spec closes that gap.

## Current Behavior

- `npm test` runs `vitest run` and passes with 2 test files / 4 cases.
- Coverage is measured (`test:coverage`, v8) but ungated; real coverage is
  negligible.
- The harness provides `test/setup.ts` (jest-dom, `MemoryStorage` for
  local/sessionStorage, `matchMedia` stub, `IntersectionObserver` stub,
  zeroed `getBoundingClientRect`, inert `gsap`/`gsap/all` mocks) and
  `test/renderWithProviders.tsx` (`ThemeProviders` + `LanguageProvider`,
  locale seeding, `userEvent`).
- Several mocks needed by the wider codebase do not yet exist (see Task 0).

## Desired Outcome

Every module in Tiers 1–3 below has a co-located `*.test.ts`/`*.test.tsx`
file that documents its actual behaviour and passes. `npm test` exits 0.
The suite is deterministic — no reliance on wall-clock time, machine
locale, or test execution order.

These are **characterisation tests**: they encode what the code does
today, not what it arguably should do. This spec is purely additive — no
source file outside test files and the shared harness is modified.

## Acceptance Criteria

### Task 0 — Extend the shared harness (prerequisite)

- [ ] `next/navigation` mock supporting `usePathname`, `useSearchParams`,
      `useRouter` (with assertable `push`), configurable per test.
- [ ] SVG-import handling so `@/data/logo.svg` resolves (needed by
      `LogoStatic`, transitively `Header`).
- [ ] CSS-import handling so modules importing `css/prism.css` / `katex`
      collect without error.
- [ ] `pliny` stubs for `pliny/mdx-components`, `pliny/search/*`,
      `pliny/comments`, `pliny/analytics`.
- [ ] `body-scroll-lock` mock with assertable `disableBodyScroll` /
      `enableBodyScroll` / `clearAllBodyScrollLocks`.
- [ ] A helper to override `matchMedia` per test, so reduced-motion and
      the `max-width: 1239px` mobile branch are both reachable (the global
      stub always returns `matches: false`).
- [ ] A `fetch` mock helper for `ContactForm`.
- [ ] `renderWithProviders` gains an opt-in `SearchProvider` (currently
      absent, so `Header`/`Layout` cannot render as-is).
- [ ] `ResizeObserver` and a controllable `requestAnimationFrame` for
      `Header`.
- [ ] Existing tests still pass unchanged after harness edits.

### Tier 1 — Pure logic

- [ ] `components/about/certificationGrouping.ts` — `groupCertifications`
      in both `'year'` and `'issuer'` modes; within-group sort orders; the
      `'__undated__'` bucket sorting last with its `undatedLabel`; empty
      input → `[]`; accent-insensitive issuer comparison.
- [ ] `utils/detectRefreshOrFirstLoad.ts` — no prior timestamp → `true`;
      elapsed >100ms → `true`; ≤100ms → `false`; key isolation. Uses fake
      timers.
- [ ] `lib/preferences/PreferencesService.ts` — `lightstimulus.` key
      namespacing; `null` for missing keys; round-trip; SSR guard when
      `window` is undefined.
- [ ] `app/seo.tsx` — `genPageMetadata` URL composition with and without
      `slug`; `image` default falling back to `socialBanner`;
      `openGraph.title` as `"<title> | <siteTitle>"`; `...rest` overriding
      earlier fields.
- [ ] `app/robots.ts` — sitemap and host URLs derived from
      `siteMetadata.siteUrl`.
- [ ] `app/sitemap.ts` — draft blog posts excluded; projects not
      draft-filtered; `lastModified` preferring `lastmod` over `date`; the
      static route list. Date frozen for determinism.
- [ ] `lib/searchStaticPages.ts` — all 3 entries have both locales and
      unique URLs.
- [ ] `components/social-icons/index.tsx` — `null` when `href` missing;
      `null` when `kind === 'mail'` with a non-`mailto:` href; `sr-only`
      label; `size`-derived classes.
- [ ] `components/Link.tsx` — `/` prefix → internal link; `#` prefix →
      plain anchor; otherwise external with `target="_blank"` and
      `rel="noopener noreferrer"`.
- [ ] `components/Image.tsx` — all three branches (small-image
      `<picture>`, static-image `<picture>` with webp srcset, bare
      `NextImage` fallthrough).
- [ ] `contexts/LanguageContext.tsx` — `t()` dot-path lookup; missing key
      returns the key verbatim; `{{var}}` interpolation with undefined
      vars becoming `''`; stored `lang` short-circuiting detection;
      invalid stored values falling through; `navigator.language`
      detection (`it`, `it-IT`, absent, other → `en`); `switchLang`
      persisting; default context echoing keys without a provider.
- [ ] **EN/IT locale parity** — `locales/en.json` and `locales/it.json`
      have identical key sets, no empty values, and matching `{{var}}`
      placeholders per key.

### Tier 2 — Presentational components

Each renders in EN and IT where localised, and its conditional branches
are asserted.

- [ ] `components/SectionContainer.tsx`, `components/TableWrapper.tsx`
- [ ] `components/MDXComponents.tsx` — exported component map shape
- [ ] `components/SearchButton.tsx` — `algolia` / `kbar` / neither
- [ ] `components/mdx/Lang.tsx` — `null` on locale mismatch, children on
      match
- [ ] `components/common/SectionHeader.tsx`,
      `components/common/Footer.tsx` (year frozen),
      `components/common/LogoStatic.tsx`
- [ ] `components/about/AboutContactBridge.tsx`, `AboutProfile.tsx`
      (avatar and per-social conditionals), `CVDownloadCard.tsx` (`null`
      without `cv.url`), `ExploringNow.tsx`, `FocusAreas.tsx` (both `null`
      when empty)
- [ ] `components/blog/BlogCardSmall.tsx` (locale-formatted date, tags
      only when non-empty), `BlogPostHeaderClient.tsx` (`reading_time`
      interpolation, title fallback to `.en`),
      `BlogPostNavigationClient.tsx` (prev/next conditionals with
      interpolation)
- [ ] `components/contact/ContactIntro.tsx`, `ContactMethods.tsx`
      (email/linkedin conditionals)
- [ ] `components/projects/ProjectCardBase.tsx` (cover/date/`small`/
      `priority`/tags branches), `ProjectCardGrid.tsx`,
      `ProjectCardSmall.tsx`, `ProjectHeader.tsx` (per-field meta gates,
      `stack` empty → `—`), `ProjectLinks.tsx` (`null` without links,
      unknown keys dropped, `null` when none survive),
      `ProjectLayoutClient.tsx`
- [ ] `components/home/BlogPreview.tsx` (`null` when empty),
      `ProjectsPreview.tsx` (no empty guard — assert current behaviour)
- [ ] `app/not-found.tsx`; `app/loading.tsx`, `app/blog/loading.tsx`,
      `app/projects/loading.tsx`
- [ ] `app/error.tsx`, `app/blog/error.tsx`, `app/projects/error.tsx` —
      `console.error` called on mount, `reset()` invoked on click
- [ ] `layouts/BlogPostLayout.tsx`, `layouts/ProjectLayout.tsx` —
      composition and conditional hero image

### Tier 3 — Interactive components

- [ ] `components/contact/ContactForm.tsx` — per-field
      required/format/min-length validation via `t`; `onBlur` validates,
      `onChange` clears that field's error; submit blocked when invalid;
      `fetch` POST to `/__forms.html` with `form-name`, trimmed values and
      the honeypot; non-`ok` → error status; success replaces the form
      with the `role="status"` panel; re-entrancy guard while submitting;
      `aria-invalid` / `aria-describedby` wiring.
- [ ] `components/common/LanguageToggle.tsx` — `null` before mount;
      locale-specific `aria-label`; en↔it toggle persisting the choice;
      flag and label text.
- [ ] `components/common/ThemeToggle.tsx` — `null` before mount;
      `light → dark → system → light` cycle; icon and `aria-label` per
      state; preference written on change.
- [ ] `components/about/CertificationsGrid.tsx` — `null` when empty;
      grouping hydrated from `PreferencesService`; `radiogroup`/`radio`
      semantics; roving-tabindex keyboard nav (Arrow keys with
      wrap-around, Enter/Space select); selection persisted;
      `getExpiryInfo` expiry/valid/invalid-date cases in both locales with
      the date frozen.
- [ ] `components/MobileNav.tsx` — toggle opens/closes;
      `disableBodyScroll`/`enableBodyScroll` called;
      `clearAllBodyScrollLocks` on unmount; all 5 nav links localised.
- [ ] `components/ScrollTopAndComment.tsx` — hidden until `scrollY > 50`;
      scroll-to-top invoked; listener removed on unmount.
- [ ] `components/common/Header.tsx` — solid state past 40px; hide/show
      past 80px with the 6px jitter threshold; nav excludes `/`;
      listeners cleaned up.
- [ ] `layouts/ListWithTagsLayout.tsx` — `activeTag` from `?tag=`;
      `currentPage` from `/page/N`; filtering by tag id; page slicing;
      `totalPages` recomputation; pagination shown only when >1 page;
      sidebar counts and localised labels; tag ids absent from items
      skipped; "All" link stripping `/page/N`; active tag toggling off;
      prev/next hrefs preserving `?tag=`; page-1 collapsing to
      `basePath`; disabled state rendering `aria-disabled` spans.
- [ ] `components/blog/BlogListClient.tsx` — `titleIt`/`titleEn`/
      `summaryIt`/`summaryEn` mapping, tag data wiring.
- [ ] `components/projects/ProjectsListClient.tsx` — grid layout,
      `priority` on the first item only.
- [ ] `components/search/SearchProvider.tsx` — `onSearchDocumentsLoad`
      filtering by `entry.lang` and mapping to kbar actions; `perform`
      calling `router.push`; remount on language change.
- [ ] `components/home/Taglines.tsx` — all 7 taglines cycle on the 5000ms
      interval with the 500ms fade; reduced motion disables the interval
      entirely; `typeDuration` computation. Fake timers, no leaks.
- [ ] `components/home/FixedAnalogyParagraph.tsx` — HTML-escaping of
      `& < > " '`; word and sentence highlight ranges (sentences first,
      non-overlapping, sorted); newline→`<p>`; IT variants; hover
      listeners setting CSS vars and toggling `.is-hovered`; reduced
      motion skipping listener attachment entirely.
- [ ] `components/common/Layout.tsx` — provider composition renders
      header, `main#main-content`, footer.

### Suite-level

- [ ] `npm test` exits 0 with no unhandled rejections, open-timer
      warnings, or `act()` warnings.
- [ ] `npm run test:coverage` completes; coverage reported, not gated.
- [ ] `npx tsc --noEmit` passes with all new test files included.
- [ ] Suite passes when run repeatedly and in a randomised file order.
- [ ] Tests are co-located `*.test.ts(x)` beside their source, per
      existing convention.
- [ ] A findings section is delivered (see below).

### Findings to report (not fix)

- [ ] Suspected bugs found while testing are documented — file, observed
      behaviour, why it looks wrong — with the test asserting _actual_
      behaviour. Known candidates to confirm: `ListWithTagsLayout`
      hardcoding English `← Previous`/`Next →` for disabled pagination
      while using `t()` when enabled; `app/sitemap.ts` emitting a `/tags`
      route with no corresponding route; `app/page.tsx` mutating the
      contentlayer `allProjects` array via `.sort()`;
      `ListWithTagsLayout`'s hardcoded `"No items found."`;
      `ProjectsPreview` lacking the empty guard its sibling `BlogPreview`
      has.
- [ ] Apparently-unreachable code is flagged, left untouched and left
      untested: `components/projects/ProjectsGrid.tsx`,
      `layouts/AuthorLayout.tsx`, `data/projectsData.ts`,
      `components/Comments.tsx` (always `null` with
      `siteMetadata.comments` commented out),
      `components/about/AboutContent.tsx`.

## Edge Cases & Error Handling

- **Locale applied in an effect**: `LanguageProvider` sets the locale
  post-mount, so assertions on localised text must use
  `findBy*`/`waitFor`, per the existing `Tag.test.tsx` precedent.
- **Mount-guarded components**: `LanguageToggle` and `ThemeToggle` return
  `null` until mounted; tests must await appearance rather than assert
  synchronously.
- **Global `matchMedia` stub returns `matches: false`**: reduced-motion
  and mobile-breakpoint branches are unreachable without a per-test
  override. Tests needing them must override explicitly.
- **Date/time dependence**: `getExpiryInfo`, `app/sitemap.ts`, `Footer`'s
  copyright year and `detectRefreshOrFirstLoad` all read the clock.
  Freeze time; never assert against the real current date.
- **Locale-dependent formatting**:
  `Intl.DateTimeFormat`/`toLocaleDateString` output varies by ICU version.
  Assert on stable substrings or pin the locale rather than exact
  formatted strings.
- **Timer leakage**: `Taglines` nests `setTimeout` inside `setInterval`;
  tests must flush and clear timers so the runner neither hangs nor leaks
  across files.
- **Real generated JSON**: `app/blog-tag-data.json` and
  `app/project-tag-data.json` are build artifacts. Tests should mock them
  rather than depend on current counts, which change when content
  changes.
- **Contentlayer output**: `.contentlayer/generated` exists today but is a
  build artifact. Tests must not require `next build` — use fixtures, not
  real generated content.
- **Storage isolation**: `test/setup.ts` clears both storages in
  `afterEach`; tests must not assume values persist across cases.
- **Missing locale key**: `t()` returns the key itself; tests should
  assert this documented behaviour rather than treating it as a crash.

## Dependencies & Constraints

- Builds on the harness from `specs/test-infrastructure-setup.md`; the
  toolchain is pinned to the Vitest 2 / Vite 5 line because Vite 8's
  strict `esbuild` peer conflicts with the app's pinned `esbuild@0.25.2`
  and breaks Netlify's `npm ci`. **Do not upgrade Vitest/Vite as part of
  this work.**
- New dev dependencies should be avoided; prefer `vi.mock` over new
  packages. Any addition must keep bare `npm ci` resolving cleanly.
- npm is the effective package manager (no `yarn`/`corepack` on PATH);
  Netlify builds with `npm ci`.
- Path aliases are derived from `tsconfig.json` in `vitest.config.mts` —
  new aliases (SVG, CSS) must not break that derivation.
- Next.js 15 App Router with `output: 'export'`; React 19; no running
  server available to tests.
- `tsconfig.json` `include` must cover new test files so `tsc --noEmit`
  checks them.
- Husky + lint-staged must keep working; tests are still not wired into
  the pre-commit hook.

## Out of Scope

- **Tier 4**: `lib/generateSearchIndex.ts`, `lib/generateBlogTagData.ts`,
  `lib/generateProjectTagData.ts`, `scripts/rss.mjs`,
  `scripts/compress-images.mjs`, `scripts/generate-favicons.mjs`,
  `app/layout.tsx`, the contentlayer-backed async server pages
  (`app/page.tsx`, `app/about`, `app/contact`, `app/blog/**`,
  `app/projects/**`), and `components/home/hero/LogoAnimation.tsx` /
  `TextAnimation.tsx` / `Hero.tsx`.
- **E2E testing** (Playwright/Cypress against the static export).
- **CI wiring** — no GitHub Actions workflow.
- **Git-hook wiring** — tests not added to Husky or lint-staged.
- **Coverage thresholds** — measured, never gated.
- **Any production-code change**, including fixing bugs the tests reveal
  or deleting dead code. Both are reported only.
- **Refactoring for testability** — module-private helpers such as
  `FixedAnalogyParagraph`'s `buildHighlightedHtml` and
  `scripts/rss.mjs`'s generators must be tested through their public
  surface, not exported to make testing easier.

## Notes

- Test count is expected in the low hundreds across ~60 new files; the
  plan should sequence Task 0 first, then Tier 1, Tier 2, Tier 3, so each
  tier lands green before the next begins.
- `components/PageTitle.test.tsx` and `components/Tag.test.tsx` are the
  style reference for bare-render and provider-render tests respectively.
- `renderWithProviders` seeds `lightstimulus.lang` in `localStorage`
  before rendering to bypass `navigator.language` detection — reuse this
  rather than inventing another mechanism.
- `siteMetadata.comments` being commented out means `Comments.tsx` and
  `ScrollTopAndComment`'s comment button are both inert; assert current
  behaviour.
- The findings report may be delivered as a section appended to this spec
  on completion, mirroring the "Implementation Notes (as-built)" pattern
  in `specs/test-infrastructure-setup.md`.

## Findings (as-tested)

Recorded on completion. Per the spec, **no production code was changed**:
every item below is characterised by a passing test asserting the _actual_
current behaviour, and reported here rather than fixed.

**Suite as delivered**: 65 new test files, 1102 tests, 67 files total.
`npm test`, `npm run test:coverage`, `npx tsc --noEmit` and `npm run build`
all exit 0. Coverage is measured (53.1% lines / 86.1% branches overall,
dominated by out-of-scope Tier 4 files) and not gated.

### Task 0 items that proved unnecessary

Empirical probes before implementation showed four anticipated harness
items were not needed, which shrank Task 0 considerably:

- **CSS-import handling** — no CSS imports exist in `components/`,
  `layouts/`, `lib/`, `utils/` or `contexts/`. They appear only in the
  Tier 4 `app/**/page.tsx` files, which are out of scope.
- **`pliny` stubs** — `pliny` renders correctly in jsdom as inlined by
  `server.deps.inline`. `BlogPostHeaderClient` and `SearchButton` both
  mount without stubbing.
- **`ResizeObserver`** — zero occurrences anywhere in the codebase.
- **`requestAnimationFrame`** — already implemented natively by jsdom.

Conversely, both remaining items were confirmed genuinely necessary by a
reproduced failure: `useSearchParams()` returns `null` outside a router
context (`ListWithTagsLayout` threw `Cannot read properties of null
(reading 'get')`), and `@/data/logo.svg` resolved to the string
`"/data/logo.svg"` (`LogoStatic` threw `InvalidCharacterError`).

### Additional harness work not anticipated by the plan

- **`app/*` bare-specifier alias** (`vitest.config.mts`).
  `components/blog/BlogListClient.tsx` and
  `components/projects/ProjectsListClient.tsx` import
  `'app/blog-tag-data.json'` / `'app/project-tag-data.json'`, and
  `app/blog/page.tsx` / `app/projects/page.tsx` import `'app/seo'`. Next
  resolves these via tsconfig `baseUrl: "."`, but there is no `@/`-prefixed
  `paths` entry, so `aliasFromTsconfig()` never emits one and Vite fails at
  import-analysis time. Verified by removal: without the alias those files
  cannot be collected at all. `vi.mock` cannot substitute, because mock
  resolution runs after import analysis.
- **`framer-motion-reduced-motion-state` alias.** `framer-motion` latches
  `prefers-reduced-motion` in module-level refs
  (`utils/reduced-motion/state.mjs`) that survive `vi.resetModules()`, and
  its `exports` map blocks deep imports. The alias exposes the real state
  module so `test/mockMatchMedia.ts` can reset the latch and switch the
  branch in both directions within one file.
- **kbar performs a real network fetch on mount.** `SearchProvider` loads
  `searchDocumentsPath`, which in jsdom surfaced as an unhandled
  `ECONNREFUSED` against localhost:80. Tests using `withSearch: true` must
  install `mockFetch()` and await the exported `waitForKbarIndex()` to keep
  the suite offline and `act()`-clean.
- **Order-dependence bug found and fixed in our own tests.**
  `navigator.language` is an accessor on `Navigator.prototype`, so
  `getOwnPropertyDescriptor(navigator, 'language')` returns `undefined` and
  the intended restore in `contexts/LanguageContext.test.tsx` silently never
  ran, leaking an Italian override into later files. Fixed by deleting the
  shadowing own property. Verified across 9 seeds plus 3 unseeded shuffles.

### Suspected bugs — reported, not fixed

Confirmed from the spec's candidate list:

1. **`layouts/ListWithTagsLayout.tsx:56,70` — pagination i18n asymmetry.**
   Enabled prev/next use `t('common.previous')`/`t('common.next')`; the
   disabled variants hardcode `"← Previous"`/`"Next →"`. Under `it`, page 1
   reads "← Previous … Successivo →". Invisible in English because the
   literals coincide with the locale values.
2. **`layouts/ListWithTagsLayout.tsx:183` — hardcoded empty state.**
   `"No items found."` bypasses `t()` entirely; no locale key exists.
3. **`app/sitemap.ts:22` — emits a `/tags` route that does not exist.**
   No `app/tags` route is present in the App Router tree.
4. **`app/page.tsx` — mutates the contentlayer array.** Sorts `allProjects`
   in place with `.sort()` on a shared module-level import.
5. **`components/home/ProjectsPreview.tsx` — missing empty guard.** Its
   sibling `BlogPreview` returns `null` for an empty list; `ProjectsPreview`
   renders its header and an empty grid.

Additional findings surfaced while testing:

6. **`components/home/FixedAnalogyParagraph.tsx:68` — accented words never
   highlight.** The regex is built as `` `\b${word}\b` `` without the `u`
   flag, so a trailing `à` falls outside `\w` and the closing `\b` cannot
   match. The configured IT entry `'trovare struttura nella complessità'`
   is therefore never highlighted, while its EN counterpart is.
7. **`components/home/FixedAnalogyParagraph.tsx:147` — effect queries
   `document`, not the container.** With two instances mounted, every
   `.highlight-word` receives listeners bound to both containers, so
   hovering one lights the other's ripple.
8. **`components/MobileNav.tsx:27-29` — `useEffect` with no dependency
   array.** `return clearAllBodyScrollLocks` re-runs its cleanup before
   every re-render, so opening the menu produces
   `disableBodyScroll` → `clearAllBodyScrollLocks` in one interaction. The
   evident intent (clear on unmount only) is not what the code does.
9. **`components/common/Header.tsx:54` — `lastScrollYRef` starts at `0`.**
   Mounting at a deep scroll position makes the first scroll event compute a
   large positive delta and hide the header immediately, even if the user
   never moved. Inconsistent with the solid-state effect, which does read
   the scroll position eagerly on mount.
10. **`components/common/Header.tsx:37-49` — JSDoc describes code that does
    not exist**, claiming an `IntersectionObserver` and a `#hero` sentinel;
    the implementation uses two plain scroll listeners.
11. **`components/common/ThemeToggle.tsx:25-27` — persists a theme the user
    never chose.** A mount effect writes `PreferencesService.setPref('theme',
theme)`, so a first-time visitor immediately gets
    `lightstimulus.theme = 'system'`. Consequently changing
    `siteMetadata.theme` can never affect a returning visitor, and the
    "no stored preference" state is unreachable after one page view. The
    write also duplicates next-themes' own write to the same `storageKey`.
12. **`components/about/CertificationsGrid.tsx:209-212` — a malformed
    `expiryDate` renders as "No expiration".** `getExpiryInfo` returns
    `null` both for a missing date and for an unparseable one, so
    `'not-a-date'` is indistinguishable from a genuinely perpetual badge.
13. **`components/blog/BlogListClient.tsx:48,59` — no Italian fallback.**
    A bare ternary (`lang === 'it' ? post.titleIt : post.titleEn`) renders an
    _empty_ heading for a post missing `titleIt`, whereas `ProjectHeader`
    uses `?? .en`. The two content types behave differently.
14. **`components/projects/ProjectsListClient.tsx:28` — `priority` keyed on
    slug, not position.** `findIndex(p => p.slug === project.slug)` gives
    duplicate-slug projects both the `priority` hint, and because the index
    is computed against the unfiltered list, tag-filtering to a non-first
    project leaves _no_ card prioritised.
15. **`layouts/ListWithTagsLayout.tsx:93-94,97,109` — two pagination
    edge cases.** `pagination.currentPage` is dead (the page comes only from
    the `/page/N` pathname), and `totalPages: 0` makes `pageSize` `Infinity`,
    so `slice(NaN, NaN)` empties the list while the recomputed `totalPages`
    of 1 hides the navigation — a dead end for the user.
16. **`layouts/BlogPostLayout.tsx:20` — hero `alt` is locale-blind.**
    `content.title?.en || 'Blog post'` means Italian readers get an English
    alt that never matches the visible heading. It also uses `||` rather
    than `??`, so an empty-string English title takes the fallback.
17. **`components/projects/ProjectCardBase.tsx:54` — the date badge is
    unreachable without a cover image**, because the `date &&` block is
    nested inside `coverImage &&`. `ProjectCardGrid` makes `date` required
    while `coverImage` is optional, so the combination is reachable.
18. **`components/projects/ProjectLinks.tsx:54` — duplicated accessible
    names.** The three `@icons-pack/react-simple-icons` glyphs emit a
    non-`aria-hidden` `<title>`, yielding names like `"GitHubGitHub"` and
    `"npmNPM Package"`. The six lucide icons are unaffected.
19. **`components/about/AboutProfile.tsx:14-20` — `twitter` and `bluesky`
    are accepted but never rendered**; only `mail`, `github` and `linkedin`
    appear. The avatar `alt` is also a hardcoded English `'Avatar'` while
    every other string goes through `t()`.
20. **`components/contact/ContactMethods.tsx` — renders its shell
    unconditionally.** With neither `email` nor `linkedin`, it still shows
    "You can also reach me directly by email" with no email present. It also
    uses `rel="noreferrer"` without `noopener`, unlike `SocialIcon`.
21. **`components/ScrollTopAndComment.tsx:9-17` — no eager scroll read.**
    Mounted on an already-scrolled page it stays hidden until the next
    scroll event, unlike Header's solid-state effect.
22. **React keys derived from translated text.** `FocusAreas.tsx:25` keys on
    `area.title[lang]` and `CertificationsGrid.tsx:118` on `cert.title`, so
    two entries sharing a title in the active locale would collide. Not
    triggered by current data.

### Confirmed dead / inert code — flagged, untouched, untested

- `components/projects/ProjectsGrid.tsx` (107 LOC, no importers)
- `layouts/AuthorLayout.tsx` (referenced only from a demo MDX post)
- `data/projectsData.ts` (legacy starter-template data)
- `components/Comments.tsx` — always returns `null`, since the whole
  `comments` block in `data/siteMetadata.js:41-56` is commented out. The
  same is true of `ScrollTopAndComment`'s "Scroll To Comment" button, whose
  handler is unreachable.
- `components/about/AboutContent.tsx`
- `components/home/FixedAnalogyParagraph.tsx:152-155` — the
  `if (!el.getAttribute('data-text'))` fallback is unreachable, because
  `buildHighlightedHtml` always emits `data-text`.

### Behaviour that could not be asserted (documented, not faked)

- **`typeDuration`'s `0.3`s floor is unreachable.** The shortest shipped
  tagline (23 non-whitespace chars) yields 0.92s, so `Math.max` always picks
  the per-character term. The formula itself is asserted indirectly by
  measuring the clip-path wipe span (±60ms tolerance); no test was written
  for the floor.
- **HTML escaping is not exercisable by real content.** Neither locale's
  `hero.fixed_paragraph` contains `& < > " '`. Rather than modify the locale
  files, a guard test asserts their absence (so the escaping suite fails
  loudly if the copy ever gains one), alongside assertions that nothing in
  the text was parsed as markup.
- **`overlaps()` rejecting a sentence-vs-sentence range is unreachable**
  with the configured copy; only sentence-beats-word precedence is
  observable, and that is asserted.
- **The pre-effect English paint is unobservable.** Testing Library flushes
  effects during `render`, so only the settled locale can be asserted.

### Harness notes worth keeping

- **Fake timers alone stall `motion`'s frameloop.** `Taglines` needs
  `requestAnimationFrame`/`cancelAnimationFrame`/`performance` faked too,
  and timers must be advanced in small steps — a single large jump runs the
  interval and its nested fade timeout without letting a frame render,
  producing a false "nothing changed" reading.
- **`toBeEmptyDOMElement()` is unusable with `renderWithProviders`**;
  next-themes injects an inline `<script>` into the render container. Assert
  the absence of the component's own elements instead.
- **`import it from '@/locales/it.json'` shadows Vitest's `it`** and breaks
  an entire file with `TypeError: default is not a function`. Alias it.
- **`SocialIcon` accessible names concatenate** the `sr-only` kind and the
  SVG `<title>` (e.g. `"linkedinLinkedin"`).
- **Headless UI keeps `MobileNav` mounted when closed** (`unmount={false}`)
  and portals the panel outside the render container, so open/closed must be
  probed with role queries against `document`, not element counts.
