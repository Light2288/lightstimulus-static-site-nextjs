# Plan: About Page Visual Re-flow

| Field       | Value                             |
| ----------- | --------------------------------- |
| **Title**   | About Page Visual Re-flow         |
| **Spec**    | specs/about-page-visual-reflow.md |
| **Type**    | refactor                          |
| **Branch**  | refactor/about-page-visual-reflow |
| **Created** | 2026-08-24 00:22:00               |
| **Status**  | IMPLEMENTED                       |

## Context

The About page stacks four consecutive full-width glass bands of near-identical
visual weight (`FocusAreas`, `ExploringNow`, `CertificationsGrid`,
`CVDownloadCard`), and vertical rhythm is scattered across five components that
each hardcode their own top margin. This refactor reorders and re-spaces the
existing sections into deliberately differentiated bands, centralises rhythm
ownership in `app/about/page.tsx`, and adds an outbound pointer to the
forthcoming `/resume` page. No content or copy changes beyond one new i18n key
pair for the resume link label.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `refactor/about-page-visual-reflow`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b refactor/about-page-visual-reflow
> ```

Branch type mapping: refactor → `refactor/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task below maps to exactly one commit. Scope is
`about` throughout.

## Build & Test Commands

| Action | Command                                                              |
| ------ | -------------------------------------------------------------------- |
| Test   | `npx vitest run` (scoped: `npx vitest run components/about locales`) |
| Build  | `npm run build`                                                      |
| Lint   | `npm run lint`                                                       |

> **Note:** `yarn` is currently broken in this workspace — `yarn vitest run`
> fails with `This package doesn't seem to be present in your lockfile`
> despite `packageManager: yarn@3.6.1`. Use `npx` / `npm` for verification, and
> do **not** attempt to fix the lockfile under this spec (out of scope).

**Baseline (captured before implementation):** 8 test files, 138 tests passing
across `components/about` and `locales`. This must still hold at the end.

## Resolved Design Decisions

Two open questions from the spec were resolved during planning:

1. **`/resume` pointer vs. missing `cv.url`** — the resume link always renders.
   `CVDownloadCard` returns `null` only when the CV asset is absent _and_ the
   resume pointer is unavailable. This changes the component's null-guard
   contract (Task 2).
2. **Heading hierarchy** — differentiate _visual size only_. All section
   headings stay `<h2>` elements (no a11y or document-outline regression, and
   existing `{ level: 2 }` test queries keep passing); the paired-row cards drop
   to a smaller visual scale so they read as subordinate (Task 4).

## Tasks

### Task 1: Add resume link i18n keys `[S]`

**Goal**: Add the EN/IT translation key pair for the `/resume` link label so
later tasks have a translated string to render.

**Files**:

| File              | Action | Description                |
| ----------------- | ------ | -------------------------- |
| `locales/en.json` | modify | Add `about.cv.resume_link` |
| `locales/it.json` | modify | Add `about.cv.resume_link` |

**Reuse**:

| File                      | What to reuse                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `locales/en.json`         | Existing `about.cv` namespace (`title`, `description`, `download`) — nest the new key alongside them                     |
| `locales/locales.test.ts` | Parity guardrails already enforce both locales define the same keys with no blank values — no new test needed for parity |

**Steps**:

1. Add `resume_link` inside the existing `about.cv` object in `locales/en.json`
   (e.g. `"View full experience"` — a label, not new content).
2. Add the Italian counterpart to the same path in `locales/it.json`.
3. Keep key ordering consistent with the surrounding file style.

**Tests**:

- `locales/locales.test.ts` already covers key parity across locales, absence
  of blank values, and string-leaf resolution. It will fail automatically if the
  key is added to only one locale. No new assertions required.

**Acceptance criteria covered**: "The `/resume` link label resolves in both EN
and IT."

**Commit**: `feat(about): add resume link translation keys`

---

### Task 2: Rework CVDownloadCard into a two-action credentials card `[M]`

**Goal**: Add the secondary `/resume` link to `CVDownloadCard` and relax its
null guard so the pointer survives a missing CV asset.

**Files**:

| File                                       | Action | Description                                                |
| ------------------------------------------ | ------ | ---------------------------------------------------------- |
| `components/about/CVDownloadCard.tsx`      | modify | Relax null guard; add secondary `/resume` link             |
| `components/about/CVDownloadCard.test.tsx` | modify | Scope ambiguous link queries; cover the new guard and link |

**Reuse**:

| File                                      | What to reuse                                                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/Link.tsx`                     | `CustomLink` — already routes internal `/`-prefixed hrefs through `next/link`; use it for `/resume` rather than a raw `<a>`                                      |
| `components/about/AboutContactBridge.tsx` | Existing internal-link styling recipe (`text-primary-600 hover:text-primary-700 dark:text-primary-300 ... hover:underline`) — mirror it for the secondary action |
| `components/about/CVDownloadCard.tsx`     | Existing `motion.div` hover-lift, `glass-bg` card shell, and `BASE_PATH` href prefixing — all preserved                                                          |
| `test/renderWithProviders.tsx`            | `renderWithProviders` with `{ locale }` for EN/IT assertions                                                                                                     |

**Steps**:

1. Change the guard from `if (!cv?.url) return null` so the component returns
   `null` only when there is nothing to show at all. The download anchor becomes
   conditional on `cv?.url`; the `/resume` link renders unconditionally.
2. Keep the download button as the **primary** action (existing bordered/filled
   treatment) and render the `/resume` link as a visually secondary text link.
3. Use `Link` from `@/components/Link` with `href="/resume"` and the
   `about.cv.resume_link` label from Task 1.
4. Preserve the existing `glass-bg` shell, `motion.div` hover lift, gradient
   `h2`, and `BASE_PATH` prefixing on the download href.
5. Ensure the action row still collapses sensibly on narrow viewports (the card
   currently uses `sm:flex-row sm:items-center sm:justify-between`).

**Tests**:

- **Fix ambiguity first**: four existing tests in `CVDownloadCard.test.tsx` use a
  bare `screen.findByRole('link')` (lines ~114, ~121, ~131, ~142). With two links
  present these become ambiguous and will throw. Scope them by accessible name
  (e.g. `{ name: 'Download CV' }`).
- Update the three "null guard" tests (`no cv prop`, `cv undefined`,
  `cv.url === ''`): the card now still renders the resume pointer, so
  `expectRenderedNothing` no longer applies to those cases. Re-express them as
  "renders no download anchor but still renders the resume link".
- Add: resume link present with `href="/resume"`, in both EN and IT locales.
- Add: resume link is internal — carries no `target="_blank"`.
- Add: download anchor still carries the boolean `download` attribute and the
  `BASE_PATH`-prefixed href when a CV exists.

**Acceptance criteria covered**: "`CVDownloadCard` renders both the existing
download action and a new link to `/resume`, with the download remaining the
primary action"; contributes to the Motion-preservation criterion.

**Commit**: `feat(about): add resume pointer to CV download card`

---

### Task 3: Strip self-imposed vertical margins from section components `[S]`

**Goal**: Make every About section spacing-agnostic so the page can own rhythm
in one place.

**Files**:

| File                                      | Action | Description                     |
| ----------------------------------------- | ------ | ------------------------------- |
| `components/about/FocusAreas.tsx`         | modify | Remove `mt-14` from `<section>` |
| `components/about/ExploringNow.tsx`       | modify | Remove `mt-16` from `<section>` |
| `components/about/CertificationsGrid.tsx` | modify | Remove `mt-16` from `<section>` |
| `components/about/CVDownloadCard.tsx`     | modify | Remove `mt-16` from `<section>` |
| `components/about/AboutContactBridge.tsx` | modify | Remove `mt-16` from `<section>` |

**Steps**:

1. Delete the outer top-margin utility from each component's root `<section>`,
   leaving all internal spacing (`mb-6` on headings, `gap-6` in grids,
   `space-y-10` between certification groups) untouched.
2. Do not otherwise restructure these components — Task 4 handles heading scale
   and Task 5 handles page composition.

**Tests**:

- No existing test asserts on these margin classes (verified by grep across
  `components/about/*.test.tsx` — no `mt-14` / `mt-16` / `toHaveClass`
  assertions), so all 138 baseline tests should continue to pass unchanged.
- Run the scoped suite to confirm no regression.

**Acceptance criteria covered**: "No about section component sets its own outer
vertical margin."

**Commit**: `refactor(about): remove self-imposed section margins`

---

### Task 4: Reduce heading scale on the paired-row cards `[S]`

**Goal**: Establish clearer hierarchy by making the paired-row headings visually
subordinate to the major band headings, without changing heading levels.

**Files**:

| File                                  | Action | Description                              |
| ------------------------------------- | ------ | ---------------------------------------- |
| `components/about/ExploringNow.tsx`   | modify | Reduce `h2` visual size below `text-2xl` |
| `components/about/CVDownloadCard.tsx` | modify | Reduce `h2` visual size below `text-2xl` |

**Steps**:

1. In both components, keep the `<h2>` element and the gradient
   `bg-gradient-to-r ... bg-clip-text text-transparent` treatment, but step the
   size down from `text-2xl` (e.g. to `text-lg` or `text-xl`) so `FocusAreas`
   and `CertificationsGrid` read as the dominant bands.
2. Leave `AboutProfile`'s and `FocusAreas`'/`CertificationsGrid`'s headings at
   their current scale.
3. Do **not** change heading levels — `h2` is preserved everywhere.

**Tests**:

- Existing `{ level: 2 }` heading queries in `ExploringNow.test.tsx` and
  `CVDownloadCard.test.tsx` must continue to pass unchanged; this is the
  guardrail confirming the level was not demoted. Run the scoped suite.

**Acceptance criteria covered**: Contributes to "clearer hierarchy" in the
Desired Outcome; preserves the `CertificationsGrid` and heading-related
criteria.

**Commit**: `refactor(about): differentiate section heading scale`

---

### Task 5: Re-flow the About page composition and centralise rhythm `[M]`

**Goal**: Reorder the sections into the target composition, introduce the paired
row with correct collapse behaviour, narrow the bio measure, and define the
vertical rhythm scale in one place.

**Files**:

| File                 | Action | Description                                                        |
| -------------------- | ------ | ------------------------------------------------------------------ |
| `app/about/page.tsx` | modify | Reorder sections, add rhythm container, paired row, narrower prose |

**Reuse**:

| File                       | What to reuse                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `app/about/page.tsx`       | Existing `SectionContainer`, `allAuthors` lookup, `genPageMetadata` — all unchanged |
| `components/MDXComponents` | Existing `components` map passed to `MDXLayoutRenderer`                             |

**Steps**:

1. Wrap the sections in a single rhythm-owning container (e.g. a
   `flex flex-col` with a responsive `gap-*` scale, tighter on mobile and
   expanding at desktop breakpoints). This container is the _only_ place
   between-band spacing is declared.
2. Reorder to: `AboutProfile` → MDX bio → `FocusAreas` → paired row
   (`ExploringNow` + `CVDownloadCard`) → `CertificationsGrid` →
   `AboutContactBridge`.
3. Narrow the MDX bio measure: replace `max-w-none` on the `prose` article with
   a constrained max-width so the prose no longer runs the full `max-w-6xl`.
4. Build the paired row as a grid that is one column by default and two columns
   at `lg`+, with a smaller within-row gap than the between-band gap.
5. **Handle the empty-half cases in the page**, which already has the source
   data: derive booleans from `author.exploringNow?.length` and `author.cv?.url`
   (noting Task 2's relaxed guard means the CV card renders whenever the resume
   pointer applies). Render the paired row as a two-column grid only when both
   halves will render; otherwise render the surviving section full-width, and
   omit the row entirely when neither renders. This prevents both a visible
   empty half and a dangling gap.
6. Because each section self-guards with `return null`, confirm the chosen
   container does not leave residual gaps for absent sections — a
   `flex` + `gap` container collapses cleanly around `null` children, unlike
   `space-y-*`, which is the reason to prefer it.

**Tests**:

- `app/about/page.tsx` is an async server component reading from
  `contentlayer/generated`, and there is no existing test harness for page-level
  server components in this repo (`app/**/*.test.tsx` covers only `loading`,
  `error`, and `not-found` client components). Do **not** introduce a new
  contentlayer mocking harness for this refactor — it is disproportionate to a
  layout change and outside the spec's boundary.
- Rely on the component-level suites for behaviour, plus the manual
  verification steps below for composition, responsive behaviour, and theming.
- Run the full suite (`npx vitest run`) to confirm no cross-cutting regression.

**Acceptance criteria covered**: page ordering; paired row side-by-side at `lg`+
and stacked below; rhythm defined in one place with distinct between-band and
within-row gaps; tighter mobile rhythm; narrower bio measure; `FocusAreas`
column behaviour preserved.

**Commit**: `refactor(about): re-flow page composition and centralise rhythm`

---

**Task ordering**: Sequential. Task 1 supplies the i18n key that Task 2
consumes. Task 2 must precede Task 5 because the page's paired-row collapse
logic depends on `CVDownloadCard`'s new render contract. Tasks 3 and 4 both
touch `CVDownloadCard.tsx` and `ExploringNow.tsx`, so keeping them after Task 2
avoids conflicting edits to the same lines. Task 5 is last — it composes the
spacing-agnostic sections the earlier tasks produce.

## Edge Cases & Error Handling

- **Empty `focusAreas`**: component returns `null`; the flex + `gap` rhythm
  container collapses without a dangling gap (Task 5, step 6).
- **Empty `exploringNow`**: page derives the condition and renders the
  credentials card full-width instead of leaving an empty grid half (Task 5,
  step 5).
- **Missing `cv.url`**: `CVDownloadCard` no longer returns `null` — it renders
  the resume pointer without the download anchor (Task 2, step 1).
- **Both paired items absent**: the paired row is omitted entirely, no residual
  spacing (Task 5, step 5).
- **Empty `certifications`**: component returns `null`; surrounding rhythm
  unaffected (Task 5, step 6).
- **Missing avatar**: `AboutProfile` is not modified; its existing grid handles
  the absent avatar column.
- **Language switch (EN ↔ IT) height mismatch**: the paired row uses grid with
  stretched items so unequal text lengths do not break alignment (Task 5,
  step 4).
- **Reduced motion**: no new animation is introduced; existing Motion usage is
  preserved verbatim. `test/mockMatchMedia.ts` already exists for reduced-motion
  assertions if needed.
- **Ambiguous link queries**: adding a second link to `CVDownloadCard` breaks
  four bare `findByRole('link')` queries — scoped by accessible name in Task 2.

## Verification

1. Run the scoped suite: `npx vitest run components/about locales`. Expect the
   138-test baseline to still pass, with Task 2's additions on top.
2. Run the full suite: `npx vitest run`.
3. Run `npm run lint` and `npm run build` to confirm the page still compiles and
   the static export succeeds.
4. Start `npm run dev` and load `/about`. Confirm the section order is profile →
   bio → focus areas → paired row → certifications → contact bridge.
5. Resize across breakpoints: confirm the paired row is one column below `lg`
   and two columns at `lg`+; `FocusAreas` is 1 → 2 at `sm`; certifications are
   1 → 2 (`sm`) → 3 (`lg`); mobile rhythm is visibly tighter than desktop.
6. Confirm the bio prose measure is visibly narrower than the full-width bands.
7. Toggle EN ↔ IT and confirm both paired-row cards stay aligned and the resume
   link label translates.
8. Toggle light ↔ dark and confirm the glass treatment and gradient headings are
   intact in both.
9. Confirm the certifications grouping toggle still works via mouse and keyboard
   (arrow keys, Enter/Space) and that the preference persists across reload.
10. **Known temporary state:** `app/resume/` does not exist in this repo yet, so
    the new `/resume` link will 404 until the separate resume spec is
    implemented. This is expected and must not be "fixed" here — creating the
    route is out of scope. Verify the link renders with `href="/resume"` rather
    than verifying a successful navigation.

## Notes

- `components/about/AboutContent.tsx` exists but is not referenced by
  `app/about/page.tsx` (it duplicates the `prose max-w-none` article wrapper the
  page inlines). It is likely dead code, but per the spec it must **not** be
  deleted under this plan. Flag it for a separate chore.
- No new abstractions are introduced. The spec explicitly deferred a shared
  `AboutSection` wrapper, and this plan honours that by centralising rhythm in
  the page container instead.
- `AboutProfile.tsx` and `AboutContactBridge.tsx` internals are untouched;
  `AboutContactBridge` is only edited to drop its `mt-16` (Task 3).
