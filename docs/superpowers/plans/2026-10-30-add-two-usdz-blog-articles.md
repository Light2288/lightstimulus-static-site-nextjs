# Add two USDZ blog articles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `personal-workflows:spec-implement` with `superpowers:executing-plans` for the proposed native execution method, or `superpowers:subagent-driven-development` if the user selects delegation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the two supplied published articles to the blog with their original bilingual content and metadata, verified through the existing production pipeline.

**Architecture:** Copy the supplied MDX files into `data/blog/`. Existing Contentlayer discovery and build hooks generate the article pages, localized search entries, tag data, and sitemap; existing components handle language selection and rendering.

**Tech Stack:** Next.js 15, React 19, Contentlayer2, bilingual MDX, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-30-add-two-usdz-blog-articles.md`

**Slug:** `add-two-usdz-blog-articles`

**Status:** APPROVED

**Created:** 2026-10-30

**Updated:** 2026-10-30

**Execution tier:** lite

**Implementation model role:** light

**Execution method:** Native, approved with this plan. Inline execution does not switch the parent model; final review still uses the managed specification and quality review roles.

**Provenance:** The separately approved specification above; user scope confirmation “confirmed,” followed by specification approval “approved,” followed by a separate plan approval “approved” after this plan's Stage 3 presentation. Repository inspected at `0d57bd4c5bf527394d2baac6ae5cc9f18091bff8`. Both saved artifacts are approved for implementation.

## Global Constraints

- Work in the existing checkout; do not create a worktree.
- Preserve both source files and every pre-existing blog document, including their draft/publication status.
- Preserve exact filenames and source content/metadata, allowing only repository-required whitespace formatting.
- Keep `draft: false` and `images: []` in both articles. Preserve `topic_key` without changing the Contentlayer schema.
- Preserve `date` and `lastmod` of `2026-10-30` for the illustration article and `2026-10-23` for the validator article.
- Treat historical technical descriptions as supplied; add no covers, assets, components, schemas, configuration, dependencies, or editorial revisions.
- Keep workflow artifacts uncommitted until plan approval and implementation-branch creation. Update `main` safely only after that approval; preserve local work.
- Implement and commit on `chore/add-two-usdz-blog-articles`. Do not push, merge, or deploy.
- Add no tests that merely duplicate static article content. Use existing tests, source comparisons, real generated output, and browser checks.

## Repository Evidence

Artifact resolution: the specification is `NEW_ONLY`; no same-slug or linked implementation plan existed before this draft, so the plan uses the specification's exact basename. No unresolved material clarification remains.

The architecture map at `docs/architecture/map.md` was generated on August 28, 2026, at HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`. It is stale relative to the inspected HEAD above. All ten documented key paths still exist; direct inspection confirms the relevant MDX, localization, search, and static-export paths. Do not regenerate the map. No ADR files were found under `docs`; there is no applicable recorded ADR constraint.

Command and output evidence:

- `package.json`: `npm run test -- <filters>` runs the configured Vitest runner; `npm run build` runs Next's production build and `scripts/postbuild.mjs`; `npm run dev` starts the development server.
- `vitest.config.mts` and the existing suites named in Step 4 establish the focused test command.
- `contentlayer.config.ts`, `components/MDXComponents.tsx`, and `components/mdx/Lang.tsx` establish compatible bilingual MDX discovery and rendering.
- `app/blog/page.tsx` uses five posts per page; `app/page.tsx` and `components/home/BlogPreview.tsx` apply existing homepage selection. Do not hard-code a different post count or ordering.
- `lib/generateSearchIndex.ts` generates two localized search entries per non-draft post; `data/siteMetadata.js` selects `/search.json`.
- `lib/generateBlogTagData.ts` counts published tag IDs in production; `app/sitemap.ts` includes published blog routes.
- `next.config.js` selects static export to `out/`. `.gitignore` excludes Contentlayer output, generated search/tag data, feeds, and the export.
- `.husky/pre-commit` runs lint-staged; `package.json` applies Prettier to staged Markdown/MDX. Content comparisons must tolerate that formatting only.

## Review Focus

1. **Source changes or destination collisions:** Recheck before copying and retain source/baseline identities; do not overwrite conflicting work.
2. **Formatting alters content:** Compare parsed metadata and compiled content with the external originals after commit hooks.
3. **Language bodies overlap:** Open each actual article and switch English/Italian, checking the selected title, summary, and prose while the other language body is absent.
4. **Import date replaces publication date:** Check generated dates and date-based listing/homepage order against the original October 30 and October 23 dates.
5. **Fixture tests miss generation:** Inspect actual exported pages, bilingual search entries, tag counts, and sitemap membership after the build.

---

### Task 1: Import and verify both published articles [size: S | risk: none | mechanical: true | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07.

**Files:**

- Create: `data/blog/from-project-illustration-to-validated-3d-asset.mdx`.
- Create: `data/blog/building-a-usdz-validator-that-admits-what-it-cannot-check.mdx`.
- Maintain: this specification/plan pair; record execution and review evidence here or in this task's evidence directory if needed.
- Regenerate ignored output only through the existing build pipeline.
- Existing tests: `components/blog/`, `components/home/BlogPreview.test.tsx`, `components/search/SearchProvider.test.tsx`, `components/mdx/Lang.test.tsx`, `contexts/LanguageContext.test.tsx`, `layouts/BlogPostLayout.test.tsx`, `layouts/ListWithTagsLayout.test.tsx`, and `app/sitemap.test.ts`.

**Interfaces:**

- Consumes the two external files at the exact absolute paths in the specification and the existing Blog frontmatter/`Lang` contract.
- Produces `/blog/from-project-illustration-to-validated-3d-asset` and `/blog/building-a-usdz-validator-that-admits-what-it-cannot-check`; existing generators discover them without registration or interface changes.

- [x] **Step 1: Establish approval evidence and the implementation branch.** After explicit plan approval, record both separate approvals and save both approved artifacts. Inspect local state, safely update `main` with `git pull --ff-only`, then run `git switch -c chore/add-two-usdz-blog-articles`. Preserve uncommitted workflow artifacts and unrelated work; reconcile any relevant upstream change before implementation and stop on divergence rather than forcing it. Commit only the approved artifact pair with `docs: record approved USDZ blog import plan`. Expected: the correct local branch contains both artifacts before product changes.

- [x] **Step 2: Capture the import baseline.** Record hashes of both external sources and all pre-existing `data/blog/` files, confirm both destination basenames are absent, and parse source frontmatter with the existing `gray-matter` dependency. Expected: two complete `en`/`it` bodies, source dates and `lastmod` values specified above, `draft: false`, `images: []`, and no additional local asset dependencies. These are direct import checks authorized by the specification, not a new content-test suite.

- [x] **Step 3: Copy the supplied MDX documents.** Copy each original to its exact destination above without rewriting metadata or prose. Compare copies to sources before formatting. Expected: both copies initially match source bytes, all preserved fields match AC-02, and every pre-existing article still matches its baseline. If commit formatting later changes whitespace, compare parsed metadata and MDX compilation semantics against the sources.

- [x] **Step 4: Run existing focused checks and the production build.** From the repository root, run:

  ```sh
  npm run test -- components/blog components/home/BlogPreview.test.tsx components/search/SearchProvider.test.tsx components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx layouts/BlogPostLayout.test.tsx layouts/ListWithTagsLayout.test.tsx app/sitemap.test.ts
  npm run build
  ```

  Expected: every selected suite passes and the production build/export and postbuild complete with exit 0. Record decisive output and distinguish existing warnings, including undeclared `topic_key`, from new failures. Do not broaden scope to unrelated repairs or repeat builds without a changed input or unresolved failure.

- [x] **Step 5: Inspect actual generated integration.** Confirm that both generated Blog documents have the approved basenames, dates, localized metadata, and publication status, and that both exported article HTML files exist. Check both URLs in the exported sitemap and exactly one search entry per article per language in `public/search.json` and the exported search data. Recompute published tag counts from generated posts and compare with `app/blog-tag-data.json`. Confirm the blog listing, pagination, and homepage use the existing date order; existing documents retain baseline hashes. Expected: AC-01 through AC-03 and AC-05 through AC-07 hold in real output, beyond fixture tests.

- [x] **Step 6: Inspect both articles in the browser.** Start the configured server with `npm run dev` and open both exact article routes. Use the existing language toggle to check English and Italian titles, summaries, headings, prose, links, and code blocks; confirm only the selected body is visible, no missing hero image appears, and both pages remain readable at desktop and narrow mobile widths. Inspect the blog list and localized search for both new articles. Expected: AC-04 and the visible AC-05/AC-06 integration pass without affected console errors. Stop only the server started for this task. Production-export inspection remains the evidence for the build itself.

- [x] **Step 7: Commit and complete the final review.** Review the full diff, commit the two imported articles with `feat(blog): add two USDZ articles`, and recheck source metadata/content and baseline identities after the formatting hook. Invoke `personal-workflows:code-review` once in integrated mode, specification review followed by quality review, using the same review package. Address findings within the approved scope and repeat only affected checks if changes warrant it. Record observed verification and review outcomes, then commit workflow bookkeeping. Expected: all acceptance criteria are satisfied, both required review stages pass, only approved files are committed, and the branch remains local.

## Acceptance Traceability

| Criteria     | Task and evidence                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| AC-01, AC-02 | Task 1 Steps 2–3 and 7: source, metadata, body, and baseline comparisons before and after formatting |
| AC-03        | Task 1 Steps 4–5: successful production build and exported article routes                            |
| AC-04        | Task 1 Steps 4 and 6: existing language/layout tests and actual bilingual browser checks             |
| AC-05        | Task 1 Steps 2, 5–6: unchanged existing posts, real date ordering, listing, homepage, pagination     |
| AC-06        | Task 1 Steps 4–6: real bilingual search entries, tag counts, and sitemap plus visible search         |
| AC-07        | Task 1 Steps 1 and 7: bounded diff, approved Git workflow, and sequential final reviews              |

## Handoff and endpoint

The task is eligible for the lite tier because it copies compatible existing content, follows a clear pattern, and has objective checks without application behavior changes. Native execution is recommended for this single small task; it retains the current parent model. The final-review workflow is required regardless of implementation tier.

Stage 4 is authorized: the user separately approved the specification and this implementation plan, preserving the plan's native method. Both approved artifacts were saved before changing product content.

**Execution endpoint:** Both articles work locally, verification and sequential final review are complete, all approved changes are committed locally, and results and limitations are reported. Stop before pushing, deploying, or starting another increment.

## Execution evidence — 2026-10-30

- `git pull --ff-only` safely advanced `main` from `0d57bd4` to `f5361b7`; the upstream change only corrected the README logo path. Implementation uses `chore/add-two-usdz-blog-articles` in the existing checkout. Approved artifacts were committed as `74f5b4f` before content changes; article import commit: `1076655`.
- Both imported articles remain **byte-identical** to their external originals after the commit hook. Source SHA-256 values are `df5a179a7c0b9d9d994aaffb6f0f5726e60f38ffa4fb5f38a4cdc5b6ba23f1e8` (illustration) and `c247af0558ee700fdcfd5837307a5fb9d5cea2c4176b28e0b6a25880288644f7` (validator). All 16 pre-existing blog documents match their baseline hashes.
- The exact focused command in Step 4 passed before import, after import, and through the native completion helper: **11 files / 262 tests**, exit 0. The required branch-finishing full `npm run test` subsequently passed: **86 files / 1,406 tests**, exit 0.
- `npm run build` passed with exit 0, generating **25 Contentlayer documents and 39 pages**, followed by successful USDZ and RSS postbuild steps. A final build after browser development checks restored production-generated tag data and caches. Existing warnings concern Next configuration/export headers, undeclared `topic_key`, optional `@emotion/is-prop-valid`, deprecated `punycode`, and TypeScript project references; application configuration was not changed.
- Generated-output assertions passed for exact metadata and bodies, both exported article pages, four localized search entries shared by public/exported indexes, both sitemap URLs, and published tag counts. The existing date order places the new articles first and second; the homepage preview then includes Tachyon. Seven published posts retain the existing two-page pagination inputs.
- Browser checks passed for both article routes in English and Italian at **1440×900** and **390×844**: eight combinations, each showing the expected title, summary, four section headings, one code block, no hero image, and no horizontal overflow. The selected language body appears without the opposite body. Both localized search palettes find both articles; selecting results navigates to the correct routes. No browser error logs were captured.
- The task's development server used port 3001 because port 3000 was already occupied. Only the task's server was stopped; the temporary browser tab was closed, viewport override reset, and initial Italian/light preferences restored.
- Scratch verification correction: the blog list is rendered through a client Suspense boundary, so a static DOM-only article query was unsuitable. The helper now checks serialized `BlogListClient` props and actual homepage card anchors, alongside the observed browser list. No product behavior was changed to accommodate the helper.
- Final sequential gate: **SPEC REVIEW: PASS** (`gpt-6-luna`), then **QUALITY REVIEW: PASS** (`gpt-6.1-sol`), no findings. Both verified the unchanged package and identity values. The same quality-review seat resumed after a slow turn; no replacement or additional review gate was introduced.
- `GATE_RUN_ID`: `9fc3f5a3-328e-4db4-89af-02a27fb053c4`; `REVIEWED_STATE_ID`: `1076655bb00d1efce4431e33fbad8422a45a2f76:2cc21cd9-aad1-414b-8780-7476b38208fb`; `PACKAGE_SHA256`: `84ebbbe378c516188cfe83ae5c8187d643d314ca24b86d9c79274626cc2f934e`. Subsequent workflow completion metadata does not change either article.
- Scope ruling: preserve supplied historical claims and pre-existing infrastructure, and limit hosting/device claims to observed local evidence, as required by this content import. Broader historical correctness, infrastructure behavior, live hosting, and Safari/device compatibility remain unverified. The full suite was unobserved during review and then passed during branch finishing. No review fixes or deferred minor findings remain.
- Full logs, source/baseline identities, browser receipts/screenshots, output assertions, the immutable review package, and both reports are archived outside the repository at `/Users/davide/.codex/visualizations/2026/10/30/01a18c66-dfc2-7630-b9a2-609d5d419cdf/usdz-blog-import/`.

**Implementation status:** Complete. AC-01 through AC-07 are satisfied. Keep the branch in place; no push, merge, deployment, or subsequent increment is authorized.
