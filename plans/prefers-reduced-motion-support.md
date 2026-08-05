# Plan: Add prefers-reduced-motion Support Across the Site

| Field       | Value                                              |
| ----------- | -------------------------------------------------- |
| **Title**   | Add prefers-reduced-motion Support Across the Site |
| **Spec**    | specs/prefers-reduced-motion-support.md            |
| **Type**    | feature                                            |
| **Branch**  | feat/prefers-reduced-motion-support                |
| **Created** | 2026-08-06 00:00:00                                |
| **Status**  | IMPLEMENTED                                        |

## Context

The site is animation-heavy but has zero handling of `prefers-reduced-motion`,
a WCAG 2.1 gap (2.3.3 / 2.2.2). We add a two-layer solution: a blanket CSS
safety net in `css/tailwind.css` that tames all keyframes/transitions, plus
Motion's built-in `useReducedMotion` hook applied to the three JS-driven
animations (`LogoAnimation`, `Taglines`, `FixedAnalogyParagraph`) so each
snaps to a static, legible state. The preference is read once at mount.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/prefers-reduced-motion-support`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/prefers-reduced-motion-support
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping:

- feature → `feat/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one commit.

## Build & Test Commands

| Action | Command      |
| ------ | ------------ |
| Lint   | `yarn lint`  |
| Build  | `yarn build` |
| Dev    | `yarn dev`   |

No automated test runner exists in the project (no Jest/Vitest/Playwright/
Testing Library). Verification is by lint + build passing plus the manual
reduced-motion checklist in the Verification section. Tasks are written to be
testable-by-design so unit tests can be added later without refactoring.

## Tasks

### Task 1: Add global CSS reduced-motion safety net `[S]`

**Goal**: Tame every CSS animation/transition and disable smooth scrolling when
`prefers-reduced-motion: reduce` is set.

**Files**:

| File               | Action | Description                                                                |
| ------------------ | ------ | -------------------------------------------------------------------------- |
| `css/tailwind.css` | modify | Append an `@media (prefers-reduced-motion: reduce)` blanket-override block |

**Reuse**:

| File               | What to reuse                                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `css/tailwind.css` | Existing `@keyframes heartbeat` (line 442), `.animate-heartbeat:hover` looping animation (line 476), `@keyframes fadeInUp` (line 479), `.highlight-word` / `.glass-ripple` transitions — all covered by the blanket rule, no per-rule edits needed |

**Steps**:

1. Append a new block at the end of `css/tailwind.css` (after line 632):

   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
     html {
       scroll-behavior: auto !important;
     }
   }
   ```

2. Rely on the blanket selector to catch the footer heartbeat (stops looping
   via `animation-iteration-count: 1`), `fadeInUp`, `.highlight-word` filter/
   opacity transitions, and all Motion CSS transitions (ThemeToggle, cert
   cards, AboutProfile) without naming them individually.

**Tests**:

- Manual: with DevTools "Emulate prefers-reduced-motion: reduce", confirm the
  footer heartbeat does not pulse and `fadeInUp` sections appear without motion.
- `yarn build` succeeds (CSS compiles under Tailwind v4).

**Acceptance criteria covered**: CSS `@media` block present; footer heartbeat
static; `fadeInUp` without motion.

**Commit**: `feat(css): add prefers-reduced-motion safety net for animations`

---

### Task 2: Snap LogoAnimation to final state under reduced motion `[S]`

**Goal**: When reduced motion is preferred, `LogoAnimation` renders the fully
drawn logo with resting glow and runs no GSAP timeline.

**Files**:

| File                                     | Action | Description                                                                    |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| `components/home/hero/LogoAnimation.tsx` | modify | Import `useReducedMotion`; fold it into the existing snap-to-final-state guard |

**Reuse**:

| File                                     | What to reuse                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `components/home/hero/LogoAnimation.tsx` | Existing `if (!shouldAnimate)` snap-to-final-state branch (lines 72–92); `detectRefreshOrFirstLoad` (line 70) |

**Steps**:

1. Import `useReducedMotion` from `motion/react` at the top.
2. Call `const shouldReduceMotion = useReducedMotion()` in the component body
   (hooks must run unconditionally, so call it above the `useEffect`).
3. Inside the effect, combine the preference with the existing check so the
   static branch runs when animation should not run OR reduced motion is
   preferred, e.g. change line 70–72 to:

   ```ts
   const shouldAnimate = detectRefreshOrFirstLoad('logo_mount_ts') && !shouldReduceMotion
   if (!shouldAnimate) {
     /* existing snap-to-final-state block */
   }
   ```

4. Add `shouldReduceMotion` to the `useEffect` dependency array (still
   effectively read-once at mount since the value is stable per mount).
5. Confirm the early `return` in the static branch means `tl` is never created,
   so the cleanup (`tl.kill()`) is only reached on the animated path — no change
   needed to cleanup logic.

**Tests**:

- Manual: with reduced motion on, hard-refresh home — logo is fully drawn with
  resting glow, no droplet trace or pulse.
- Manual: with reduced motion off, hard-refresh — full animation plays (no
  regression).

**Acceptance criteria covered**: LogoAnimation uses `useReducedMotion`, snaps to
final state, runs no animation; single clear guard; no regression when off.

**Commit**: `feat(logo): snap logo to final state under reduced motion`

---

### Task 3: Show a static tagline under reduced motion `[S]`

**Goal**: When reduced motion is preferred, `Taglines` shows one tagline with no
`setInterval` cycling and no clip-path wipe.

**Files**:

| File                           | Action | Description                                                                      |
| ------------------------------ | ------ | -------------------------------------------------------------------------------- |
| `components/home/Taglines.tsx` | modify | Import `useReducedMotion`; guard the interval effect and render a static tagline |

**Reuse**:

| File                           | What to reuse                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `components/home/Taglines.tsx` | Existing `motion.div` clip-path reveal (lines 59–68); existing `taglines`/`index` state |

**Steps**:

1. Import `useReducedMotion` from `motion/react`.
2. Call `const shouldReduceMotion = useReducedMotion()`.
3. In the interval `useEffect` (lines 21–34), return early when
   `shouldReduceMotion` is true so no `setInterval` is scheduled and no timer
   cleanup is needed (guard at the top of the effect). Add `shouldReduceMotion`
   to the dependency array.
4. For the inner clip-path `motion.div` (lines 59–68), when
   `shouldReduceMotion` is true set `initial`/`animate` `clipPath` to the fully
   revealed `inset(0 0% 0 0)` (or omit the clip animation) so the text appears
   without a wipe. Keep the deterministic first tagline (`index` stays 0).
5. Leave the outer `AnimatePresence`/opacity fade — it is a Motion transition
   also covered by the CSS safety net; optionally set its transition duration
   near-zero when reduced. Keep the single-tagline render deterministic.

**Tests**:

- Manual: with reduced motion on, observe Taglines — one tagline shown, no
  cycling, no wipe.
- Manual: with reduced motion off — typewriter cycles as before (no regression).

**Acceptance criteria covered**: Taglines uses `useReducedMotion`; no interval;
one static tagline; no wipe; single clear guard; no regression when off.

**Commit**: `feat(taglines): show static tagline under reduced motion`

---

### Task 4: Disable ripple/hover motion in FixedAnalogyParagraph under reduced motion `[M]`

**Goal**: When reduced motion is preferred, skip cursor-follow/ripple listeners
and container handlers; highlighted words remain static styling.

**Files**:

| File                                        | Action | Description                                                                            |
| ------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `components/home/FixedAnalogyParagraph.tsx` | modify | Import `useReducedMotion`; guard per-word listener effect and container mouse handlers |

**Reuse**:

| File                                        | What to reuse                                                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `components/home/FixedAnalogyParagraph.tsx` | Existing per-word `useEffect` listener block (lines 137–188); container handlers (lines 122–134); `.highlight-word` base styling in `css/tailwind.css` (line 493) which is already static color/weight |

**Steps**:

1. Import `useReducedMotion` from `motion/react`.
2. Call `const shouldReduceMotion = useReducedMotion()`.
3. In the per-word `useEffect` (lines 137–188), return early when
   `shouldReduceMotion` is true so no `mousemove`/`mouseenter`/`mouseleave`
   listeners are attached; because nothing is attached, the `disposers`-based
   cleanup runs over an empty array (safe). Add `shouldReduceMotion` to the
   dependency array (`[html, shouldReduceMotion]`).
4. For the container handlers (`handleContainerMouseMove` /
   `handleContainerMouseLeave`), make them no-ops when `shouldReduceMotion` is
   true (early `return`), OR conditionally omit the `onMouseMove`/`onMouseLeave`
   props on the ripple `<div>` (line 199–205) so the CSS `--ripple-opacity`
   variable never activates and the glass ripple stays hidden.
5. Confirm the highlight words still render (static `.highlight-word` color +
   weight from CSS); only the `.is-hovered` glow and `::after` transition are
   suppressed — the transition itself is already tamed by Task 1's CSS safety
   net, and the `is-hovered` class is never added because listeners are skipped.

**Tests**:

- Manual: with reduced motion on, move cursor over the analogy paragraph — no
  ripple, no cursor-follow, highlights static.
- Manual: with reduced motion off — ripple and word glow work as before (no
  regression).

**Acceptance criteria covered**: FixedAnalogyParagraph uses `useReducedMotion`;
no listeners attached; static highlights; single clear guard; safe cleanup; no
regression when off.

**Commit**: `feat(analogy): disable ripple and hover motion under reduced motion`

---

**Task ordering**: Task 1 (CSS) is independent and can land first — it also
backs up any Motion transitions in Tasks 3–4. Tasks 2, 3, and 4 are independent
of each other (different components). Recommended order: 1 → 2 → 3 → 4.

## Edge Cases & Error Handling

- **SSR / hydration:** Motion's `useReducedMotion` is SSR-safe (returns a stable
  value); no hydration mismatch introduced. (Tasks 2–4)
- **LogoAnimation dual condition:** the reduced-motion check is ANDed with the
  existing `detectRefreshOrFirstLoad` result so either reason yields the static
  logo; the early `return` means the timeline is never created and its cleanup
  is only reached on the animated path. (Task 2)
- **Taglines dangling interval:** the effect returns before `setInterval` is
  called, so no timer is created and no cleanup is required. (Task 3)
- **FixedAnalogyParagraph listener cleanup:** when listeners are skipped, the
  `disposers` array is empty and cleanup is a no-op. (Task 4)
- **No `matchMedia` support:** Motion's hook falls back to "no preference",
  yielding full animation — graceful degradation. (Tasks 2–4)
- **Essential-motion escape hatch:** documented in the spec; not implemented.
  All motion is decorative; the blanket CSS rule applies to everything. (Task 1)

## Verification

1. Run `yarn lint` and `yarn build` — both succeed.
2. Enable reduced motion (macOS: System Settings → Accessibility → Display →
   Reduce motion; or Chrome DevTools → Rendering → "Emulate CSS
   prefers-reduced-motion: reduce").
3. Hard-refresh the home page — logo fully drawn with resting glow, no
   trace/pulse (Task 2).
4. Observe Taglines — single static tagline, no cycling, no wipe (Task 3).
5. Hover the analogy paragraph — no ripple/cursor-follow, static highlights
   (Task 4).
6. Footer heartbeat static; `fadeInUp` sections appear without motion; theme
   toggle / cert cards / AboutProfile transitions effectively instant (Task 1).
7. Disable reduced motion and repeat 3–6 — every animation behaves as before
   (no regression).
