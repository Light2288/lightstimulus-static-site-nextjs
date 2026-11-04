# A11y Journey Evidence project-page verification

**Created:** 2026-11-05
**Updated:** 2026-11-05
**Status:** In progress; the page and artwork are implemented, but AC-09 and the final whole-branch review remain pending.
**Spec:** `docs/superpowers/specs/2026-11-04-add-a11y-journey-evidence-project.md`
**Plan:** `docs/superpowers/plans/2026-11-04-add-a11y-journey-evidence-project.md`
**Branch:** `feat/add-a11y-journey-evidence-project`
**Baseline:** `3d64caa62f30db6c492cd65006df47b260a7a3f6`

## Authorization and result

The user separately confirmed scope/design with “i confirm,” approved the saved specification with “approved,” and then approved the separate plan with “approved.” Native execution uses the plan's full tier; it does not change the parent model. The approved workflow documents were committed in `01dda89` before product changes. `git pull --ff-only` reported that `main` was already up to date before branch creation. No push, merge, workflow dispatch or deployment occurred.

The new bilingual MDX supplies `/projects/a11y-journey-evidence`, listing/homepage integration, localized tags/search, navigation, source links and existing SEO output. The English body has 1,103 whitespace-separated words; Italian has 1,302. Both have seven corresponding sections and the exact approved summaries, visible experimental v0.1.0 status and pending external validation. The project entry keeps its approved date of 2026-11-04; execution crossed into November 5 without changing its original creation-date filenames.

Authoritative documentation, released README, GitHub release and npm registry were rechecked. The page describes source-project package verification; those package tests were not rerun for the site. The npm website's prior HTTP 403 is not presented as a successful website inspection.

## Artwork

The user supplied `/Users/davide/Downloads/Glossy Keyboard Workflow Dashboard.png`, a 1918 × 820 PNG with SHA-256 `6679c4400ad4ef6a8eabe1392219d9fc95228ec17413ef263307838fa3689822`.

Its wide composition already matched the existing treatment, so no replacement generation or destructive composition change was needed. The untouched original is retained in the ignored source backup, separately from the compression backup. The primary cover is 1000 × 428 pixels, 116,988 bytes. All ten PNG/WebP derivatives decode successfully at widths 144, 200, 640, 800 and 1000. The source Downloads file is unchanged.

The compressor processed one new image and skipped eight already-backed-up images. All 95 baseline project-source/artwork file hashes remain unchanged. Desktop and mobile inspection shows the keyboard/focus sequence remains recognizable in the existing crops. The homepage's narrower desktop card crops the edges of the illustrative panels while retaining the keys and focus sequence.

## Commands and observations

| Check                                                                                                                                                                                                                                                                                                                                               | Exit | Observed result                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------ |
| `git pull --ff-only`                                                                                                                                                                                                                                                                                                                                | 0    | Already up to date; existing local documents preserved                                           |
| Baseline `npm run test`                                                                                                                                                                                                                                                                                                                             | 0    | 86 suites, 1,406 tests passed                                                                    |
| `npm run compress-images -- projects`                                                                                                                                                                                                                                                                                                               | 0    | 1 image processed, 8 skipped; complete new derivative family                                     |
| `npm run test -- components/projects components/home/ProjectsPreview.test.tsx components/search/SearchProvider.test.tsx components/Image.test.tsx components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx layouts/ProjectLayout.test.tsx app/sitemap.test.ts scripts/compressImagesTarget.test.ts data/projects/usdzValidatorAssets.test.ts` | 0    | 17 suites, 304 tests passed                                                                      |
| Final `npm run build`                                                                                                                                                                                                                                                                                                                               | 0    | Production compilation, configured lint/type validation, 40 static pages and postbuild succeeded |
| Final `npm run test`                                                                                                                                                                                                                                                                                                                                | 0    | 86 suites, 1,406 tests passed                                                                    |
| Direct production inspection                                                                                                                                                                                                                                                                                                                        | 1    | Fourteen output/integrity checks passed; `CreativeWork.url` failed AC-09                         |
| Export browser verification                                                                                                                                                                                                                                                                                                                         | 0    | 24 views, both-language navigation flows, no page errors or failed image responses               |

Full command logs and temporary QA scripts/runtime remain in this plan's ignored execution workspace. The browser runtime was isolated Playwright 1.64.1 with installed Chrome; repository dependency files were unchanged.

The build retains existing warnings about obsolete Next configuration, custom headers with static export, deprecated `punycode`, seven undeclared blog `topic_key` fields, and optional `@emotion/is-prop-valid` resolution. These did not prevent the configured build from passing. No unrelated remediation was performed.

## Actual production output

[Production inspection](production-inspection.json) verifies the real new generated document rather than mocked fixtures: exact metadata and summaries, seven sections per language, word target, two localized search entries, expected tag-count increments, sitemap membership, English SEO, Open Graph project URL/cover, Twitter cover, `CreativeWork` cover and breadcrumbs. All seven project routes and all eleven cover assets exist in the export. Existing source/artwork identities remain unchanged.

The single failed production assertion is recorded below, not converted into a passing check. The increment is not complete.

## Responsive and navigation evidence

[Browser observations](browser-qa.json) cover `/`, `/projects` and `/projects/a11y-journey-evidence` at 1440 × 900 and 390 × 844, in English/Italian and light/dark themes: 24 combinations. The exported site has no horizontal overflow, broken images or page errors in those checks. Both language bodies show the correct seven headings; the title, summaries, tags and metadata wrap within the viewport. Covers load in all views.

Keyboard language switching and back navigation passed. All five new tag filters, localized search-result navigation in both languages, source/documentation/npm/release/example link destinations, the four-entry homepage order and access to Light Stimulus through the full listing were checked. No source-package screen-reader or conformance claim follows from these site checks.

Representative screenshots: [desktop detail](detail-1440-en-light.png), [Italian dark mobile detail](detail-390-it-dark.png), [desktop homepage cards](home-1440.png), [mobile homepage cards](home-390.png), [desktop listing](listing-1440.png), [mobile listing](listing-390.png).

**Ruling:** Use actual exported files for the final browser matrix after `npm run dev` intermittently emitted `SyntaxError: Invalid or unexpected token` before hydration. Isolated repeats hydrated correctly, and the production export passed the full matrix with no page errors. This strengthens delivered-output verification without changing application code; development-server-specific behavior remains unverified. The temporary export server resolves both clean HTML URLs and native static-export data files. An initial server-helper routing error was corrected in ignored QA code; no site source changed for it.

## Existing structured-data defect and pending scope amendment

[Diagnosis](structured-data-diagnosis.json) records the same wrong URL on the new page and existing USDZ/CertFlow pages. `contentlayer.config.ts` is unchanged from the baseline. Its Project `structuredData` resolver reads sibling computed `doc.slug` before that field is available, producing `https://lightstimulus.dev/projects/undefined`. Final generated documents have the correct `slug`, and the route/SEO/breadcrumb generators use it successfully later; this is specifically an ordering/dependency problem in the computed metadata resolver.

The existing Blog structured-data resolver derives its URL from `_raw.flattenedPath`, which is available at resolution time. The smallest proposed correction is to use that existing pattern for Project URLs, then add focused regression coverage and repeat affected build/output checks. No correction or regression test has been implemented because the approved content/assets plan excludes shared-code edits. The user must confirm the scope amendment and separately approve the revised specification and affected plan before that change.

AC-09 remains incomplete. AC-11's sequential final review and the overall delivery/commit completion claim remain pending until that discrepancy is resolved. Existing page/cover approvals and authorization are preserved.

## Review Focus

- **RF-01:** Both languages retain actual versus expected failure and explicitly state that hard failures leave later checks unexecuted; the published dialog/form recipes were re-read.
- **RF-02:** Both languages distinguish native outcome/completeness, independent sequences and fixture-teardown captures; empty/unavailable evidence is disclosed.
- **RF-03:** Supplied source preserved, complete family decoded/exported, actual crops inspected and old artwork hashes unchanged.
- **RF-04:** The complete 24-view export matrix and both-language keyboard/navigation flows passed.
- **RF-05:** Actual generated search, tags, routes, images and metadata were inspected. This caught the shared structured-data defect that fixture-based tests missed.

**Endpoint state:** Authorized content and artwork work is implemented and verified as recorded. The shared-code repair, final review and full increment completion are pending; publication remains user-controlled.
