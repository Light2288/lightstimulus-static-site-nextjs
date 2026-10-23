# Add USDZ Validation Kit Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after explicit plan approval. Steps use checkbox (`- [ ]`) syntax for tracking. Use the personal spec-implement adapter and its sequential final review gate.

**Goal:** Add an accurate English/Italian USDZ Validation Kit portfolio entry, integrated into the existing project, homepage, search, and sitemap flows, with the approved illustration or its explicit missing-artwork fallback.

**Architecture:** Add one project MDX document and, when available, its cover assets. Contentlayer and the existing project components discover and render the document; build-time hooks regenerate ignored tag/search artifacts. No application code, interfaces, schemas, or dependencies change.

**Tech Stack:** Next.js 15, React 19, Contentlayer2, bilingual MDX, existing Sharp image pipeline, Vitest and React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-add-usdz-validator-project-design.md`

**Slug:** `add-usdz-validator-project`
**Status:** APPROVED
**Approval:** The user explicitly approved this written plan with “plan approved” on 2026-10-22.
**Approved clarification:** The subsequent user-approved content correction sets `status: in-progress` and describes v0.1 as an initial working demo in both languages, following the updated specification.
**Provenance:** The approved specification above; the user's separate specification/plan approval workflow; direct inspection of the existing project pages, content schema, build hooks, image script, tests, and architecture map. This is a new plan; no existing new-path or legacy plan matches this slug.
**Execution tier:** full
**Implementation model role:** full
**Execution method:** Native inline execution, approved with this plan; fresh specification and quality reviewers run sequentially at the final whole-branch gate. Bilingual technical authoring and artwork judgment are not mechanical work, so this plan is not eligible for the lite tier.

## Global Constraints

- Obtain explicit approval of this written plan before running implementation steps, updating `main`, creating a branch, or committing.
- Keep specification and plan changes uncommitted until the implementation branch is created. Work directly in the existing checkout; do not create a worktree.
- After approval, update `main` by fast-forward only and create `feat/add-usdz-validator-project`. Do not overwrite unrelated local work. Report a Git conflict rather than resetting or inventing history.
- Implement, verify, and commit on the feature branch. Do not push, merge, or deploy.
- Treat `/Users/davide/Personal/Projects/usdz-validator` as a read-only source. Preserve the specification's exact metadata, summaries, five localized tags, links, and six corresponding body sections.
- Do not modify components, schema, dependencies, locale dictionaries, existing project documents, or the unused `data/projectsData.ts`.
- Prefer the approved raster illustration. If it remains unavailable, omit `coverImage`, deliver the specification's generation prompt, and report AC-04's artwork portion and AC-07 as incomplete.
- Add no content-only unit tests or new test infrastructure unless verification exposes a concrete gap. The approved specification explicitly selects existing tests and production-output/browser checks for this content change.

## Repository Evidence and Assumptions

- Planning checkout: `main`, HEAD `e9f8b579f0f65258086a5c8d803f2ada9b9e503d`. Recheck the checkout after approval; planning does not update Git state.
- Architecture map: `docs/architecture/map.md`, generated 2026-08-28, recorded HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`. It is historical rather than current-HEAD evidence. All ten recorded key paths still exist: the root layout, components, language context, data, lib, content schema, package manifest, Next config, Vitest config, and test setup. Direct inspection confirms the relevant MDX-to-Contentlayer-to-projects/search/sitemap flow. Do not regenerate the map.
- No ADR or architecture-decision files were found under `docs`; no accepted ADR adds a constraint to this change.
- `data/projects/certflow.mdx` and `data/projects/blog-writer.mdx` establish the localized frontmatter and body conventions. `contentlayer.config.ts` discovers `projects/**/*.mdx`; the cover is optional.
- The homepage selects four projects by descending date. The listing, detail route, sitemap, search generator, and tag generator consume Contentlayer projects automatically.
- `package.json` defines `npm run test`, `npm run build`, `npm run dev`, and `npm run compress-images`. The test script is `vitest run`; passing file/directory filters through `npm run test -- ...` selects existing suites without changing configuration.
- The build invokes the existing generators for `app/project-tag-data.json` and `public/search.json`; both are ignored. Verify the generated files and exported output, but do not force-add them to Git.
- The image CLI accepts a directory beneath `public/static/images`, not a single image file. At planning time all five existing project covers have compressor backups, so `npm run compress-images -- projects` skips them. Recheck backups and preserve existing-cover hashes before using that command.
- The image pipeline preserves the high-resolution input in its ignored backup directory, optimizes the primary image to its configured maximum width, and generates the five required PNG/WebP derivative widths. Do not add a second image pipeline.
- The built-in image generator is unavailable at planning time and no new artwork has been supplied. Recheck capability at execution time; do not silently switch to an API/CLI image generator. If unavailable, use the already-approved prompt fallback without asking the user to approve it again.
- Build-time Google Fonts fetching requires network access. Report an unavailable prerequisite honestly; do not change fonts or Next configuration to bypass it.

## Review Focus

1. Binary-USDC input: prose must retain the native reference-coverage gap after external checker success; inspect both languages against the source.
2. Optional checker: native local-only claims must not imply that external execution has the same filesystem/network restrictions; inspect both languages.
3. Missing artwork: the page, cards, and metadata must not request a nonexistent project cover; inspect rendered DOM/network requests and metadata.
4. Real generated content: fixture-based component tests do not prove the new project's search entries, tag counts, sitemap URL, or homepage position; inspect the production output and browser behavior.
5. Localization and narrow layouts: all six sections must switch together and long Italian labels must remain usable; inspect both themes at desktop and mobile widths.

---

### Task 1: Add and verify the bilingual project entry [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: false | concerns: none]

**Acceptance criteria:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09.

**Files:**

- Create: `data/projects/usdz-validator.mdx`.
- Conditional artwork: `public/static/images/projects/usdz-validator.png` and `public/static/images/projects/responsive/usdz-validator-{144,200,640,800,1000}w.{png,webp}`.
- Retain and commit on the feature branch: the governing specification and this plan.
- Generated, ignored: Contentlayer output, project tag counts, bilingual search index, static site export, and image backups when artwork is processed.
- Existing verification: project component suites, `layouts/ProjectLayout.test.tsx`, `components/home/ProjectsPreview.test.tsx`, `components/search/SearchProvider.test.tsx`, `components/mdx/Lang.test.tsx`, `app/sitemap.test.ts`, and the full Vitest suite.

**Interfaces:**

- Consumes the existing Project frontmatter contract and `<Lang value="en">` / `<Lang value="it">` body wrappers without changing either interface.
- Produces slug `usdz-validator`, route `/projects/usdz-validator`, two localized search entries for that route, and the five specified tag IDs. Produces cover assets only if the approved artwork is available.
- No new public API, type, dependency, or component interface is introduced.

- [x] **Step 1: Establish the branch and baseline after plan approval.** Confirm that the only pending site changes are this specification and plan, or preserve any unrelated user changes explicitly. Fast-forward `main` from `origin/main` with `git pull --ff-only`, then create `feat/add-usdz-validator-project` with `git switch -c feat/add-usdz-validator-project`. Recheck the relevant content/schema entry points if incoming commits changed them. Run `npm run test` from the site root. Expected: the new feature branch is active, specification/plan remain present, and all baseline suites pass. If the baseline fails, record the actual failures before deciding whether they affect this content addition; do not repair unrelated behavior as part of this task.

- [x] **Step 2: Resolve the approved artwork path.** Recheck whether the built-in image generator or a user-supplied matching image is available. If available, use the specification's prompt and Blog-Writer/Light Stimulus reference images, inspect the result against the approved composition, and save the selected PNG at the specified cover path. Record existing project-cover hashes, confirm their compression backups exist, then run `npm run compress-images -- projects`. Expected: the new cover is processed, all five PNG and WebP derivative widths exist, existing covers retain their hashes, and the image remains legible at card size. If backups for an existing cover are absent, isolate the new image in a temporary directory beneath the image root, run the same existing script against that directory, and move only the resulting new primary/derivative files into their specified destinations. If artwork is unavailable, make no image files and carry the fallback into Step 3; mark AC-04's artwork portion and AC-07 as incomplete.

- [x] **Step 3: Author the project MDX.** Copy the structural convention from the existing project documents. Use the approved specification's exact bilingual summaries, date `2026-10-22`, `projectType: product`, `status: in-progress`, stack, tag IDs/labels, and two links. Set `coverImage` only when the verified cover and derivatives exist. Write the six specified sections in both languages, grounding claims in the source README, package manifest, CLI/inspection documentation, and recorded verification summary. Explain encoded texture budgets, explicit optional checker behavior, incomplete native USDC references, gate acceptance, and verified versus intended platform support. Expected: one new bilingual project source document, with equivalent qualifications in both languages and no application-code changes.

- [x] **Step 4: Run existing focused verification.** Run `npm run test -- components/projects components/home/ProjectsPreview.test.tsx components/search/SearchProvider.test.tsx components/mdx/Lang.test.tsx layouts/ProjectLayout.test.tsx app/sitemap.test.ts`. Expected: all selected existing suites pass, including the supported no-cover rendering path. Do not claim these fixture-based suites establish the new document's integration; Steps 5 and 6 check the actual content. If a concrete product defect appears, investigate it before proposing a minimal regression test/fix; do not broaden this content plan silently.

- [x] **Step 5: Build and inspect production artifacts.** Run `npm run build`. Expected: exit 0, successful Contentlayer generation, and an exported `/projects/usdz-validator` page alongside all five existing project pages. Inspect the generated project document for all required fields and both six-section language blocks; compare against the approved specification. Verify exactly one `en` and one `it` search entry with the correct route and summaries, all five generated tag counts, and the new URL in the exported sitemap. Check exported homepage/listing order and the unchanged four-project preview limit. Under the fallback, verify there is no `/static/images/projects/usdz-validator.png` request or metadata reference; the existing social-banner fallback is acceptable. Expected: AC-01, AC-03, AC-05, AC-06, and the generated-content portion of AC-08 are evidenced by real output.

- [x] **Step 6: Inspect browser behavior.** Use `npm run dev` and the reported local origin; the repository uses static export, so do not rely on `next start` to serve it. Inspect the homepage, `/projects`, and `/projects/usdz-validator` at 1440 × 900 and 390 × 844, in English/Italian and light/dark themes. Switch languages and confirm that exactly the selected six sections appear; inspect long Italian tag labels and external links. Filter the listing by each of the five tags and open the new project from a matching search result in each language. Confirm the homepage shows USDZ Validation Kit, Blog-Writer, CertFlow, and Light Stimulus in that order and that Micelio/Remedmind remain accessible from the listing. With artwork, inspect every responsive asset and relevant crop; without it, check that cards/detail content remain usable and no missing-cover requests occur. Expected: working navigation, filters and search; no mixed-language body, clipping, horizontal overflow, or broken project-cover request. Record the five Review Focus checks explicitly.

- [x] **Step 7: Complete regression verification.** Run `npm run test` after the final changes. Expected: all existing suites pass. Confirm the build in Step 5 still corresponds to the final content; rerun it only if subsequent source changes invalidated that result. Preserve commands, exit statuses, decisive output lines, browser observations, and artwork status in the execution ledger. Inspect the complete diff for scope and whitespace. Do not run the repository's broad fixing lint/format scripts for this MDX-only addition; keep any formatting limited to the new content and workflow documents.

- [ ] **Step 8: Run the final review gate and commit.** Use `personal-workflows:code-review` once in integrated mode, with the governing specification, this plan, complete reviewed diff, changed-file list, ledger rulings, and observed verification evidence in one immutable package. Run specification review first, then quality review only after specification review passes; both are read-only fresh-context reviews. Treat the approved artwork fallback as permitted partial delivery, never as completed AC-07. Handle findings under the execution workflow's permitted fix loop, then commit only this feature's documents, content, and any actual artwork with `feat(projects): add USDZ Validation Kit portfolio entry`. Expected: verified feature commit on the feature branch, no unrelated changes staged, no push/merge/deploy, and explicit reporting of any incomplete artwork criteria. Leave generated ignored files untracked.

## Acceptance Traceability

| Criterion | Implementation and evidence                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| AC-01     | Step 3 frontmatter; Step 5 Contentlayer build and generated-document inspection                                             |
| AC-02     | Step 3 bilingual content; Steps 4 and 6 language rendering checks                                                           |
| AC-03     | Step 3 source-grounded prose; Steps 5, 6, and 8 accuracy review                                                             |
| AC-04     | Steps 2–3 content/artwork; Steps 5–6 detail page, metadata, and links; artwork portion explicitly incomplete under fallback |
| AC-05     | Steps 5–6 real homepage/listing order and four-project limit                                                                |
| AC-06     | Steps 5–6 generated tags/search/sitemap and real UI filtering/search                                                        |
| AC-07     | Steps 2 and 6 actual assets/crops, or explicitly incomplete when artwork is unavailable                                     |
| AC-08     | Steps 4–7 existing tests, retained exported routes, and listing/browser checks                                              |
| AC-09     | Step 4 focused tests, Step 5 production build, and Step 7 full suite                                                        |

## Approval and Handoff

The user approved this written plan after approving the specification. Approval includes native inline execution and the specification's conditional artwork fallback. Both gates are satisfied; no push, merge, or deployment is authorized.

After approval, use the personal spec-implement workflow. Resolve its current managed full model role for any permitted reviewer dispatch; native execution does not switch the parent model. Report the delivered project page, verification, feature commit, and any artwork still required. Link the specification's fallback prompt if image generation remains unavailable.
