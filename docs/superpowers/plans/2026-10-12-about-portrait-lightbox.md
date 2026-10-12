# About Portrait Carousel Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, responsive larger-image lightbox to the About portrait carousel while preserving and sharing all existing photo, style, navigation, fallback, localization, and reduced-motion behavior.

**Architecture:** `PortraitCarousel` remains the single owner of photo/style/fallback state and passes current display data plus existing state-changing callbacks to a focused `PortraitLightbox` child. The child uses the installed Headless UI Dialog primitives for modal semantics and focus management, the existing responsive `Image` component for large assets, and only local terminal-image-unavailable state that resets when the shared display key changes.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, `@headlessui/react` 2.2.0, `motion/react` 12, existing `Image` and `LanguageContext`, Vitest 2, React Testing Library, user-event.

**Spec:** `docs/superpowers/specs/2026-10-12-about-portrait-lightbox-design.md`

**Slug:** `about-portrait-lightbox`
**Provenance:** `docs/superpowers/specs/2026-10-12-about-portrait-lightbox-design.md`; current user request; `components/about/PortraitCarousel.tsx`; `components/about/PortraitCarousel.test.tsx`; `components/Image.tsx`; `components/MobileNav.tsx`; `locales/locales.test.ts`; `package.json`; `vitest.config.mts`; `test/mockMatchMedia.ts`; `docs/architecture/map.md`

**Execution tier:** full
**Implementation model role:** full

The full tier is required because accessible focus containment/restoration, Headless UI portal behavior, responsive image containment, and browser scroll locking require non-mechanical judgment and browser validation even though the implementation is localized.

## Global Constraints

- Work directly in `/Users/davide/Personal/Projects/lightstimulus-static-site-nextjs`; do not create or use a Git worktree.
- Create `feat/about-portrait-lightbox` only after this plan receives explicit approval, starting from an updated `main`.
- Keep `PortraitCarousel` as the only photo/style/fallback state owner; do not add a second carousel state machine.
- Use installed `@headlessui/react`; add no dependency unless verified implementation evidence proves it cannot meet a requirement.
- Do not redesign the About card, regenerate portraits, change portrait/style order, alter the author content model, or create a site-wide modal/gallery abstraction.
- Add every new visible and accessible string to both `locales/en.json` and `locales/it.json` with matching interpolation placeholders.
- Follow TDD: observe each focused test fail for the intended missing behavior before adding the minimal implementation.
- Run only repository-sourced verification commands: `npm run test`, `npm run lint`, `npm run build`, and `npm run dev` from `package.json`.
- Commit the approved spec, plan, tests, and verified implementation on the feature branch. Do not push or merge before local user testing.

## Repository Evidence

- Architecture map: `docs/architecture/map.md`, generated at HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`; current planning HEAD is `6007aa3f6daaf5da94517139bba4073b5bb608c6`, so the map is stale.
- Freshness check: every recorded key path exists at planning time: `app/layout.tsx`, `components/`, `contexts/LanguageContext.tsx`, `data/`, `lib/`, `contentlayer.config.ts`, `package.json`, `next.config.js`, `vitest.config.mts`, and `test/setup.ts`.
- Relevant boundaries remain valid: About UI is a client component under `components/about/`; localization flows through `LanguageContext`; static-export images use `components/Image.tsx`; tests use Vitest/jsdom and React Testing Library.
- ADRs: no ADR/MADR/decision document was found under `docs/`; there is no accepted or proposed ADR constraining this change.
- Verification commands come from `package.json`; reduced-motion test setup comes from `test/mockMatchMedia.ts`; locale parity behavior comes from `locales/locales.test.ts`.
- Explicit assumption: Headless UI 2.2.0 supplies focus trapping, inert background, Escape/outside-click handling, and scroll locking. Verify these in component tests where jsdom exposes them and in browser QA; add custom handling only for a demonstrated gap.
- Browser-QA viewport assumption: use 1440×900 for desktop and 375×812 for narrow mobile unless the available browser surface requires a comparably representative size.

## File Structure

- Create `components/about/PortraitLightbox.tsx`: Headless UI dialog markup, large responsive image, localized controls, motion presentation, and terminal unavailable-image state.
- Create `components/about/PortraitCarousel.lightbox.test.tsx`: focused public-behavior integration tests rendered through `PortraitCarousel`.
- Modify `components/about/PortraitCarousel.tsx`: expand trigger/open state, shared display props, callbacks, and sibling lightbox rendering; preserve existing handlers.
- Modify `locales/en.json`: English larger-view labels and failure text.
- Modify `locales/it.json`: equivalent Italian labels and matching placeholders.
- Modify `locales/locales.test.ts`: assert the lightbox-specific contract in addition to existing whole-file parity checks.
- Preserve `components/about/PortraitCarousel.test.tsx` except for narrowly justified regression assertions; its existing 21 tests remain the characterization suite.

## Review Focus

- Closing through Escape or backdrop, not only the close button, must restore focus to the exact expand trigger; Task 1 tests every close path.
- Switching English to Italian while open must update dialog/alt/control text without resetting state; Task 1 tests the live language change.
- One configured portrait must keep navigation usable and stable rather than producing an invalid index; Task 2 tests previous, next, and direct selection with a one-item fixture.
- A terminal avatar failure must clear after selecting a new source rather than poisoning the rest of the session; Task 3 tests recovery after photo/style change.
- A narrow viewport with long Italian copy must retain complete image/control access without horizontal page overflow; Task 2 pins structural classes and Task 4 verifies the rendered browser layout at 375×812.

## Criterion Traceability

| Criterion | Owning task    | Primary evidence                                                   |
| --------- | -------------- | ------------------------------------------------------------------ |
| AC-01     | Task 1         | Sibling structure, 44px target, contextual accessible-name tests   |
| AC-02     | Task 1         | Initial dialog photo/style test                                    |
| AC-03     | Task 2         | Shared style cycle/wrap test                                       |
| AC-04     | Task 2         | Previous/next/dot wrap and Original-reset tests                    |
| AC-05     | Task 2         | Close/reopen preserved-state test                                  |
| AC-06     | Task 1         | Close button, Escape, backdrop, and inside-click tests             |
| AC-07     | Task 1, Task 4 | Focus/inert tests and browser scroll-lock QA                       |
| AC-08     | Task 2, Task 4 | Responsive picture/object-contain assertions and viewport QA       |
| AC-09     | Task 1, Task 2 | Dialog semantics, localized alt/control names, focus/touch classes |
| AC-10     | Task 2, Task 4 | Theme classes and light/dark browser QA                            |
| AC-11     | Task 2         | Reduced-motion immediate-swap test                                 |
| AC-12     | Task 3         | Three-stage fallback and recovery tests                            |
| AC-13     | Task 1         | Locale contract and live language-change tests                     |
| AC-14     | Task 2, Task 4 | Existing carousel focused tests and full regression suite          |
| AC-15     | Tasks 1–4      | Red/green focused tests and complete `npm run test`                |
| AC-16     | Task 4         | Lint, production build, and browser QA record                      |

---

### Task 1: Accessible, localized dialog shell [size: M | risk: other | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: none]

The `other` risk is accessibility: incorrect portal, focus, inert-background, or close-path behavior can make the page unusable for keyboard and assistive-technology users even when ordinary click tests pass.

**Acceptance criteria:** AC-01, AC-02, AC-06, AC-07, AC-09, AC-13, AC-15

**Files:**

- Create: `components/about/PortraitLightbox.tsx`
- Create: `components/about/PortraitCarousel.lightbox.test.tsx`
- Modify: `components/about/PortraitCarousel.tsx:3-49,187-253,309-313`
- Modify: `locales/en.json:13-23`
- Modify: `locales/it.json:13-23`
- Modify: `locales/locales.test.ts:119-132`
- Commit: `docs/superpowers/specs/2026-10-12-about-portrait-lightbox-design.md`
- Commit: `docs/superpowers/plans/2026-10-12-about-portrait-lightbox.md`

**Interfaces:**

- Consumes: `Portrait`, `Image`, `useLanguage()`, `useReducedMotion()`, and Headless UI `Dialog`, `DialogBackdrop`, `DialogPanel`, `DialogTitle`.
- Produces: `type PortraitDisplayState = { id: string; label: string; src: string }` and `type PortraitLightboxProps = { open: boolean; portraits: Portrait[]; activePhotoIndex: number; activePortrait: Portrait; activeState: PortraitDisplayState; statePosition: number; stateTotal: number; displaySrc?: string; displayKey: string; failureStage: 'active' | 'original' | 'avatar'; fallbackAlt: string; transitionKind: 'photo' | 'variant'; transitionDirection: number; shouldReduceMotion: boolean; canRecoverFromImageError: boolean; onClose: () => void; onCycleVariant: () => void; onNavigatePhoto: (offset: number) => void; onSelectPhoto: (index: number) => void; onImageError: () => void }`.
- Produces: `PortraitLightbox(props: PortraitLightboxProps): ReactElement`.
- Produces: parent-owned `isLightboxOpen: boolean` and `expandButtonRef: RefObject<HTMLButtonElement | null>` in `PortraitCarousel`; Task 2 reuses the existing `cycleVariant`, `navigatePhoto`, and `selectPhoto` callbacks unchanged.

- [ ] **Step 1: Start implementation in the approved checkout and commit the approved artifacts**

Run:

```bash
git status --short --branch
git fetch origin
git pull --ff-only origin main
git switch -c feat/about-portrait-lightbox
git add docs/superpowers/specs/2026-10-12-about-portrait-lightbox-design.md docs/superpowers/plans/2026-10-12-about-portrait-lightbox.md
git commit -m "docs: specify about portrait lightbox"
```

Expected: the initial status is `main...origin/main` with only the approved spec and plan untracked/modified; the pull reports up to date or fast-forwards without conflict; the new branch is `feat/about-portrait-lightbox`; the commit contains only the two approved artifacts.

- [ ] **Step 2: Write failing shell, dismissal, focus, and localization tests**

In `components/about/PortraitCarousel.lightbox.test.tsx`, add tests named:

```tsx
it('renders a separate 44px contextual expand control without activating the portrait')
it('opens a labelled dialog with the active photo and style and focuses Close')
it.each(['close button', 'Escape', 'backdrop'])('closes through %s and restores focus to expand')
it('keeps inside-panel clicks open and traps Tab focus within the dialog')
it('updates English dialog context to Italian while open without resetting selection')
```

Assert sibling DOM structure; `h-11 w-11`; accessible name `View larger: Guitar session, Original`; one `role="dialog"` with localized title; content image alt `Guitar session, Original`; initial close-button focus; no style change from opening; each close path removes the dialog and focuses the trigger; panel clicks remain open; Tab/Shift+Tab cycle within dialog controls; language switching changes title, alt, close, and expand names while retaining the selected style.

In `locales/locales.test.ts`, add a lightbox-key contract for `view_larger`, `lightbox_title`, `close_lightbox`, `lightbox_image_alt`, and `image_unavailable`, asserting both locales contain them and use identical `{{title}}`/`{{state}}` placeholders where applicable.

- [ ] **Step 3: Run the focused tests and confirm the intended red state**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx locales/locales.test.ts`

Expected: FAIL because the expand control/dialog and new locale keys do not exist; existing locale-parity assertions continue to pass until one-sided strings are introduced.

- [ ] **Step 4: Implement the minimal dialog shell and bilingual strings**

Create `PortraitLightboxProps` and `PortraitLightbox` in `components/about/PortraitLightbox.tsx`. Render Headless UI Dialog primitives only when `open`, use an internal close-button ref as `initialFocus`, put the backdrop outside `DialogPanel`, and expose the close button first in DOM focus order. Do not yet add working style/photo controls beyond semantic placeholders required to render the shell.

In `PortraitCarousel`, add `isLightboxOpen`, `expandButtonRef`, and a 44px icon-only sibling button with localized contextual name; render `PortraitLightbox` after the carousel content and pass live read-only display data plus existing callbacks.

Add complete English and Italian values for the five planned locale keys in the existing `about.profile.carousel` namespace. Use existing interpolation syntax from `LanguageContext`.

- [ ] **Step 5: Run the focused shell tests to verify green**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx locales/locales.test.ts`

Expected: PASS for structure, open/close paths, dialog semantics, focus behavior, language change, and locale contracts.

- [ ] **Step 6: Run the existing carousel characterization suite**

Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

Expected: all existing carousel tests PASS unchanged, proving the sibling trigger and open state do not alter clicks, keyboard, swipe, fallback, or motion behavior.

- [ ] **Step 7: Commit the accessible shell**

```bash
git add components/about/PortraitLightbox.tsx components/about/PortraitCarousel.tsx components/about/PortraitCarousel.lightbox.test.tsx locales/en.json locales/it.json locales/locales.test.ts
git commit -m "feat(about): add accessible portrait lightbox shell"
```

### Task 2: Shared controls, responsive image, themes, and motion [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-03, AC-04, AC-05, AC-08, AC-09, AC-10, AC-11, AC-14, AC-15

**Files:**

- Modify: `components/about/PortraitLightbox.tsx`
- Modify: `components/about/PortraitCarousel.lightbox.test.tsx`
- Verify: `components/about/PortraitCarousel.test.tsx`

**Interfaces:**

- Consumes: `PortraitLightboxProps`, parent-owned state, and existing `cycleVariant(): void`, `navigatePhoto(offset: number): void`, `selectPhoto(index: number, direction?: number): void` from Task 1/current carousel.
- Produces: fully working lightbox style, previous/next, and direct-selection controls; large responsive image keyed by `displayKey`; no new selection state.

- [ ] **Step 1: Write failing synchronization, navigation, layout, theme, and motion tests**

Add tests named:

```tsx
it('cycles shared styles in the lightbox and wraps both surfaces to Original')
it('navigates previous next and dots with wrap and resets each photo to Original')
it('preserves the final shared selection across close and reopen')
it('keeps a one-photo carousel stable under every lightbox navigation control')
it('renders responsive object-contain imagery and mobile-safe touch controls')
it('uses existing light and dark theme classes with visible focus styles')
it('uses immediate lightbox swaps when reduced motion is enabled')
```

Assert both carousel and dialog labels/images after every action; `aria-current` on the active lightbox dot; complete-image `object-contain`; responsive `<source>` entries include 640/800/1000 WebP assets; previous/next/close targets are at least 44px and dots remain clear/usable; panel/image/control containers use viewport-constrained, overflow-safe, light/dark, and focus-visible classes; `data-motion="reduced"` and one current lightbox image after a state change with reduced motion.

- [ ] **Step 2: Run the focused tests and confirm missing behavior**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx`

Expected: FAIL because lightbox controls are placeholders and the large responsive/motion presentation is not implemented.

- [ ] **Step 3: Implement shared controls and large-image presentation**

Wire `onCycleVariant`, `onNavigatePhoto`, and `onSelectPhoto` directly to controls; never copy indexes into the child. Render the existing `Image` with `fill`, viewport-responsive `sizes`, localized non-empty alt text, and `object-contain` inside a relative min-height-safe region. Use previous/next buttons alongside the image and a separate direct-selection-dot row so five usable dots fit at narrow width.

Use `AnimatePresence`/`motion` with `displayKey`, `transitionKind`, and `transitionDirection` for the existing restrained motion language. When `shouldReduceMotion` is true, disable initial/exit effects and set transition duration to zero. Add dark backdrop, light/dark panel/control classes, `100dvh`-bounded layout, internal vertical overflow only when required, focus-visible rings, and touch-target sizes.

- [ ] **Step 4: Run focused lightbox and existing carousel tests**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx components/about/PortraitCarousel.test.tsx`

Expected: all lightbox synchronization/layout/motion tests and all existing carousel characterization tests PASS.

- [ ] **Step 5: Commit synchronized lightbox behavior**

```bash
git add components/about/PortraitLightbox.tsx components/about/PortraitCarousel.tsx components/about/PortraitCarousel.lightbox.test.tsx
git commit -m "feat(about): synchronize portrait lightbox controls"
```

### Task 3: Resilient lightbox image fallback [size: S | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-12, AC-13, AC-15

**Files:**

- Modify: `components/about/PortraitLightbox.tsx`
- Modify: `components/about/PortraitCarousel.tsx`
- Modify: `components/about/PortraitCarousel.lightbox.test.tsx`

**Interfaces:**

- Consumes: shared `handleImageError(): void`, `failureStage`, `displayKey`, `canRecoverFromImageError`, `fallbackAlt`, and localized `image_unavailable` from Tasks 1–2.
- Produces: local `imageUnavailable: boolean` that is set only when no shared fallback remains and resets on `displayKey` change or a new open session.

- [ ] **Step 1: Write failing fallback-chain and recovery tests**

Add tests named:

```tsx
it('falls back from a failed creative lightbox image to shared Original')
it('falls back from a failed Original to the legacy avatar')
it('shows localized unavailable content when the final avatar fails')
it('shows unavailable content when Original fails without an avatar')
it('clears terminal failure after selecting a new photo or style source')
```

Assert shared carousel style changes to Original after creative failure; avatar alt uses `fallbackAlt`; final failure removes the broken image but retains dialog title and controls; English/Italian unavailable text is present; no repeated error loop occurs; photo/style navigation after a terminal failure attempts and displays the new source.

- [ ] **Step 2: Run focused fallback tests and confirm the red state**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx`

Expected: FAIL because terminal lightbox errors still leave a broken image and do not reset on source changes.

- [ ] **Step 3: Implement minimal terminal fallback state**

Compute `canRecoverFromImageError` in `PortraitCarousel` from `failureStage`, `activeVariantIndex`, and `fallbackAvatar`. In `PortraitLightbox`, call shared `onImageError` while recovery remains; otherwise set `imageUnavailable`. Reset only that local terminal flag when `displayKey` changes or the dialog begins a new open session. Keep title, style, navigation, dots, and close controls rendered around localized unavailable content.

- [ ] **Step 4: Run fallback, locale, and existing-carousel tests**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx components/about/PortraitCarousel.test.tsx locales/locales.test.ts`

Expected: all focused fallback/recovery tests, locale contracts, and existing carousel fallback tests PASS.

- [ ] **Step 5: Commit resilient fallback handling**

```bash
git add components/about/PortraitLightbox.tsx components/about/PortraitCarousel.tsx components/about/PortraitCarousel.lightbox.test.tsx
git commit -m "fix(about): handle portrait lightbox image failures"
```

### Task 4: Whole-project verification and browser QA [size: M | risk: other | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: borderline]

The `other` risk is browser-only interaction/layout behavior: jsdom cannot fully prove native focus containment, inertness, scroll locking, responsive geometry, theme contrast, or image containment.

**Acceptance criteria:** AC-07, AC-08, AC-10, AC-14, AC-15, AC-16

**Files:**

- Verify: all repository source and test files
- Inspect: `components/about/PortraitLightbox.tsx`
- Inspect: `components/about/PortraitCarousel.tsx`
- Inspect: `components/about/PortraitCarousel.lightbox.test.tsx`
- Inspect: `locales/en.json`
- Inspect: `locales/it.json`

**Interfaces:**

- Consumes: completed Tasks 1–3 and repository scripts from `package.json`.
- Produces: test/lint/build evidence, a completed desktop/mobile light/dark browser-QA record, and a clean unpushed feature branch ready for local user testing.

- [ ] **Step 1: Run the complete test suite**

Run: `npm run test`

Expected: Vitest exits 0 with every test file and test passing; no unhandled error, act warning introduced by the lightbox, or snapshot update is accepted without investigation.

- [ ] **Step 2: Run repository lint and inspect automatic changes**

Run: `npm run lint`

Expected: Next lint exits 0. Because this repository's lint script includes `--fix`, immediately run `git status --short` and `git diff --check`; only intended formatting/fix changes in feature-owned files are allowed.

- [ ] **Step 3: Re-run focused tests after lint**

Run: `npm run test -- components/about/PortraitCarousel.lightbox.test.tsx components/about/PortraitCarousel.test.tsx locales/locales.test.ts`

Expected: PASS after any lint fixes.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: Next.js static-export build and `scripts/postbuild.mjs` both exit 0; `/about` is generated without TypeScript, prerender, missing-image, or localization errors.

- [ ] **Step 5: Start the repository development server for browser QA**

Run: `npm run dev`

Expected: the Next.js development server starts successfully and serves the About page at its reported local URL. Keep it running only for the bounded QA session.

- [ ] **Step 6: Perform desktop browser QA at 1440×900**

In both light and dark themes, verify: sibling expand target and focus ring; exact active photo/style on open; large image fully contained; style synchronization; previous/next/dot wrap and Original reset; close button, Escape, and backdrop behavior; focus trap/restoration; background cannot scroll; English/Italian live copy; no console error; and no carousel regression after closing.

Expected: every check passes without clipped controls, distorted image, background interaction, focus escape, layout shift into adjacent About content, or theme-contrast defect.

- [ ] **Step 7: Perform narrow-mobile browser QA at 375×812**

Repeat light/dark opening, control reachability, image containment, state synchronization, dismissal, focus, and scroll-lock checks. Switch to Italian and verify long labels reflow without horizontal page scrolling. If the browser supports reduced-motion emulation, verify immediate modal/image changes; otherwise record the passing focused reduced-motion component test as the evidence for that branch.

Expected: the panel stays within the dynamic viewport, every control remains reachable and visibly focused, direct-selection dots remain clear, the full image remains visible, and the page has no horizontal overflow.

- [ ] **Step 8: Stop the development server and review the complete diff**

Run:

```bash
git status --short --branch
git diff --check
git diff main...HEAD --stat
git log --oneline main..HEAD
```

Expected: branch is `feat/about-portrait-lightbox`; no worktree was created; diff contains only the approved docs, lightbox/carousel implementation, focused tests, and locale changes; no whitespace errors; commits are scoped and unpushed.

- [ ] **Step 9: Commit only verified lint or QA corrections, if any**

If Steps 2–7 required a correction, first rerun its owning focused test plus `npm run test`, then commit only the correction:

```bash
git add components/about/PortraitLightbox.tsx components/about/PortraitCarousel.tsx components/about/PortraitCarousel.lightbox.test.tsx locales/en.json locales/it.json locales/locales.test.ts
git commit -m "fix(about): address portrait lightbox verification"
```

Expected: no empty commit; final `git status --short` is empty and the feature branch remains unpushed and unmerged for local user testing.
