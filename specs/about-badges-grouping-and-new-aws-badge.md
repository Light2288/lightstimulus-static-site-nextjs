# About Page — Badge Grouping, Grouping Toggle & New AWS Badge

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| **Title**   | About Page — Badge Grouping, Grouping Toggle & New AWS Badge |
| **Type**    | feature                                                      |
| **Scope**   | About page "Certifications & Credentials" section            |
| **Created** | 2026-07-28 00:00:00                                          |
| **Status**  | IMPLEMENTED                                                  |

## Problem Statement

The "Certifications & Credentials" section on the about page currently
renders all badges as a flat, source-ordered grid with no way to organise
or navigate them. As the number of badges grows, this becomes harder to
scan and gives no sense of either the credential timeline or the breadth
of issuers. Additionally, the badge data model only stores an integer
`year`, so it cannot represent full issue dates or expiry dates — which
some credentials (including a new AWS certification) carry.

This work introduces grouping (by year or by issuer), a user-facing
control to switch between the two groupings, a richer badge data model
that supports full issue/expiry dates, and adds a newly earned AWS badge.

## Current Behavior

- The about page (`app/about/page.tsx`) renders
  `<CertificationsGrid items={author.certifications ?? []} />`.
- `components/about/CertificationsGrid.tsx` (client component) maps the
  array directly into a responsive card grid
  (`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`), in the exact order the
  entries appear in the data — no sorting, grouping, or filtering.
- Badge data lives in the frontmatter of `data/authors/default.mdx` under
  the `certifications:` key, and is typed/validated by the Author document
  in `contentlayer.config.ts`.
- Each badge has: `title` (string, required), `issuer` (string, required),
  `year` (number, required), `image` (string, optional), `url` (string,
  optional). There is **no** full issue date and **no** expiry date.
- Section title and the "View credential →" link label are localised in
  `locales/en.json` and `locales/it.json` under `about.certifications.*`.
- Badge images live in `public/static/images/certifications/` (with
  generated responsive/webp variants under `.../responsive/`), rendered via
  the custom `@/components/Image` wrapper at `width={72} height={72}`.
- Image compression/variant generation is handled by
  `scripts/compress-images.mjs`, run via `npm run compress-images`.

## Desired Outcome

The Certifications & Credentials section:

1. **Groups badges by year (default) or by issuer.** The default view
   groups by year, newest year first, rendered under year headings.
2. **Provides a segmented toggle** (two options: "Year" | "Issuer") that
   lets the user switch the grouping. The chosen grouping is remembered
   across reloads/navigation via `localStorage`.
3. **Supports full issue and expiry dates** in the badge data model, and
   displays expiry status on cards where an expiry date exists.
4. **Includes a new badge:** AWS Certified Machine Learning Engineer –
   Associate, with the image compressed via the existing script.
5. Groups are deterministically sorted, show a count in their heading, and
   the toggle is accessible and localised (EN + IT).

## Acceptance Criteria

### Data model

- [ ] The Author `certifications` schema in `contentlayer.config.ts` gains
      two optional string fields for full dates (e.g. `issueDate` and
      `expiryDate`), in addition to the existing `year`.
- [ ] The `Certification` TypeScript type in
      `components/about/CertificationsGrid.tsx` is extended to match the
      new optional date fields.
- [ ] Existing badges continue to work unchanged (new fields are optional;
      absent dates render as before).

### New badge

- [ ] A new certification entry is added to the `certifications:` list in
      `data/authors/default.mdx` with: - `title`: `AWS Certified Machine Learning Engineer – Associate` - `issuer`: `Amazon Web Services` (shortened, matching existing AWS
      entries for consistency) - `year`: `2026` - issue date `2026-04-21` and expiry date `2029-04-21` in the new
      date fields - `image`:
      `/static/images/certifications/aws-certified-machine-learning-engineer-associate.png` - no `url` (none was provided)
- [ ] The source image at
      `/Users/davide/Downloads/aws-certified-machine-learning-engineer-associate.png`
      is placed at
      `public/static/images/certifications/aws-certified-machine-learning-engineer-associate.png`.
- [ ] `npm run compress-images` is run so the new badge gets compressed and
      its responsive/webp variants (including 144w/200w thumbnails) are
      generated.

### Grouping & toggle

- [ ] By default, badges are grouped by year with the newest year first;
      each year is rendered under a heading.
- [ ] A segmented toggle with exactly two options — "Year" and "Issuer" —
      lets the user switch grouping. Both options are always visible; one
      click switches.
- [ ] When grouped by issuer, badges are grouped under issuer headings.
- [ ] Within each group, ordering is deterministic (e.g. within a year,
      sorted alphabetically by issuer then title; within an issuer, sorted
      by year descending then title) rather than raw source order.
- [ ] Each group heading shows a count of badges in that group
      (e.g. `2026 (3)`).
- [ ] The chosen grouping persists in `localStorage` and is restored on
      subsequent visits/reloads.

### Accessibility

- [ ] The grouping toggle has appropriate ARIA semantics (radiogroup-style
      roles/labels) and is fully keyboard operable.
- [ ] The badge list conveys updates to assistive tech when the grouping
      changes (e.g. an `aria-live` region).

### Localisation

- [ ] New UI strings for the toggle are added to both `locales/en.json`
      and `locales/it.json` (e.g. "Group by" / "Raggruppa per",
      "Year" / "Anno", "Issuer" / "Emittente"), and expiry labels
      (e.g. "Expires" / "Scade", "Expired" / "Scaduto") where shown.

### Expiry display

- [ ] Cards for badges that have an expiry date show a small expiry label
      (e.g. "Expires Apr 2029").
- [ ] If a badge's expiry date is in the past, the card indicates it is
      expired (e.g. an "Expired" pill).
- [ ] Badges without an expiry date render without any expiry label
      (unchanged from today).

## Edge Cases & Error Handling

- **Badges with no `year`/date info:** Should not crash grouping; fall
  into a sensible bucket (e.g. an "Undated"/"Other" group placed last) or
  be handled gracefully — decide during implementation and keep it stable.
- **Multiple issuers with slightly different names** (e.g. "Amazon Web
  Services" vs "Amazon Web Services Training and Certification"): using the
  shortened `Amazon Web Services` for the new badge keeps all AWS badges in
  one issuer group.
- **Empty certifications list:** The component still returns `null`
  (current behaviour preserved) — no toggle/headings rendered.
- **`localStorage` unavailable** (private mode / SSR): grouping falls back
  to the default (by year) without throwing.
- **Compress script idempotency:** `compress-images.mjs` skips files that
  already have a backup; running it should only process the newly added
  image and leave existing badges untouched.
- **Expiry exactly today:** define whether "today" counts as expired;
  choose one consistent rule.

## Dependencies & Constraints

- Next.js App Router + Contentlayer (badge data is MDX frontmatter, not
  JSON/TS). Schema changes go in `contentlayer.config.ts`.
- Styling is Tailwind CSS v4 utility classes; the section uses a custom
  `glass-bg` class, gradient headings via CSS custom properties
  (`--color-primary-500` / `--color-secondary-500`), and `motion/react`
  for hover animation. New UI should match this aesthetic.
- i18n uses the custom `useLanguage()` hook / `LanguageContext`; all
  user-visible strings must be localised in EN and IT.
- Images render through `@/components/Image`; new badge images must be run
  through `npm run compress-images` (`scripts/compress-images.mjs`) to
  produce the 144w/200w thumbnails the 72px badges rely on.
- The grouping toggle and `localStorage` persistence require a client
  component (`CertificationsGrid` is already `'use client'`).

## Out of Scope

- Redesigning the overall card visual style beyond what's needed for
  grouping headings, the toggle, and the expiry label.
- Adding filtering or search over badges (only grouping + toggle here).
- Adding share/verify `url`s for badges that currently lack them.
- Backfilling full issue/expiry dates for existing badges (only the new
  AWS badge gets full dates; others keep `year` only unless trivially
  available).
- Any changes outside the about page badges section.

## Notes

- Default grouping decision: **by year, newest first** (reads as a
  credential timeline; most badges carry a meaningful year).
- Control decision: **segmented toggle** for the binary Year/Issuer choice
  (both options visible, one click, fits the aesthetic) — chosen over a
  dropdown (overkill for two options) or radios (bulkier).
- New badge source (as provided): "This badge was issued to Davide Aliti.
  Date issued: April 21, 2026. Expires: April 21, 2029. AWS Certified
  Machine Learning Engineer – Associate, issued by Amazon Web Services
  Training and Certification." Per user decision, the stored `issuer` is
  the shortened "Amazon Web Services".
- Relevant files: `app/about/page.tsx`,
  `components/about/CertificationsGrid.tsx`, `data/authors/default.mdx`,
  `contentlayer.config.ts`, `locales/en.json`, `locales/it.json`,
  `components/Image.tsx`, `scripts/compress-images.mjs`,
  `public/static/images/certifications/`.
