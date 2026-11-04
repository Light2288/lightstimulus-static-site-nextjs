# Add A11y Journey Evidence to the Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `personal-workflows:spec-implement` with `superpowers:executing-plans` for the recommended native execution method, or `superpowers:subagent-driven-development` if the user selects delegation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved complete bilingual A11y Journey Evidence project page, supplied-artwork cover, listing integration and metadata, with verification and user-controlled publication.

**Architecture:** Add one project MDX document and its processed cover family. Existing Contentlayer discovery and generators produce the project route, localized search entries, tag counts and sitemap; shared project components supply rendering and navigation. No application interfaces, schemas, configuration or dependencies change.

**Tech Stack:** Next.js 15, React 19, Contentlayer2, bilingual MDX, Sharp, Vitest and React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-04-add-a11y-journey-evidence-project.md`

**Slug:** `add-a11y-journey-evidence-project`

**Status:** APPROVED

**Execution status:** In progress. Content, supplied artwork and the 24-view export browser checks are implemented; AC-09 needs a separately approved shared-code scope amendment, and final review remains pending.

**Created:** 2026-11-04

**Updated:** 2026-11-05

**Execution tier:** full

**Implementation model role:** full

**Execution method:** Native, selected by the user's separate approval of this plan and its recommendation on 2026-11-04. The full tier does not switch the parent model. Final sequential specification and quality review remains required.

**Provenance:** The separately approved specification above; Stage 1 scope confirmation “i confirm,” Stage 2 specification approval “approved,” and separate Stage 3 plan approval “approved,” on 2026-11-04. Repository inspected at HEAD `3d64caa62f30db6c492cd65006df47b260a7a3f6` on `main`. Both saved artifacts are approved for implementation in the existing checkout on `feat/add-a11y-journey-evidence-project`.

## Global Constraints

- Work in the existing checkout. Do not create a worktree unless requested.
- Do not update `main`, create the implementation branch or commit workflow documents before plan approval. After approval, safely update `main`, preserve local work and use `feat/add-a11y-journey-evidence-project`.
- Keep the scope to the new project MDX, supplied-artwork cover family and necessary workflow/verification records. Preserve unrelated content, covers, code, schemas, dictionaries, configuration, dependencies and public interfaces.
- Use the specification's exact bilingual summaries, metadata, stack, tag IDs/labels and three source URLs. Use date `2026-11-04`, type `experiment` and status `in-progress`.
- Preserve the published experimental v0.1.0 scope: Chromium, one page/main document, ordinary light DOM and explicit native tests. Keep external validation pending in both languages.
- Preserve all seven corresponding sections and the approximately 1,100–1,300 English-word target, with equivalent Italian content and qualifications.
- Keep native Playwright actions, locators, assertions, named steps and fixture composition central. Attribute source-package verification; site checks do not broaden package support or establish accessibility or screen-reader behavior.
- Add no adoption figures, testimonials, endorsements, measured time savings, compatibility guarantees or roadmap promises.
- Adapt the supplied illustration. Do not generate replacement artwork. A missing or unsuitable illustration leaves the cover requirement pending and prevents declaring the complete increment delivered.
- Use the existing four-project homepage limit, English SEO metadata and one route with client-side language switching. Do not edit unused `data/projectsData.ts` or manually modify ignored generated tag/search files.
- Add no content-only unit tests or new test infrastructure. Use existing suites, direct source/output inspection and actual browser verification.
- Complete verification, the personal workflow's sequential final review and local commits. Do not push, merge, dispatch a workflow or deploy without a user request.

## Repository Evidence and Decisions

Artifact resolution before this plan: specification `NEW_ONLY` at the path above; plan `MISSING`, with no same-slug or explicitly linked competing plan or exact legacy artifact. The new plan uses the specification's exact basename. Specification approval is the user's separate “approved” response to its Stage 2 presentation; artifact lookup alone is not approval evidence.

The architecture map at `docs/architecture/map.md` was generated on 2026-08-28 at HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`. It is historical relative to the planning HEAD. All ten recorded key paths still exist: `app/layout.tsx`, `components/`, `contexts/LanguageContext.tsx`, `data/`, `lib/`, `contentlayer.config.ts`, `package.json`, `next.config.js`, `vitest.config.mts` and `test/setup.ts`. Direct inspection confirms the relevant MDX, language, project, search and static-export paths. Do not regenerate the map. No ADR files were found under `docs`; no applicable accepted/proposed ADR constrains this content addition.

Current command and behavior evidence:

- `package.json` defines `npm run test` (`vitest run`), filtered tests using `npm run test -- <filters>`, `npm run build`, `npm run dev` and `npm run compress-images -- <directory>`.
- `next.config.js` requires static export and enables production lint/type validation. `scripts/postbuild.mjs` completes the existing USDZ export and generates RSS; use the full build, not a standalone repeated postbuild. Existing evidence records that `npm run serve`/`next start` is unsuitable for this export.
- `contentlayer.config.ts` discovers `projects/**/*.mdx` and generates tags/search on success. `lib/generateSearchIndex.ts` emits one `en` and one `it` entry per project at the same route. `lib/generateProjectTagData.ts` counts tag IDs across project sources.
- `app/projects/[slug]/page.tsx`, `app/seo.tsx`, `app/sitemap.ts`, `app/projects/page.tsx` and `app/page.tsx` establish detail metadata, structured data, sitemap inclusion and date-based listing/homepage selection.
- `components/projects/ProjectLinks.tsx` supports `docs`, `github` and `npm`, but no `release` key. Place the release link in the MDX body. Existing `Lang` wrappers and localized frontmatter supply the language behavior.
- `scripts/compress-images.mjs` accepts a directory under `public/static/images`, backs up input, skips already-backed-up images and generates five PNG/WebP widths. PNG variants whose width equals or exceeds input width are skipped; the working master must therefore exceed 1000 pixels. All six existing top-level project covers currently have backups. Recheck this before processing.
- `.gitignore` excludes generated Contentlayer/search/tag/export files and ordinary artwork backups. Do not force-add those outputs. `data/projects/usdzValidatorAssets.test.ts` pins existing USDZ artwork identities, reinforcing the need to preserve unrelated images.
- `package.json` includes Prettier and lint-staged; `.husky/pre-commit` runs `npx --no-install lint-staged` with formatting for Markdown/MDX. Use the existing `npx prettier --check` CLI on changed documents; the installed command was verified during specification drafting. The broad lint scripts use `--fix`, so the build's configured checks avoid unrelated formatting rewrites.
- `docs/superpowers/evidence/2026-10-30-usdz-validator-cover-and-asset-demo/verification.md` records a prior production/browser workflow and historic results. Its temporary isolated QA script/runtime is no longer present; do not invoke its nonexistent command or reuse its observations as current evidence. Browser automation may use an available external runtime without changing this repository's dependency files, or actual browser inspection. Required checks remain pending until run.

No unresolved design decision blocks planning. The illustration is a pending execution input; do not invent its path. Native execution is recommended for this one cohesive task. The execution tier is `full` because bilingual editorial accuracy and visual crop acceptance require judgment rather than a mechanical transformation.

## Review Focus

1. **RF-01 — Expected failures:** Intentional dialog/form regressions can yield command exit 0; both language versions must still identify actual failed assertions and unexecuted later checks. Verify against the published recipes in Step 3.
2. **RF-02 — Incomplete evidence:** Missing/empty teardown captures, separate outcome/completeness and independent sequence orders must not become claims of complete, assertion-time or synchronized evidence. Inspect both language versions in Step 3.
3. **RF-03 — Supplied artwork and responsive assumptions:** Missing/small input, stale backup skipping or aggressive crops must not leave absent variants or an unrecognizable subject. Check the source, all eleven output files and unrelated-image identities in Step 4, and browser requests/crops in Step 7.
4. **RF-04 — Language, theme and mobile combinations:** Long Italian tags/title wrapping, hidden wrong-language prose and navigation must remain usable in all 24 route/viewport/language/theme views. Exercise these combinations in Step 7.
5. **RF-05 — Fixture-only confidence:** Mocked component/sitemap tests cannot prove actual MDX integration. Inspect the new exported route, metadata, two search entries, tag counts and unchanged existing routes in Step 6, then exercise navigation in Step 7.

---

### Task 1: Deliver and verify the complete project entry [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: false | concerns: none]

**Acceptance criteria:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12.

**Files:**

- Create: `data/projects/a11y-journey-evidence.mdx`.
- Create: `public/static/images/projects/a11y-journey-evidence.png`.
- Create: `public/static/images/projects/responsive/a11y-journey-evidence-{144,200,640,800,1000}w.{png,webp}` (ten derivative files).
- Maintain only lifecycle/execution metadata and checkboxes in this approved specification/plan pair.
- Record implementation evidence: `docs/superpowers/evidence/2026-11-04-add-a11y-journey-evidence-project/verification.md` and `reviews.md`; include relevant screenshots/observations there without distributing temporary QA dependencies.
- Generate ignored Contentlayer/search/tag/export output through the normal build only.
- Reuse existing tests: `components/projects/`, `components/home/ProjectsPreview.test.tsx`, `components/search/SearchProvider.test.tsx`, `components/Image.test.tsx`, `components/mdx/Lang.test.tsx`, `contexts/LanguageContext.test.tsx`, `layouts/ProjectLayout.test.tsx`, `app/sitemap.test.ts`, `scripts/compressImagesTarget.test.ts` and `data/projects/usdzValidatorAssets.test.ts`.

**Interfaces:**

- Consumes the approved specification, the user-supplied illustration at its actual supplied path, existing `Project` frontmatter and `Lang` contracts, and the existing directory-based image compressor.
- Produces route `/projects/a11y-journey-evidence`; cover URL `/static/images/projects/a11y-journey-evidence.png`; the five tag IDs `playwright`, `accessibility`, `testing`, `developer-tools`, `typescript`; two localized search entries sharing that route; and automatic listing, homepage, sitemap, social and structured-data integration. No function signature or application interface is introduced.

- [x] **Step 1: Establish authorization, branch and baseline.** Before product changes, identify both saved artifacts and the separate messages approving them: specification “approved” after Stage 2, plus the future approval after this plan's Stage 3 presentation. Record approval state and the actual execution method in the artifacts. Recheck local changes and current branch; preserve the uncommitted artifacts and unrelated work. After both approvals, safely update `main` using `git pull --ff-only` when an upstream is configured, then run `git switch -c feat/add-a11y-journey-evidence-project`. If the current branch/state has changed, preserve it and reconcile safely without force, reset or discarding changes. Review relevant incoming changes before proceeding. Run `npm run test` as the baseline and record the current project count, route/order/tag data and SHA-256 identities of existing project sources and artwork. Expected: the implementation branch is active, authorization is recorded, and baseline results are known. A pre-existing failure must be disclosed and assessed; do not repair unrelated code under this plan. Commit only the approved artifact pair with `git add docs/superpowers/specs/2026-11-04-add-a11y-journey-evidence-project.md docs/superpowers/plans/2026-11-04-add-a11y-journey-evidence-project.md` and `git commit -m "docs: record approved A11y Journey Evidence plan"`.

- [x] **Step 2: Recheck source and illustration inputs.** Use the exact authoritative URLs in the specification. Confirm that the published v0.1.0 facts remain consistent; distinguish later repository changes from the released scope. Preserve the npm-registry fallback if the npm website remains blocked. Record the actual supplied illustration path, dimensions, format and identity if available; otherwise mark artwork pending and continue independent content work without declaring completion. Confirm new destination files do not collide with user work. Expected: source-backed copy inputs and an explicit, truthful artwork state. No source/package repository changes or new package verification runs are required.

- [x] **Step 3: Author the bilingual MDX.** Use the specification's exact title, summaries, date, type/status, stack, three link keys and localized tags. Write the seven corresponding sections using the current USDZ page as editorial/structural reference, targeting 1,100–1,300 English words and equivalent Italian coverage. Link the release, full dialog/form recipes, comparison and limitations at their specified URLs. Include the native API/fixture workflow, bounded observations, actual/expected status, separate attempts, failure artifacts and whole-directory sharing. Set `coverImage` only when its real asset family is ready; an intermediate coverless state is incomplete. Directly compare both language blocks against the source recipes and evidence guide for RF-01/RF-02 and against all claim restrictions in the specification. Expected: equivalent experimental/pending-validation wording, fair stock comparison, supported-scope and data/capture qualifications, no invented results and no assertion that source-package tests were rerun. This direct editorial check replaces unnecessary content-only unit tests.

- [x] **Step 4: Adapt and process the supplied illustration.** When the input is available, preserve its source identity and produce a PNG working master wider than 1000 pixels, approximately 2.3:1 where the composition permits, retaining the central subject through the existing header/card crops. Retain the untouched supplied source in the ignored backup area separately from any adapted working master so compression does not replace the only original. Recheck existing backups and hashes before running `npm run compress-images -- projects`; use that directory target only if every other scanned image will be skipped safely. Otherwise isolate the new artwork in a temporary directory beneath `public/static/images`, run the same configured compressor against that directory, then move only its new primary/derivative files into the specified destinations. Do not remove existing backups or regenerate unrelated artwork. Inspect the primary PNG and decode all ten PNG/WebP derivatives with the existing Sharp dependency; verify actual widths 144/200/640/800/1000 and nonempty image data. Set the document's final `coverImage` to the approved URL. Expected: eleven valid output files, preserved source, unchanged existing-image identities and successful RF-03 checks. If the image remains absent or unsuitable, keep AC-08 and dependent final checks pending; report the input needed without silently substituting artwork.

- [x] **Step 5: Run focused regression checks.** Run `npm run test -- components/projects components/home/ProjectsPreview.test.tsx components/search/SearchProvider.test.tsx components/Image.test.tsx components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx layouts/ProjectLayout.test.tsx app/sitemap.test.ts scripts/compressImagesTarget.test.ts data/projects/usdzValidatorAssets.test.ts`. Expected: exit 0 with all selected suites passing, including existing image identities and the directory-based image CLI behavior. Record the actual suite/test counts, not historical counts. No new tests or production-code fixes are planned; a defect outside the approved content/assets scope requires investigation and explicit scope resolution before implementing a broader fix.

- [ ] **Step 6: Build and inspect actual production artifacts.** Run `npm run build`; expected exit 0, configured lint/type validation, successful Contentlayer generation and a new exported project page in `out/` alongside all six baseline project routes. Inspect actual generated metadata/body against AC-01–AC-06. Verify exactly one English and one Italian `/projects/a11y-journey-evidence` search entry with the correct titles/summaries; expected tag counts equal the baseline plus this entry's tags. Verify sitemap membership, English title/description, Open Graph project URL/image, Twitter image, `CreativeWork` and breadcrumb JSON-LD. Check all eleven cover assets are exported and the homepage keeps four entries in the approved order: A11y Journey Evidence, USDZ Validation Kit, Blog-Writer, CertFlow. Expected: RF-05 is satisfied by actual generated content, not fixtures, and every old project source/route remains available. Generated ignored files remain untracked.

- [x] **Step 7: Inspect the real browser views and flows.** Start the configured local server with `npm run dev` and use its reported origin; do not use `next start`. Inspect `/`, `/projects` and `/projects/a11y-journey-evidence` at 1440 × 900 and 390 × 844, with English/Italian and light/dark themes (24 combinations). Use available browser tooling; if automation needs an isolated runtime, keep it outside repository dependencies and public delivery files. Inspect exported output separately as in Step 6; a development-server view is not production-export evidence. Verify the expected heading/summary/language sections, natural wrapping, no horizontal overflow or clipped controls, recognizable cover crops, successful responsive image requests and keyboard access. Exercise every new tag filter, open the new route from search in both languages, follow the back link and verify the source/documentation/npm/release/example destinations. Inspect the four-entry homepage order and open an existing displaced project from the full listing. Capture the route/viewport/language/theme matrix and screenshots/observations in verification evidence. Expected: AC-07/AC-08/AC-10 and RF-03/RF-04/RF-05 pass. A missing browser capability or missing artwork is an unverified requirement, not a passing result.

- [ ] **Step 8: Complete final checks and commit the verified implementation.** Run `npm run test`; expected exit 0 for the full suite. Run `npx prettier --check data/projects/a11y-journey-evidence.mdx docs/superpowers/specs/2026-11-04-add-a11y-journey-evidence-project.md docs/superpowers/plans/2026-11-04-add-a11y-journey-evidence-project.md` and the same installed formatter check for newly created Markdown evidence; expected no formatting errors. Resolve formatting only in this increment's files. Rebuild only if changes since Step 6 invalidated its production evidence. Inspect the complete scoped diff, recheck existing-source/artwork identities and confirm no ignored generated output or QA dependencies will be staged. Stage only the new MDX, primary/derivative artwork and this task's documentation/evidence; commit with `git commit -m "feat: add A11y Journey Evidence project page"`, allowing existing pre-commit hooks to run. Inspect any hook formatting for semantic changes. Expected: a local implementation commit with accurate final evidence and no unrelated file changes. Do not label a missing-artwork increment complete or commit a broken cover reference.

- [ ] **Step 9: Perform sequential final review and close the increment.** Invoke `personal-workflows:code-review` through `spec-implement` for the complete branch, first specification review and then quality review, using the approved artifact pair and actual execution/browser evidence. Follow that workflow's review/fix gates; do not spawn per-task implementation agents when native execution was selected. Fix in-scope findings, rerun affected verification when changes invalidate evidence and commit any resulting corrections. Material specification/plan changes retain the user's separate approval gates. Record review outcomes in `reviews.md` and update the task checklist. Expected: all twelve criteria have concrete evidence, no required check/review remains unresolved, and the locally committed outcome is ready for the user's publication decision. Report the route, adapted artwork, checks actually run, limitations and local commit(s); stop without push, merge, deployment or another increment. If a required input/check remains missing, report the precise incomplete criteria and retain an honest pending state instead of claiming completion.

## Acceptance-Criterion Traceability

| Criterion | Implementation and evidence                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| AC-01     | Step 3 frontmatter; Step 6 actual generated document and route                                   |
| AC-02     | Step 3 section/parity/length inspection; Step 7 real language switching                          |
| AC-03     | Steps 2–3 source/claim checks; Steps 6–7 summaries and opening text                              |
| AC-04     | Step 3 native workflow/evidence semantics; Step 9 specification review                           |
| AC-05     | Step 3 example/comparison source checks (RF-01); Step 7 link destinations                        |
| AC-06     | Step 3 language-equivalent limits/data checks (RF-02); Step 9 review                             |
| AC-07     | Steps 5–7 existing tests, generated entries, homepage order and real navigation                  |
| AC-08     | Step 4 supplied-artwork identity/eleven valid files; Steps 6–7 export and browser crops/requests |
| AC-09     | Step 6 real search/tag/sitemap/social/structured output (RF-05)                                  |
| AC-10     | Step 7 full 24-view matrix, keyboard and navigation checks (RF-04)                               |
| AC-11     | Steps 1/5/6/8 checks and baseline; Step 9 sequential final review                                |
| AC-12     | Step 1 approval/branch/artifact commit; Steps 8–9 scoped commits and publication boundary        |

## Self-Review

Specification coverage, file responsibilities, field/route consistency, all twelve acceptance criteria and the five Review Focus checks are mapped above. One integrated task is proportionate to a single content-and-assets outcome. The `full` tier follows the declared nonmechanical editorial/visual work, rather than introducing unnecessary behavioral tests. No material design decision remains open; the actual illustration and final execution-method confirmation remain explicit inputs. No implementation or package test/build/browser run occurred during planning.

**Execution endpoint:** After explicit plan approval, complete and locally commit the approved bilingual page, supplied cover and automatic site integrations, required checks and sequential final review; report the working result, evidence and limitations; stop before later work, push, merge, workflow dispatch or deployment.
