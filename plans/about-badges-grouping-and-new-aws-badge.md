# Plan: About Page — Badge Grouping, Grouping Toggle & New AWS Badge

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| **Title**   | About Page — Badge Grouping, Grouping Toggle & New AWS Badge |
| **Spec**    | specs/about-badges-grouping-and-new-aws-badge.md             |
| **Type**    | feature                                                      |
| **Branch**  | feat/about-badges-grouping-and-new-aws-badge                 |
| **Created** | 2026-07-28 00:00:00                                          |
| **Status**  | IMPLEMENTED                                                  |

## Context

The about page "Certifications & Credentials" section renders badges as a
flat, source-ordered grid with no organisation, and the badge data model
only stores an integer `year` (no full issue/expiry dates). This plan adds
issue/expiry date fields, a grouping capability (by year — default — or by
issuer) with an accessible, localised, persisted segmented toggle, expiry
display on cards, and a newly earned AWS certification badge.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/about-badges-grouping-and-new-aws-badge`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/about-badges-grouping-and-new-aws-badge
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

| Action          | Command                   |
| --------------- | ------------------------- |
| Build           | `npm run build`           |
| Lint            | `npm run lint`            |
| Compress images | `npm run compress-images` |

> Note: this project has **no automated test framework** (no jest/vitest,
> no `test` script in `package.json`). Verification is manual — via
> `npm run build`, `npm run lint`, and dev-server visual/keyboard/a11y
> checks. Each task's "Tests" section therefore describes manual
> verification, not automated test files.

## Tasks

### Task 1: Extend the certification data model with issue/expiry dates `[S]`

**Goal**: Allow badges to carry an optional full issue date and expiry
date in both the Contentlayer schema and the component's TS type.

**Files**:

| File                                      | Action | Description                                                                                           |
| ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `contentlayer.config.ts`                  | modify | Add `issueDate` and `expiryDate` optional string fields to the `certifications` JSON field definition |
| `components/about/CertificationsGrid.tsx` | modify | Add `issueDate?: string` and `expiryDate?: string` to the `Certification` type                        |

**Reuse**:

| File                                     | What to reuse                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `contentlayer.config.ts` (lines 179–192) | Existing `certifications` list/JSON field shape; add fields alongside `year`, `image`, `url` |

**Steps**:

1. In `contentlayer.config.ts`, inside the `certifications` field's
   `of.fields`, add `issueDate: { type: 'string' }` and
   `expiryDate: { type: 'string' }` (both optional, ISO `YYYY-MM-DD`).
2. In `CertificationsGrid.tsx`, extend the `Certification` type with the
   two optional fields so downstream code is typed.
3. Keep everything else unchanged — new fields are optional so existing
   badges validate as before.

**Tests**:

- Run `npm run build`; Contentlayer regenerates types without error and
  existing badges still validate.

**Acceptance criteria covered**: Data model (schema gains optional date
fields; TS type extended; existing badges unchanged).

**Commit**: `feat(about): add issue/expiry date fields to certification model`

---

### Task 2: Add the new AWS ML Engineer badge image and compress it `[S]`

**Goal**: Place the new badge PNG in the certifications image folder and
generate its compressed + responsive/webp variants.

**Files**:

| File                                                                                                            | Action | Description                           |
| --------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------- |
| `public/static/images/certifications/aws-certified-machine-learning-engineer-associate.png`                     | create | Copy of the source badge image        |
| `public/static/images/certifications/responsive/aws-certified-machine-learning-engineer-associate-*.{png,webp}` | create | Generated by the compress script      |
| `public/static/images/original-backups/...`                                                                     | create | Backup created by the compress script |

**Reuse**:

| File                          | What to reuse                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `scripts/compress-images.mjs` | Existing idempotent compression + responsive/webp variant generator (144w/200w thumbnails for badges) |

**Steps**:

1. Copy `/Users/davide/Downloads/aws-certified-machine-learning-engineer-associate.png`
   into `public/static/images/certifications/` with the exact filename
   `aws-certified-machine-learning-engineer-associate.png`.
2. Run `npm run compress-images`. The script backs up the original,
   compresses the main image, and generates responsive + webp variants
   (including 144w/200w thumbnails). It skips already-processed images, so
   existing badges are untouched.
3. Confirm the `responsive/` variants for the new badge were created.

**Tests**:

- Verify the file exists at the target path and that
  `responsive/aws-certified-machine-learning-engineer-associate-144w.webp`
  (and other widths) were generated.
- Re-running the script is a no-op for existing badges (idempotency).

**Acceptance criteria covered**: New badge — image placed at target path;
`npm run compress-images` run to produce compressed + responsive variants.

**Commit**: `chore(about): add and compress AWS ML Engineer badge image`

---

### Task 3: Add the new badge entry to the author data `[S]`

**Goal**: Register the new AWS ML Engineer badge in the author frontmatter
with full issue/expiry dates.

**Files**:

| File                       | Action | Description                            |
| -------------------------- | ------ | -------------------------------------- |
| `data/authors/default.mdx` | modify | Add a new `certifications:` list entry |

**Reuse**:

| File                                      | What to reuse                                |
| ----------------------------------------- | -------------------------------------------- |
| `data/authors/default.mdx` (lines 56–101) | Existing YAML entry shape for certifications |

**Steps**:

1. Add a new entry to the `certifications:` list:
   - `title: AWS Certified Machine Learning Engineer – Associate`
   - `issuer: Amazon Web Services` (shortened, matching existing AWS entries)
   - `year: 2026`
   - `issueDate: '2026-04-21'`
   - `expiryDate: '2029-04-21'`
   - `image: /static/images/certifications/aws-certified-machine-learning-engineer-associate.png`
   - no `url` (none provided)
2. Match existing YAML indentation/spacing style exactly.

**Tests**:

- Run `npm run build`; the badge appears in the section and the entry
  validates against the extended schema (Task 1).

**Acceptance criteria covered**: New badge — data entry added with title,
issuer, year, issue/expiry dates, image, and no url.

**Commit**: `feat(about): add AWS ML Engineer certification entry`

---

### Task 4: Extend PreferencesService to support the grouping preference `[S]`

**Goal**: Allow the badge grouping choice to be persisted via the existing
localStorage preferences service, safely (SSR/no-op guarded).

**Files**:

| File                                    | Action | Description                                         |
| --------------------------------------- | ------ | --------------------------------------------------- |
| `lib/preferences/PreferencesService.ts` | modify | Add a `'certGrouping'` key to the allowed pref keys |

**Reuse**:

| File                                    | What to reuse                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `lib/preferences/PreferencesService.ts` | Existing `getPref`/`setPref` with `lightstimulus.` namespace and `typeof window` SSR guards |

**Steps**:

1. Widen the key union type in `getPref`/`setPref` from
   `'theme' | 'lang'` to `'theme' | 'lang' | 'certGrouping'`.
2. No behavioural change otherwise — the existing namespacing and
   server-side no-op guards cover the `localStorage` unavailable edge case.

**Tests**:

- Type-check via `npm run build`. Manually confirm setting/getting the new
  key round-trips in the browser.

**Acceptance criteria covered**: Grouping persistence (foundation);
`localStorage` unavailable edge case (SSR guard preserved).

**Commit**: `feat(preferences): support certGrouping preference key`

---

### Task 5: Add grouping/sorting logic and grouping utility `[M]`

**Goal**: Implement pure functions that group badges by year or by issuer,
with deterministic within-group ordering and group ordering, handling
missing years gracefully.

**Files**:

| File                                        | Action | Description                                                                                   |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `components/about/certificationGrouping.ts` | create | Pure helper: `groupCertifications(items, mode)` returning ordered groups with labels + counts |

**Reuse**:

| File                                      | What to reuse                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `components/about/CertificationsGrid.tsx` | The `Certification` type (import it, or move the type into the helper and re-export) |

**Steps**:

1. Create a helper module exporting a `GroupingMode = 'year' | 'issuer'`
   type and a `groupCertifications(items, mode)` function.
2. **By year**: bucket by `year`; order groups by year descending (newest
   first). Badges with no year fall into a trailing "Other"/"Undated"
   bucket placed last.
3. **By issuer**: bucket by `issuer`; order issuer groups alphabetically.
4. **Within a group**: deterministic sort — for year mode, sort by issuer
   then title; for issuer mode, sort by year descending then title.
5. Each returned group carries a stable `key`, a display `label`, and a
   `count`.
6. Keep this module pure and framework-free so it is trivially testable
   and reusable.

**Tests**:

- Manual: verify with the real 9-badge dataset that year mode yields
  2026/2025/2024/2019/2018 groups (newest first) and issuer mode yields
  Amazon Web Services / AXELOS / IBM / Scrum.org (alphabetical), with
  correct counts and stable ordering.

**Acceptance criteria covered**: Grouping (year default order, issuer
mode), deterministic within-group ordering, per-group counts; missing-year
edge case (Other bucket last).

**Commit**: `feat(about): add certification grouping/sorting helper`

---

### Task 6: Add localisation strings for the toggle and expiry labels `[S]`

**Goal**: Provide EN + IT strings for the grouping toggle and expiry
labels.

**Files**:

| File              | Action | Description                                                 |
| ----------------- | ------ | ----------------------------------------------------------- |
| `locales/en.json` | modify | Add keys under `about.certifications` for grouping + expiry |
| `locales/it.json` | modify | Same keys, Italian values                                   |

**Reuse**:

| File                                                           | What to reuse                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| `locales/en.json` / `locales/it.json` (`about.certifications`) | Existing nested key block (`title`, `view`) — add siblings |

**Steps**:

1. Under `about.certifications`, add e.g.:
   - `groupBy` → "Group by" / "Raggruppa per"
   - `byYear` → "Year" / "Anno"
   - `byIssuer` → "Issuer" / "Emittente"
   - `expires` → "Expires" / "Scade" (used with a formatted date)
   - `expired` → "Expired" / "Scaduto"
2. Keep JSON valid and consistently ordered in both files.

**Tests**:

- Manual: switch language in the UI and confirm the new strings render in
  both EN and IT.

**Acceptance criteria covered**: Localisation (toggle + expiry labels in
EN and IT).

**Commit**: `feat(i18n): add certification grouping and expiry labels`

---

### Task 7: Build the accessible grouping toggle and render grouped badges `[M]`

**Goal**: Add the segmented Year/Issuer toggle to `CertificationsGrid`,
persist the choice, render badges under group headings with counts, and
keep it accessible.

**Files**:

| File                                      | Action | Description                                                      |
| ----------------------------------------- | ------ | ---------------------------------------------------------------- |
| `components/about/CertificationsGrid.tsx` | modify | Add grouping state + toggle UI + grouped rendering with headings |

**Reuse**:

| File                                        | What to reuse                                                         |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `components/about/certificationGrouping.ts` | `groupCertifications` + `GroupingMode` (Task 5)                       |
| `lib/preferences/PreferencesService.ts`     | `getPref`/`setPref` with `'certGrouping'` (Task 4)                    |
| `contexts/LanguageContext` (`useLanguage`)  | `t()` for the new toggle labels (Task 6)                              |
| Existing markup in `CertificationsGrid.tsx` | Gradient heading, `glass-bg` card, `motion/react` hover, grid classes |

**Steps**:

1. Introduce `groupingMode` state defaulting to `'year'`; in a
   `useEffect`, hydrate from `PreferencesService.getPref('certGrouping')`
   (falls back to `'year'` when absent/unavailable — covers SSR &
   localStorage-off edge cases). On change, call `setPref`.
2. Add a segmented toggle beside the section heading with two options
   ("Year" | "Issuer") using localised labels. Implement radiogroup
   semantics: container `role="radiogroup"` with `aria-label` (from
   `groupBy`), each option `role="radio"` with `aria-checked`, keyboard
   operable (arrow keys / Enter/Space), visible focus ring. Match the
   glass/gradient aesthetic with Tailwind classes.
3. Compute groups via `groupCertifications(items, groupingMode)` and render
   each group: a heading showing the label + count (e.g. `2026 (3)`),
   followed by the existing responsive card grid for that group's items.
4. Preserve existing card internals (image, title, `issuer · year`, "View
   credential" link). Keep the `if (!items.length) return null` guard so an
   empty list renders nothing (no toggle/headings).
5. Wrap the grouped list in an `aria-live="polite"` region (or set
   `aria-live` on the list container) so grouping changes are announced.

**Tests**:

- Manual: default view is grouped by year, newest first; toggling to
  Issuer regroups; reload preserves the last choice; keyboard navigation
  works; screen reader announces changes; empty list renders nothing.

**Acceptance criteria covered**: Grouping default/toggle/issuer view,
per-group counts, persistence, accessibility (radiogroup + keyboard +
aria-live), empty-list edge case.

**Commit**: `feat(about): add year/issuer grouping toggle to certifications`

---

### Task 8: Display expiry status on badge cards `[S]`

**Goal**: Show an expiry label on cards that have an `expiryDate`, marking
expired credentials.

**Files**:

| File                                      | Action | Description                                      |
| ----------------------------------------- | ------ | ------------------------------------------------ |
| `components/about/CertificationsGrid.tsx` | modify | Render "Expires <Mon YYYY>" / "Expired" per card |

**Reuse**:

| File                                             | What to reuse                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `contexts/LanguageContext` (`useLanguage`)       | `t('about.certifications.expires' / 'expired')` + `lang` for date formatting |
| Existing card layout in `CertificationsGrid.tsx` | Card body where `issuer · year` is shown                                     |

**Steps**:

1. For cards with `expiryDate`, format the date to a short "Mon YYYY" using
   `Intl.DateTimeFormat` keyed off the active `lang` (en/it).
2. If `expiryDate` is in the past, render an "Expired" pill; otherwise
   render an "Expires <Mon YYYY>" label. Define the boundary rule: a
   credential is "expired" only strictly after its expiry date (expiry
   date == today is still valid) — apply consistently.
3. Cards without `expiryDate` render exactly as today (no label).
4. Style the pill/label subtly to match the card aesthetic (small text,
   muted/`text-secondary`; the expired pill visually distinct).

**Tests**:

- Manual: the new AWS badge shows "Expires Apr 2029"; badges without an
  expiry show no label; temporarily setting a past expiry shows the
  "Expired" pill.

**Acceptance criteria covered**: Expiry display (label when expiry exists,
expired indicator when past, no label when absent); expiry-boundary edge
case.

**Commit**: `feat(about): show certification expiry status on cards`

---

**Task ordering**: Task 1 → 2 → 3 build the data foundation (Task 3 depends
on 1 for schema and 2 for the image path). Task 4, 5, and 6 are independent
of each other and can proceed in any order after Task 1. Task 7 depends on
Tasks 4, 5, and 6. Task 8 depends on Task 1 (dates) and Task 6 (labels) and
touches the same component as Task 7 (do 7 then 8 to avoid conflicts).

## Edge Cases & Error Handling

- **Badge with no year/date**: `groupCertifications` places it in a
  trailing "Other" bucket; never crashes (Task 5).
- **Issuer name variants**: new badge uses shortened `Amazon Web Services`
  so all AWS badges share one issuer group (Task 3).
- **Empty certifications list**: `CertificationsGrid` still returns `null`;
  no toggle or headings render (Task 7).
- **`localStorage` unavailable / SSR**: `PreferencesService` no-ops
  server-side and grouping falls back to the `'year'` default (Tasks 4, 7).
- **Compress script idempotency**: existing badges already have backups and
  are skipped; only the new image is processed (Task 2).
- **Expiry exactly today**: treated as still valid; "Expired" only strictly
  after the expiry date (Task 8).

## Verification

1. `npm run build` succeeds (Contentlayer regenerates types; new badge
   validates; component compiles).
2. `npm run lint` passes.
3. Confirm the new badge image and its `responsive/` variants exist and the
   compress script is idempotent for existing badges.
4. In the dev server on the about page: default grouping is by year
   (newest first) with per-group counts; toggling to Issuer regroups
   correctly; the choice persists across reload; the toggle is keyboard
   operable with visible focus and announces changes to assistive tech.
5. The new AWS ML Engineer badge renders with "Expires Apr 2029"; badges
   without an expiry show no label; both EN and IT strings render when
   switching language.
