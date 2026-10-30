# Add two USDZ blog articles

**Slug:** `add-two-usdz-blog-articles`

**Type:** chore

**Status:** APPROVED

**Created:** 2026-10-30

**Updated:** 2026-10-30

**Provenance:** User request to add the two articles listed below. The user confirmed the Stage 1 scope/design proposal with “confirmed,” separately approved this specification with “approved” after its Stage 2 presentation, and then separately approved the implementation plan with another “approved” after its Stage 3 presentation. Both artifacts are saved and approved for Stage 4 implementation.

## Problem and current behavior

The supplied articles exist in the blog-writer project's published directory but are absent from this site's `data/blog/` directory:

- `/Users/davide/Personal/Projects/blog-writer/published/from-project-illustration-to-validated-3d-asset.mdx`
- `/Users/davide/Personal/Projects/blog-writer/published/building-a-usdz-validator-that-admits-what-it-cannot-check.mdx`

The site uses Contentlayer to discover `data/blog/**/*.mdx`. Its existing schema accepts bilingual titles and summaries, localized tags, dates, publication status, and image metadata. The registered `Lang` MDX component renders the English or Italian body according to the existing language control. The build generates search and tag data, article routes, and the sitemap.

Both sources already use this content format, declare `draft: false`, and have `images: []`. Neither references additional local assets. Their `topic_key` metadata follows the convention already present in imported blog articles, although it is not a declared Contentlayer field.

## Desired outcome and approach

Import both complete MDX documents into `data/blog/` using their original filenames. Their resulting routes are:

- `/blog/from-project-illustration-to-validated-3d-asset`
- `/blog/building-a-usdz-validator-that-admits-what-it-cannot-check`

Preserve both languages, prose, code blocks, links, titles, summaries, localized tags, `topic_key`, `draft: false`, and empty image arrays. Preserve the first article's `date` and `lastmod` of `2026-10-30` and the second article's values of `2026-10-23`.

Use the existing discovery, rendering, and generation pipeline. Copying the documents is the only necessary content change; custom routes, manual index entries, and schema or component changes add no value for these compatible sources. Repository-required formatting may change whitespace without changing the imported content or metadata.

Treat the articles as the supplied historical accounts. Do not revise the validator article's description of its original version to match the current project page.

## Delivery boundary

- **Wider direction:** Keep the portfolio blog current with the user's published writing.
- **Selected increment:** Add these two published articles and verify their bilingual pages and existing blog discovery integrations.
- **Uncertainty:** No unresolved scope or design decision remains. Verification will establish that the supplied MDX compiles and integrates with the current static export.
- **Necessary safeguards:** Preserve the external source files and all pre-existing posts; check imported content and metadata, run the production build and relevant existing checks, inspect both languages, and review the final change.
- **Deferred work:** Editorial revisions, cover images, new interactive article features, and changes to the project pages or site infrastructure.
- **Boundary rationale:** Both articles share the existing import path and can be delivered together as one small, independently verifiable content update.

## Acceptance criteria

- **AC-01:** Both destination files exist under `data/blog/` with the exact source basenames and contain the complete supplied English and Italian articles. Only repository-required whitespace formatting may differ.
- **AC-02:** Imported titles, summaries, tags, links, code examples, `topic_key`, publication dates, modification dates, `draft: false`, and `images: []` retain their source values. The external source files remain unchanged.
- **AC-03:** The production build completes successfully, generating both article routes without errors introduced by the imported documents.
- **AC-04:** Both article pages render their titles, summaries, prose, headings, links, and code blocks through the existing layout. Switching between English and Italian shows the corresponding content without rendering both language bodies together.
- **AC-05:** Both posts appear in the production blog listing in the order determined by their preserved dates. Existing posts retain their content, metadata, and draft/publication status; the existing homepage preview and pagination follow their established rules.
- **AC-06:** Generated search data contains the English and Italian entries for both article routes, the sitemap contains both routes, and generated blog tag counts include their declared tags using the existing pipeline.
- **AC-07:** The final review confirms that product changes are limited to the two imported MDX documents and any required generated blog/search data. No rendering, schema, dependency, configuration, or unrelated content changes are introduced.

## Edge cases and verification

- Neither basename currently collides with an existing article. If the repository or sources change before implementation, compare the new evidence before copying rather than overwriting conflicting work.
- Preserve `topic_key` as source metadata. Any existing Contentlayer warning about undeclared metadata is not authorization to change the schema or remove source fields.
- Empty image arrays are intentional. Do not add a hero image or transfer unrelated USDZ assets.
- Preserve the second article's earlier publication date rather than treating the import date as its publication date.
- Verify with source/destination comparison, the standard production build, generated output inspection, and browser checks of both article pages in both languages. Use relevant existing tests for blog rendering, language selection, and search where applicable; new tests that duplicate static article content are unnecessary.
- Record any pre-existing build warnings or environment limitations separately from failures caused by this change. A local export does not establish deployed-site behavior.

## Constraints and approval handoff

Work in the existing checkout. Keep this specification and the eventual separate implementation plan uncommitted until both receive their own explicit approvals and the implementation branch is created. After those approvals, update `main` safely, create a conventional implementation branch, then implement, verify, review, and commit locally. Preserve existing work and do not push or merge.

Stages 2 and 3 are complete: the user separately approved this specification and `docs/superpowers/plans/2026-10-30-add-two-usdz-blog-articles.md`, each with “approved” after its own presentation. Stage 4 implementation is authorized through the plan's native execution method.

Stage 4 is complete. Both articles were imported byte-identically, all acceptance criteria were verified, the production build and tests passed, and the sequential specification and quality reviews passed with no findings. Detailed evidence is recorded in the implementation plan. The implementation branch remains local.

**Execution endpoint:** Both imported articles work in the local production export; required verification and review are complete, the approved changes are committed locally, and the result and any limitations are reported. Stop before pushing, deploying, or beginning further work.
