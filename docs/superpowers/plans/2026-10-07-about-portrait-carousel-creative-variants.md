# About Portrait Carousel and Creative Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About page's single avatar with a manually controlled five-photo carousel whose portraits each cycle through one original and three localized creative variants.

**Architecture:** Add a normalized portrait-content contract at the existing Contentlayer/client boundary, then render it through a focused `PortraitCarousel` owned by the About domain while leaving `AboutProfile` responsible for identity-card composition. Prepare the 20 static PNG assets through a safely scoped extension of the existing image-compression script so the current `Image` component can serve its expected 144w/200w PNG and WebP derivatives.

**Tech Stack:** Next.js 15 App Router and static export, React 19, TypeScript, Contentlayer2, Tailwind CSS 4, Motion, Vitest, Testing Library, Sharp, and the existing localization context.

**Spec:** `docs/superpowers/specs/2026-10-06-about-portrait-carousel-creative-variants-design.md`

**Slug:** `about-portrait-carousel-creative-variants`

**Provenance:** `docs/superpowers/specs/2026-10-06-about-portrait-carousel-creative-variants-design.md`; `docs/architecture/map.md`; `package.json`; `scripts/compress-images.mjs`; `components/Image.tsx`; `components/about/AboutProfile.tsx`; `app/about/page.tsx`; `contentlayer.config.ts`

**Execution tier:** full

**Implementation model role:** full

## Global Constraints

- Preserve the static-export architecture; add no API route, backend, runtime image generation, or carousel dependency.
- Use exactly five configured photo groups with four ordered states each; photo navigation is manual and changing photos resets the state to Original.
- Copy only the 20 approved PNGs from `/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures`; do not copy JPEG generation sources or the external backup directory.
- Normalize `family_sunset.PNG` to the repository name `family_sunset.png` and keep every repository asset name lowercase.
- Run only the scoped compression command `npm run compress-images -- about/portraits`; an unscoped run is prohibited for this feature.
- Preserve `/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures/originals-backup-2026-10-06` and never stage `public/static/images/original-backups/`.
- Use the existing `Image`, `LanguageContext`, Motion, styling, and test-helper conventions.
- Keep the existing identity, social links, highlights, About-page ordering, and page rhythm unchanged.

## Review Focus

- **Compression target escape or scope regression:** `../`, absolute, and unrelated paths must be rejected or excluded; Task 1 tests root resolution and Task 3 verifies no unrelated image diff.
- **Malformed or partial Contentlayer JSON:** bad portrait entries must not break the card, while valid partial variants retain a dynamic denominator; Task 2 tests both cases.
- **Ambiguous pointer movement:** a 32px horizontal-dominant gesture changes exactly one photo, while shorter or vertical-dominant releases cycle exactly one variant; Task 5 pins the boundary.
- **Repeated image failure:** a failed creative state falls back once to its original, then a failed original falls back once to the legacy avatar without a loop; Task 5 exercises the sequence.
- **Language change during a creative state:** labels and announcements switch language without resetting photo or state; Task 5 tests the live transition.

## Repository Evidence

- `docs/architecture/map.md` records HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`; planning HEAD is `1a9c03c0e218fad0d4d84e3376fbe816082b0928`, seven commits newer. A key-path diff found changes only in two `data/blog/*.mdx` files, so the map is stale by SHA but its static-export, Contentlayer, client-component, and test-topology descriptions remain applicable to this feature.
- No ADR or `decisions/` artifact exists in the repository; there is no accepted architectural decision beyond the approved feature spec.
- Commands are taken from `package.json`: `npm run test` (line 13), `npm run build` (line 8), `npm run lint` (line 11), `npm run dev` (line 7), and `npm run compress-images` (line 17).
- `scripts/compress-images.mjs:24-25` already excludes `original-backups` and `responsive`; lines 27-59 derive backup/responsive paths, and lines 96-151 generate PNG/WebP derivatives.
- `components/Image.tsx` selects 144w and 200w derivatives for images displayed below 200px, matching the approved 160/176px portrait sizes.
- Assumption: the verified external 20-PNG source set remains available at execution time. No product behavior or asset choice remains unresolved.

## File Structure

### New files

- `components/about/portraitData.ts` — portrait types and defensive normalization for Contentlayer JSON.
- `components/about/portraitData.test.ts` — malformed, partial, and valid portrait-contract tests.
- `components/about/PortraitCarousel.tsx` — all portrait state, controls, gestures, announcements, transitions, and load fallback behavior.
- `components/about/PortraitCarousel.test.tsx` — focused interaction, localization, accessibility, motion, gesture, and fallback tests.
- `scripts/compressImagesTarget.test.ts` — safe default/scoped/escaping path-resolution tests for the `.mjs` script.
- `data/authors/portraitAssets.test.ts` — frontmatter and 20-asset/derivative contract test.
- `public/static/images/about/portraits/*.png` — 20 compressed primary display assets.
- `public/static/images/about/portraits/responsive/*` — generated PNG and WebP derivatives.

### Modified files

- `scripts/compress-images.mjs` — accept a safe optional image-subtree argument while preserving its default whole-tree behavior.
- `contentlayer.config.ts` — declare the `portraits` author field.
- `data/authors/default.mdx` — configure the five localized portrait groups and their 20 paths.
- `locales/en.json`, `locales/it.json` — localized carousel controls, Original label, announcements, and fallback copy.
- `components/about/AboutProfile.tsx` — normalize portrait data and compose the carousel with the legacy-avatar fallback.
- `components/about/AboutProfile.test.tsx` — preserve characterization coverage and add carousel/fallback integration.
- `app/about/page.tsx` — pass compiled portrait content into `AboutProfile`.
- `app/about/page.test.tsx` — prove page-level data flow without changing band composition.

## Criterion Traceability

| Acceptance criterion | Owning task(s) | Primary evidence                                                                     |
| -------------------- | -------------- | ------------------------------------------------------------------------------------ |
| AC-01                | 2, 3           | normalization and asset/frontmatter manifest tests                                   |
| AC-02–AC-04          | 4              | portrait state-cycle and rendered-content tests                                      |
| AC-05–AC-06          | 4, 5           | arrows/dots/no-timer and keyboard/swipe reset tests                                  |
| AC-07–AC-08          | 5              | accessible-name, keyboard, live-region, and gesture-disambiguation tests             |
| AC-09                | 3, 6           | author-only mountain manifest plus visual family-crop verification                   |
| AC-10                | 5              | standard/reduced-motion branch tests                                                 |
| AC-11                | 3–5            | locale resource, Italian rendering, and live language-switch tests                   |
| AC-12–AC-13          | 1, 3           | scoped compression and derivative/dimension contract tests                           |
| AC-14                | 2, 5, 6        | malformed-data and two-stage image fallback tests                                    |
| AC-15–AC-16          | 6              | About characterization, page composition, full suite/build, and responsive visual QA |

---

### Task 1: Scope the image-compression script [size: S | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: performance]

**Acceptance criteria:** AC-13

**Files:**

- Modify: `scripts/compress-images.mjs:6-8,176-220`
- Create: `scripts/compressImagesTarget.test.ts`

**Interfaces:**

- Consumes: optional CLI argument `process.argv[2]`, expressed relative to `public/static/images/`.
- Produces: `resolveScanRoot(relativeDir?: string): string`; `compressAllImages(relativeDir?: string): Promise<void>`; direct CLI execution that preserves the current default and supports `about/portraits`.

- [ ] **Step 1: Write the failing path-resolution tests**

  Add tests that dynamically import the `.mjs` module and assert:

  ```ts
  expect(resolveScanRoot()).toBe(imagesRoot)
  expect(resolveScanRoot('about/portraits')).toBe(path.join(imagesRoot, 'about/portraits'))
  expect(() => resolveScanRoot('../outside')).toThrow(/public\/static\/images/)
  expect(() => resolveScanRoot('/tmp/outside')).toThrow(/public\/static\/images/)
  ```

  Importing the module must not start compression; the existing invocation therefore needs a direct-execution guard in the implementation step.

- [ ] **Step 2: Run the focused test and verify the red state**

  Run: `npm run test -- scripts/compressImagesTarget.test.ts`

  Expected: FAIL because `resolveScanRoot` is not exported and importing the current module starts its unscoped work.

- [ ] **Step 3: Implement the scoped resolver and direct-execution guard**

  In `scripts/compress-images.mjs`, export:

  ```js
  function resolveScanRoot(relativeDir) // returns an absolute path inside IMAGES_ROOT or throws
  async function compressAllImages(relativeDir)
  ```

  Resolve with `path.resolve(IMAGES_ROOT, relativeDir ?? '.')`, reject any result whose `path.relative(IMAGES_ROOT, candidate)` is absolute or starts with `..`, call `findImages(scanRoot, IMAGES_ROOT)` so backup paths retain `about/portraits`, and pass `process.argv[2]` only from a `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])` main guard. Keep no-argument behavior unchanged.

- [ ] **Step 4: Run the focused test and verify the green state**

  Run: `npm run test -- scripts/compressImagesTarget.test.ts`

  Expected: PASS with four path-resolution cases and no compression output during import.

- [ ] **Step 5: Commit the scoped script**

  ```bash
  git add scripts/compress-images.mjs scripts/compressImagesTarget.test.ts
  git commit -m "feat(images): scope compression to a safe subtree"
  ```

### Task 2: Define and normalize portrait content [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-01, AC-14

**Files:**

- Create: `components/about/portraitData.ts`
- Create: `components/about/portraitData.test.ts`
- Modify: `contentlayer.config.ts:136-180`

**Interfaces:**

- Consumes: unknown Contentlayer `portraits` JSON.
- Produces: `LocalizedPortraitText`, `PortraitVariant`, `Portrait`, and `normalizePortraits(value: unknown): Portrait[]`.

- [ ] **Step 1: Write failing normalization tests**

  Add these cases with explicit EN/IT fixtures:

  ```ts
  expect(normalizePortraits(validFivePortraitFixture)).toHaveLength(5)
  expect(normalizePortraits(null)).toEqual([])
  expect(normalizePortraits([{ id: '', original: '' }])).toEqual([])
  expect(
    normalizePortraits([{ ...validPortrait, variants: [validVariant, { id: 7 }] }])[0].variants
  ).toEqual([validVariant])
  expect(normalizePortraits([{ ...validPortrait, focalPoint: 12 }])[0].focalPoint).toBe('50% 50%')
  ```

  Also assert inputs are not mutated.

- [ ] **Step 2: Run the focused test and verify the red state**

  Run: `npm run test -- components/about/portraitData.test.ts`

  Expected: FAIL because `portraitData.ts` and `normalizePortraits` do not exist.

- [ ] **Step 3: Implement the data types and normalizer**

  Create these exact public shapes:

  ```ts
  type LocalizedPortraitText = { en: string; it: string }
  type PortraitVariant = { id: string; label: LocalizedPortraitText; src: string }
  type Portrait = {
    id: string
    title: LocalizedPortraitText
    original: string
    focalPoint: string
    variants: PortraitVariant[]
  }
  function normalizePortraits(value: unknown): Portrait[]
  ```

  Accept only non-empty IDs/paths and complete EN/IT text, default a missing/non-string focal point to `50% 50%`, discard invalid portraits and variants without throwing, preserve input order, and return new objects.

- [ ] **Step 4: Declare the Contentlayer author field**

  Add `portraits` after `avatar` in `contentlayer.config.ts` as a `list` of `json`, documenting nested `id`, `title`, `original`, `focalPoint`, and `variants`; default it to `[]` and preserve the existing warning that nested fields require runtime normalization.

- [ ] **Step 5: Run the focused test and verify the green state**

  Run: `npm run test -- components/about/portraitData.test.ts`

  Expected: PASS for valid, null, malformed, partial-variant, focal-default, and immutability cases.

- [ ] **Step 6: Commit the portrait contract**

  ```bash
  git add contentlayer.config.ts components/about/portraitData.ts components/about/portraitData.test.ts
  git commit -m "feat(about): define portrait content contract"
  ```

### Task 3: Import, configure, and optimize the 20 assets [size: M | risk: none | mechanical: true | clear_pattern: true | objectively_verifiable: true | concerns: performance]

**Acceptance criteria:** AC-01, AC-09, AC-11, AC-12, AC-13

**Files:**

- Create: `data/authors/portraitAssets.test.ts`
- Modify: `data/authors/default.mdx`
- Modify: `locales/en.json`
- Modify: `locales/it.json`
- Create: `public/static/images/about/portraits/*.png`
- Create: `public/static/images/about/portraits/responsive/*`

**Interfaces:**

- Consumes: Task 1's scoped compression CLI and the approved external 20-PNG manifest.
- Produces: five `portraits` frontmatter entries, localized carousel UI keys, 20 compressed primary images, and 144w/200w PNG/WebP derivatives for each image.

- [ ] **Step 1: Write the failing author/asset contract test**

  Parse `data/authors/default.mdx` with `gray-matter`, flatten each portrait's original and three variants, and assert:

  ```ts
  expect(data.portraits.map((portrait) => portrait.id)).toEqual([
    'guitar',
    'family-sunset',
    'polaroid',
    'mountain',
    'statue',
  ])
  expect(assetPaths).toHaveLength(20)
  expect(new Set(assetPaths).size).toBe(20)
  expect(
    assetPaths.every((src) => /^\/static\/images\/about\/portraits\/[a-z0-9_]+\.png$/.test(src))
  ).toBe(true)
  ```

  For every path, assert the primary file plus `-144w.png`, `-200w.png`, `-144w.webp`, and `-200w.webp` exists; use `image-size` to assert the compressed primary is at most 1000×1000 and thumbnail widths are 144 and 200.

- [ ] **Step 2: Run the contract test and verify the red state**

  Run: `npm run test -- data/authors/portraitAssets.test.ts`

  Expected: FAIL because `portraits` and the repository asset directory do not exist.

- [ ] **Step 3: Copy exactly the approved PNG inputs**

  Run these commands as separate actions:

  ```bash
  mkdir -p public/static/images/about/portraits
  portrait_source_dir='/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures'
  cp "$portrait_source_dir"/{guitar_session.png,guitar_session_16_bit_rock.png,guitar_session_90s_anime.png,guitar_session_cubist_riff.png,family_sunset_coastal_anime.png,family_sunset_storybook.png,family_sunset_retro_futurist.png,polaroid_portrait.png,polaroid_portrait_y2k_pop.png,polaroid_portrait_dream_portal.png,polaroid_portrait_hologram.png,mountain_day.png,mountain_day_future_explorer.png,mountain_day_low_poly.png,mountain_day_topo_watercolor.png,budapest_encounter.png,budapest_encounter_noir_comic.png,budapest_encounter_bronze_echo.png,budapest_encounter_8_bit_quest.png} public/static/images/about/portraits/
  cp "$portrait_source_dir/family_sunset.PNG" public/static/images/about/portraits/family_sunset.png
  ```

  Expected: exactly 20 lowercase `.png` files in the destination and no JPEGs.

- [ ] **Step 4: Configure portrait frontmatter and localized controls**

  Add the five portrait groups to `default.mdx` in the approved table order and point at the exact imported paths. Use focal points `50% 50%` (guitar), `50% 46%` (family), `50% 50%` (polaroid), `50% 50%` (mountain), and `52% 45%` (statue). Add parallel EN/IT keys under `about.profile.carousel` for Original, previous/next photo, cycle variant, photo/state announcement, and image fallback.

- [ ] **Step 5: Run only scoped portrait compression**

  Run: `npm run compress-images -- about/portraits`

  Expected: the output lists 20 processed portrait images, creates `responsive/`, reports 144w/200w derivatives, and does not list an image outside `about/portraits` as processed.

- [ ] **Step 6: Run the author/asset contract test and verify the green state**

  Run: `npm run test -- data/authors/portraitAssets.test.ts`

  Expected: PASS with five groups, 20 unique lowercase paths, maximum primary dimensions, and all 80 required thumbnail derivatives.

- [ ] **Step 7: Verify compression did not touch unrelated assets or expose backups to Git**

  Run: `git status --short public/static/images`

  Expected: every reported path begins with `public/static/images/about/portraits/`; `public/static/images/original-backups/` is absent because it is gitignored.

- [ ] **Step 8: Commit the content and optimized asset set**

  ```bash
  git add data/authors/default.mdx data/authors/portraitAssets.test.ts locales/en.json locales/it.json public/static/images/about/portraits
  git commit -m "feat(about): add personal portrait artwork"
  ```

### Task 4: Build the manual portrait and variant controls [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-02, AC-03, AC-04, AC-05, AC-06, AC-11

**Files:**

- Create: `components/about/PortraitCarousel.tsx`
- Create: `components/about/PortraitCarousel.test.tsx`

**Interfaces:**

- Consumes: Task 2's `Portrait[]` and Task 3's localized resource keys/assets.
- Produces: `PortraitCarousel({ portraits, fallbackAvatar, fallbackAlt }: PortraitCarouselProps)` with manual state cycling, arrows, and direct-selection dots.

- [ ] **Step 1: Write failing initial-state and variant-cycle tests**

  With a two-photo fixture, assert the portrait initially shows the first original, `Original · 1/4`, and only the localized photo title below. Click the portrait four times and assert source/label order `original → variant 1 → variant 2 → variant 3 → original`; assert no style-description element exists below the circle.

- [ ] **Step 2: Run the cycle tests and verify the red state**

  Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

  Expected: FAIL because `PortraitCarousel` does not exist.

- [ ] **Step 3: Implement the portrait-state cycle**

  Render one active `Image`, a localized title, and an in-image state chip. Maintain `activePhotoIndex` and `activeVariantIndex`; derive states as `[original, ...variants]`, use the configured `focalPoint` as `object-position`, and increment variant state modulo the active state's actual length when the semantic portrait button is activated.

- [ ] **Step 4: Run the cycle tests and verify the first green state**

  Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

  Expected: PASS for initial state, four-state ordering, wrapping, chip placement/content, and absence of below-image style text.

- [ ] **Step 5: Add failing photo-navigation and localization tests**

  Assert previous/next buttons wrap, a dot selects its photo directly, every photo change resets to `Original · 1/4`, exactly one dot per portrait is rendered with its active state, 60 seconds of fake timers cause no change, and Italian rendering shows `Originale` plus the configured Italian photo/style titles.

- [ ] **Step 6: Run the new tests and verify the red state**

  Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

  Expected: FAIL on missing arrows, dots, reset behavior, and localized controls.

- [ ] **Step 7: Implement manual arrows, dots, and localized labels**

  Add previous/next buttons beside the circle and one direct-selection dot per portrait below it. Use modulo navigation, reset variant state to zero in the shared `selectPhoto(index: number)` path, render no interval/effect for autoplay, and source every visible or accessible label through `useLanguage()`.

- [ ] **Step 8: Run the complete core-carousel test file**

  Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

  Expected: PASS for cycles, navigation, wrapping, reset, no autoplay, and EN/IT rendering.

- [ ] **Step 9: Commit the core carousel**

  ```bash
  git add components/about/PortraitCarousel.tsx components/about/PortraitCarousel.test.tsx
  git commit -m "feat(about): add manual portrait carousel"
  ```

### Task 5: Add gestures, accessibility, motion, and image fallbacks [size: M | risk: none | mechanical: false | clear_pattern: false | objectively_verifiable: true | concerns: borderline]

**Acceptance criteria:** AC-05, AC-07, AC-08, AC-10, AC-11, AC-14

**Files:**

- Modify: `components/about/PortraitCarousel.tsx`
- Modify: `components/about/PortraitCarousel.test.tsx`

**Interfaces:**

- Consumes: Task 4's `selectPhoto(index)` and variant-cycle behavior; `mockReducedMotion()` from `test/mockMatchMedia.ts`.
- Produces: one-action pointer disambiguation, scoped keyboard navigation, polite announcements, standard/reduced transitions, and bounded image fallback.

- [ ] **Step 1: Write failing keyboard, announcement, and language-switch tests**

  Focus the portrait and assert Enter/Space cycle variants, ArrowRight/ArrowLeft change and wrap photos while resetting state, focus remains on the initiating control, and a polite live region announces the new localized photo/state. Switch EN→IT while variant 2 is active and assert the same photo/state remains active while chip/control/announcement copy changes language.

- [ ] **Step 2: Run the focused test file and verify the accessibility red state**

  Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

  Expected: FAIL on arrow-key navigation, live announcements, and live language change.

- [ ] **Step 3: Implement keyboard semantics and live announcements**

  Keep portrait activation native to its button for Enter/Space; handle Left/Right only while the portrait controller is focused; give portrait, arrows, and dots localized accessible names; and update one `aria-live="polite"` status after completed photo, variant, or fallback changes without moving focus.

- [ ] **Step 4: Write failing gesture-boundary tests**

  Assert `dx=31, dy=0` followed by click cycles one variant, `dx=32, dy=10` changes one photo and suppresses the following click, `dx=40, dy=50` cycles one variant, and no sequence performs both actions.

- [ ] **Step 5: Implement pointer disambiguation**

  Store pointer-down coordinates in a ref. On release, treat `abs(dx) >= 32 && abs(dx) > abs(dy)` as one photo navigation; otherwise leave the sequence as a tap. Use a one-shot suppression ref so the synthetic click following a swipe cannot cycle the variant.

- [ ] **Step 6: Write failing fallback, rapid-activation, and motion tests**

  Assert three rapid activations settle on state 4, a creative-image error resets once to original and announces it, an original-image error renders `fallbackAvatar`, a fallback-avatar error does not retry, and `mockReducedMotion()` yields `data-motion="reduced"` with immediate swaps while the default yields `data-motion="standard"`.

- [ ] **Step 7: Implement bounded fallbacks and motion branches**

  Use `AnimatePresence`/Motion for a short state crossfade and restrained directional photo transition. Use `useReducedMotion()` to select zero-duration/no-direction transitions. Track only the current failure stage (`creative`, `original`, `avatar`) so each error advances once and cannot loop.

- [ ] **Step 8: Run the complete carousel test file**

  Run: `npm run test -- components/about/PortraitCarousel.test.tsx`

  Expected: PASS for core controls, keyboard, localization, language switching, exact gesture boundaries, rapid activation, two-stage fallback, standard motion, and reduced motion.

- [ ] **Step 9: Commit the completed interaction**

  ```bash
  git add components/about/PortraitCarousel.tsx components/about/PortraitCarousel.test.tsx
  git commit -m "feat(about): complete portrait interactions"
  ```

### Task 6: Integrate the carousel and verify the complete About experience [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: performance]

**Acceptance criteria:** AC-09, AC-15, AC-16 and final verification of AC-01–AC-14

**Files:**

- Modify: `components/about/AboutProfile.tsx:9-53`
- Modify: `components/about/AboutProfile.test.tsx`
- Modify: `app/about/page.tsx:45-59`
- Modify: `app/about/page.test.tsx`

**Interfaces:**

- Consumes: `normalizePortraits(author.portraits)` and `PortraitCarousel` from Tasks 2–5.
- Produces: an About profile that prefers valid portrait content and preserves the current avatar path as the zero-valid-portrait fallback.

- [ ] **Step 1: Write failing profile-integration tests**

  Extend `AboutProfile.test.tsx` to assert valid `portraits` render the carousel instead of the standalone avatar, malformed/empty portraits preserve the current avatar and alt behavior, and identity/company/social/highlight assertions remain unchanged.

- [ ] **Step 2: Run the profile suite and verify the red state**

  Run: `npm run test -- components/about/AboutProfile.test.tsx`

  Expected: FAIL because `AboutProfile` does not accept or render `portraits`.

- [ ] **Step 3: Integrate normalization and carousel composition**

  Add `portraits?: unknown` to `AboutProfile` props, call `normalizePortraits` once, render `PortraitCarousel` when the result is non-empty, and otherwise preserve the existing 144px avatar block exactly. Keep the surrounding grid, identity, social, and highlights responsibilities in `AboutProfile`.

- [ ] **Step 4: Add failing page data-flow coverage**

  Extend the mutable author fixture in `app/about/page.test.tsx` with a valid portrait list and assert the configured first title/state reaches the rendered profile while the existing band-order and rhythm assertions remain unchanged.

- [ ] **Step 5: Pass compiled portrait data from the page**

  Add `portraits={author.portraits}` to the existing `AboutProfile` invocation in `app/about/page.tsx`; do not alter any other page band or spacing class.

- [ ] **Step 6: Run targeted About suites**

  Run: `npm run test -- components/about/AboutProfile.test.tsx app/about/page.test.tsx components/about/aboutSectionRhythm.test.tsx components/about/aboutHeadingHierarchy.test.tsx`

  Expected: PASS with carousel data flow and all existing profile/page contracts intact.

- [ ] **Step 7: Run repository verification commands from project configuration**

  Run: `npm run test`

  Expected: all Vitest suites PASS.

  Run: `npm run lint`

  Expected: exit 0 with no unresolved lint errors.

  Run: `npm run build`

  Expected: static Next.js build and `scripts/postbuild.mjs` complete successfully; Contentlayer accepts `portraits`; no missing image path is reported.

- [ ] **Step 8: Perform responsive visual and interaction QA**

  Run: `npm run dev`

  Verify `/about` at approximately 320px, 768px, and desktop widths in light and dark themes. Confirm the 160/176px circle, family visibility in all four states, author-only mountain states, in-image chip, arrows/dots, swipe/tap separation, visible focus, EN/IT copy, no autoplay, reduced-motion instant swaps, and no browser request for a master image larger than the generated display derivatives.

- [ ] **Step 9: Commit integration and verified behavior**

  ```bash
  git add components/about/AboutProfile.tsx components/about/AboutProfile.test.tsx app/about/page.tsx app/about/page.test.tsx
  git commit -m "feat(about): integrate creative portrait carousel"
  ```
