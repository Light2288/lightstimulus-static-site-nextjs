# Publish Two Blog Articles and Draft All Existing Ones

| Field       | Value                                                 |
| ----------- | ----------------------------------------------------- |
| **Title**   | Publish Two Blog Articles and Draft All Existing Ones |
| **Type**    | chore                                                 |
| **Scope**   | Blog content (`data/blog/`)                           |
| **Created** | 2026-07-28 00:00:00                                   |
| **Status**  | IMPLEMENTED                                           |

## Problem Statement

Two newly written blog articles need to go live on the production site, and at
the same time every article currently in the blog should be hidden from
production. The desired end state is a blog whose production listing shows only
the two new articles.

The two source articles live outside this repository at:

- `/Users/davide/Personal/Projects/blog-writer/drafts/building-a-two-agent-blog-writer-system-in-opencode.mdx`
- `/Users/davide/Personal/Projects/blog-writer/drafts/server-side-ai-exam-generation-and-a-generated-vs-curated-ux.mdx`

## Current Behavior

- Blog articles are `.mdx` files under `data/blog/`, registered automatically by
  Contentlayer (glob `blog/**/*.mdx`).
- "Draft" is not a folder — it is the `draft: true` frontmatter boolean. Posts
  with `draft: true` are filtered out of the production blog listing, the
  paginated listing, next/prev navigation, the sitemap, and (in production) the
  tag data. Files remain in `data/blog/` either way.
- There are currently 11 blog files:
  1. `code-sample.mdx`
  2. `deriving-ols-estimator.mdx`
  3. `github-markdown-guide.mdx`
  4. `guide-to-using-images-in-nextjs.mdx`
  5. `introducing-tailwind-nextjs-starter-blog.mdx`
  6. `my-fancy-title.mdx` (already `draft: true`)
  7. `new-features-in-v1.mdx`
  8. `pictures-of-canada.mdx`
  9. `release-of-tailwind-nextjs-starter-blog-v2.0.mdx`
  10. `the-time-machine.mdx`
  11. `nested-route/introducing-multi-part-posts-with-nested-routing.mdx`
- The two new articles are not yet present in this repository.

## Desired Outcome

- The two new articles are added to `data/blog/`, keeping their existing source
  filenames (which become the URL slugs):
  - `building-a-two-agent-blog-writer-system-in-opencode.mdx`
  - `server-side-ai-exam-generation-and-a-generated-vs-curated-ux.mdx`
    Both retain `draft: false` so they appear in production.
- All 11 pre-existing blog articles are set to `draft: true` so they no longer
  appear in production (listing, pagination, next/prev, sitemap, tag data).
  `my-fancy-title.mdx` is already a draft and simply stays that way.
- After the change, the production blog shows exactly the two new articles and
  nothing else.

## Acceptance Criteria

- [ ] `data/blog/building-a-two-agent-blog-writer-system-in-opencode.mdx` exists,
      matching the source file's content, with `draft: false`.
- [ ] `data/blog/server-side-ai-exam-generation-and-a-generated-vs-curated-ux.mdx`
      exists, matching the source file's content, with `draft: false`.
- [ ] All 11 pre-existing articles listed above have `draft: true` in their
      frontmatter.
- [ ] The production blog listing renders only the two new articles.
- [ ] The sitemap and production tag data include only the two new articles.
- [ ] The site builds successfully (Contentlayer generation + Next.js build) with
      no errors introduced by these changes.

## Edge Cases & Error Handling

- **Frontmatter shape:** the two new articles use the site's bilingual
  (`en`/`it`) `title`/`summary` objects and localized `tags`. Confirm they match
  the required Contentlayer schema so generation does not fail.
- **`lastmod` / `topic_key` fields:** the source frontmatter includes fields such
  as `topic_key` and `lastmod`. Verify these are either supported by the schema
  or harmless extras that Contentlayer ignores.
- **Slug collisions:** neither new filename collides with an existing blog file.
- **Already-draft file:** `my-fancy-title.mdx` is already `draft: true`; leave it
  unchanged rather than error on a no-op.
- **Nested-route post:** `nested-route/introducing-multi-part-posts-with-nested-routing.mdx`
  must also be set to `draft: true`; it is not exempt for living in a subfolder.

## Dependencies & Constraints

- Content is managed by Contentlayer (`contentlayer2`); no manual index needs
  updating — adding/editing `.mdx` files under `data/blog/` is sufficient.
- The two source files exist outside this repo and must be copied in; the copies
  are authored under `data/blog/`.

## Out of Scope

- Editing the prose/content of the two new articles beyond what is needed to fit
  the project's frontmatter schema.
- Deleting any existing article files (they are hidden via `draft: true`, not
  removed).
- Any changes to blog rendering logic, layouts, or the draft-filtering mechanism
  itself.
- Adding matching project entries, authors, or images.
