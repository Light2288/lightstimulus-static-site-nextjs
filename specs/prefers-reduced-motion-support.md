# Add prefers-reduced-motion Support Across the Site

| Field       | Value                                              |
| ----------- | -------------------------------------------------- |
| **Title**   | Add prefers-reduced-motion Support Across the Site |
| **Type**    | feature                                            |
| **Scope**   | Site-wide animation / accessibility                |
| **Created** | 2026-08-06 00:00:00                                |
| **Status**  | IMPLEMENTED                                        |

## Problem Statement

The site is animation-heavy but currently has **zero** handling of the
`prefers-reduced-motion` user preference (verified by grep — no CSS media
query and no JS hook anywhere in the codebase). Users who have requested
reduced motion at the OS level — often because motion triggers vestibular
disorders, nausea, migraines, or distraction — are served the full set of
animations regardless.

This is a **WCAG 2.1 gap** against:

- **2.3.3 Animation from Interactions (AAA)** — motion animation triggered
  by interaction can be disabled unless essential.
- **2.2.2 Pause, Stop, Hide (A)** — moving/auto-updating content (the
  forever-looping typewriter) must be pausable/stoppable.

We want to respect the preference everywhere with minimal, robust changes.

## Current Behavior

No code path inspects `prefers-reduced-motion`. Regardless of the user's OS
setting, the site plays:

**JS-driven animations:**

- `components/home/hero/LogoAnimation.tsx` — a ~2.8s GSAP DrawSVG/MotionPath
  sequence (droplet trace → enlarge → body fade-in → pulsing glow). It
  **already** contains a "snap to final state" branch: the `if (!shouldAnimate)`
  block used for internal SPA navigation sets the tails, bodies, circles, and
  a resting glow to their final visible state and returns early.
- `components/home/Taglines.tsx` — a forever-looping typewriter driven by
  `setInterval` every 5000ms, with a Motion clip-path wipe transition.
- `components/home/FixedAnalogyParagraph.tsx` — a cursor-following glass
  ripple plus word-glow hover effects.

**CSS / Motion-driven animations:**

- CSS keyframes: footer heartbeat, `fadeInUp`.
- Motion transitions in `ThemeToggle`, cert cards, and `AboutProfile`.

## Desired Outcome

When a user has `prefers-reduced-motion: reduce` set, the site presents its
content in a static (or near-instant) form while remaining fully legible and
functional. Two complementary layers deliver this:

### Layer 1 — Global CSS safety net (`css/tailwind.css`)

Add an `@media (prefers-reduced-motion: reduce)` block that acts as a
**blanket near-instant override**, taming every CSS animation and transition
regardless of whether it was individually audited:

- Force `animation-duration` and `transition-duration` to a negligible value
  (e.g. `0.01ms !important`).
- Force `animation-iteration-count: 1 !important` so looping keyframes (e.g.
  footer heartbeat) do not repeat.
- Set `scroll-behavior: auto !important` to disable smooth scrolling.

This automatically covers the footer heartbeat, `fadeInUp`, and any current
or future CSS/Motion transition without per-rule maintenance.

### Layer 2 — JS hook applied to the three interactive animations

Use **Motion's built-in `useReducedMotion` hook from `motion/react`** (Motion
is already a dependency — no new hook code). The preference is **read once at
mount**; the animations do not need to react to a live mid-session OS toggle.

Apply it as follows:

- **`LogoAnimation.tsx`** — when reduced motion is preferred, take the existing
  "snap to final state" path (reuse the `!shouldAnimate` branch logic) so the
  logo renders fully drawn with its resting glow and no droplet/pulse animation
  runs.
- **`Taglines.tsx`** — do **not** start the `setInterval`; render a single
  tagline statically with no clip-path wipe.
- **`FixedAnalogyParagraph.tsx`** — skip registering the ripple/cursor-follow
  listeners; keep the word highlights as static styling (no glow-on-hover
  motion).

### Testability by design

No test runner exists in the project today (no Jest/Vitest/Playwright/Testing
Library). This spec does **not** introduce one. Instead the implementation must
be **structured so the behaviour is testable in isolation** and verifiable by a
documented manual checklist:

- The reduced-motion decision in each component must be a clear, isolatable
  branch (a single guard driven by the hook's boolean) rather than logic tangled
  through the animation setup.
- Prefer expressing each component's two states (animated vs. reduced) so that
  the reduced path can later be asserted by a unit test when a runner is added.

## Acceptance Criteria

- [ ] `css/tailwind.css` contains an `@media (prefers-reduced-motion: reduce)`
      block that sets `animation-duration` and `transition-duration` to a
      negligible value, `animation-iteration-count: 1`, and
      `scroll-behavior: auto`, applied broadly (blanket override).
- [ ] With reduced motion enabled, the footer heartbeat does not visibly pulse
      and `fadeInUp` content appears without motion.
- [ ] `LogoAnimation.tsx` uses `useReducedMotion` from `motion/react`; when
      reduced motion is preferred it snaps to the final drawn logo with resting
      glow (reusing the existing snap-to-final-state logic) and runs no droplet
      trace or pulse animation.
- [ ] `Taglines.tsx` uses `useReducedMotion`; when reduced motion is preferred
      it does **not** start the 5000ms `setInterval`, shows exactly one tagline
      statically, and performs no clip-path wipe.
- [ ] `FixedAnalogyParagraph.tsx` uses `useReducedMotion`; when reduced motion
      is preferred it does not attach the cursor-follow / ripple listeners, and
      word highlights render as static styling with no hover-glow motion.
- [ ] With reduced motion **disabled**, all four animations behave exactly as
      they do today (no regression).
- [ ] The reduced-motion branch in each of the three JS components is a single
      clear guard driven by the hook boolean (testable-by-design).
- [ ] A manual verification checklist is followed and passes (see Notes).

## Edge Cases & Error Handling

- **SSR / first paint:** the hook must not throw during server rendering or
  hydration; the initial render should be safe (Motion's `useReducedMotion`
  handles this). No hydration mismatch warnings introduced.
- **LogoAnimation SPA-navigation branch vs. reduced-motion branch:** both should
  converge on the same final visible state; the reduced-motion condition must be
  combined with the existing `!shouldAnimate` check so either reason produces the
  static logo. Cleanup (`tl.kill()` / `killTweensOf`) must still be correct when
  the animated timeline is never created.
- **Taglines with reduced motion:** ensure no dangling interval is created and
  torn down; simply never schedule it. The single shown tagline should be
  deterministic (e.g. the first).
- **FixedAnalogyParagraph listener cleanup:** if listeners are never attached,
  the effect's cleanup must not attempt to remove listeners that were never
  added.
- **No `matchMedia` support (very old/edge environments):** treat as "no
  preference" and fall back to full animation gracefully.

## Dependencies & Constraints

- `motion` (`^12.x`) is already a dependency; use its `motion/react`
  `useReducedMotion` export. No new runtime dependencies.
- GSAP (`^3.13.0`) drives `LogoAnimation`; the reduced-motion path bypasses the
  timeline rather than reconfiguring GSAP globals.
- Next.js 15 / React 19, App Router; affected components are client components
  (`'use client'`).
- Preference is read once at mount (no live re-subscription requirement).
- CSS lives in `css/tailwind.css` (Tailwind v4).

## Out of Scope

- Setting up a test runner or writing automated tests (tracked separately;
  this spec only requires testability _by design_ + manual verification).
- Adding a user-facing in-app motion toggle/setting (OS preference only).
- Reworking or retiming the animations themselves for non-reduced-motion users.
- Auditing or changing animations beyond those listed here.

## Notes

**Escape hatch (documented, not used now):** WCAG permits motion that is
_essential_ to functionality to be exempt. All motion on the site is currently
decorative, so no exemption is applied. If an essential animation is added
later, it can opt out of the blanket CSS override via a dedicated class that the
`@media` rule excludes. No such class is introduced by this spec.

**Manual verification checklist (run with OS reduced-motion ON, then OFF):**

1. Enable reduced motion (macOS: System Settings → Accessibility → Display →
   Reduce motion; or Chrome DevTools → Rendering → "Emulate CSS
   prefers-reduced-motion: reduce").
2. Hard-refresh the home page — logo appears fully drawn with resting glow, no
   trace/pulse animation.
3. Observe Taglines — a single tagline is shown, no typewriter cycling, no wipe.
4. Move the cursor over the analogy paragraph — no ripple/cursor-follow; word
   highlights are static.
5. Footer heartbeat is static; `fadeInUp` sections appear without motion; theme
   toggle / cert cards / AboutProfile transitions are effectively instant.
6. Disable reduced motion and repeat — every animation behaves as before.
