# Redesign Home Logo Animation with New Limulus Logo

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| **Title**   | Redesign Home Logo Animation with New Limulus Logo   |
| **Type**    | feature                                              |
| **Scope**   | home hero logo animation, site header logo, favicons |
| **Created** | 2026-08-01 00:00:00                                  |
| **Status**  | IMPLEMENTED                                          |

## Problem Statement

The home page hero currently animates an older stylized "limulus" logo (a
droplet/eye shell shape) using GSAP, next to a Motion/Framer text animation.
A new logo design is now available. We want the home page to draw and animate
the **new** logo, following the same libraries and conventions already in
place, and we want the site header and favicons to use a reduced variant of
the new logo so the whole site is visually consistent.

## Current Behavior

- The animated home logo lives in
  `components/home/hero/LogoAnimation.tsx` and uses **GSAP** with the
  `DrawSVGPlugin` (stroke tracing) and `MotionPathPlugin` (moving glow
  "drops" along paths). The inline SVG depicts the old droplet/shell shape
  with three stroked paths (`#tail`, `#left-shell`, `#right-shell`), a
  `#glow` filter, a `#dropGradient`, and a `#pulseGlowGroup` for the final
  pulse. All strokes use the theme-aware `--color-accent-secondary` token.
- The animation is gated by `detectRefreshOrFirstLoad('logo_mount_ts')`:
  it plays the full timeline only on first load / real refresh, and
  otherwise snaps to a final static state with a soft resting glow.
- The current timeline is: draw the tail (with a drop tracing it) →
  draw both shells simultaneously (with drops) → final glow pulse
  (fade in to `PULSE_OPACITY_PEAK` then fade out), leaving a resting glow.
- The text next to it (`components/home/hero/TextAnimation.tsx`) uses
  **Motion / Framer** (`motion/react`) and is tuned to reach its final
  glow pulse in the same window as the logo; the two are coupled by
  matching glow durations (`GLOW_FADE_IN_DURATION` = 0.4s,
  `GLOW_FADE_OUT_DURATION` = 1.0s) rather than a shared timeline.
- The header shows a **static** logo via `components/common/LogoStatic.tsx`,
  which imports the _full_ logo geometry from `data/logo.svg` (via SVGR)
  and renders it alongside the "LIGHT / STIMULUS" text.
- Favicons are declared as manual `<link>` tags in `app/layout.tsx`, with
  raster and SVG assets under `public/static/favicons/`
  (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`,
  `apple-touch-icon.png`, `android-chrome-96x96.png`, `mstile-150x150.png`,
  `safari-pinned-tab.svg`), all derived from the old logo.

## Desired Outcome

The home hero animates the **new** logo
(`/Users/davide/Personal/Images/Limulus/new_logo/new_logo.svg`) using the
same GSAP conventions (DrawSVG for tracing, MotionPath for the traveling
dot, a `#glow` filter, and a final pulse group), timed to finish in the same
window as the existing text animation. The header and favicons use the
**reduced** variant
(`/Users/davide/Personal/Images/Limulus/new_logo/new_logo_header.svg`).

### New logo geometry (reference)

`new_logo.svg` (`viewBox 0 0 1024 1024`) contains:

- Two greenish (`#2E8B83`) body paths (`.st0`): a **lower** body path and
  an **upper** body path (each with two mirrored subpaths).
- Two orange (`#F07C23`) tail line segments (`.st1`): a lower segment
  (`y=552 → y=961`) and an upper segment (`y=246 → y=552`), forming the
  single vertical tail.
- Two orange circles (`.st2`): a **bigger** top circle
  (`cx=512, cy=246, r=56.7`) and a **smaller** middle circle
  (`cx=512, cy=545.89, r=22.75`).

`new_logo_header.svg` is a reduced variant: two greenish body strokes and a
single orange filled circle (`cx=512, cy=400, r=132`).

### Required SVG code adaptations (before it can be animated)

The provided `new_logo.svg` is a raw Illustrator export and, unlike the
current animated SVG inlined in `LogoAnimation.tsx`, it is **not yet
animation-ready**. To match the existing conventions it must be adapted:

- **Add `id` attributes** to each animatable element so GSAP can target
  them (the current SVG uses `#tail`, `#left-shell`, `#right-shell`, etc.).
  The new SVG has no ids. Ids are needed for at least: the two tail line
  segments, the two greenish body paths (lower/upper), and the two circles
  (middle/top).
- **Inline the `#glow` filter** (and the `#dropGradient`) directly inside
  the SVG `<defs>`, as the current animated SVG does. The new export has no
  filter/defs at all.
- **Replace hardcoded colors with the dynamic theme tokens where a token
  exists**: the current SVG uses `var(--color-accent-secondary)` /
  `var(--color-accent-secondary-lightest)` instead of literal hex. The new
  SVG hardcodes `#F07C23` (orange → should become the accent token) and
  `#2E8B83` (green → should map to the new green glow color/token).
- **Convert the Illustrator `<style>` class approach** (`.st0/.st1/.st2`)
  to inline presentation attributes (`fill`, `stroke`, `stroke-width`,
  `stroke-linecap`, etc.), consistent with the current inline SVG, and set
  initial `opacity` values appropriate for the animation (paths/bodies
  start hidden and are revealed by the timeline).
- Add the empty `#pulseGlowGroup` (`<g filter="url(#glow)" opacity="0" />`)
  used for the final pulse, as in the current SVG.

### Desired animation sequence (home hero)

1. A **small dot** appears at the **bottom** of the tail (bottom end of the
   lower orange line segment) and traces upward along the line.
2. When the dot reaches the **middle circle** (the smaller one,
   `cy=545.89`), it **enlarges** to match that circle's size; at the moment
   it reaches full size, the **lower body** (greenish) fades in.
3. Tracing **restarts** with a fresh small dot from the middle circle,
   moving up the upper line segment toward the **top circle**.
4. When the dot reaches the **top circle** (the bigger one, `cy=246`), it
   **enlarges** to match that circle's size; at the moment it reaches full
   size, the **upper body** (greenish) fades in.
5. A final **pulse glow** appears (fade in then fade out), as in the current
   animation, leaving a soft resting glow.

### Glow behavior

- Throughout the animation, the whole drawn path carries a **constant,
  subtle glow** (lighter than the final pulse), as in the current logo.
- Both the constant glow and the final pulse are **colored per element**:
  orange for the tail line and dots, greenish for the body parts.
- The orange glow uses the existing theme-aware `--color-accent-secondary`
  token; a matching **green** glow color is introduced for the body parts.

### Timing / coupling

- The total duration of the logo animation must equal the total duration of
  the text animation (`TextAnimation.tsx`), preserving the existing
  convention of matching the closing glow durations
  (`GLOW_FADE_IN_DURATION` / `GLOW_FADE_OUT_DURATION`) and both components
  reaching the glow finale in the same window.

### Header + favicon swap

- The header static logo (`components/common/LogoStatic.tsx`) uses the
  **reduced** `new_logo_header.svg` (not the full animated geometry as
  today). The source SVG that SVGR imports (`data/logo.svg`, or the import
  path) is replaced with the reduced new-logo geometry.
- The favicon assets under `public/static/favicons/` are regenerated from
  `new_logo_header.svg`: all raster files (`favicon.ico`,
  `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`,
  `android-chrome-96x96.png`, `mstile-150x150.png`) and the SVG
  (`safari-pinned-tab.svg` / mask-icon).

## Acceptance Criteria

- [ ] On first load / real refresh of the home page, the hero logo animates
      the new logo geometry using GSAP (DrawSVG + MotionPath), not the old
      shape.
- [ ] The new logo SVG is adapted for animation: ids added to animatable
      elements, `#glow` filter and `#dropGradient` inlined, hardcoded colors
      replaced with dynamic theme tokens where available, Illustrator
      `<style>` classes converted to inline attributes, and a
      `#pulseGlowGroup` added.
- [ ] The animation starts with a small dot at the bottom of the tail that
      traces up the lower line segment to the middle (smaller) circle.
- [ ] On reaching the middle circle, the dot enlarges to that circle's size,
      and the lower greenish body fades in exactly when the dot reaches full
      size.
- [ ] Tracing restarts with a fresh small dot from the middle circle up to
      the top (bigger) circle.
- [ ] On reaching the top circle, the dot enlarges to that circle's size,
      and the upper greenish body fades in exactly when the dot reaches full
      size.
- [ ] A final pulse glow (fade in then fade out) plays after the upper body
      appears, leaving a soft resting glow, matching the current behavior.
- [ ] The entire drawn path shows a constant subtle glow (lighter than the
      final pulse) during the animation.
- [ ] The constant glow and the final pulse are orange for the tail/dots and
      greenish for the body parts; orange uses `--color-accent-secondary`
      and a matching green color is used for the body.
- [ ] The total logo animation duration matches the total text animation
      duration, keeping the matching closing-glow durations convention.
- [ ] On internal SPA navigation (not first load/refresh), the home logo
      snaps to the new logo's final static state with the resting glow (no
      full replay), consistent with the current gating via
      `detectRefreshOrFirstLoad`.
- [ ] The site header logo (`LogoStatic`) renders the reduced
      `new_logo_header.svg` instead of the full logo.
- [ ] All favicon assets (raster `.ico`/`.png` files and the SVG mask-icon)
      are regenerated from `new_logo_header.svg` and referenced correctly in
      `app/layout.tsx`, so browser tabs, PWA manifest, Apple touch icon, and
      Windows tiles all show the new logo.

## Edge Cases & Error Handling

- **Internal navigation vs. first load**: the gating helper must continue to
  distinguish real refresh/first-load from SPA remounts so the animation
  only plays when intended.
- **Theme switching (light/dark)**: orange and green glow colors must remain
  visible and consistent in both themes; orange continues to use the
  theme-aware token, and the green color must be defined for both themes.
- **Reduced-motion / performance**: preserve any existing cleanup
  (`tl.kill()`, `gsap.killTweensOf`) so timelines do not leak on unmount.
- **Two-subpath body paths**: each greenish body is defined as a single path
  with two mirrored subpaths; the fade-in should reveal the whole body part
  as one unit.

## Dependencies & Constraints

- Continue using the existing libraries and conventions: **GSAP** (with
  `DrawSVGPlugin` and `MotionPathPlugin`) for the logo, **Motion/Framer**
  (`motion/react`) for the text, and **SVGR** for importing SVGs as React
  components (configured in `next.config.js`).
- Keep the `detectRefreshOrFirstLoad` gating for the animation.
- Source SVGs:
  - Full animated logo:
    `/Users/davide/Personal/Images/Limulus/new_logo/new_logo.svg`
  - Reduced header/favicon logo:
    `/Users/davide/Personal/Images/Limulus/new_logo/new_logo_header.svg`
- Favicon links are hand-written in `app/layout.tsx` (not the Next Metadata
  icons API); asset paths are prefixed with `basePath`.
- `theme-color` / manifest colors and `safari-pinned-tab.svg` `color` may
  need review to match the new logo palette.

## Out of Scope

- Changing the text animation itself (`TextAnimation.tsx`) beyond whatever
  timing coordination is needed to keep total durations matched.
- Redesigning the hero layout or other pages/components.
- Changing the accent color tokens' meaning elsewhere in the app (only a new
  green glow color is introduced as needed).

## Notes

- Middle circle is the **smaller** dot (r=22.75); top circle is the
  **bigger** dot (r=56.7). The animation reaches the smaller (middle) circle
  first, then the bigger (top) circle — confirmed with the user.
- Body reveal is a **fade-in** (opacity 0→1) at the moment the traveling dot
  reaches full size at its circle — confirmed with the user.
- Current logo timing reference: `TAIL_DRAW_DURATION=1`,
  `SHELL_DRAW_DURATION=1.2`, `PULSE_FADE_IN_DURATION=0.4`,
  `PULSE_FADE_OUT_DURATION=1.0`; text uses matching
  `GLOW_FADE_IN_DURATION=0.4`, `GLOW_FADE_OUT_DURATION=1.0`.
- The current animated SVG (inlined in `LogoAnimation.tsx`) differs from a
  raw Illustrator export: it has element ids, an inlined `#glow` filter and
  `#dropGradient`, uses `var(--color-accent-secondary)` tokens instead of
  literal hex, inline presentation attributes instead of `<style>` classes,
  and a `#pulseGlowGroup`. The new SVGs must receive the same adaptations —
  see "Required SVG code adaptations" above.
