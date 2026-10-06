# About Portrait Carousel and Creative Variants

**Slug:** `about-portrait-carousel-creative-variants`
**Type:** feature
**Status:** APPROVED
**Provenance:** Current user request; `app/about/page.tsx`; `components/about/AboutProfile.tsx`; `components/about/AboutProfile.test.tsx`; `data/authors/default.mdx`; `contentlayer.config.ts`; `scripts/compress-images.mjs`; `/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures`

## Problem

The About profile currently renders one generic avatar. It does not represent
the range of personal moments the author wants to share, and it has no way to
show creative reinterpretations of those moments without replacing the
professional presentation of the profile card.

## Current Behavior

- `AboutProfile` accepts one optional `avatar` path and renders it as a
  144-by-144-pixel circular image.
- The image has a hover scale but no navigation or state beyond presence or
  absence.
- Author identity, social links, and highlight bullets share the same profile
  card and must remain intact.
- The About page is statically exported and author data is compiled from
  `data/authors/default.mdx` by Contentlayer.

## Desired Outcome

Replace the single avatar with a manually controlled circular portrait
carousel containing five personal photo groups. Each group contains one
original and three tailored creative versions. Photo navigation and creative
variation navigation are distinct:

- arrows, dots, horizontal swipe, or scoped Left/Right keys change photos;
- clicking or tapping the portrait, or pressing Enter/Space while it is
  focused, cycles that photo through its four visual states.

The original remains the default presentation for every photo. A compact chip
inside the portrait identifies the active state and its position, such as
`90s Anime · 2/4`. Only the localized photo title appears below the portrait;
style descriptions do not appear below it.

## Approved Creative Set

The configured order of photo groups and states is authoritative. Changing to
another photo always resets its state to `Original` (`Originale` in Italian).

| Photo ID        | Localized title                           | State 2                              | State 3                        | State 4                                  |
| --------------- | ----------------------------------------- | ------------------------------------ | ------------------------------ | ---------------------------------------- |
| `guitar`        | Guitar session / Sessione con la chitarra | 16-bit Rock                          | 90s Anime / Anime anni '90     | Cubist Riff / Riff cubista               |
| `family-sunset` | Family sunset / Tramonto in famiglia      | Coastal Anime / Anime sulla costa    | Storybook / Libro illustrato   | Future Coast / Costa futura              |
| `polaroid`      | Polaroid portrait / Ritratto Polaroid     | Y2K Pop                              | Dream Portal / Portale onirico | Hologram / Ologramma                     |
| `mountain`      | Mountain portrait / Ritratto in montagna  | Future Explorer / Esploratore futuro | Low Poly                       | Topo Watercolor / Acquerello topografico |
| `statue`        | Statue encounter / Incontro con la statua | Noir Comic / Fumetto noir            | Bronze Echo / Eco di bronzo    | 8-bit Quest / Missione 8-bit             |

Each state must preserve recognizable faces, pose, and the essential
composition of its source. All four people in the family photo must remain
recognizable inside the circular crop. The final mountain source will contain
only the author.

## Design

### Content model

Add a `portraits` list to the Authors Contentlayer document. Each entry has one
stable ID, a localized title, an original image path, optional focal-position
metadata, and exactly three ordered creative variants. Each variant has one
stable ID, a localized short label, and an image path.

The source of truth remains `data/authors/default.mdx`; the page must not
hard-code the photo or style lists. The existing `avatar` field remains as a
backward-compatible fallback when no valid portrait entries are available.

Conceptual shape:

```ts
type Portrait = {
  id: string
  title: { en: string; it: string }
  original: string
  focalPoint?: string
  variants: Array<{
    id: string
    label: { en: string; it: string }
    src: string
  }>
}
```

Because Contentlayer does not deeply validate list-of-JSON fields, the client
boundary must normalize partial data before rendering it. Invalid entries are
ignored rather than allowed to break the whole About card.

### Component boundary

Extract portrait interaction into a focused client component owned by the
About domain. `AboutProfile` remains responsible for the profile-card layout,
identity, social links, and highlights. The portrait component receives
normalized portrait data plus the legacy avatar fallback and owns only:

- active photo index;
- active state index;
- pointer, swipe, and keyboard interaction;
- active-state announcement;
- transition and image-error fallback behavior.

No general-purpose carousel abstraction or third-party carousel dependency is
introduced.

### Interaction state machine

The active photo begins at the first configured portrait and state index zero
(`Original · 1/4`).

1. Activating the portrait increments the state index modulo four:
   `Original → Style 1 → Style 2 → Style 3 → Original`.
2. Activating a dot selects that photo directly and resets the state index to
   zero.
3. Activating a previous/next arrow or a scoped Left/Right key changes the
   photo modulo five and resets the state index to zero.
4. A touch gesture changes the photo when horizontal displacement reaches 32px
   and exceeds vertical displacement; a release below that threshold is a tap
   and cycles the state. The two gestures must not fire for the same pointer
   sequence.
5. Photo navigation is entirely manual. There is no timer or automatic
   advancement.

The portrait is a semantic button. The inner image is decorative to that
control and uses an empty `alt`; the button's accessible name conveys the
localized photo title, current state, and action. Arrow and dot controls have
localized accessible names. A polite live region announces completed photo or
state changes without moving focus.

### Visual treatment

- Keep the portrait circular and within the existing glass profile card.
- Use a 176-by-176-pixel circle on desktop and a 160-by-160-pixel circle on
  compact layouts. Use focal-position metadata to keep the family group
  recognizable without overflowing the existing card.
- Place the current localized state and `n/4` counter in a compact chip inside
  the lower portion of the circle.
- Place only the localized photo title and the five direct-selection dots
  below the circle.
- Place previous and next buttons on the left and right edges of the portrait.
- Use a restrained directional transition for photo changes and a short
  crossfade for variation changes. When `prefers-reduced-motion: reduce` is
  active, swap images without animated movement or fading.
- Preserve light/dark-theme contrast and visible focus indicators.

### Image assets and performance

The feature consumes 20 approved PNG assets: five originals plus three
creative variants for each original. Master PNGs remain outside the served
site in the user's verified backup location. Display assets live under
`public/static/images/about/portraits/` using stable photo-and-state filenames.

The prepared source and destination names are:

| Group    | PNG files                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Guitar   | `guitar_session.png`, `guitar_session_16_bit_rock.png`, `guitar_session_90s_anime.png`, `guitar_session_cubist_riff.png`                  |
| Family   | `family_sunset.png`, `family_sunset_coastal_anime.png`, `family_sunset_storybook.png`, `family_sunset_retro_futurist.png`                 |
| Polaroid | `polaroid_portrait.png`, `polaroid_portrait_y2k_pop.png`, `polaroid_portrait_dream_portal.png`, `polaroid_portrait_hologram.png`          |
| Mountain | `mountain_day.png`, `mountain_day_future_explorer.png`, `mountain_day_low_poly.png`, `mountain_day_topo_watercolor.png`                   |
| Budapest | `budapest_encounter.png`, `budapest_encounter_noir_comic.png`, `budapest_encounter_bronze_echo.png`, `budapest_encounter_8_bit_quest.png` |

Implementation must copy only these PNG files from
`/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures` into the new
portrait directory. The source file `family_sunset.PNG` is normalized to the
lowercase destination name `family_sunset.png`. JPEG generation sources and
the external `originals-backup-2026-10-06` directory are not copied into the
repository.

The current compression script scans the entire image tree and uses gitignored
backup files as its skip markers. A fresh worktree has no such markers, so an
unscoped run would recompress unrelated existing assets. Implementation must
therefore add a backward-compatible optional relative-directory argument to
`scripts/compress-images.mjs`: no argument retains the existing all-images
behavior, `about/portraits` limits discovery to that subtree, and paths that
escape `public/static/images/` are rejected.

After the fresh PNGs are copied, implementation must run
`npm run compress-images -- about/portraits`. For each new portrait asset, the
script:

- places an uncompressed local backup under the gitignored
  `public/static/images/original-backups/about/portraits/` path;
- compresses the main PNG in place, limiting its dimensions to 1000 by 1000;
- creates available 144w, 200w, 640w, 800w, and 1000w PNG derivatives under
  `public/static/images/about/portraits/responsive/` without enlargement; and
- creates matching WebP derivatives.

The implementation must verify the generated 144w and 200w PNG/WebP files for
all 20 assets because those are the sizes selected by `components/Image.tsx`
for the 160/176-pixel portrait. The gitignored optimization backups must not be
staged or committed.

The existing image optimization workflow must create the 144w and 200w PNG
and WebP derivatives expected by `components/Image.tsx`. The carousel must use
those display-sized derivatives and must not serve multi-megabyte master PNGs
for the small portrait. Outside the brief transition window, only the active
image is rendered; a transition may temporarily retain the outgoing and
incoming images. Normal browser caching retains previously visited states.

Creative asset generation is an input to implementation, not a runtime site
feature. The website performs no AI generation and makes no image-generation
network calls.

### Failure handling

- If `portraits` is absent or no entry survives normalization, render the
  existing `avatar` behavior.
- If a portrait has fewer than three valid creative variants during content
  staging, cycle only through the valid states and show the correct dynamic
  denominator. Production content must nevertheless satisfy the complete
  four-state acceptance criterion.
- If a creative image fails to load, fall back once to that photo's original
  and announce the fallback. If the original also fails, fall back to the
  legacy avatar without retrying indefinitely.
- Asset-contract tests must verify that every configured production image and
  required responsive derivative exists, so missing paths are detected before
  deployment.

## Acceptance Criteria

- **AC-01:** The About profile renders five portrait groups in the configured
  order, each with one original and exactly three tailored creative variants.
- **AC-02:** The first portrait initially shows `Original · 1/4`; activating the
  portrait cycles through all four states in order and wraps to Original.
- **AC-03:** The active-state chip appears inside the circle and contains the
  localized state label plus its `n/4` position. No style/effect description is
  rendered below the portrait.
- **AC-04:** Only the localized photo title and five direct-selection dots
  appear below the portrait.
- **AC-05:** Previous/next buttons, direct-selection dots, scoped Left/Right
  keys, and horizontal touch swipe change photos manually and wrap at both
  ends. No photo changes automatically.
- **AC-06:** Every photo change resets that photo to `Original · 1/4`.
- **AC-07:** Enter/Space on the focused portrait cycles variants. All controls
  have localized accessible names, visible focus, and polite state
  announcements without unexpected focus movement.
- **AC-08:** A touch gesture triggers either photo navigation or variant
  cycling, never both.
- **AC-09:** All four people remain recognizable in every family-photo state.
  The production mountain states use the final author-only source.
- **AC-10:** Standard motion uses restrained photo and variant transitions;
  reduced-motion mode performs immediate state changes without animation.
- **AC-11:** English and Italian display the corresponding photo titles,
  state labels, control labels, and announcements without leaking raw keys.
- **AC-12:** The served portrait uses responsive PNG/WebP derivatives; the
  full-resolution master PNGs are not requested by the browser.
- **AC-13:** All 20 approved source PNGs are copied with the specified lowercase
  destination names, `npm run compress-images -- about/portraits` succeeds
  without modifying unrelated image assets, and every portrait asset has the
  required 144w and 200w PNG/WebP derivatives.
- **AC-14:** Missing or partial portrait content follows the defined fallback
  behavior without breaking the identity card.
- **AC-15:** Existing identity, occupation, company, social links, highlights,
  profile-card layout, About-page ordering, and page rhythm remain functional.
- **AC-16:** The complete interaction is verified at compact and desktop
  widths in light and dark themes, including the family crop and visible focus
  treatment.

## Testing Strategy

- Add focused component tests for initial state, four-state cycling, wrapping,
  arrows, direct dots, keyboard controls, photo-reset behavior, localized
  labels, live announcements, swipe/tap disambiguation, and fallbacks.
- Extend `AboutProfile` characterization tests to cover portrait data while
  retaining the legacy-avatar cases.
- Add normalization tests for malformed Contentlayer JSON and asset-contract
  tests for all configured files and responsive derivatives.
- Verify the image-preparation step by checking the compression command's exit
  status and the complete 20-asset responsive manifest.
- Add focused tests for the compression script's default root, scoped portrait
  root, and rejection of paths outside `public/static/images/`.
- Extend page composition tests only where the prop contract changes; the
  surrounding About-page bands and rhythm must remain unchanged.
- Run the project test suite, lint/type checks, and static production build.
- Perform visual verification at approximately 320px, 768px, and desktop
  widths in light, dark, and reduced-motion modes.

## Constraints

- Preserve the static-export architecture; no API route or runtime backend.
- Reuse the existing `Image`, Motion, LanguageContext, and styling conventions.
- Add no carousel or gesture dependency unless the implementation plan proves
  native pointer handling insufficient.
- Preserve the verified source-image backup at
  `/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures/originals-backup-2026-10-06`.
- Treat the 20 prepared PNGs in
  `/Users/davide/Personal/Images/Lightstimulus_About_Page_Pictures` as the
  approved implementation inputs. The final mountain image is author-only and
  all 15 creative variants are present.

## Edge Cases

- Empty portrait list, missing original, missing variants, or malformed
  localized labels.
- Rapid repeated activation while a transition or image load is in progress.
- Pointer movement near the swipe threshold.
- Family crop at the narrowest supported layout.
- Language switch while a non-original state is active.
- A failed creative asset followed by a failed original asset.
- Reduced-motion preference changing during the session.

## Out of Scope

- Generating or editing the creative images inside the website.
- Producing the final author-only mountain crop or the 15 creative source
  artworks as part of the application implementation.
- Automatic playback, randomization, or persistence of the selected photo or
  variant across visits.
- Full-screen galleries, lightboxes, downloads, captions beyond the photo
  title, or changes to other About-page sections.

## Alternatives Considered

- **Orbit gallery:** exposes creative variants around the portrait, but adds
  visual noise to an otherwise professional identity card.
- **Split lens:** provides an original-versus-creative comparison slider, but
  increases interaction complexity and competes with photo navigation.
- **Flip portal (selected):** keeps the original prominent, reveals creativity
  on demand, and supports multiple tailored variants with one compact control.
