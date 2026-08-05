# Plan: Filter Search Results by Active Language

| Field       | Value                                     |
| ----------- | ----------------------------------------- |
| **Title**   | Filter Search Results by Active Language  |
| **Spec**    | specs/language-filtered-search-results.md |
| **Type**    | feature                                   |
| **Branch**  | feat/language-filtered-search-results     |
| **Created** | 2026-08-05 03:00:00                       |
| **Status**  | IMPLEMENTED                               |

## Context

The command palette currently loads both the English and Italian entry for
every document, so a query in one language surfaces the other language's
result and pages appear twice. This plan scopes results to the active UI
language by tagging each index entry with an explicit `lang` field and
filtering entries in the custom `SearchProvider` using the existing
`useLanguage()` context, remounting the kbar provider on language change so
the action set rebuilds.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/language-filtered-search-results`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/language-filtered-search-results
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

> Note: the predecessor spec `expand-search-index-all-content` was
> implemented on branch `feat/expand-search-index-all-content` and may not
> yet be merged into the base. If that work is not on the detected base,
> branch this work from `feat/expand-search-index-all-content` instead, so
> `lib/generateSearchIndex.ts` and `components/search/SearchProvider.tsx`
> (created there) are present. The implementer should confirm those two
> files exist on the chosen base before starting.

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

| Action        | Command                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------- | --- | ----------------- |
| Build         | `npm run build` (runs `next build`; contentlayer `onSuccess` regenerates `public/search.json`)    |
| Lint          | `npm run lint`                                                                                    |
| Inspect index | `node -e "const j=require('./public/search.json'); console.log(j.length, j.every(e=>e.lang==='en' |     | e.lang==='it'))"` |

> The project has no unit-test framework configured (no jest/vitest in
> `package.json`). Verification is via the build output, inspecting
> `public/search.json`, and manual exercise of the palette in
> `npm run dev`. Tasks describe concrete inspection checks in lieu of
> automated tests.
>
> Node is provided via nvm; if `node`/`npm` are not on PATH, load it first:
> `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22`.

## Tasks

### Task 1: Add explicit `lang` field to each search index entry `[S]`

**Goal**: Emit a `lang: 'en' | 'it'` property on every entry written to
`public/search.json`, so the client can filter without parsing the `id`.

**Files**:

| File                         | Action | Description                                                        |
| ---------------------------- | ------ | ------------------------------------------------------------------ |
| `lib/generateSearchIndex.ts` | modify | Add `lang` to the `SearchEntry` type and set it in `emitLocalized` |

**Reuse**:

| File                         | What to reuse                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `lib/generateSearchIndex.ts` | Existing `LOCALES` loop and `emitLocalized` helper — `locale` is already in scope per iteration |

**Steps**:

1. Extend the exported `SearchEntry` type (lines 10–16) with
   `lang: Locale` (i.e. `'en' | 'it'`).
2. In `emitLocalized` (lines 44–52), add `lang: locale` to the pushed
   entry object. No other call sites need to change — every entry flows
   through this helper (blogs, projects, about, static pages).
3. Leave the `id` format (`${url}#${locale}`) unchanged for stability; the
   `lang` field is now the source of truth for filtering.

**Tests**:

- After `npm run build`, inspect `public/search.json`: every entry has a
  `lang` of `'en'` or `'it'`; the en/it split is even (roughly half each),
  and each URL still has exactly one `en` and one `it` entry.

**Acceptance criteria covered**: explicit `lang` field on every entry;
build still generates `search.json`.

**Commit**: `feat(search): tag search index entries with language`

---

### Task 2: Filter palette results by active language `[M]`

**Goal**: Make `SearchProvider` show only entries matching the active UI
language, and rebuild the kbar action set when the language toggles.

**Files**:

| File                                   | Action | Description                                                                           |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `components/search/SearchProvider.tsx` | modify | Read `lang` via `useLanguage()`, filter entries by `lang`, key the provider on `lang` |

**Reuse**:

| File                                   | What to reuse                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| `contexts/LanguageContext.tsx`         | `useLanguage()` hook → `{ lang }` (`'en'                                           | 'it'`), already exported at line 184 |
| `components/common/LanguageToggle.tsx` | Reference for the mounted-guard pattern used elsewhere to avoid hydration mismatch |
| `components/search/SearchProvider.tsx` | Existing `onSearchDocumentsLoad` mapping and `SearchEntry` type                    |

**Steps**:

1. Add `'use client'` is already present. Import `useLanguage` from
   `@/contexts/LanguageContext`.
2. Extend the local `SearchEntry` type with `lang: 'en' | 'it'` to match
   the generated shape from Task 1.
3. Inside the component, call `const { lang } = useLanguage()`.
4. In `onSearchDocumentsLoad`, filter before mapping:
   `json.filter((entry) => entry.lang === lang).map(...)`. Entries whose
   `lang` does not equal the active language (including any unexpected
   value) are dropped, so a mismatched-language query yields no results.
5. Add `key={lang}` to the `KBarSearchProvider` element so that toggling
   the language remounts it and re-runs `onSearchDocumentsLoad` against the
   new `lang`. (The index is ~22 entries, so remount cost is negligible.)
6. Confirm the mapped action fields are unchanged (id, name=title,
   keywords=summary, section=type, subtitle=summary,
   perform=router.push(url)), so visible results keep localized title,
   type label, summary, and correct navigation.

**Tests**:

- `npm run dev`, open the palette (Cmd/Ctrl-K):
  - With language = en: `i built` → returns the English "I built two
    robots…" entry; the Italian counterpart is absent. `ho costruito`
    → no results.
  - Toggle to it (without reloading): `ho costruito` → returns only the
    Italian entry; `i built` → no results.
  - Each visible result shows a title, section (Blog/Project/Page), and
    summary, and selecting it navigates to the correct URL.
- `npm run lint` passes with no errors.

**Acceptance criteria covered**: reads active language via `useLanguage()`;
only matching-`lang` entries mapped; en/it symmetric filtering; mismatched
query returns nothing; language toggle updates results without reload;
visible results retain title/type/summary/url; unknown-lang safety.

**Commit**: `feat(search): filter palette results by active language`

---

**Task ordering**: Task 2 depends on the `lang` field emitted by Task 1
(the client filter reads `entry.lang`). Implement Task 1 first, rebuild so
`public/search.json` carries `lang`, then Task 2. End-to-end verification
happens after Task 2.

## Edge Cases & Error Handling

- **Missing localized field**: unchanged — `localize()` still falls back to
  the other language's text, and the entry keeps the `lang` of its slot, so
  it appears only under that language (Task 1).
- **Initial render / hydration**: `useLanguage()` resolves to `en` on first
  paint and corrects after mount, consistent with the rest of the site; the
  palette reflects the resolved language once mounted (Task 2).
- **Unknown / future `lang` value**: the strict equality filter
  (`entry.lang === lang`) drops non-matching entries, so an unexpected
  value yields an empty (not broken) palette (Task 2).
- **Empty query**: kbar default behavior unchanged; only the candidate
  action set is language-scoped (Task 2).

## Verification

1. Run `npm run build`; confirm it succeeds and logs
   `Local search index generated...`.
2. Inspect `public/search.json`: every entry has `lang` `'en'` or `'it'`;
   each URL still has one `en` and one `it` entry.
3. Run `npm run dev` and exercise the palette in both languages per the
   Task 2 tests: correct-language queries match, cross-language queries
   return nothing, toggling language flips the available results without a
   page reload, and selecting a result navigates correctly.
4. Run `npm run lint`; confirm no errors.
