# About Portrait Carousel Lightbox

**Slug:** `about-portrait-lightbox`
**Type:** feature
**Status:** APPROVED
**Provenance:** Current user request; `docs/superpowers/specs/2026-10-06-about-portrait-carousel-creative-variants-design.md`; `components/about/PortraitCarousel.tsx`; `components/about/PortraitCarousel.test.tsx`; `components/about/portraitData.ts`; `components/about/AboutProfile.tsx`; `components/Image.tsx`; `components/MobileNav.tsx`; `locales/en.json`; `locales/it.json`; `locales/locales.test.ts`; `package.json`; `vitest.config.mts`; `test/mockMatchMedia.ts`; `docs/architecture/map.md`

## Problem

The About page portrait carousel presents each portrait inside a compact circular crop. Visitors can explore photos and creative styles, but they cannot inspect the selected image at a substantially larger size. Reusing the portrait itself to open a larger view would conflict with its existing style-cycling action, so the larger view needs a distinct control and interaction surface.

## Current Behavior

- `PortraitCarousel` owns the active photo index, active style index, transition direction, live-region announcement, swipe tracking, and image-fallback stage.
- Activating the circular portrait or its separate style chip cycles the active photo through Original and its creative variants.
- Previous/next buttons, direct-selection dots, Left/Right keys scoped to the focused portrait, and horizontal swipe navigate photos. Every photo change resets the selected photo to Original.
- Image failure falls back from a creative variant to the photo's original, then to the legacy avatar without retrying indefinitely.
- `motion/react` provides transitions and honors `prefers-reduced-motion`.
- `components/Image.tsx` uses 144/200-pixel responsive assets for the carousel and 640/800/1000-pixel responsive assets for larger static images.
- `@headlessui/react` is already installed and used for the mobile-navigation dialog.

## Desired Outcome

Add a dedicated expand control beside the circular portrait. It opens an accessible, responsive lightbox showing the carousel's current photo and style at a substantially larger size. The carousel remains the sole owner of photo and style selection, so actions in either surface stay synchronized and closing the lightbox preserves the final selection.

The lightbox must feel like an extension of the existing About card rather than a redesign: it uses the existing images, controls, themes, transitions, localization system, and fallback semantics.

## Design

### State ownership and component boundary

Keep `activePhotoIndex`, `activeVariantIndex`, `failureStage`, transition state, and navigation/style actions in `PortraitCarousel`. Add only lightbox-open state and the expand-trigger reference there. This retains one authoritative state machine and prevents carousel/lightbox drift.

Extract the modal presentation into an About-domain `PortraitLightbox` component. It receives the current portrait/style display data, localized photo titles for direct selection, motion preference, and callbacks for close, style cycling, photo navigation, direct photo selection, and image failure. It must not create a second photo or style index.

Do not introduce a general-purpose gallery abstraction, reducer, carousel dependency, or new package.

### Expand control

Add an icon button on or beside the portrait edge. It must be a DOM sibling of the existing portrait button, never a nested interactive element. Its hit area is at least 44 by 44 CSS pixels, it has the same visible-focus quality as existing controls, and its localized accessible name includes the action and current context, for example `View larger: Guitar session, Original`.

Activating the expand control changes only the lightbox-open state. It must not cycle styles, navigate photos, trigger swipe suppression, or change carousel focus styling.

### Dialog and focus behavior

Use the installed Headless UI `Dialog`, `DialogBackdrop`, `DialogPanel`, and `DialogTitle` primitives. The open lightbox must:

- expose dialog semantics with a localized title describing the current portrait;
- move focus into the dialog, with the prominent close button as the preferred initial control;
- trap focus and make the background inert;
- prevent background scrolling;
- close from the prominent close button, Escape, or a backdrop click;
- leave clicks inside the panel open; and
- restore focus to the expand button after closing.

Headless UI remains responsible for focus trapping, outside-click handling, Escape behavior, inert background, and scroll locking. Custom code should be added only where a verified behavior is not supplied by the library.

### Lightbox controls and synchronization

The lightbox displays:

- the localized photo title and active style label;
- a localized `Change style` action;
- previous and next photo buttons;
- direct-selection dots when all configured dots remain clear and usable at narrow widths; and
- a prominent localized close button.

All controls call the existing carousel actions:

1. Opening shows the exact active photo and active style.
2. `Change style` advances the shared style index using the existing order and wrap semantics.
3. Previous, next, and direct selection change the shared photo index and reset the new photo to Original.
4. Photo navigation wraps at both ends exactly as the carousel does.
5. Closing changes no selection state; reopening shows the preserved selection.

The existing circular portrait, style chip, carousel arrows, dots, scoped keyboard behavior, swipe threshold, click suppression, live announcements, and transitions remain unchanged.

### Image presentation and responsive layout

Render the selected image through the existing `Image` component so the lightbox uses the available 640-, 800-, and 1000-pixel responsive PNG/WebP assets. Use a viewport-constrained relative image region and `object-contain` so the full image remains visible without cropping, stretching, or distortion.

Use a dark translucent backdrop and a responsive panel that stays within the dynamic viewport height. On desktop the image may occupy most of the viewport with controls arranged around or below it. On narrow mobile layouts, controls may reflow into multiple rows; they must not overlap the image, clip localized labels, or require horizontal page scrolling.

The lightbox follows existing gray, primary, glass, light-theme, dark-theme, border, and focus-ring conventions. Existing portrait masters and responsive derivatives are reused unchanged; no image is regenerated.

Photo/style transitions may use the current restrained directional and crossfade language. When `prefers-reduced-motion: reduce` is active, the backdrop, panel, and image swap without animated movement, blur, scaling, or fading.

### Accessible image and announcements

The lightbox image is content rather than a decorative child of the portrait button. Its localized alternative text identifies the photo and active style. The dialog title and visible context must not rely only on the image alt text.

The existing shared polite live region continues announcing photo, style, and fallback changes. Opening or closing the dialog should not create a duplicate announcement unless Headless UI supplies necessary dialog context to assistive technology.

### Failure handling

Reuse the shared fallback path for lightbox image errors:

1. a failed creative variant selects and displays that photo's Original and announces the fallback;
2. a failed Original displays the legacy avatar when available and announces the fallback; and
3. a failed or absent final avatar leaves the dialog controls and context intact and replaces the image region with localized unavailable-image content.

Changing photo or style resets any terminal lightbox-only unavailable state. Failure handling must not loop, reopen a closed dialog, or produce an empty panel.

### Localization

Add every new visible and accessible string to both `locales/en.json` and `locales/it.json`. Expected concepts include:

- view larger with current photo/style context;
- larger-view dialog title;
- close larger view;
- lightbox image alternative text; and
- image unavailable.

Reuse the existing localized Original, Change style, previous-photo, next-photo, direct-selection, announcement, and fallback strings where their meaning is unchanged. English and Italian must retain key parity.

### Testing and verification

Follow TDD. Add focused React Testing Library/Vitest component tests before implementation for:

- sibling expand-control structure and non-interference with portrait activation;
- opening with the active photo/style;
- close button, Escape, and backdrop dismissal;
- focus entry, focus trapping, and focus restoration;
- style synchronization in both directions;
- previous, next, direct selection, wrap behavior, and reset to Original;
- preserved state after closing and reopening;
- English and Italian visible/accessibility copy;
- creative-to-original, original-to-avatar, and terminal unavailable fallbacks;
- standard and reduced-motion behavior; and
- regression of the existing portrait click, style chip, arrows, dots, keyboard, swipe, announcement, and fallback tests.

After focused tests pass, run the full commands defined by `package.json`: `npm run test`, `npm run lint`, and `npm run build`.

Perform browser QA on the About page at a representative desktop viewport and a narrow mobile viewport in both light and dark themes. Verify opening/closing, focus visibility, Escape, backdrop click, scroll locking, photo/style synchronization, image containment, control reachability, localization, responsive reflow, and reduced motion.

## Acceptance Criteria

- **AC-01:** The About portrait renders a dedicated expand button that is a sibling of the portrait button, has a hit area of at least 44 by 44 CSS pixels, and exposes a localized accessible name containing the active photo and style context.
- **AC-02:** Activating the expand button opens a Headless UI dialog showing the currently active photo and active style without changing either selection.
- **AC-03:** Activating the lightbox Change style control advances the shared style in the configured order, wraps to Original, and immediately updates the underlying carousel.
- **AC-04:** Lightbox previous, next, and direct-selection controls use the carousel's wrap semantics and reset every newly selected photo to Original in both the lightbox and underlying carousel.
- **AC-05:** Closing and reopening the lightbox preserves the final photo/style selection.
- **AC-06:** The prominent close button, Escape, and backdrop click close the lightbox; interaction inside the panel does not close it.
- **AC-07:** Focus moves into the open dialog, remains trapped there, and returns to the expand button after every supported close path; the background is inert and cannot scroll while the dialog is open.
- **AC-08:** The large image uses existing optimized responsive assets, remains fully visible within the viewport, and is never cropped, stretched, or distorted at desktop or narrow mobile widths.
- **AC-09:** The dialog exposes a localized title, localized image/context alternative text, localized controls, visible focus indicators, and clear controls with reasonable touch targets.
- **AC-10:** Lightbox styling works in light and dark themes and follows the existing About-page visual language without redesigning the profile card.
- **AC-11:** With reduced motion enabled, lightbox and image state changes use immediate swaps with no movement, blur, scaling, or fading.
- **AC-12:** A failed creative image falls back to Original, a failed Original falls back to the legacy avatar when present, and a failed or absent final fallback shows localized unavailable content without an empty or broken dialog.
- **AC-13:** All new visible and accessible strings exist in both English and Italian, and changing language while the dialog is open updates copy without resetting photo/style state.
- **AC-14:** Portrait activation, style-chip activation, carousel arrows, carousel dots, scoped Left/Right keys, Enter/Space behavior, swipe thresholds, click suppression, transitions, live announcements, and existing carousel fallbacks retain their current behavior.
- **AC-15:** Focused component tests cover opening, closing, synchronization, navigation, keyboard/focus behavior, localization, fallbacks, and reduced motion, and the complete project test suite passes.
- **AC-16:** `npm run lint` and `npm run build` complete successfully, and browser QA passes at desktop and narrow mobile widths in light and dark themes.

## Edge Cases

- The portrait list is empty or invalid: `AboutProfile` retains the existing legacy-avatar path and renders no expand control.
- There is only one valid portrait: previous/next/direct selection retain current carousel semantics and still reset through the shared selection action if invoked.
- A portrait has fewer variants than production content: style cycling and counters use the valid dynamic state count.
- A language change occurs while open: current photo/style indexes remain unchanged while labels, title, alt text, and accessible names update.
- Rapid style or photo activations use functional/shared state updates and do not drop actions.
- The viewport height changes while open, including mobile browser chrome changes: the panel remains reachable and scrolls internally only when necessary.
- The selected source changes after a prior terminal lightbox error: the unavailable state clears and the new source is attempted.

## Constraints

- Do not add a dependency unless implementation evidence proves the installed Headless UI Dialog cannot meet a requirement.
- Do not redesign the About card, regenerate portraits, change portrait order/style order, or alter the author content model.
- Apply YAGNI: no reusable gallery framework, generalized modal wrapper, or unrelated refactor.
- Work directly in `/Users/davide/Personal/Projects/lightstimulus-static-site-nextjs`; do not create or use a Git worktree.
- Specification approval precedes plan creation; plan approval precedes implementation.
- Create the implementation branch only when implementation begins, from an updated `main`, using the conventional name `feat/about-portrait-lightbox`.
- Commit the verified specification, plan, tests, and implementation on that feature branch. Do not push or merge before local user testing.

## Out of Scope

- Zoom, pan, download, fullscreen-browser APIs, thumbnails, captions beyond existing photo/style context, autoplay, or swipe navigation inside the lightbox.
- Changes to portrait artwork, responsive-image generation, author metadata, or other About-page sections.
- A site-wide modal or gallery abstraction.

## Notes

- `docs/architecture/map.md` records HEAD `d3bdac6`, while discovery occurred at `6007aa3`; the map is stale, but every recorded key path checked during discovery still exists. No architecture map regeneration is part of this feature.
- No applicable ADR was found.
- The governing workflow for this feature is: review and approve this specification; create and review the implementation plan with `personal-workflows:spec-plan`; after explicit plan approval, update `main`, create `feat/about-portrait-lightbox`, implement through TDD, verify, and commit without pushing or merging.
