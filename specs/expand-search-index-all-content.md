# Expand Site Search Index to Cover All Content

| Field       | Value                                            |
| ----------- | ------------------------------------------------ |
| **Title**   | Expand Site Search Index to Cover All Content    |
| **Type**    | feature                                          |
| **Scope**   | search index generation (contentlayer.config.ts) |
| **Created** | 2026-08-05 00:00:00                              |
| **Status**  | IMPLEMENTED                                      |

## Problem Statement

The site's command palette (Pliny kbar `SearchProvider`, configured in
`data/siteMetadata.js`) reads a static index generated at build to
`public/search.json`. Today that index only contains blog posts, so
projects and the about page are not discoverable via search. Visitors
who search for a project name, a technology used in a project, or
information about the author get no results, which makes a growing part
of the site invisible to the primary discovery affordance.

The site is also bilingual (`{ en, it }` frontmatter for
`title`/`summary`/`tags`) with no language-specific URLs, so the index
must decide how to represent both languages against a single URL per page.

## Current Behavior

- `contentlayer.config.ts` defines a `createSearchIndex(allBlogs)`
  helper that, when `siteMetadata.search.provider === 'kbar'` and a
  `searchDocumentsPath` is set, writes
  `public/search.json` from `allCoreContent(sortPosts(allBlogs))`.
- `onSuccess` calls `createSearchIndex(allBlogs)` — **only blog posts**
  are passed in.
- As a result, `public/search.json` contains only blog documents.
  Projects (`data/projects/*.mdx` → `allProjects`), the about author
  page (`data/authors/default.mdx`), and static routes
  (`/contact`, `/projects`, `/blog`) are absent from search.
- kbar renders each indexed document using its `title` and links via the
  document's `path`/`url`. Blog documents resolve correctly because
  their `path` maps to `/blog/<slug>`.

## Desired Outcome

`public/search.json` is generated from all indexable content so that the
command palette surfaces:

- **Blog posts** — unchanged from today, linking to `/blog/<slug>`.
- **Projects** — every `data/projects/*.mdx`, linking to
  `/projects/<slug>`.
- **About page** — a single entry for `data/authors/default.mdx`,
  linking to `/about`.
- **Static pages** — hand-authored entries for the contact page
  (`/contact`), the projects index (`/projects`), and the blog index
  (`/blog`).

Each result carries a title, a type/section label, a summary subtitle,
and the correct URL. Because there are no language-specific URLs, every
localized document produces **two index entries** — one for English and
one for Italian — both pointing at the same URL, so a query in either
language finds the page.

## Language Model

- For every localized document (blog, project, about), emit **two search
  entries**: one built from the `en` fields and one from the `it` fields.
- Both entries for a document share the **same URL** (there are no
  `/en` or `/it` routes).
- The English entry uses `title.en` / `summary.en`; the Italian entry
  uses `title.it` / `summary.it`. Tag labels follow the same per-language
  split where tags are included.
- Static-page entries (contact, projects index, blog index) likewise get
  an English and an Italian entry, using the page's localized title and
  a short localized description.

## Result Shape

Each entry in `search.json` contains:

- **title** — the localized page/post/project title.
- **type / section label** — a category such as `Blog`, `Project`, or
  `Page`, so results are visually grouped/identifiable.
- **summary** — the localized summary used as the result subtitle.
- **url** — the canonical route for the content
  (`/blog/<slug>`, `/projects/<slug>`, `/about`, `/contact`,
  `/projects`, `/blog`).

Full MDX body text is **not** indexed; matching is on
title/summary/type (and tag labels where present).

## Acceptance Criteria

- [ ] After a build, `public/search.json` contains entries for blog
      posts, projects, the about page, and the three static pages
      (contact, projects index, blog index).
- [ ] Every project in `data/projects/*.mdx` (that is not a draft) is
      represented, with URL `/projects/<slug>`.
- [ ] The about page is represented with URL `/about`.
- [ ] Static pages are represented with URLs `/contact`, `/projects`,
      and `/blog`.
- [ ] Each localized document (blog, project, about) produces two
      entries — one English, one Italian — both pointing to the same URL.
- [ ] Each entry includes a localized title, a type/section label, a
      localized summary subtitle, and a correct URL.
- [ ] Selecting any result in the kbar palette navigates to the correct
      page.
- [ ] Content flagged `draft: true` (blog or project) is excluded from
      the index.
- [ ] Existing blog search results continue to work with the same URLs
      and titles as before (no regression).

## Edge Cases & Error Handling

- **Missing localized field**: if a document lacks `it` (or `en`)
  title/summary, the corresponding entry should fall back gracefully
  (e.g. reuse the available language) rather than emit an empty/broken
  result.
- **Draft content**: excluded from the index entirely; no entry in
  either language.
- **Duplicate-looking results**: because en/it entries share a URL, a
  user searching a term present in both languages may see two similar
  results — this is accepted, both resolve to the same page.
- **Search provider disabled or non-kbar**: index generation remains
  guarded by the existing `provider === 'kbar'` and `searchDocumentsPath`
  checks; when not applicable, nothing is written.
- **Empty summary**: entries with no summary should still index cleanly
  with just title + type + URL.

## Dependencies & Constraints

- Index generation happens in `contentlayer.config.ts` `onSuccess`,
  which already receives `allBlogs` and `allProjects` from
  `importData()`. The about author is available via the `Authors`
  document type; static-page entries have no MDX source and must be
  authored inline.
- Must honor `siteMetadata.search.kbarConfig.searchDocumentsPath` and the
  `BASE_PATH` prefix (the config already prefixes `search.json` with
  `process.env.BASE_PATH`).
- Output must remain compatible with what Pliny's kbar
  `SearchProvider` expects to read from `public/search.json`.
- No language-specific routing exists; URLs are single-locale.

## Out of Scope

- Adding language-specific URLs or i18n routing.
- Indexing full MDX body text / full-text search.
- Switching search providers (e.g. Algolia) or changing the kbar UI.
- Ranking, boosting, or fuzzy-match tuning beyond kbar defaults.
- Generating tag-count or other auxiliary data files (handled elsewhere).

## Notes

- Current generator: `createSearchIndex(allBlogs)` in
  `contentlayer.config.ts` (lines ~66–77 and the `onSuccess` call at
  ~316–321) writes only blog content.
- Relevant routes confirmed present: `app/blog/[...slug]/page.tsx`,
  `app/projects/[slug]/page.tsx`, `app/about/page.tsx`,
  `app/contact/page.tsx`, `app/projects/page.tsx`, `app/blog/page.tsx`.
- Blog and Project document types already expose `titleEn`/`summaryEn`
  (and blog has `titleIt`/`summaryIt`) computed fields, which may help
  build the per-language entries.
- Open question for implementation: exact type-label wording
  (`Blog`/`Project`/`Page` vs. localized labels) and whether tag labels
  are added to the searchable text — can be decided during planning.
