# Plan: Expand Site Search Index to Cover All Content

| Field       | Value                                         |
| ----------- | --------------------------------------------- |
| **Title**   | Expand Site Search Index to Cover All Content |
| **Spec**    | specs/expand-search-index-all-content.md      |
| **Type**    | feature                                       |
| **Branch**  | feat/expand-search-index-all-content          |
| **Created** | 2026-08-05 01:30:00                           |
| **Status**  | IMPLEMENTED                                   |

## Context

The kbar command palette reads a build-time index at `public/search.json`
that today contains only blog posts, so projects, the about page, and key
static pages are undiscoverable. This plan expands the generated index to
cover all content, emitting one English and one Italian entry per localized
document (sharing a single URL), and wires a custom client `SearchProvider`
that renders the new normalized entries correctly — the current default
Pliny mapper cannot, because it assumes string titles and a `date`/`path`
on every item.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/expand-search-index-all-content`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/expand-search-index-all-content
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

| Action        | Command                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Build         | `npm run build` (runs `next build`, which triggers contentlayer `onSuccess` and regenerates `public/search.json`)                             |
| Lint          | `npm run lint`                                                                                                                                |
| Inspect index | `cat public/search.json \| node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).length))"` |

> The project has no unit-test framework configured (no jest/vitest in
> `package.json`). Verification is done via the build output and manual
> inspection of `public/search.json` plus the running dev server
> (`npm run dev`). Tasks below describe concrete inspection checks in lieu
> of automated tests.

## Tasks

### Task 1: Add search-index generator helper for all content `[M]`

**Goal**: Create a `lib/generateSearchIndex.ts` helper that builds a
normalized, per-language, multi-type list of search entries and writes it
to `public/search.json`.

**Files**:

| File                         | Action | Description                                 |
| ---------------------------- | ------ | ------------------------------------------- |
| `lib/generateSearchIndex.ts` | create | Builds and writes the expanded search index |

**Reuse**:

| File                             | What to reuse                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `lib/generateProjectTagData.ts`  | Pattern: exported async fn, `writeFileSync`, iterate docs                                                      |
| `contentlayer.config.ts` (66–77) | Existing guard on `provider === 'kbar'` + `searchDocumentsPath` and `public/${path.basename(...)}` target path |
| `data/siteMetadata.js`           | `search.provider`, `search.kbarConfig.searchDocumentsPath`                                                     |

**Steps**:

1. Export `async function createSearchIndex(allBlogs, allProjects, authors)`.
2. Keep the existing guard: only proceed when
   `siteMetadata?.search?.provider === 'kbar'` and
   `siteMetadata.search.kbarConfig.searchDocumentsPath` is set. Write to
   `public/${path.basename(searchDocumentsPath)}` (matches current behavior
   and honors `BASE_PATH`).
3. Define an entry shape: `{ id, title, summary, type, url }` where `title`
   and `summary` are **plain strings** (already localized) and `type` is a
   section label (`'Blog' | 'Project' | 'Page'`).
4. Add a helper `emitLocalized(doc, url, type)` that pushes two entries:
   one from the `en` fields and one from the `it` fields. Fall back to the
   other language when one side is missing (e.g. `title.it ?? title.en`) so
   no empty title/URL is emitted (edge case: missing localized field).
   Give each entry a unique `id` (e.g. `${url}#en` / `${url}#it`).
5. Explicitly filter drafts: skip any blog/project with `draft === true`.
   (Do not rely on `allCoreContent`'s draft filter, which only applies when
   `NODE_ENV === 'production'`.)
6. Map content types:
   - Blogs → `type: 'Blog'`, `url: '/' + doc.path` (path is `blog/<slug>`).
   - Projects → `type: 'Project'`, `url: '/projects/' + doc.slug`.
   - About → `type: 'Page'`, `url: '/about'`, built from the author doc
     (`data/authors/default.mdx`). Use the author `name` for the title
     (author has no `{en,it}` title) with a short localized summary derived
     from `occupation`/`company` or a fixed localized string.
7. Append hand-authored static-page entries (see Task 2 — import from the
   shared definition) for `/contact`, `/projects`, `/blog`, each with en+it
   entries and `type: 'Page'`.
8. Serialize with `JSON.stringify(entries)` and `writeFileSync`. Log
   `'Local search index generated...'` to preserve existing console output.

**Tests**:

- After wiring (Task 3) and `npm run build`, inspect `public/search.json`:
  every entry has string `title`, string `summary`, a `type`, and a `url`
  starting with `/`. No entry has an object-valued `title`.

**Acceptance criteria covered**: entry fields (title/type/summary/url),
per-language double entries, draft exclusion, missing-localized fallback,
provider guard.

**Commit**: `feat(search): add expanded multi-content search index generator`

---

### Task 2: Define shared static-page search entries `[S]`

**Goal**: Provide a single source of truth for the hand-authored static
pages (`/contact`, `/projects`, `/blog`) with localized titles/summaries,
importable by the generator.

**Files**:

| File                       | Action | Description                                                                                                 |
| -------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `lib/searchStaticPages.ts` | create | Exports an array of `{ url, type, title:{en,it}, summary:{en,it} }` for contact, projects index, blog index |

**Reuse**:

| File                                                                 | What to reuse                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `app/contact/page.tsx`, `app/projects/page.tsx`, `app/blog/page.tsx` | Confirm existing route paths and page titles for accurate labels |

**Steps**:

1. Export `staticSearchPages` = array of three objects:
   `{ url: '/contact', type: 'Page', title: { en: 'Contact', it: 'Contatti' }, summary: {...} }`,
   `{ url: '/projects', type: 'Page', title: { en: 'Projects', it: 'Progetti' }, ... }`,
   `{ url: '/blog', type: 'Page', title: { en: 'Blog', it: 'Blog' }, ... }`.
2. Keep summaries short and localized (one line each). Verify wording
   against the actual pages.
3. This module is plain data (no contentlayer import) so it is safe to
   import from `lib/generateSearchIndex.ts` at build time.

**Tests**:

- `public/search.json` (after build) contains entries with URLs `/contact`,
  `/projects`, and `/blog`, each present in both languages.

**Acceptance criteria covered**: static pages indexed with correct URLs;
per-language entries for static pages.

**Commit**: `feat(search): add static page entries for search index`

---

### Task 3: Wire the generator into contentlayer onSuccess `[S]`

**Goal**: Replace the inline blog-only `createSearchIndex` with the new
helper, passing blogs, projects, and the author document.

**Files**:

| File                     | Action | Description                                                                        |
| ------------------------ | ------ | ---------------------------------------------------------------------------------- |
| `contentlayer.config.ts` | modify | Remove inline `createSearchIndex`; import and call the new helper from `onSuccess` |

**Reuse**:

| File                               | What to reuse                                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `contentlayer.config.ts` (316–321) | Existing `onSuccess` that destructures `importData()` and already calls `createBlogTagCount`/`createProjectTagCount` |

**Steps**:

1. Delete the inline `createSearchIndex(allBlogs)` function (lines ~66–77)
   and the now-unused imports if they become unused (`allCoreContent`,
   `sortPosts` — confirm before removing; keep any still referenced).
2. Import the new helper:
   `import { createSearchIndex } from './lib/generateSearchIndex'`.
3. In `onSuccess`, destructure `allBlogs, allProjects, allAuthors` (or the
   correct generated name for authors — verify against
   `contentlayer/generated`) from `await importData()`.
4. Call `await createSearchIndex(allBlogs, allProjects, allAuthors)` after
   the existing tag-count calls.

**Tests**:

- `npm run build` completes without errors and logs
  `Local search index generated...`.
- `public/search.json` now contains Blog, Project, and Page entries.

**Acceptance criteria covered**: index includes all content types; blog
entries preserved.

**Commit**: `refactor(search): generate index from all content in onSuccess`

---

### Task 4: Add custom client SearchProvider for the new index shape `[M]`

**Goal**: Replace the generic Pliny `SearchProvider` in `app/layout.tsx`
with a custom wrapper built on `KBarSearchProvider` that maps the new flat
entries into kbar actions and renders correctly.

**Files**:

| File                                   | Action | Description                                                                 |
| -------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `components/search/SearchProvider.tsx` | create | `'use client'` wrapper using `KBarSearchProvider` + `onSearchDocumentsLoad` |
| `app/layout.tsx`                       | modify | Import the local `SearchProvider` instead of `pliny/search`                 |

**Reuse**:

| File                                  | What to reuse                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `faq/customize-kbar-search.md`        | Reference implementation of a custom `KBarSearchProvider` with `onSearchDocumentsLoad` |
| `data/siteMetadata.js`                | `search.kbarConfig.searchDocumentsPath` for the config                                 |
| `node_modules/pliny/search/KBar.d.ts` | `KBarSearchProps` typing for `onSearchDocumentsLoad`                                   |

**Steps**:

1. Create `components/search/SearchProvider.tsx` with `'use client'`.
2. Use `KBarSearchProvider` from `pliny/search/KBar`, `useRouter` from
   `next/navigation`.
3. Set `searchDocumentsPath` from
   `siteMetadata.search.kbarConfig.searchDocumentsPath`.
4. Implement `onSearchDocumentsLoad(json)` mapping each entry to a kbar
   action: `{ id, name: entry.title, keywords: entry.summary || '',
section: entry.type, subtitle: entry.summary, perform: () =>
router.push(entry.url) }`. Because `url` is already absolute (`/...`),
   push it directly (do not prepend `/`).
5. Optionally add `defaultActions` for Homepage (`/`) to preserve baseline
   navigation — keep minimal; not required by spec.
6. In `app/layout.tsx`, replace
   `import { SearchProvider, SearchConfig } from 'pliny/search'` and the
   `<SearchProvider searchConfig={...}>` usage with the new local
   `SearchProvider` wrapping `<Layout>`. Remove the now-unused
   `SearchConfig` import if nothing else uses it.

**Tests**:

- Run `npm run dev`, open the palette (Ctrl/Cmd-K), and verify:
  results show readable localized titles (not `[object Object]`), grouped
  by section (`Blog`/`Project`/`Page`); searching a project name, an
  Italian summary term, and "about"/"contact" surfaces the right entries;
  selecting a result navigates to the correct URL.

**Acceptance criteria covered**: entries render with localized title +
type + summary; selecting a result navigates correctly; both languages
searchable; no blog regression.

**Commit**: `feat(search): render expanded search index via custom kbar provider`

---

**Task ordering**: Task 2 has no dependencies. Task 1 depends on Task 2
(imports `staticSearchPages`). Task 3 depends on Task 1. Task 4 depends on
the index shape defined in Task 1 (field names must match) but touches only
client code, so it can be developed in parallel once the entry shape from
Task 1 is fixed; verify end-to-end after Task 3. Recommended order:
2 → 1 → 3 → 4.

## Edge Cases & Error Handling

- **Missing localized field**: `emitLocalized` falls back to the other
  language (`?? `) so titles/URLs are never empty (Task 1).
- **Draft content**: explicitly filtered by `draft === true` in the
  generator, independent of `NODE_ENV` (Task 1).
- **Empty summary**: entry still emitted with title/type/url; `keywords`
  and `subtitle` default to `''` in the mapper (Tasks 1, 4).
- **Duplicate-looking en/it results**: accepted; both share one URL and
  resolve to the same page (Tasks 1, 4).
- **Search provider disabled / non-kbar**: generator guard skips writing;
  no file emitted (Task 1).
- **URL already absolute**: mapper pushes `entry.url` directly rather than
  prepending `/` (Task 4), unlike the default Pliny mapper.

## Verification

1. Run `npm run build`; confirm it logs `Local search index generated...`
   and completes without errors.
2. Inspect `public/search.json`: confirm entries for blog posts, all
   non-draft projects (`/projects/<slug>`), the about page (`/about`), and
   the three static pages (`/contact`, `/projects`, `/blog`); confirm every
   localized document has both an en and an it entry; confirm all `title`
   and `summary` values are plain strings and all `url` values start with
   `/`.
3. Run `npm run dev`, open the command palette, and verify localized
   titles render, results are grouped by section, queries in English and
   Italian both match, and selecting results navigates to the correct
   pages (including an existing blog post — no regression).
4. Run `npm run lint` to confirm no lint errors in the new/changed files.
