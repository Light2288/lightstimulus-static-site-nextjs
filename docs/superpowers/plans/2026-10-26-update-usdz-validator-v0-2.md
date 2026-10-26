# Update USDZ Validation Kit for v0.2 — Implementation Plan

> **For agentic workers:** Use `personal-workflows:spec-implement` with `superpowers:executing-plans` for the selected native execution method. Steps use checkboxes for tracking.

**Goal:** Refresh the bilingual portfolio page to describe the delivered v0.2.0 scope accurately and mark the project completed.

**Architecture:** Update one MDX document. Existing Contentlayer hooks regenerate search and tag data; existing components render the page, listing, and homepage preview.

**Tech Stack:** Next.js 15, React 19, Contentlayer2, bilingual MDX, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-update-usdz-validator-v0-2.md`

**Slug:** `update-usdz-validator-v0-2`  
**Status:** APPROVED  
**Created:** 2026-10-26  
**Updated:** 2026-10-26  
**Execution tier:** full  
**Implementation model role:** full  
**Execution method:** Native, selected through the interactive control.  
**Provenance:** Approved specification, current site inspection at `a010330d1a9554197f3548a483610c5632f34195`, and validator evidence at `dad53f0`. Presented separately in chat, then explicitly approved by the user submitting this exact plan with “PLEASE IMPLEMENT THIS PLAN” on 2026-10-26. The specification was separately approved before planning.  
**Approval:** Both artifacts are approved; Stage 4 implementation is authorized. Native full-tier execution does not switch the parent model. Managed final-review roles resolve from the current AGENTS instructions: light `gpt-6-luna`, full `gpt-6.1-sol`.

## Global Constraints

- Modify only the project MDX, this update’s workflow documents, and generated ignored output.
- Keep the validator repository read-only.
- Preserve the route, original `2026-10-22` date, titles, tags, links, cover, and responsive assets.
- Retain six corresponding sections and existing English/Italian `<Lang>` wrappers.
- Use the specification’s exact summaries and technical boundaries.
- Introduce no public API, type, schema, component, dictionary, dependency, or artwork changes.
- Add no content-only tests unless verification exposes a concrete gap.
- After plan approval, save both approved artifacts before product changes. Safely update `main`, create `chore/update-usdz-validator-v0-2`, and commit locally.
- Use the existing checkout. No worktree, push, merge, publishing, or deployment.

## Repository Evidence and Review Focus

The architecture map at `docs/architecture/map.md` records HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`, generated August 28. It is stale relative to current HEAD; all ten listed key paths still exist. Direct inspection confirms the relevant MDX, Contentlayer, localization, search, homepage, and sitemap flow. Do not regenerate the map. No ADR files were found under `docs`.

Current configuration confirms that `completed` is supported, the homepage selects four projects by descending date, and build hooks regenerate ignored search/tag output. Commands below come from the package scripts and existing Vitest suites.

The final checks must specifically address:

1. **Overstated USDC support:** Both languages retain exact supported versions and conditional coverage.
2. **Opaque numeric arrays:** Envelope 3 must not imply geometry or numerical-body validation.
3. **Checker boundaries:** Native locality claims must remain distinct from explicitly requested external execution.
4. **Historical evidence:** Recorded validator results must not imply fresh runs or verified minimum-target compatibility.
5. **Real integration:** Fixture-based tests require complementary generated-output and browser checks.

---

### Task 1: Refresh and verify the bilingual portfolio entry [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: false | concerns: none]

**Acceptance criteria:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08.

**Files and interfaces:**

- Modify `data/projects/usdz-validator.mdx`.
- Save and maintain this update’s specification and plan.
- Regenerate ignored Contentlayer, search, tag, and static-export output.
- Consume the existing Project frontmatter and language wrappers unchanged; produce the same `/projects/usdz-validator` route and two localized search entries.
- No interface additions or migrations.

- [x] **Step 1: Persist approvals and establish the branch.** After explicit plan approval and leaving Plan mode, save this plan with approval evidence and update the specification’s lifecycle metadata. Check local changes, preserve unrelated work, run `git pull --ff-only` on `main`, then `git switch -c chore/update-usdz-validator-v0-2`. Commit only the two approved workflow documents. Expected: the implementation branch contains both artifacts and no work is discarded. Reconcile relevant incoming changes before implementation; stop on divergence.

- [x] **Step 2: Update metadata and summaries.** Set `status: completed`, append `LZ4`, and copy both exact summaries from the specification. Preserve all other frontmatter. Expected: metadata differs only in those approved fields.

- [x] **Step 3: Refresh both six-section bodies.** Describe v0.2.0, published October 25, 2026, and link its release. Replace demo, dependency-free, and blanket USDC-exclusion claims. Cover private pinned LZ4 1.10.0, shared package-local resolution, supported authored-reference forms in exact crates 0.8.0/0.9.0/0.10.0, envelope 3, and schema-major-1 compatibility. Preserve existing package-integrity, budget, profile, and reporting explanations.

- [x] **Step 4: Audit technical meaning against the source.** Compare both languages with the validator’s implementation, inspection boundary, report compatibility, and current release evidence at `dad53f0`. Confirm all specification boundaries, including opaque numeric bodies, stored-only ZIP members, coverage versus acceptance, optional checker isolation limits, and deferred platform verification. Attribute 19/19 gates, 338 cases per configuration, 11 opt-in skips, and 59 occurrences across five originals to recorded evidence. State that installed-checker smoke was unrequested/skipped for current v0.2 acceptance. Expected: equivalent bilingual claims without unsupported guarantees.

- [x] **Step 5: Run existing tests and the production build.**

  From the site root, run:

  ```sh
  npm run test -- components/projects components/home/ProjectsPreview.test.tsx components/search/SearchProvider.test.tsx components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx layouts/ProjectLayout.test.tsx app/sitemap.test.ts
  npm run build
  ```

  Expected: selected suites pass and the production build completes, regenerating ignored content/search/tag output. Record exact commands, exit statuses, and decisive output. Investigate relevant failures; do not expand into unrelated repairs.

- [x] **Step 6: Inspect generated production output.** Check the authoritative generated Project index and exported output against the approved summaries and metadata. Confirm two language-specific search entries resolve to the unchanged route, the sitemap includes it, and all five tags remain present. Confirm the homepage still shows exactly USDZ Validator, Blog-Writer, CertFlow, and Light Stimulus in that order. Check the retained cover and ten responsive variants exist. Expected: AC-01, AC-02, AC-06, and AC-07 hold for real generated content.

- [x] **Step 7: Inspect the browser matrix.** Start the existing development server with `npm run dev`. At 1440×900 and 390×844, inspect English and Italian in light and dark themes. Check the completed label, summaries, six sections, LZ4, release/repository/documentation links, artwork loading/cropping, and readable wrapping. Exercise listing filters and localized search; confirm the homepage order and another existing project page. Expected: all eight viewport/language/theme combinations render correctly, links target the approved URLs, and no affected image requests fail. Stop only the server started for this work.

- [ ] **Step 8: Commit and run the required final review.** Review the complete diff and commit the verified content with a conventional message. Invoke `personal-workflows:code-review` once in integrated mode: specification review first, then quality review using the unchanged review package. Address findings within scope and repeat affected checks when changes warrant it. Record verification and review outcomes in the plan, commit workflow bookkeeping, and report the local branch and commits. Do not push or merge.

### Acceptance Traceability

| Criteria    | Implementation and proof                                      |
| ----------- | ------------------------------------------------------------- |
| AC-01–AC-02 | Steps 2–3; build, generated content, language/browser checks  |
| AC-03–AC-05 | Steps 3–4; source comparison and sequential final review      |
| AC-06       | Steps 3–4; release links and generated/rendered copy          |
| AC-07       | Steps 5–7; generated search, tags, sitemap, listing, homepage |
| AC-08       | Steps 5–8; passing tests/build, browser matrix, final reviews |

**Assumptions:** Source evidence remains at `dad53f0`; recheck before editing. Network-dependent build prerequisites must be reported honestly rather than bypassed through configuration changes. Full execution is selected because bilingual technical authoring requires judgment.

**Handoff:** Stage 4 implementation is authorized by the separately recorded specification and plan approvals. Both approved artifacts are now saved outside Plan mode.

## Execution evidence — 2026-10-26

- `git pull --ff-only` returned “Already up to date”; implementation uses `chore/update-usdz-validator-v0-2`. Approved artifacts were committed as `9b91722` before product edits.
- Validator evidence remains at `dad53f0e5c2853424db3e91c7de234083d409209`; its repository was read only. GitHub API confirms non-draft, non-prerelease `v0.2.0`, published `2026-10-25T18:59:08Z`.
- The exact focused Vitest command in Step 5 passed before and after the content update: exit 0, **13 test files / 280 tests passed**. No new content-only unit tests were added.
- `npm run build`: exit 0; generated 23 Contentlayer documents, exported 37 pages, and completed the RSS postbuild hook. Existing warnings concern legacy Next configuration/export headers, undeclared `topic_key` in five blog documents, deprecated `punycode`, optional `@emotion/is-prop-valid`, and TypeScript project references. Those files were not modified.
- Generated-output assertions passed: exact summaries/metadata, two search entries, five tag counts, correct canonical/OG/description, sitemap membership, all six project exports, and four homepage cards in the existing order. Step 6's “USDZ Validator” names the existing **USDZ Validation Kit** project; its title remains unchanged.
- All eleven cover/responsive files are byte-identical to the baseline. Four GitHub destinations and all eleven image URLs returned HTTP 200.
- Browser checks passed at **1440×900 / 390×844**, English/Italian, light/dark: six sections, summaries, completed labels, stack, links, image crops/loading and no horizontal overflow. All five filter links return the project; Italian and English search display the updated summaries and resolve to its route. Homepage order and the existing Micelio page were checked. No browser error logs were captured. Development warnings include an image fill-position warning during styling and the same optional animation dependency warning; the artwork renders correctly.
- Screenshots and matrix/filter receipts are retained outside the repository under `/Users/davide/.codex/visualizations/2026/10/22/01a1630f-707e-71c2-b229-61b8ce98f2cc/usdz-v0-2/`. Initial Italian/dark preferences were restored, temporary viewport overrides reset, the temporary tab closed, and only this task’s development server stopped.
- Scratch verification harness corrections: corrected the Node subprocess options object; counted homepage cards through heading links rather than the two links per card; scoped browser title queries to articles because the browser locator API does not support a heading-level filter. Corrected checks passed; no product changes were needed for these harness issues.
- Sequential final review: pending. No push, merge, deployment, artwork changes, or validator test runs were performed.
