# Resume Page with HTML Experience Timeline

| Field       | Value                                                    |
| ----------- | -------------------------------------------------------- |
| **Title**   | Resume Page with HTML Experience Timeline                |
| **Type**    | feature                                                  |
| **Scope**   | `/resume` route, Author content model, resume components |
| **Created** | 2026-08-24 00:00:00                                      |
| **Status**  | IMPLEMENTED                                              |

## Problem Statement

Professional experience is currently only available as a downloadable PDF at
`/static/cv/cv.pdf`. That asset is not indexable, not shareable as a URL, not
bilingual, and not readable on mobile without pinch-zoom. Visitors who want to
understand the career history — recruiters, collaborators, conference
organisers — must download a file to get information that should be a web page.

There is also a concrete broken link in the codebase today. `CVDownloadCard`
renders an unconditional pointer to `/resume` (label `about.cv.resume_link`,
"View full experience" / "Vedi esperienza completa") and
`CVDownloadCard.test.tsx` asserts `href === '/resume'`. Because
`app/resume/page.tsx` does not exist, that link 404s in production. This spec
closes that gap.

## Current Behavior

- `app/resume/` does not exist; navigating to `/resume` yields a 404.
- `/about` links to `/resume` from `CVDownloadCard`, so the 404 is reachable
  through normal navigation.
- `data/authors/default.mdx` frontmatter carries `focusAreas`, `exploringNow`,
  `certifications`, and `cv`, but no structured work history or education.
- The `Authors` document type in `contentlayer.config.ts` has no `experience`
  or `education` fields.
- Career history exists only as prose in the author bio body and inside the CV
  PDF.

## Desired Outcome

A dedicated, statically exported `/resume` page that presents work history as
an HTML vertical timeline and education as a companion section, both driven by
new bilingual frontmatter arrays on the Author document. The page is fully
bilingual EN/IT, matches the site's glassmorphism / OKLCH teal-amber design
language, animates with Motion consistent with the existing about components,
keeps the existing PDF available as a download, and is indexable and shareable
with page metadata plus JSON-LD.

### Data model

Two new frontmatter arrays on `data/authors/default.mdx`, with matching field
definitions added to the `Authors` document type in `contentlayer.config.ts`.
Both follow the established convention visible in `focusAreas[]`: prose fields
are bilingual `{ en, it }` objects, while language-neutral facts (proper nouns,
dates) stay plain scalars.

`experience[]` entry shape:

| Field        | Type                 | Required | Notes                                            |
| ------------ | -------------------- | -------- | ------------------------------------------------ |
| `id`         | string               | yes      | Stable kebab-case key for React keys and anchors |
| `role`       | `{ en, it }`         | yes      | Job title                                        |
| `company`    | string               | yes      | Proper noun, not translated                      |
| `location`   | `{ en, it }`         | no       | e.g. "Milan, Italy" / "Milano, Italia"           |
| `startDate`  | string `YYYY-MM`     | yes      | ISO-like partial date                            |
| `endDate`    | string `YYYY-MM`     | no       | Omitted means the role is current                |
| `highlights` | list of `{ en, it }` | no       | Achievement bullets                              |
| `stack`      | list of string       | no       | Language-neutral technology names                |
| `url`        | string               | no       | Company or project link                          |

`education[]` entry shape:

| Field         | Type             | Required | Notes                                 |
| ------------- | ---------------- | -------- | ------------------------------------- |
| `id`          | string           | yes      | Stable kebab-case key                 |
| `degree`      | `{ en, it }`     | yes      | Qualification title                   |
| `institution` | string           | yes      | Proper noun, not translated           |
| `location`    | `{ en, it }`     | no       |                                       |
| `startDate`   | string `YYYY-MM` | no       |                                       |
| `endDate`     | string `YYYY-MM` | no       | Graduation / completion               |
| `notes`       | `{ en, it }`     | no       | Thesis topic, honours, specialisation |

Because Contentlayer2 `list of json` fields do not deeply validate nested
shapes, the rendering components own runtime tolerance for missing optional
fields (see Edge Cases).

Real career content is authored during implementation, not fixed by this spec.
Implementation must land at least two representative `experience[]` entries
(one current with `endDate` omitted, one past) and at least one `education[]`
entry, so that both the current-role and completed-role rendering paths are
exercised by real data.

### Page composition

`app/resume/page.tsx` — a server component reading `allAuthors` and finding the
`default` author, mirroring the structure of `app/about/page.tsx` (wrapped in
`SectionContainer`, single owner of vertical rhythm via a `flex flex-col gap-*`
container so that `null`-returning sections collapse cleanly).

Sections, in order:

1. **Header** — `h1` page title, name, occupation, company, and the CV download
   action reusing the existing `cv.url` frontmatter value.
2. **Experience timeline** — the `experience[]` entries.
3. **Education** — the `education[]` entries.

Certifications are deliberately not repeated here; they remain exclusively on
`/about` to avoid duplicate indexable content across two pages.

### Timeline visual style

A single left-hand vertical rail with a dot marker per entry and a
glassmorphism card to the right of each marker. The same layout applies at all
breakpoints, with tighter spacing on small screens rather than a structural
change. Cards reuse the established treatment from `FocusAreas` /
`CVDownloadCard`: `glass-bg rounded-xl border border-white/20 ... backdrop-blur`
with a `dark:border-white/10` counterpart, and a Motion hover lift
(`whileHover={{ y: -3 }}` with the existing spring settings).

The rail and markers are presentational only; the underlying markup is a
semantic list so that screen readers and search engines receive an ordered set
of roles rather than decorative divs.

### Bilingual behaviour

Section headings, the "Present" label for current roles, date formatting, and
the download action label come from `locales/en.json` and `locales/it.json`
under a new `resume.*` namespace, consumed through
`useLanguage()` / `t()`. Entry content itself comes from the frontmatter
`{ en, it }` objects, indexed by the active `lang` exactly as `FocusAreas`
does. Switching language updates the page without a reload and without
remounting into a broken state.

### SEO

- `metadata` via `genPageMetadata()` with `title`, a description, and
  `slug: 'resume'` so the canonical/OG URL resolves correctly.
- JSON-LD injected via a `<script type="application/ld+json">` tag, following
  the pattern in `app/projects/[slug]/page.tsx`: a `ProfilePage` whose
  `mainEntity` is a `Person` carrying `name`, `jobTitle`, `url`, `sameAs`
  (LinkedIn, GitHub), `hasOccupation` derived from `experience[]`, and
  `alumniOf` derived from `education[]`.
- The page is statically exported and indexable — no `noindex`, no
  client-only rendering of the primary content.

## Acceptance Criteria

- [ ] `app/resume/page.tsx` exists and `/resume` renders successfully under
      `next build` with static export (no dynamic-server errors).
- [ ] The existing `/about` → `/resume` link from `CVDownloadCard` resolves to
      a real page instead of a 404, with no change required to
      `CVDownloadCard` itself.
- [ ] `contentlayer.config.ts` defines `experience` on the `Authors` document
      type as a `list of json` with the fields specified above, defaulting to
      `[]`.
- [ ] `contentlayer.config.ts` defines `education` on the `Authors` document
      type as a `list of json` with the fields specified above, defaulting to
      `[]`.
- [ ] `data/authors/default.mdx` frontmatter contains an `experience[]` array
      with at least two entries — at least one current role with `endDate`
      omitted and at least one completed role — each with EN and IT values for
      every bilingual field.
- [ ] `data/authors/default.mdx` frontmatter contains an `education[]` array
      with at least one fully populated bilingual entry.
- [ ] The experience timeline renders one entry per `experience[]` item, in
      reverse-chronological order by `startDate` (most recent first),
      regardless of the order in the frontmatter.
- [ ] Each timeline entry displays role, company, formatted date range, and
      its highlights; `location`, `stack`, and `url` render only when present.
- [ ] A role with no `endDate` renders a localised "Present" / "Oggi" end
      label rather than an empty or `undefined` value.
- [ ] The education section renders one entry per `education[]` item in
      reverse-chronological order, showing degree, institution, and date range.
- [ ] The CV PDF remains downloadable from `/resume` using the existing
      `cv.url` frontmatter value, with the `BASE_PATH` prefix applied as
      `CVDownloadCard` does.
- [ ] Switching language via the header toggle updates every translatable
      string on the page — headings, date labels, roles, highlights, education
      entries — with no untranslated leftovers and no full page reload.
- [ ] All new user-facing UI strings live under a `resume.*` namespace in both
      `locales/en.json` and `locales/it.json`, with identical key sets in both
      files (as enforced by the existing `locales/locales.test.ts` parity
      checks).
- [ ] The page exports `metadata` produced by `genPageMetadata()` including
      `slug: 'resume'`.
- [ ] The page emits a valid JSON-LD `ProfilePage` with a `Person`
      `mainEntity`, whose `hasOccupation` reflects `experience[]` and whose
      `alumniOf` reflects `education[]`.
- [ ] Timeline entries are marked up as a semantic list, and the rail, dots,
      and other purely decorative elements are hidden from assistive
      technology.
- [ ] Heading hierarchy is correct and gap-free: a single `h1`, section `h2`s,
      and entry-level `h3`s — consistent with the convention asserted in
      `components/about/aboutHeadingHierarchy.test.tsx`.
- [ ] Date-range formatting and reverse-chronological sorting live in a pure,
      framework-free helper module (in the spirit of
      `components/about/certificationGrouping.ts`) with direct unit tests.
- [ ] Component-level tests cover: entry rendering, EN and IT output, current
      vs. completed roles, sort order, and omission of absent optional fields.
- [ ] Motion hover animations respect `prefers-reduced-motion`.
- [ ] The full existing test suite, lint, and type-check pass.

## Edge Cases & Error Handling

- **`experience[]` empty or absent**: the timeline section returns `null` and
  the surrounding rhythm container collapses the gap; the page still renders
  its header and CV download rather than erroring.
- **`education[]` empty or absent**: the education section returns `null` with
  no residual heading or empty rail.
- **Author document missing**: the page returns `null` (matching
  `app/about/page.tsx`) rather than throwing during static export.
- **`cv.url` missing**: the download action is omitted while the rest of the
  page renders — the same degradation `CVDownloadCard` already implements.
- **Entry with no `highlights`**: the card renders role, company, and dates
  with no empty bullet list.
- **Entry with no `endDate`**: treated as the current role and labelled
  "Present" / "Oggi"; it must sort ahead of dated entries with earlier
  `startDate` values.
- **Malformed or unparseable `startDate` / `endDate`**: the entry still
  renders with the raw string rather than `NaN`, `Invalid Date`, or a thrown
  error, and is sorted last rather than corrupting the ordering of valid
  entries.
- **Two entries sharing the same `startDate`**: ordering is deterministic
  (stable tiebreak, e.g. by company then role) so static output does not churn
  between builds.
- **Missing `it` translation on a bilingual field**: falls back to the `en`
  value rather than rendering `undefined`.
- **Very long role, company, or highlight text**: wraps without overflowing
  the glass card or breaking the rail alignment.
- **`url` present but external**: opens safely (`rel` set appropriately) and
  is keyboard focusable with a visible focus ring, consistent with existing
  link treatments.
- **Duplicate or missing `id` values**: rendering must not rely solely on `id`
  for React keys in a way that breaks on duplicates.

## Dependencies & Constraints

- **Next.js 15 App Router with static export** — the page must be fully
  prerenderable. No request-time APIs; interactive pieces are client
  components marked `'use client'`, as `FocusAreas` and `CVDownloadCard` are.
- **Contentlayer2** — schema changes require a regenerated
  `contentlayer/generated`. `list of json` fields do not deeply validate
  nested object shapes, so components must tolerate partial data at runtime.
- **`contentlayer.config.ts` `onSuccess`** calls `createSearchIndex(...)` with
  `allAuthors`; adding fields must not break search index generation.
- **Bilingual system** — `contexts/LanguageContext.tsx` plus
  `locales/{en,it}.json`; `locales/locales.test.ts` enforces key parity
  between the two files.
- **Design system** — glassmorphism utilities (`glass-bg`), OKLCH teal/amber
  tokens (`--color-primary-500`, `--color-secondary-500`,
  `text-accent-primary`), and `motion/react` for animation.
- **`BASE_PATH`** must be honoured for the PDF href and any other static asset
  references.
- **`genPageMetadata()`** in `app/seo.tsx` is the single source of page
  metadata; do not hand-roll a `Metadata` object.
- **Existing tests** — `CVDownloadCard.test.tsx` and `app/about/page.test.tsx`
  already assert the `/resume` link and must keep passing unchanged.

## Out of Scope

- Generating or regenerating the CV PDF, or deriving the PDF from the HTML
  timeline (or vice versa). The existing `/static/cv/cv.pdf` is reused as-is.
- Rendering certifications on `/resume`; they stay on `/about`.
- Adding `/resume` to the site header navigation. The `/about` → `/resume`
  link remains the entry point.
- Print-specific stylesheets or a print-optimised layout.
- Redesigning, restructuring, or otherwise modifying the `/about` page or its
  components beyond what is strictly required to keep existing tests green.
- Localised URL routing (e.g. `/it/resume`); language remains a client-side
  toggle over a single route, consistent with the rest of the site.
- Filtering, searching, collapsing, or paginating timeline entries.
- Moving the author bio prose out of the MDX body into frontmatter.
- Authoring the definitive final career content; implementation lands
  representative real entries, and later content edits are ordinary
  frontmatter changes needing no code change.

## Notes

- The initial request described `certifications[]` as the bilingual pattern to
  mirror. On inspection, `certifications[]` is **not** bilingual — its fields
  are plain strings, because certification titles and issuers are
  language-neutral proper nouns. The genuine bilingual list patterns are
  `focusAreas[]` (`title`/`description` as `{ en, it }`) and `exploringNow[]`
  (`{ id, en, it }`). This spec therefore mirrors `focusAreas[]` for prose and
  keeps `certifications[]`-style plain strings for proper nouns and dates.
- `certificationGrouping.ts` is the reference for the "pure, framework-free,
  directly unit-tested helper" convention that the date-formatting and sorting
  logic should follow.
- `components/about/` holds the analogous components for `/about`; a parallel
  `components/resume/` directory keeps the same organisational convention,
  though the exact component split is an implementation decision.
- `endDate` omission (rather than a sentinel value such as `"present"`) is the
  chosen encoding for a current role, so date parsing never has to special-case
  a magic string.
- Open question for implementation: whether the header block on `/resume`
  should reuse `AboutProfile` directly or use a leaner resume-specific header.
  Reuse is preferable if it does not force `AboutProfile` to grow variant
  props.
