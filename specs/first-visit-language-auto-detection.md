# First-Visit Language Auto-Detection

| Field       | Value                                           |
| ----------- | ----------------------------------------------- |
| **Title**   | First-Visit Language Auto-Detection             |
| **Type**    | feature                                         |
| **Scope**   | contexts/LanguageContext.tsx (client-side i18n) |
| **Created** | 2026-08-06 00:00:00                             |
| **Status**  | IMPLEMENTED                                     |

## Problem Statement

The bilingual EN/IT site always defaults first-time visitors to English,
regardless of their browser/OS language. An Italian-speaking visitor must
manually toggle to Italian on every fresh visit. Because the site is a
Next.js static export with no language-specific URLs, detection has to
happen entirely client-side without breaking SSR/hydration.

Additionally, the current implementation eagerly writes `lang='en'` to
`localStorage` on the very first visit. This "freezes" the language before
the user has expressed any real choice, which would prevent auto-detection
from ever following a later OS/browser language change.

## Current Behavior

- `LanguageProvider` (`contexts/LanguageContext.tsx`) initializes state to
  `'en'`.
- On mount, a `useEffect` reads `PreferencesService.getPref('lang')`:
  - If a value exists, it is used.
  - If not, it defaults to `'en'` **and immediately persists**
    `setPref('lang', 'en')` (line ~114).
- Browser language detection is explicitly **not** used.
- `switchLang(newLang)` updates state and persists via
  `PreferencesService.setPref('lang', newLang)`.
- `LanguageToggle.tsx` flips EN ↔ IT via `switchLang` and is already
  hydration-safe (renders `null` until `mounted`).
- `PreferencesService` namespaces the key as `lightstimulus.lang` in
  `localStorage`; `getPref`/`setPref` are SSR-safe no-ops when
  `window` is undefined.

## Desired Outcome

Introduce a distinction between a **detected** language (ephemeral, never
persisted) and a **chosen** language (persisted, always wins):

- **First visit / no stored preference:** read `navigator.language`; if it
  starts with `it` (case-insensitive), default to Italian, otherwise
  English. This detected value is applied to the UI but **not** written to
  `localStorage`.
- **Every subsequent visit with no stored preference:** re-detect from
  `navigator.language` again, so the displayed language automatically
  follows the user's current OS/browser language.
- **After a manual toggle:** the chosen language is persisted to
  `localStorage` (`lightstimulus.lang`) and thereafter always honored on
  every visit — detection is skipped entirely and never overrides it.
- **SSR/hydration safety:** the server-rendered / statically-exported
  output keeps English as the default. The correct language is reconciled
  on the client after mount. A brief one-frame EN→IT flash for an Italian
  first-time visitor is acceptable.

## Acceptance Criteria

- [ ] On first visit with `navigator.language` starting with `it` (e.g.
      `it`, `it-IT`, `it-CH`, case-insensitive) and no stored preference,
      the site displays Italian after client reconciliation.
- [ ] On first visit with any non-Italian `navigator.language` and no
      stored preference, the site displays English.
- [ ] After an auto-detected (not manually chosen) visit, **no** `lang`
      value is written to `localStorage` (`lightstimulus.lang` remains
      absent).
- [ ] With no stored preference, changing the OS/browser language between
      visits changes the displayed language on the next visit accordingly
      (detection re-runs every time).
- [ ] Clicking `LanguageToggle` persists the chosen language to
      `localStorage` via `PreferencesService.setPref('lang', ...)`.
- [ ] Once a preference is stored, every subsequent visit uses the stored
      value and detection does **not** run or override it — regardless of
      `navigator.language`.
- [ ] A manual toggle always persists the resulting value (no "revert to
      auto" behavior); toggling back to the auto-detected language still
      results in a stored, pinned preference.
- [ ] SSR / static export output renders English as the default; there is
      no React hydration mismatch error.
- [ ] The eager first-visit `setPref('lang', 'en')` write is removed.
- [ ] Detection and persistence logic lives in
      `contexts/LanguageContext.tsx`; `PreferencesService` keeps its
      current `getPref`/`setPref` API unchanged.

## Edge Cases & Error Handling

- **`navigator.language` undefined/empty** (rare/exotic environments):
  fall back to English.
- **`navigator` unavailable during SSR:** detection only runs client-side
  (inside `useEffect` after mount); server render uses the English
  default.
- **`localStorage` unavailable / access throws** (privacy mode, disabled
  storage): `PreferencesService` already guards on `window`; treat a
  read failure as "no stored preference" and fall back to detection, and
  treat a write failure gracefully without crashing the toggle.
- **Stored value is an unexpected/legacy string** (e.g. previously
  auto-persisted `'en'`, or a corrupt value): if it is not a valid
  `'en' | 'it'`, ignore it and re-detect. Note: users who visited under
  the old behavior may already have `lang='en'` stored, which will now be
  honored as a "manual" choice — see Notes.
- **Multi-region Italian locales** (`it-IT`, `it-CH`, `it-SM`): the
  `startsWith('it')` check (case-insensitive) covers all of them.

## Dependencies & Constraints

- Must remain fully client-side; no server-side routing or Next.js
  built-in i18n (static export constraint).
- No language-specific URLs (`/en/*`, `/it/*`).
- Detection uses `navigator.language` only (not the `navigator.languages[]`
  array).
- English remains the SSR-rendered default to keep hydration safe.
- Reuses the existing `lightstimulus.lang` `localStorage` key and the
  existing `PreferencesService` API.

## Out of Scope

- Adding a pre-hydration inline `<script>` to suppress the first-paint
  flash (explicitly deferred; the brief flash is accepted).
- Extending `PreferencesService` with new keys or helpers.
- Checking the `navigator.languages[]` array for a secondary Italian
  preference.
- Adding new languages beyond EN/IT.
- Changing the visual design or behavior of `LanguageToggle` beyond its
  existing toggle action.
- Any migration UI for users who already have a legacy stored `lang`
  value.

## Notes

- **Legacy stored values:** users who visited before this change will have
  `lightstimulus.lang='en'` already persisted from the old eager-write
  behavior. Under the new logic that value will be treated as a manual
  choice and pinned to English, so those returning users will _not_ get
  auto-detected. This is considered acceptable for now (no migration in
  scope), but flagged for awareness.
- Detection model chosen: a single `localStorage` key that is written
  **only** on manual toggle. Absence of the key means "no manual choice
  yet" and triggers re-detection each visit — no separate `source` flag.
- Relevant files: `contexts/LanguageContext.tsx`,
  `components/common/LanguageToggle.tsx`,
  `lib/preferences/PreferencesService.ts`, `locales/en.json`,
  `locales/it.json`.
