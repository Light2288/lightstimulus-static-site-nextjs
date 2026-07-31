# Plan: Redesign Home Logo Animation with New Limulus Logo

| Field       | Value                                              |
| ----------- | -------------------------------------------------- |
| **Title**   | Redesign Home Logo Animation with New Limulus Logo |
| **Spec**    | specs/redesign-home-logo-animation.md              |
| **Type**    | feature                                            |
| **Branch**  | feat/redesign-home-logo-animation                  |
| **Created** | 2026-08-01 00:00:00                                |
| **Status**  | IMPLEMENTED                                        |

## Context

The home hero currently draws an old droplet/shell "limulus" logo with GSAP
(DrawSVG + MotionPath) next to a Motion/Framer text animation. We are
replacing it with a new logo (`new_logo.svg`) and a new drawing sequence
(dot traces the tail up to the smaller middle circle, enlarges + reveals the
lower body, restarts up to the bigger top circle, enlarges + reveals the
upper body, then a final glow pulse), with per-element orange/green glow and
a total duration matched to the text animation. The header logo and all
favicons are swapped to the reduced `new_logo_header.svg`.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/redesign-home-logo-animation`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/redesign-home-logo-animation
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping:

- feature → `feat/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

| Action | Command                                                  |
| ------ | -------------------------------------------------------- |
| Lint   | `yarn lint`                                              |
| Build  | `yarn build`                                             |
| Dev    | `yarn dev` (manual visual verification of the animation) |

This project has **no automated test suite** (no test runner in
`package.json`). Verification is by lint, a successful production build, and
manual visual inspection in the browser (first load, refresh, internal
navigation, light + dark themes).

## Tasks

### Task 1: Add theme-aware green accent tokens `[S]`

**Goal**: Introduce theme-aware `--color-accent-primary` /
`--color-accent-primary-lightest` aliases so the green body glow can use a
dynamic token, mirroring the existing `--color-accent-secondary` pattern.

**Files**:

| File               | Action | Description                                                                                                                                                                                   |
| ------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `css/tailwind.css` | modify | Add `--color-accent-primary` and `--color-accent-primary-lightest` aliases in `:root` and `.dark`, plus a `--color-accent-primary-*-brighter` in `@theme` if needed for the lightest variant. |

**Reuse**:

| File               | What to reuse                                                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `css/tailwind.css` | The `--color-accent-secondary` / `--color-accent-secondary-lightest` alias pattern in `:root` (lines 115-116) and `.dark` (lines 124-125); existing `--color-accent-primary-light` (`#2e8b83`) and `--color-accent-primary-dark` (`#3fc3b9`). |

**Steps**:

1. In `@theme`, add `--color-accent-primary-light-brighter` and
   `--color-accent-primary-dark-brighter` (a slightly brighter teal/green)
   next to the existing primary color definitions, mirroring the
   `-secondary-*-brighter` tokens.
2. In `:root`, add
   `--color-accent-primary: var(--color-accent-primary-light);` and
   `--color-accent-primary-lightest: var(--color-accent-primary-light-brighter);`.
3. In `.dark`, add the dark equivalents pointing at the `-dark` variants.
4. Confirm this does not alter existing `text-accent-primary` /
   `bg-accent-primary` utilities (they reference the `-light`/`-dark`
   tokens directly, not the new aliases).

**Tests**:

- Manual: temporarily apply `color: var(--color-accent-primary)` in dev and
  confirm it renders teal/green in light mode and brighter teal in dark
  mode. No automated tests.

**Acceptance criteria covered**: "a matching green color is used for the
body" (glow color); theme-switching edge case for green.

**Commit**: `feat(theme): add theme-aware green accent color tokens`

---

### Task 2: Add the animation-ready home logo SVG source `[M]`

**Goal**: Create the new animated home-logo SVG source, adapted from
`new_logo.svg` per the spec's "Required SVG code adaptations", ready for
GSAP to target.

**Files**:

| File                                           | Action | Description                                                                                                                                                            |
| ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/logo-animated.svg` (or inline in Task 3) | create | New logo geometry adapted for animation: ids, inlined `#glow` filter + `#dropGradient`, dynamic color tokens, inline presentation attributes, empty `#pulseGlowGroup`. |

> Note: the current animated SVG is **inlined** directly in
> `LogoAnimation.tsx` (not imported). To match that convention, the adapted
> markup may instead live inline in Task 3's JSX. This task defines the
> exact adapted markup; if inlined, merge this task's output into Task 3 and
> use its commit there. Keeping a standalone reference file is optional.

**Reuse**:

| File                                                          | What to reuse                                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `components/home/hero/LogoAnimation.tsx` (lines 217-281)      | The exact `<defs>` block: `#glow` filter and `#dropGradient` gradient, plus the `#pulseGlowGroup` group. |
| `/Users/davide/Personal/Images/Limulus/new_logo/new_logo.svg` | Source geometry: body paths (`.st0`), tail line segments (`.st1`), circles (`.st2`).                     |

**Steps**:

1. Copy the `<defs>` (glow filter + dropGradient) from the current
   `LogoAnimation.tsx`.
2. Convert the two `.st1` tail lines into two `<line>`/`<path>` elements
   with ids `tail-lower` (`y=552→961`) and `tail-upper` (`y=246→552`),
   `stroke="var(--color-accent-secondary)"`, `stroke-linecap="round"`,
   matching stroke width, `opacity="0"` initial.
3. Convert the two `.st0` body paths into two `<path>` elements with ids
   `body-lower` and `body-upper`, `stroke="var(--color-accent-primary)"`,
   `opacity="0"` initial (revealed by fade-in). Preserve their two mirrored
   subpaths so each reveals as one unit.
4. Convert the two `.st2` circles into `<circle>` elements with ids
   `circle-middle` (`cy=545.89 r=22.75`) and `circle-top`
   (`cy=246 r=56.7`), filled with `url(#dropGradient)` (or the accent
   token), `opacity="0"` initial.
5. Add the empty `<g id="pulseGlowGroup" filter="url(#glow)" opacity="0" />`.
6. Replace hardcoded `#F07C23` → `var(--color-accent-secondary)` and
   `#2E8B83` → `var(--color-accent-primary)`; drop the Illustrator
   `<style>` block in favor of inline attributes.

**Tests**:

- Manual: render the static SVG (no animation) and confirm all elements
  appear correctly positioned and colored in both themes.

**Acceptance criteria covered**: "The new logo SVG is adapted for
animation..." (ids, inlined filter/gradient, dynamic tokens, inline
attributes, pulseGlowGroup).

**Commit**: `feat(home): add animation-ready new limulus logo svg`

---

### Task 3: Rewrite the home logo animation timeline `[L]`

**Goal**: Replace the GSAP timeline and inline SVG in `LogoAnimation.tsx`
with the new logo and the new drawing sequence (traced tail → enlarging dot
→ body fade-in, twice → final pulse), keeping the `detectRefreshOrFirstLoad`
gating, per-element glow, and total duration matched to the text.

**Files**:

| File                                     | Action | Description                                                                                                                                                  |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `components/home/hero/LogoAnimation.tsx` | modify | Swap inline SVG to the Task 2 markup; rewrite the timeline for the two-segment tail + two circles + two body reveals + final pulse; update timing constants. |

**Reuse**:

| File                                     | What to reuse                                                                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `components/home/hero/LogoAnimation.tsx` | GSAP setup + plugin registration (lines 4-8), `createDrop()` helper (lines 66-74), MotionPath tracing pattern (lines 108-126), final-pulse clone-into-`#pulseGlowGroup` pattern (lines 178-196), CASE 1 non-animate branch (lines 41-59), cleanup (lines 202-205). |
| `utils/detectRefreshOrFirstLoad.ts`      | `detectRefreshOrFirstLoad('logo_mount_ts')` gating (unchanged).                                                                                                                                                                                                    |
| `components/home/hero/TextAnimation.tsx` | Timing constants to match total duration (see Task 4).                                                                                                                                                                                                             |

**Steps**:

1. Update element queries to the new ids: `tail-lower`, `tail-upper`,
   `body-lower`, `body-upper`, `circle-middle`, `circle-top`,
   `pulseGlowGroup`.
2. **CASE 1 (no animation / internal nav)**: set both tail segments to
   `drawSVG: '0% 100%'`, opacity 1, `filter: url(#glow)`; set both bodies
   and both circles to opacity 1 with glow; set `pulseGlowGroup` to
   `FINAL_GLOW_OPACITY`. Hide any transient drop ellipses.
3. **CASE 2 (first load / refresh) timeline** (`ease: 'none'` default):
   - a. Create one small drop ellipse (reuse `createDrop`, small `rx/ry`)
     positioned at the **bottom** of `tail-lower` (MotionPath `start:0`).
   - b. Draw `tail-lower` (DrawSVG `0%→100%`) while the drop traces it
     (MotionPath `start:0 end:1`, `autoRotate`) over `TAIL_LOWER_DURATION`.
   - c. On reaching `circle-middle`: tween the drop's `rx/ry` (or scale) up
     to the middle circle's radius over `DOT_ENLARGE_DURATION`; at the
     tween's completion, fade `circle-middle` opacity to 1 and fade
     `body-lower` opacity `0→1` over `BODY_FADE_DURATION` (fires exactly
     when the dot reaches full size). Hide/retire the drop.
   - d. Create a fresh small drop at `circle-middle` position and draw
     `tail-upper` while tracing it over `TAIL_UPPER_DURATION`.
   - e. On reaching `circle-top`: enlarge the drop to the top circle's
     radius, then reveal `circle-top` and fade `body-upper` in, same as
     step c.
   - f. Final pulse: clone `tail-lower`, `tail-upper`, `body-lower`,
     `body-upper`, `circle-*` into `#pulseGlowGroup`; `fromTo` opacity
     `0 → PULSE_OPACITY_PEAK` over `PULSE_FADE_IN_DURATION`, then
     `→ 0`/resting over `PULSE_FADE_OUT_DURATION` (reuse existing pattern).
   - g. `sessionStorage.setItem('logoAnimated', 'true')`.
4. Apply the `#glow` filter to all drawn elements so the **constant subtle
   glow** is present throughout (as today, elements carry `filter:
url(#glow)`); the orange elements glow orange (secondary token) and green
   bodies glow green (primary token) because the filter merges the source
   graphic color.
5. Define/adjust timing constants at top of file so the timeline's total
   duration equals the text animation's total (see Task 4 for the target
   sum). Keep `PULSE_FADE_IN_DURATION = 0.4` and
   `PULSE_FADE_OUT_DURATION = 1.0` to match the text glow convention.
6. Preserve cleanup: `tl.kill()` + `gsap.killTweensOf('*')` on unmount.

**Tests**:

- Manual, on the home page:
  - First visit + hard refresh → full sequence plays as described.
  - Internal SPA nav to `/` → snaps to final static state, no replay.
  - Light and dark themes → orange tail/dots, green bodies, glows visible.
  - No console errors; timeline cleans up on route change (no leak).

**Acceptance criteria covered**: animates new geometry with GSAP; dot starts
at bottom and traces to middle circle; enlarge + lower body fade-in at
middle; restart to top circle; enlarge + upper body fade-in at top; final
pulse + resting glow; constant subtle glow; per-element orange/green glow;
internal-nav static state.

**Why `[L]` and not split**: The SVG markup, timeline sequence, per-element
glow, and CASE 1/CASE 2 branches are tightly coupled inside a single
`useEffect` and one inline SVG; the drop-tracing, enlarging, and body
fade-in for each of the two stages share state (drop element, MotionPath
targets, timeline labels) and cannot be committed independently without
leaving the animation in a broken intermediate state. Task 2 already carves
out the SVG-markup concern; the remaining timeline logic is one atomic unit.
The implementer may still build it incrementally (stage 1 before stage 2)
within this single commit.

**Commit**: `feat(home): animate new limulus logo with staged draw sequence`

---

### Task 4: Match logo total duration to the text animation `[S]`

**Goal**: Ensure the logo timeline's total duration equals the text
animation's total duration, keeping the shared closing-glow convention.

**Files**:

| File                                     | Action | Description                                                                     |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `components/home/hero/LogoAnimation.tsx` | modify | Final tuning of timing constants so total logo duration == total text duration. |

**Reuse**:

| File                                                  | What to reuse                                                                                                                                                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/home/hero/TextAnimation.tsx` (lines 8-15) | Text timing constants: `FADE_IN_DURATION 0.5` + `SPLIT_DURATION 0.5` + `EXPANSION_DURATION 0.5` + `COLOR_CHANGE_DURATION 0.6` overlaps + `GLOW_FADE_IN_DURATION 0.4` + `GLOW_FADE_OUT_DURATION 1.0`. |

**Steps**:

1. Compute the text animation's total wall-clock duration from its
   `async/await` chain (sequential fade-in → split → expansion → color →
   glow-in → glow-out; note step 4 color change is not awaited before the
   glow, so account for actual awaited path).
2. Set the logo's pre-pulse durations (`TAIL_LOWER_DURATION`,
   `DOT_ENLARGE_DURATION`, `BODY_FADE_DURATION`, `TAIL_UPPER_DURATION`, and
   the second enlarge/fade) so that
   `pre-pulse total + PULSE_FADE_IN + PULSE_FADE_OUT` equals the text total.
3. Keep `PULSE_FADE_IN_DURATION = 0.4` and `PULSE_FADE_OUT_DURATION = 1.0`
   identical to the text's `GLOW_FADE_IN/OUT_DURATION` so both reach and end
   the glow finale together.
4. Add a short comment documenting the duration budget, mirroring the
   "Final GLOW pulse (matches logo)" cross-reference comment style.

**Tests**:

- Manual: on first load, confirm the logo's final pulse and the text's final
  glow start and end at the same time (visually simultaneous finish).

**Acceptance criteria covered**: "The total logo animation duration matches
the total text animation duration, keeping the matching closing-glow
durations convention."

**Commit**: `feat(home): sync logo animation duration with text animation`

---

### Task 5: Swap the header static logo to the reduced new logo `[M]`

**Goal**: Replace the header's static logo geometry with the reduced
`new_logo_header.svg` so `LogoStatic` renders the new mark.

**Files**:

| File                               | Action                    | Description                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/logo.svg`                    | modify (replace contents) | Replace old geometry with the reduced `new_logo_header.svg` markup, adapted to use dynamic color tokens (`var(--color-accent-secondary)` for the orange circle, `var(--color-accent-primary)` for the green body strokes) instead of hardcoded hex; keep the inlined `#glow`/defs consistent with current file. |
| `components/common/LogoStatic.tsx` | modify (if needed)        | Verify sizing (`h-12 w-12 md:h-16 md:w-16`) still frames the new geometry; adjust only if the new viewBox aspect requires it.                                                                                                                                                                                   |

**Reuse**:

| File                                                                 | What to reuse                                                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/Users/davide/Personal/Images/Limulus/new_logo/new_logo_header.svg` | Source geometry (two green body strokes + one orange circle, `viewBox 0 0 1024 1024`).                |
| `data/logo.svg` (current)                                            | The SVGR-friendly structure, inlined `#glow` filter, and `var(--color-accent-secondary)` token usage. |
| `components/common/LogoStatic.tsx`                                   | Existing import (`@/data/logo.svg`) and layout — no import path change needed.                        |

**Steps**:

1. Replace the body of `data/logo.svg` with the reduced header geometry.
2. Convert the Illustrator `<style>` classes to inline presentation
   attributes; map `#2E8B83` → `var(--color-accent-primary)` and `#F07C23`
   → `var(--color-accent-secondary)`.
3. Keep/port the inlined `#glow` filter and `<defs>` so the static header
   logo retains its soft glow consistent with today.
4. Confirm `LogoStatic.tsx` still imports `@/data/logo.svg` via SVGR and
   renders at the intended size; adjust wrapper sizing only if clipped.

**Tests**:

- Manual: header on any page shows the new reduced logo, correctly colored
  in light and dark themes, next to the "LIGHT / STIMULUS" text; internal
  navigation unaffected.

**Acceptance criteria covered**: "The site header logo (`LogoStatic`)
renders the reduced `new_logo_header.svg` instead of the full logo."

**Commit**: `feat(header): replace static logo with reduced new limulus logo`

---

### Task 6: Add a favicon generation script `[M]`

**Goal**: Add a reproducible Node script (using the installed `sharp` plus a
small ICO helper) that rasterizes `new_logo_header.svg` into every favicon
asset size.

**Files**:

| File                            | Action | Description                                                                                                                                                                                                                                                               |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/generate-favicons.mjs` | create | Sharp-based script: read a source SVG, output `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180), `android-chrome-96x96.png`, `mstile-150x150.png` into `public/static/favicons/`, and build `favicon.ico` from the 16/32(/48) PNGs via `png-to-ico`. |
| `package.json`                  | modify | Add `png-to-ico` devDependency and a `"generate-favicons"` script entry.                                                                                                                                                                                                  |

**Reuse**:

| File                          | What to reuse                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `scripts/compress-images.mjs` | ES-module + `sharp` usage pattern, `__dirname`/`PROJECT_ROOT` resolution, `sharp(input).resize(...).png().toFile(...)` idiom. |

**Steps**:

1. Add `png-to-ico` to `devDependencies` and a
   `"generate-favicons": "node scripts/generate-favicons.mjs"` script.
2. Write `scripts/generate-favicons.mjs`: resolve the source SVG path
   (accept it as an arg, default to a copy placed under the repo, e.g.
   `public/static/favicons/source/new_logo_header.svg`), then for each
   target size use `sharp(svgBuffer, { density: ... }).resize(size).png()`
   to write the PNGs.
3. Generate `favicon.ico` from the 16/32/48 PNG buffers with `png-to-ico`.
4. Log outputs, matching the console-report style of `compress-images.mjs`.

> Note: `sharp` cannot write `.ico` directly, hence `png-to-ico`. Keep the
> script idempotent (overwrites existing assets).

**Tests**:

- Manual: run `yarn generate-favicons` and confirm all target files are
  written without error.

**Acceptance criteria covered**: enables regeneration of "All favicon assets
(raster `.ico`/`.png` files)".

**Commit**: `chore(favicons): add sharp-based favicon generation script`

---

### Task 7: Regenerate favicon assets and update mask-icon + colors `[M]`

**Goal**: Produce the actual favicon assets from `new_logo_header.svg`,
replace `safari-pinned-tab.svg`, and update the brand colors referenced in
`layout.tsx` / manifest / browserconfig to match the new logo.

**Files**:

| File                                                | Action | Description                                                                        |
| --------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `public/static/favicons/source/new_logo_header.svg` | create | Copy of the source SVG for reproducible regeneration.                              |
| `public/static/favicons/favicon.ico`                | modify | Regenerated from new logo.                                                         |
| `public/static/favicons/favicon-16x16.png`          | modify | Regenerated.                                                                       |
| `public/static/favicons/favicon-32x32.png`          | modify | Regenerated.                                                                       |
| `public/static/favicons/apple-touch-icon.png`       | modify | Regenerated (180x180).                                                             |
| `public/static/favicons/android-chrome-96x96.png`   | modify | Regenerated (96x96).                                                               |
| `public/static/favicons/mstile-150x150.png`         | modify | Regenerated (150x150).                                                             |
| `public/static/favicons/safari-pinned-tab.svg`      | modify | Monochrome silhouette of the new logo.                                             |
| `app/layout.tsx`                                    | modify | Update `mask-icon` `color` and `theme-color` to the new brand color if it changed. |

**Reuse**:

| File                            | What to reuse                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/generate-favicons.mjs` | Task 6 script — run it to produce the raster assets.                                                                                                |
| `app/layout.tsx` (lines 66-104) | Existing `<link>`/`<meta>` structure and `basePath` prefixing (references stay the same filenames, so no link changes needed unless colors change). |

**Steps**:

1. Copy `new_logo_header.svg` into
   `public/static/favicons/source/new_logo_header.svg`.
2. Run `yarn generate-favicons` (Task 6) to produce all PNGs + `favicon.ico`.
3. Create a monochrome `safari-pinned-tab.svg` from the new logo silhouette
   (single-path, `fill` set as required by Safari mask-icon).
4. Update `app/layout.tsx`: set the `mask-icon` `color` and the
   `theme-color` meta to the new logo's brand color (currently `#ffb347`);
   keep them if unchanged. Optionally align `browserconfig.xml` `TileColor`
   / `site.webmanifest` `theme_color` (currently `#0d1b2a`) — leave as-is
   unless the user wants them changed (colors are dark-bg tiles, not logo
   color).
5. Verify favicon filenames referenced in `layout.tsx` still match.

**Tests**:

- Manual: reload the site; browser tab shows the new favicon; check
  Apple touch icon, Android/PWA icon (manifest), and Windows tile reference
  the new logo. Confirm `yarn build` succeeds.

**Acceptance criteria covered**: "All favicon assets (raster `.ico`/`.png`
files and the SVG mask-icon) are regenerated from `new_logo_header.svg` and
referenced correctly in `app/layout.tsx`..."

**Commit**: `feat(favicons): regenerate favicons from new limulus logo`

---

**Task ordering**:

- Task 1 (green token) must land before Tasks 2, 3, 5 (they consume it).
- Task 2 defines the animated SVG markup consumed by Task 3 (may be merged
  into Task 3 if inlining — see Task 2 note).
- Task 3 depends on Task 2; Task 4 tunes Task 3.
- Task 5 (header) is independent of the home-animation tasks (only shares
  Task 1's token).
- Task 6 (script) must precede Task 7 (which runs the script).
- Suggested order: 1 → 2 → 3 → 4 → 5 → 6 → 7.

## Edge Cases & Error Handling

- **Internal navigation vs. first load**: keep `detectRefreshOrFirstLoad`;
  CASE 1 snaps to the new logo's final state (Task 3).
- **Theme switching (light/dark)**: orange uses `--color-accent-secondary`,
  green uses the new `--color-accent-primary` alias — both theme-aware
  (Tasks 1, 3, 5).
- **Timeline leaks**: preserve `tl.kill()` + `gsap.killTweensOf('*')` on
  unmount (Task 3).
- **Two-subpath body paths**: reveal each body path as one unit via a single
  opacity fade on the whole `<path>` (Tasks 2, 3).
- **`.ico` generation**: sharp cannot emit ICO — use `png-to-ico`
  (Task 6).
- **basePath**: favicon `<link>` hrefs keep the same filenames, so no
  reference changes needed unless colors change (Task 7).

## Verification

1. `yarn lint` passes.
2. `yarn build` completes without errors.
3. `yarn dev` and manually verify on the home page:
   - First load / hard refresh: dot starts at the bottom of the tail →
     traces to the middle (smaller) circle → enlarges + lower green body
     fades in → restarts → traces to the top (bigger) circle → enlarges +
     upper green body fades in → final glow pulse; constant subtle glow
     throughout; orange tail/dots, green bodies.
   - Logo's final pulse and text's final glow finish simultaneously.
   - Internal SPA navigation to `/`: logo shows final static state, no
     replay.
   - Light and dark themes both render correct colors and glows.
4. Header shows the reduced new logo on all pages, both themes.
5. Browser tab, Apple touch icon, PWA/Android icon, Windows tile, and Safari
   pinned tab all show the new logo.
