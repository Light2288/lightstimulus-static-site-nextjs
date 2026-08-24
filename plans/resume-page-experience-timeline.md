# Plan: Resume Page with HTML Experience Timeline

| Field       | Value                                     |
| ----------- | ----------------------------------------- |
| **Title**   | Resume Page with HTML Experience Timeline |
| **Spec**    | specs/resume-page-experience-timeline.md  |
| **Type**    | feature                                   |
| **Branch**  | `feat/resume-page-experience-timeline`    |
| **Created** | 2026-08-24 00:00:00                       |
| **Status**  | IMPLEMENTED                               |

## Context

Career history is currently locked inside `/static/cv/cv.pdf` — not indexable,
not shareable, not bilingual. Worse, `CVDownloadCard` already renders an
unconditional link to `/resume` (asserted in `CVDownloadCard.test.tsx`), but
`app/resume/page.tsx` does not exist, so that link 404s in production today.

This plan adds bilingual `experience[]` and `education[]` arrays to the Author
document, then builds a statically exported `/resume` page rendering them as a
left-rail glassmorphism timeline plus an education section, with the existing
PDF retained as a download, full EN/IT support, page metadata, and JSON-LD.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/resume-page-experience-timeline`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/resume-page-experience-timeline
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping:

- feature → `feat/<slug>`
- bug → `fix/<slug>`
- refactor → `refactor/<slug>`
- chore → `chore/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

| Action     | Command              |
| ---------- | -------------------- |
| Test       | `npm test`           |
| Test watch | `npm run test:watch` |
| Lint       | `npm run lint`       |
| Build      | `npm run build`      |

The project uses **npm**, not yarn: there is no `yarn.lock`, `package-lock.json`
is tracked, and `netlify.toml` builds with `npm ci && npm run build`. A stale
`"packageManager": "yarn@3.6.1"` field left over from the starter template made
`yarn` fail outright and risked Netlify selecting yarn at deploy time; it is
removed as part of Task 0.

Test runner is Vitest with `@testing-library/react`; tests live beside their
subject as `<Name>.test.tsx` / `<name>.test.ts`. Use `renderWithProviders` from
`test/renderWithProviders.tsx` (supports `{ locale: 'it' }`) for anything
consuming `LanguageContext`.

There is no separate type-check script; `npm run build` performs type checking.

## Architectural Decisions

Decisions taken during planning, resolving the spec's open questions:

1. **New `ResumeHeader` component**, not a reuse of `AboutProfile`.
   `AboutProfile` renders the name as an `h2` and hardcodes four
   `about.profile.highlights.*` bullets; reusing it would either break the
   `/resume` heading hierarchy or force variant props onto a component the
   spec puts out of scope for modification.

2. **Reduced motion needs no per-component work.** `css/tailwind.css`
   (lines 634–656) already carries a blanket
   `@media (prefers-reduced-motion: reduce)` override that tames every
   animation and transition site-wide. Since the timeline uses only
   `whileHover={{ y: -3 }}` springs — the same pattern as `FocusAreas` — the
   existing safety net covers it. Task 7 verifies this rather than adding
   `useReducedMotion()` calls.

3. **Two pure helper modules**, mirroring `certificationGrouping.ts`:
   `resumeDates.ts` (parse/format/label) and `resumeSorting.ts` (ordering).
   Splitting them keeps each task S-sized and each helper single-purpose.

4. **Sitemap and search index are in scope** (Task 8). The spec requires the
   page be indexable; `app/sitemap.ts` and `lib/searchStaticPages.ts` both
   omit `/resume` today, so without this the requirement is only half met.

5. **`components/resume/` directory** parallels `components/about/`.

## Tasks

### Task 0: Remove the stale yarn `packageManager` field `[S]`

**Goal**: Stop `yarn` from being selected as the package manager, locally and on
Netlify, since the project is actually npm-based.

**Files**:

| File           | Action | Description                             |
| -------------- | ------ | --------------------------------------- |
| `package.json` | modify | Remove `"packageManager": "yarn@3.6.1"` |

**Steps**:

1. Delete the `packageManager` field. Evidence it is stale: no `yarn.lock`
   exists, `package-lock.json` is tracked, `netlify.toml` runs
   `npm ci && npm run build`, and `yarn test` fails with a lockfile error.
2. Confirm `npm test` still passes.

**Tests**: No new tests — this is build configuration. Verified by the existing
suite continuing to pass and by `npm run build` succeeding.

**Commit**: `chore(build): remove stale yarn packageManager field`

---

### Task 1: Extend the Author content model with `experience[]` and `education[]` `[S]`

**Goal**: Teach Contentlayer about the two new frontmatter arrays so the fields
reach `allAuthors` typed and defaulted.

**Files**:

| File                     | Action | Description                                            |
| ------------------------ | ------ | ------------------------------------------------------ |
| `contentlayer.config.ts` | modify | Add `experience` and `education` to the `Authors` type |

**Reuse**:

| File                     | What to reuse                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `contentlayer.config.ts` | `focusAreas` field definition — the `list of json` + nested `fields` + `default: []` pattern |
| `contentlayer.config.ts` | `certifications` — plain-string fields for language-neutral facts                            |

**Steps**:

1. In the `Authors` document type, after `certifications`, add an `experience`
   field: `type: 'list'`, `of: { type: 'json', fields: {...} }`,
   `default: []`. Nested fields per the spec table: `id` (string, required),
   `role` (json, required), `company` (string, required), `location` (json),
   `startDate` (string, required), `endDate` (string), `highlights`
   (list of json), `stack` (list of string), `url` (string).
2. Add an `education` field the same way: `id` (string, required), `degree`
   (json, required), `institution` (string, required), `location` (json),
   `startDate` (string), `endDate` (string), `notes` (json).
3. Add a short comment noting that `list of json` does not deeply validate
   nested shapes, so consumers must tolerate partial data at runtime.
4. Regenerate Contentlayer (`npm run build`, or `npm run dev` briefly) and confirm
   `.contentlayer/generated` picks up the fields with no schema warnings.

**Tests**:

- No dedicated unit test: this is declarative build-time schema. Coverage is
  indirect — Task 2's real data must parse, and `npm run build` must complete
  without Contentlayer validation errors.
- Confirm `createSearchIndex(...)` in the `onSuccess` hook still runs (it
  receives `allAuthors`); adding fields must not break index generation.

**Acceptance criteria covered**: `experience` defined as `list of json`
defaulting to `[]`; `education` defined likewise.

**Commit**: `feat(content): add experience and education fields to author schema`

---

### Task 2: Author the real experience and education frontmatter content `[S]`

**Goal**: Populate `data/authors/default.mdx` with representative bilingual
career data that exercises both the current-role and completed-role paths.

**Files**:

| File                       | Action | Description                                    |
| -------------------------- | ------ | ---------------------------------------------- |
| `data/authors/default.mdx` | modify | Add `experience:` and `education:` frontmatter |

**Reuse**:

| File                       | What to reuse                                             |
| -------------------------- | --------------------------------------------------------- |
| `data/authors/default.mdx` | `focusAreas` block — YAML shape for nested `en`/`it` keys |
| `data/authors/default.mdx` | Existing bio body (EN + IT) as the source of career facts |
| `/static/cv/cv.pdf`        | Reference for roles, dates, employers                     |

**Steps**:

1. Insert an `experience:` block after `certifications:` and before `cv:`.
2. Add at least two entries: the current IBM role with `endDate` **omitted**,
   and at least one earlier completed role with both dates. The bio mentions a
   progression from mobile/frontend developer into architecture and
   leadership — use that as the narrative spine.
3. For every entry provide both `en` and `it` for `role`, `location`, and each
   `highlights` item. Keep `company`, `stack`, `startDate`, `endDate`, and
   `url` as plain scalars.
4. Use kebab-case `id` values, unique across the array (e.g.
   `ibm-application-architect`).
5. Quote all `YYYY-MM` dates in YAML (`'2019-09'`) so they are not coerced
   into dates, matching how `issueDate` is already quoted.
6. Add an `education:` block with at least one fully populated bilingual entry.
7. Run `npm run build` (or `npm run dev`) and confirm the frontmatter parses.

**Tests**:

- No unit test (content, not code). Validated by Task 1's schema and by the
  page rendering in Task 6.
- Sanity-check the generated JSON in `.contentlayer/generated` to confirm
  nested `{ en, it }` objects survive parsing intact.

**Acceptance criteria covered**: `experience[]` with ≥2 entries including one
current and one completed, all bilingual fields populated; `education[]` with
≥1 fully populated bilingual entry.

**Commit**: `feat(content): add experience and education entries to author data`

---

### Task 3: Add pure date-formatting helpers for resume entries `[S]`

**Goal**: A framework-free module that parses `YYYY-MM` strings and formats
localised date ranges, including the "Present" case and malformed input.

**Files**:

| File                                    | Action | Description                       |
| --------------------------------------- | ------ | --------------------------------- |
| `components/resume/resumeDates.ts`      | create | Parse and format `YYYY-MM` values |
| `components/resume/resumeDates.test.ts` | create | Direct unit tests                 |

**Reuse**:

| File                                        | What to reuse                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `components/about/certificationGrouping.ts` | The pure-helper convention: exported types, JSDoc module header, no React/DOM imports |

**Steps**:

1. Export shared types: `Localized = { en: string; it: string }`, `Lang`,
   `ExperienceEntry`, `EducationEntry`. Mark every spec-optional field
   optional so partial data type-checks.
2. Export `parseYearMonth(value?: string): { year: number; month: number } | null`
   — returns `null` for undefined, empty, or unparseable input. Never throws.
3. Export `formatMonthYear(value: string | undefined, lang: Lang): string`.
   Use `Intl.DateTimeFormat` with `en-US` / `it-IT` and
   `{ month: 'short', year: 'numeric' }`. On unparseable input return the raw
   string rather than `Invalid Date`.
4. Export `formatDateRange(start, end, lang, presentLabel): string` — joins
   with an en dash and substitutes `presentLabel` when `end` is absent. The
   caller supplies the already-translated label so the helper stays free of
   i18n imports (same inversion `groupCertifications` uses for
   `undatedLabel`).
5. Export `localize(field, lang)`: returns `field[lang]`, falling back to the
   other language, then `''`. Mirrors `localize` in `lib/generateSearchIndex.ts`.

**Tests**:

- `parseYearMonth`: valid `'2024-03'`; `undefined`; `''`; garbage
  (`'not-a-date'`); month out of range (`'2024-13'`).
- `formatMonthYear`: EN vs IT output differ; raw string returned for garbage.
- `formatDateRange`: both dates present; missing `end` → present label;
  garbage passed through.
- `localize`: both languages; missing `it` falls back to `en`; empty object
  yields `''`.

**Acceptance criteria covered**: date formatting lives in a pure, directly
unit-tested helper. Edge cases: malformed dates; missing `it` fallback.

**Commit**: `feat(resume): add pure date formatting helpers for resume entries`

---

### Task 4: Add pure sorting helpers for experience and education `[S]`

**Goal**: Deterministic reverse-chronological ordering that puts current roles
first and never lets malformed dates corrupt the sequence.

**Files**:

| File                                      | Action | Description       |
| ----------------------------------------- | ------ | ----------------- |
| `components/resume/resumeSorting.ts`      | create | Sorting functions |
| `components/resume/resumeSorting.test.ts` | create | Direct unit tests |

**Reuse**:

| File                                        | What to reuse                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/about/certificationGrouping.ts` | `sortWithinYear` / `sortWithinIssuer` — copy-then-return (never mutate input) and `localeCompare(..., { sensitivity: 'base' })` for tiebreaks |
| `components/resume/resumeDates.ts`          | `parseYearMonth` (Task 3)                                                                                                                     |

**Steps**:

1. Export `sortExperience(items: ExperienceEntry[]): ExperienceEntry[]`.
   Return a new array (spread first, as `certificationGrouping` does).
2. Ordering rules, in priority order:
   - Entries with no `endDate` (current roles) sort first.
   - Then by `startDate` descending, via `parseYearMonth`.
   - Entries with unparseable or missing `startDate` sort last, without
     disturbing the relative order of valid entries.
   - Deterministic tiebreak on equal `startDate`: `company`, then `role[en]`,
     using locale-aware base-sensitivity comparison — so static output does
     not churn between builds.
3. Export `sortEducation(items: EducationEntry[]): EducationEntry[]` — reverse
   chronological by `endDate`, falling back to `startDate`, tiebreaking on
   `institution` then `degree.en`.
4. Handle empty arrays by returning `[]` early.

**Tests**:

- Current role (no `endDate`) sorts ahead of a more recent completed role.
- Two current roles order by `startDate` descending.
- Malformed `startDate` sorts last; valid entries keep correct relative order.
- Equal `startDate` produces a stable, deterministic order — assert exact
  output, and assert the same input sorted twice yields identical results.
- Input array is not mutated.
- `sortEducation` orders by `endDate`, falls back to `startDate`.
- Empty input returns `[]`.

**Acceptance criteria covered**: reverse-chronological ordering regardless of
frontmatter order (experience and education). Edge cases: no `endDate` sorts
first; malformed dates sort last; equal dates deterministic.

**Commit**: `feat(resume): add deterministic sorting helpers for resume entries`

---

### Task 5: Add `resume.*` locale strings `[S]`

**Goal**: Every user-facing string the page needs, present with identical keys
in both locales.

**Files**:

| File                      | Action | Description                           |
| ------------------------- | ------ | ------------------------------------- |
| `locales/en.json`         | modify | Add `resume` namespace                |
| `locales/it.json`         | modify | Add `resume` namespace                |
| `locales/locales.test.ts` | modify | Assert the new namespace and its keys |

**Reuse**:

| File                      | What to reuse                                                           |
| ------------------------- | ----------------------------------------------------------------------- |
| `locales/en.json`         | `about.cv.*` block as the shape/tone reference                          |
| `locales/locales.test.ts` | Existing parity suite plus the `about.cv.*` presence test as a template |

**Steps**:

1. Add a `resume` namespace to `en.json`, alphabetically placed among existing
   top-level keys. Keys: `title`, `description`, `experience.title`,
   `education.title`, `present`, `cv.download`, `stack.label`,
   `company_link`.
2. Mirror every key in `it.json` with Italian values — `present` → `"Oggi"`,
   `experience.title` → `"Esperienza"`, `education.title` → `"Formazione"`.
   Use typographic apostrophes (`’`) to match the existing files.
3. Do not introduce `{{var}}` placeholders unless needed; if any are added,
   they must match exactly across both files (the parity suite enforces this).
4. Extend `locales.test.ts`: add `'resume'` to the namespace list in the
   "covers the namespaces the components rely on" test, and add a focused test
   asserting the specific `resume.*` keys exist in both locales — mirroring
   the existing CV-card test.

**Tests**:

- Existing parity suite must pass unchanged: identical key sets, no blank
  values, identical placeholders, same top-level namespaces.
- New: `resume` namespace present in both; each documented `resume.*` key
  present in both.

**Acceptance criteria covered**: all new UI strings under `resume.*` in both
locale files with identical key sets.

**Commit**: `feat(i18n): add resume page locale strings`

---

### Task 6: Build the experience timeline component `[M]`

**Goal**: Render sorted experience entries as an accessible semantic list with
a decorative left rail and glassmorphism cards.

**Files**:

| File                                            | Action | Description               |
| ----------------------------------------------- | ------ | ------------------------- |
| `components/resume/ExperienceTimeline.tsx`      | create | Timeline client component |
| `components/resume/ExperienceTimeline.test.tsx` | create | Component tests           |

**Reuse**:

| File                                  | What to reuse                                                                                                                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/about/FocusAreas.tsx`     | Whole shape: `'use client'`, `useLanguage()`, `if (!items.length) return null`, gradient `h2`, `glass-bg rounded-xl border border-white/20 p-6 ... backdrop-blur` + `dark:border-white/10`, `whileHover={{ y: -3 }}` with `spring / stiffness 260 / damping 22` |
| `components/resume/resumeDates.ts`    | `formatDateRange`, `localize`, shared types (Task 3)                                                                                                                                                                                                            |
| `components/resume/resumeSorting.ts`  | `sortExperience` (Task 4)                                                                                                                                                                                                                                       |
| `components/about/CVDownloadCard.tsx` | External-link and focus-ring class treatment                                                                                                                                                                                                                    |
| `test/renderWithProviders.tsx`        | `renderWithProviders(ui, { locale })`                                                                                                                                                                                                                           |

**Steps**:

1. Create the component accepting `{ items }: { items: ExperienceEntry[] }`.
   Mark `'use client'` — it reads `LanguageContext` and animates.
2. Return `null` when `items` is empty or undefined, so the page's flex-gap
   rhythm collapses cleanly.
3. Render a gradient `h2` from `t('resume.experience.title')` at the
   major-band `text-2xl` scale, matching `FocusAreas`.
4. Sort with `sortExperience(items)`. Render a `<ul>` of `<li>` entries —
   semantic list, not divs.
5. Draw the rail as a `::before`-style absolutely-positioned element on the
   list (or a dedicated `<span>`) plus a dot per `<li>`. Mark all of it
   `aria-hidden="true"` and rely on padding-left so it never overlaps text.
   Use tighter horizontal offsets below `sm`, identical structure at all
   breakpoints.
6. In each card: `h3` for the role (`localize(role, lang)`), the company (as
   an external link when `url` is present, with `target="_blank"`,
   `rel="noopener noreferrer"`, and a visible `focus-visible` ring), and the
   formatted range via `formatDateRange(startDate, endDate, lang, t('resume.present'))`.
   Wrap the range in a `<time>`-adjacent text node or plain text.
7. Render `location` only when present; `highlights` as a nested `<ul>` only
   when non-empty; `stack` only when non-empty (small pill badges).
8. Use ``key={`${entry.id ?? 'entry'}-${index}`}`` so duplicate or missing
   `id` values cannot break reconciliation.
9. Apply `break-words` / `min-w-0` so long role, company, or highlight text
   wraps instead of overflowing the card or breaking rail alignment.

**Tests**:

- Renders one list item per entry; output is a real list
  (`getAllByRole('listitem')`).
- Displays role, company, and formatted date range.
- Current role (no `endDate`) shows the EN present label; IT via
  `{ locale: 'it' }` shows `Oggi`.
- Entries render in sorted order, not frontmatter order.
- Omits `location`, `stack`, and the company link when absent; no empty
  `<ul>` when `highlights` is missing.
- Renders nothing (`null`) for `[]` and for `undefined`.
- Entry headings are `h3`; the section heading is `h2`.
- Rail and dot elements carry `aria-hidden`.
- External company link has `rel="noopener noreferrer"`.
- Duplicate `id` values across two entries still render both.

**Acceptance criteria covered**: one entry per item in reverse-chronological
order; role/company/range/highlights displayed with optional fields
conditional; localised Present label; semantic list with decorative elements
hidden; `h2`/`h3` hierarchy. Edge cases: empty/absent array, no highlights, no
`endDate`, long text, external `url`, duplicate `id`.

**Commit**: `feat(resume): add experience timeline component`

---

### Task 7: Build the education section component `[S]`

**Goal**: Render sorted education entries in a visual language consistent with
the timeline.

**Files**:

| File                                          | Action | Description                |
| --------------------------------------------- | ------ | -------------------------- |
| `components/resume/EducationSection.tsx`      | create | Education client component |
| `components/resume/EducationSection.test.tsx` | create | Component tests            |

**Reuse**:

| File                                       | What to reuse                                 |
| ------------------------------------------ | --------------------------------------------- |
| `components/resume/ExperienceTimeline.tsx` | Rail, card, and heading treatment from Task 6 |
| `components/resume/resumeSorting.ts`       | `sortEducation`                               |
| `components/resume/resumeDates.ts`         | `formatDateRange`, `localize`                 |

**Steps**:

1. Create the component taking `{ items }: { items: EducationEntry[] }`,
   `'use client'`, returning `null` when empty — no residual heading or rail.
2. Gradient `h2` from `t('resume.education.title')` at the same major-band
   scale.
3. Sort via `sortEducation(items)`; render as a semantic list reusing the same
   rail-and-card structure so the two sections read as one system.
4. Per entry: `h3` for `localize(degree, lang)`, then institution, formatted
   range, and `location` / `notes` only when present.
5. Since both dates are optional here, render no range at all when both are
   missing rather than a bare separator.

**Tests**:

- One item per entry, in reverse-chronological order.
- Degree, institution, and date range render.
- `null` for `[]` and `undefined` — and specifically no `h2` in the output.
- `location` and `notes` omitted when absent.
- No dangling separator when both dates are missing.
- IT locale renders Italian degree text.
- Entry headings are `h3`.

**Acceptance criteria covered**: one entry per `education[]` item in
reverse-chronological order showing degree, institution, date range. Edge
case: `education[]` empty or absent renders no residual heading or rail.

**Commit**: `feat(resume): add education section component`

---

### Task 8: Build the resume header with CV download `[S]`

**Goal**: A page header carrying identity and the PDF download, without
touching `AboutProfile`.

**Files**:

| File                                      | Action | Description             |
| ----------------------------------------- | ------ | ----------------------- |
| `components/resume/ResumeHeader.tsx`      | create | Header client component |
| `components/resume/ResumeHeader.test.tsx` | create | Component tests         |

**Reuse**:

| File                                  | What to reuse                                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/about/CVDownloadCard.tsx` | Download anchor verbatim in spirit: ``href={`${basePath}${cv.url}`}``, `download` attribute, `process.env.BASE_PATH \|\| ''`, `hasDownload` guard, and the full button class string |
| `components/about/AboutProfile.tsx`   | Glass container and identity layout (name, occupation, company)                                                                                                                     |

**Steps**:

1. Create the component taking `{ name, occupation, company, cv }`.
   `'use client'` for `useLanguage()` and Motion.
2. Render the page `h1` from `t('resume.title')` — the single `h1` on the
   page. Below it show name, then occupation and company when present.
3. Read `const basePath = process.env.BASE_PATH || ''` and render the download
   anchor only when `cv?.url` is truthy, exactly as `CVDownloadCard` does —
   `href={`${basePath}${cv.url}`}`, `download`, label from
   `t('resume.cv.download')`.
4. Reuse the existing glass container and entry animation
   (`initial`/`animate` spring from `AboutProfile`), and keep the identity
   name as a `<p>` or `h2` — not a second `h1`.
5. Do **not** modify `AboutProfile` or `CVDownloadCard`.

**Tests**:

- Renders exactly one `h1`.
- Download link present with the correct `href` and `download` attribute when
  `cv.url` is set.
- No download link when `cv` is `undefined` or `cv.url` is empty — while name
  and heading still render.
- `BASE_PATH` prefix applied when the env var is set.
- `occupation` and `company` omitted when absent.
- IT locale renders the Italian title and download label.

**Acceptance criteria covered**: CV PDF downloadable via existing `cv.url`
with `BASE_PATH` applied; single `h1`. Edge case: `cv.url` missing degrades
gracefully.

**Commit**: `feat(resume): add resume header with cv download`

---

### Task 9: Assemble the `/resume` page with metadata and JSON-LD `[M]`

**Goal**: Wire the components into a statically exported, indexable route.

**Files**:

| File                       | Action | Description                      |
| -------------------------- | ------ | -------------------------------- |
| `app/resume/page.tsx`      | create | Route: metadata, JSON-LD, layout |
| `app/resume/page.test.tsx` | create | Composition tests                |

**Reuse**:

| File                           | What to reuse                                                                                                                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/about/page.tsx`           | Server-component skeleton: `allAuthors.find(a => a.slug === 'default')`, `if (!author) return null`, `SectionContainer`, `mx-auto max-w-6xl px-6 py-12`, and the single rhythm owner `flex flex-col gap-14 sm:gap-16 lg:gap-24` with `data-testid` |
| `app/seo.tsx`                  | `genPageMetadata({ title, description, slug })`                                                                                                                                                                                                    |
| `app/projects/[slug]/page.tsx` | JSON-LD injection: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />`                                                                                                                               |
| `data/siteMetadata`            | `siteUrl` for absolute URLs in JSON-LD                                                                                                                                                                                                             |
| `app/about/page.test.tsx`      | Test harness: `vi.mock('contentlayer/generated')` with a mutable `authorOverrides`, and invoking the server component as a plain function                                                                                                          |

**Steps**:

1. Create `app/resume/page.tsx` as a non-async server component. Export
   `metadata = genPageMetadata({ title: 'Resume', description: ..., slug: 'resume' })`.
   Do not hand-roll a `Metadata` object.
2. Resolve the default author from `allAuthors`; `return null` if absent so
   static export cannot throw.
3. Build the JSON-LD object: `@type: 'ProfilePage'` with `mainEntity` of
   `@type: 'Person'` carrying `name`, `jobTitle` (from `occupation`), `url`
   (`${siteMetadata.siteUrl}/resume`), and `sameAs` filtered to defined
   `linkedin` / `github` values. Derive `hasOccupation` from `experience[]`
   (`@type: 'OccupationalExperience'` or `Role`-shaped entries with the EN
   role name, employer, and dates) and `alumniOf` from `education[]`
   (`@type: 'EducationalOrganization'` with `name: institution`). Use EN
   values throughout — structured data is not language-toggled.
4. Omit `hasOccupation` / `alumniOf` entirely when their arrays are empty
   rather than emitting empty lists.
5. Inject the JSON-LD via a `<script type="application/ld+json">` tag.
6. Compose in order inside the rhythm container: `ResumeHeader`,
   `ExperienceTimeline`, `EducationSection` — each wrapped in a
   `data-testid` div for composition assertions. Do not render
   certifications.
7. Add `/resume` to the routes array in `app/sitemap.ts` and a `/resume`
   entry to `staticSearchPages` in `lib/searchStaticPages.ts` with EN/IT
   title and summary.
8. Verify no request-time APIs are used, so the route prerenders.

**Tests**:

- In `app/resume/page.test.tsx`, mock `contentlayer/generated` with an author
  fixture including `experience` and `education`; render the page function
  inside `ThemeProviders` + `LanguageProvider`.
- Sections appear in order: header, experience, education.
- Certifications are **not** rendered.
- Page returns `null` when no author matches.
- Renders with `experience: []` and `education: []` without crashing; header
  still present.
- JSON-LD script exists, parses as JSON, and has
  `@type === 'ProfilePage'` with a `Person` `mainEntity`; `hasOccupation`
  reflects experience and `alumniOf` reflects education.
- `metadata.title` is set and the OG URL resolves to the `/resume` slug.
- Exactly one `h1` on the assembled page, with section `h2`s and entry `h3`s
  and no skipped levels.
- Extend `app/sitemap.test.ts` to assert the `/resume` URL is present.

**Acceptance criteria covered**: page exists and renders under static export;
`/about` link resolves; metadata via `genPageMetadata` with `slug: 'resume'`;
valid JSON-LD `ProfilePage`; heading hierarchy gap-free. Edge case: author
missing returns `null`.

**Commit**: `feat(resume): add resume page with timeline, metadata and json-ld`

---

### Task 10: Verify bilingual behaviour, motion, and full-suite green `[S]`

**Goal**: Confirm the cross-cutting requirements that no single component test
covers, and that nothing regressed.

**Files**:

| File                                        | Action | Description                        |
| ------------------------------------------- | ------ | ---------------------------------- |
| `components/resume/resumeLanguage.test.tsx` | create | Cross-component EN/IT switch tests |
| `components/resume/resumeMotion.test.tsx`   | create | Reduced-motion verification        |

**Reuse**:

| File                                              | What to reuse                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| `test/renderWithProviders.tsx`                    | `renderWithProviders(ui, { locale: 'it' })` and the exported `user`        |
| `test/mockMatchMedia.ts`                          | `mockReducedMotion()` plus the documented latching caveat and reset helper |
| `components/about/aboutHeadingHierarchy.test.tsx` | Cross-component contract-test style                                        |
| `components/home/Taglines.test.tsx`               | `prefers-reduced-motion` describe-block pattern                            |

**Steps**:

1. Write a language test that renders the timeline and education section and
   asserts EN output, then IT output via `{ locale: 'it' }` — headings, date
   labels, roles, highlights, and education entries all translated, with no
   English leftovers and no key-name leakage (a missing key makes `t()`
   return the raw key, so assert the rendered text is not e.g.
   `resume.present`).
2. Add a fallback test: an entry whose `it` value is missing renders the `en`
   value rather than `undefined`.
3. Write a reduced-motion test using `mockReducedMotion()`, honouring the
   latching caveat documented in `test/mockMatchMedia.ts` (call the reset
   helper so `useReducedMotion()` re-reads `matchMedia`). Assert the timeline
   renders its content unchanged under reduced motion.
4. Document in a comment that motion damping itself is enforced globally by
   the `@media (prefers-reduced-motion: reduce)` block in
   `css/tailwind.css`, so the component adds no per-instance guard — this is
   why the test asserts graceful rendering rather than absent animation.
5. Run `npm test`, `npm run lint`, and `npm run build`. Confirm
   `CVDownloadCard.test.tsx`, `app/about/page.test.tsx`, and
   `locales/locales.test.ts` all still pass untouched.
6. Manually load `/resume`, toggle the language, and follow the `/about` →
   `/resume` link to confirm the 404 is gone.

**Tests**:

- As described above; no production code should need changing. If a test
  reveals a defect, fix it in the owning component within this task.

**Acceptance criteria covered**: language toggle updates every translatable
string with no reload; motion respects `prefers-reduced-motion`; component
tests cover EN and IT; full suite, lint, and build pass. Edge case: missing
`it` falls back to `en`.

**Commit**: `test(resume): verify bilingual rendering and reduced-motion behaviour`

---

**Task ordering**: Largely sequential. Task 1 must precede Task 2 (schema
before data). Tasks 3 and 4 are independent of 1–2 and of each other, except
that Task 4 imports `parseYearMonth` from Task 3 — so 3 before 4. Task 5 is
fully independent and can be done at any point before Tasks 6–8. Tasks 6, 7,
and 8 depend on Tasks 3, 4, and 5; Task 7 additionally reuses Task 6's visual
structure, so 6 before 7. Task 9 depends on 6, 7, and 8. Task 10 is last.

Recommended order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10.

## Edge Cases & Error Handling

- **`experience[]` empty or absent**: `ExperienceTimeline` returns `null`; the
  page's `flex` + `gap` container collapses the space (Task 6, Task 9)
- **`education[]` empty or absent**: `EducationSection` returns `null` with no
  heading or rail (Task 7)
- **Author document missing**: page returns `null` before rendering (Task 9)
- **`cv.url` missing**: download anchor omitted, rest of header renders
  (Task 8)
- **Entry with no `highlights`**: no nested `<ul>` emitted (Task 6)
- **Entry with no `endDate`**: localised Present/Oggi label, sorts first
  (Tasks 3, 4, 6)
- **Malformed `startDate` / `endDate`**: raw string rendered, entry sorted
  last, never `NaN` or a throw (Tasks 3, 4)
- **Equal `startDate`**: deterministic tiebreak on company then role, so
  static output is build-stable (Task 4)
- **Missing `it` translation**: `localize()` falls back to `en` (Tasks 3, 10)
- **Very long text**: `break-words` / `min-w-0` keep cards and rail intact
  (Task 6)
- **External `url`**: `target="_blank"`, `rel="noopener noreferrer"`, visible
  focus ring (Task 6)
- **Duplicate or missing `id`**: React keys combine `id` with the array index
  (Task 6)

## Verification

1. `npm test` — full Vitest suite green, including the new
   `components/resume/*` tests, the extended `locales.test.ts` and
   `app/sitemap.test.ts`, and the untouched `CVDownloadCard.test.tsx` and
   `app/about/page.test.tsx`.
2. `npm run lint` — clean.
3. `npm run build` — Contentlayer regenerates with the new schema and content, no
   validation warnings, type check passes, and `/resume` prerenders as a static
   route with no dynamic-server errors.
4. Inspect the built `/resume` HTML: confirm timeline entries are present in
   the static markup (not client-only), the JSON-LD `ProfilePage` block is
   emitted, and OG/canonical URLs point at `/resume`.
5. Validate the JSON-LD by pasting it into Google's Rich Results Test or
   Schema Markup Validator.
6. `npm run dev` and browse `/resume`: verify reverse-chronological order,
   current role shows Present, the rail aligns at mobile and desktop widths,
   the CV download works, and hover lifts feel consistent with `/about`.
7. Toggle EN/IT on `/resume` and confirm every string switches with no reload
   and no raw translation keys visible.
8. Navigate `/about` → "View full experience" and confirm it lands on a real
   page instead of a 404.
9. Confirm `/resume` appears in the generated sitemap and is findable via the
   in-site kbar search.
10. Re-check the spec's acceptance criteria list and tick off each item.
