# Plan: Publish Two Blog Articles and Draft All Existing Ones

| Field       | Value                                                 |
| ----------- | ----------------------------------------------------- |
| **Title**   | Publish Two Blog Articles and Draft All Existing Ones |
| **Spec**    | specs/publish-two-blog-articles-and-draft-existing.md |
| **Type**    | chore                                                 |
| **Branch**  | chore/publish-two-blog-articles-and-draft-existing    |
| **Created** | 2026-07-28 00:00:00                                   |
| **Status**  | IMPLEMENTED                                           |

## Context

Two newly written blog articles must be published to the site, and every
pre-existing blog article must be hidden from production at the same time. In
this Contentlayer-based site, hiding is done via the `draft: true` frontmatter
flag (files stay in `data/blog/`), and publishing means adding the `.mdx` files
with `draft: false`.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `chore/publish-two-blog-articles-and-draft-existing`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b chore/publish-two-blog-articles-and-draft-existing
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping:

- chore → `chore/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task below maps to exactly one commit.

## Build & Test Commands

| Action | Command      |
| ------ | ------------ |
| Build  | `yarn build` |
| Lint   | `yarn lint`  |

(There is no test framework in this project. Verification relies on a successful
Contentlayer generation + Next.js build, which is triggered by `yarn build`.)

## Tasks

### Task 1: Add the two new articles to `data/blog/` `[S]`

**Goal**: Publish both new articles by copying their source `.mdx` files into
`data/blog/` unchanged, keeping `draft: false`.

**Files**:

| File                                                                         | Action | Description                              |
| ---------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| `data/blog/building-a-two-agent-blog-writer-system-in-opencode.mdx`          | create | Copy of the source draft, `draft: false` |
| `data/blog/server-side-ai-exam-generation-and-a-generated-vs-curated-ux.mdx` | create | Copy of the source draft, `draft: false` |

**Reuse**:

| File                             | What to reuse                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `data/blog/the-time-machine.mdx` | Reference for the expected bilingual frontmatter shape (`title`/`summary` as `{en,it}`, `tags` as `{id,label:{en,it}}`) |

**Steps**:

1. Copy `/Users/davide/Personal/Projects/blog-writer/drafts/building-a-two-agent-blog-writer-system-in-opencode.mdx`
   verbatim into `data/blog/` with the same filename.
2. Copy `/Users/davide/Personal/Projects/blog-writer/drafts/server-side-ai-exam-generation-and-a-generated-vs-curated-ux.mdx`
   verbatim into `data/blog/` with the same filename.
3. Confirm each file keeps `draft: false` in its frontmatter.
4. Note that the source frontmatter includes a `topic_key` field not present in
   the Contentlayer schema (`contentlayer.config.ts`, `Blog` fields). Contentlayer
   ignores unknown fields, so it is harmless; leave it as-is. The `title`,
   `summary`, `date`, `tags`, `lastmod`, and `draft` fields all match the schema.

**Tests**:

- No unit tests. Verify via `yarn build`: Contentlayer must generate both new
  `Blog` entries with no schema errors.

**Acceptance criteria covered**: New articles exist with `draft: false`; both
appear in the production listing (verified together with Task 2 via build).

**Commit**: `chore(blog): add two new blog articles`

---

### Task 2: Set all pre-existing articles to `draft: true` `[S]`

**Goal**: Hide every pre-existing blog article from production by setting
`draft: true` in each file's frontmatter.

**Files**:

| File                                                                          | Action | Description                                     |
| ----------------------------------------------------------------------------- | ------ | ----------------------------------------------- |
| `data/blog/code-sample.mdx`                                                   | modify | `draft: false` → `draft: true`                  |
| `data/blog/deriving-ols-estimator.mdx`                                        | modify | set `draft: true`                               |
| `data/blog/github-markdown-guide.mdx`                                         | modify | set `draft: true`                               |
| `data/blog/guide-to-using-images-in-nextjs.mdx`                               | modify | set `draft: true`                               |
| `data/blog/introducing-tailwind-nextjs-starter-blog.mdx`                      | modify | set `draft: true`                               |
| `data/blog/my-fancy-title.mdx`                                                | modify | already `draft: true` — leave unchanged (no-op) |
| `data/blog/new-features-in-v1.mdx`                                            | modify | set `draft: true`                               |
| `data/blog/pictures-of-canada.mdx`                                            | modify | set `draft: true`                               |
| `data/blog/release-of-tailwind-nextjs-starter-blog-v2.0.mdx`                  | modify | set `draft: true`                               |
| `data/blog/the-time-machine.mdx`                                              | modify | set `draft: true`                               |
| `data/blog/nested-route/introducing-multi-part-posts-with-nested-routing.mdx` | modify | set `draft: true`                               |

**Reuse**:

| File                                                                | What to reuse                                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `lib/generateBlogTagData.ts`, `app/sitemap.ts`, `pliny` `sortPosts` | Existing draft-filtering behaviour — no code changes needed; setting the flag is sufficient |

**Steps**:

1. For each pre-existing file, locate the `draft:` line in frontmatter and set it
   to `true`. If a file has no `draft` field, add `draft: true`.
2. Leave `my-fancy-title.mdx` as-is (already `draft: true`).
3. Do not delete any files; hiding is via the flag only.

**Tests**:

- No unit tests. Verify via `yarn build` that the production listing, sitemap,
  and tag data exclude these posts.

**Acceptance criteria covered**: All 11 pre-existing articles are drafts;
production shows only the two new articles; sitemap/tag data include only the
two new articles.

**Commit**: `chore(blog): mark existing articles as drafts`

---

**Task ordering**: Task 1 and Task 2 are independent and may be done in either
order, but both must land before the final verification build.

## Edge Cases & Error Handling

- Unknown `topic_key` field in new articles: Contentlayer ignores unrecognised
  frontmatter fields, so no error (Task 1).
- `my-fancy-title.mdx` already a draft: treated as a no-op, not an error (Task 2).
- Nested-route post: set to `draft: true` like the rest — not exempt for being in
  a subfolder (Task 2).
- Slug collisions: neither new filename collides with an existing blog file
  (Task 1).
- Frontmatter schema mismatch: both new files use the required bilingual
  `title`/`summary` and `{id,label:{en,it}}` tags, matching the schema; verified
  by a clean build (Task 1).

## Verification

1. Run `yarn build` — Contentlayer generation and the Next.js build must complete
   with no errors, confirming all 13 files parse.
2. Confirm the generated blog listing (production) contains exactly the two new
   articles and none of the 11 pre-existing ones.
3. Confirm `app/sitemap.ts` output and production tag data reference only the two
   new articles.
4. Optionally run `yarn lint` to confirm no lint/formatting regressions on the
   `.mdx` files.
