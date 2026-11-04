# Remove Pending External-Validation Wording — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `personal-workflows:spec-implement` with `superpowers:executing-plans` for native execution, preserving the session's execution method. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the six approved English/Italian sentences and verify their removal from the article, summaries, search and description metadata.

**Architecture:** Edit one existing bilingual MDX document. Existing Contentlayer discovery and generators propagate the shortened summaries into shared components, static output, localized search and description metadata; application code and assets remain unchanged.

**Tech Stack:** Next.js 15 static export, React 19, Contentlayer2, bilingual MDX, Vitest, React Testing Library and Prettier.

**Spec:** `docs/superpowers/specs/2026-11-05-remove-a11y-external-validation-wording.md`

**Slug:** `remove-a11y-external-validation-wording`
**Status:** APPROVED
**Created:** 2026-11-05
**Updated:** 2026-11-05
**Execution tier:** lite
**Implementation model role:** light
**Execution method:** Native, continuing the session's approved inline method. The task is a literal, objectively checkable content edit. Inline execution cannot switch the parent model; the selected tier is not a claim that a model switch or cost saving occurred. The required final sequential review remains independent of this tier.
**Provenance:** The specification above; scope confirmation “confirmed,” followed by specification approval “approved” after the separate Stage 2 presentation and plan approval “approved” after the separate Stage 3 presentation. Planning inspected `main` at `6157746`. Both artifacts are separately approved for native implementation.

## Global Constraints

- Delete only the six sentences specified in the approved specification, including the two opening sentences' bold wrappers and adjacent separating whitespace. Use its exact resulting English and Italian summaries.
- Preserve experimental v0.1.0 status, all seven headings per language and all remaining copy, including technical limits and the author's comparison. Do not introduce a claim that validation occurred or add filler to preserve an earlier word target.
- Preserve project identity, navigation, frontmatter other than the two summaries, cover proportions and all assets. No shared-code, dependency or metadata-generator repair is authorized.
- Preserve the original project specification/plan and earlier evidence as historical records. This increment supersedes their pending-validation wording requirement only for live project copy.
- Use normal build generation; do not hand-edit or force-add ignored Contentlayer, search or export files. Keep temporary inspection/browser helpers in this plan's ignored execution workspace, outside repository dependency files.
- After plan approval, safely update `main`, create a conventional implementation branch in the existing checkout, and commit the approved artifact pair there before the content edit. Preserve unrelated changes. No worktree, push, merge, workflow dispatch or deployment.

## Repository Evidence and Artifact Resolution

The approved specification resolves as `NEW_ONLY` at the exact path above, with matching Slug and Created date. No other matching new or legacy specification/plan was found. The plan resolves as `MISSING` before creation and uses the specification's exact basename. No unresolved decision requires clarification.

`docs/architecture/map.md` was generated on 2026-08-28 at HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`; it is historical relative to planning HEAD `6157746`. All ten recorded key paths still exist: `app/layout.tsx`, `components/`, `contexts/LanguageContext.tsx`, `data/`, `lib/`, `contentlayer.config.ts`, `package.json`, `next.config.js`, `vitest.config.mts`, `test/setup.ts`. Direct inspection confirms the relevant content, rendering and generation paths. No ADR paths were found under `docs`; no accepted/proposed ADR applies. Do not regenerate the map.

Command/behavior evidence comes from `package.json` (`npm run test`, Vitest filters, `npm run build`, Prettier), `next.config.js` (static export and configured lint/type checks), `.husky/pre-commit` (lint-staged), the project header/cards and homepage components (localized summaries), `lib/generateSearchIndex.ts` (two localized entries), `app/projects/[slug]/page.tsx` and `app/seo.tsx` (English descriptions), and `contentlayer.config.ts` (structured-data description). Use the full build, which includes postbuild. Broad lint commands autofix unrelated files and are not required here.

The prior tracked evidence at `docs/superpowers/evidence/2026-11-04-add-a11y-journey-evidence-project/verification.md` records a working export-browser approach and an existing `CreativeWork.url` defect. Current Project resolver source still uses unavailable sibling computed `doc.slug` for that URL. This cleanup verifies descriptions; it does not repair that URL or repeat the earlier increment's acceptance claim. Historical QA scripts asserting old summaries, pending wording or the old word minimum are not this increment's checks. Never read or modify another plan's ignored execution workspace.

## Review Focus

- **RF-01 — Both languages and both forms:** A partial deletion could leave either summary/opening wording or the different closing sentence. Step 2 records all six matches; Steps 3 and 5 verify all four sentence variants are absent from current source/output.
- **RF-02 — Generated summaries:** Mocked component tests could pass while search or metadata stays stale. Step 5 checks actual generated values against the approved exact summaries.
- **RF-03 — Editorial integrity:** Deleting emphasized sentences could leave empty markup or change experimental/limitations copy. Step 3 compares the complete source to the baseline with only the six specified deletions; Step 6 checks rendered content.
- **RF-04 — Mobile and language state:** Shorter summaries still need correct language selection and usable cards/header. Step 6 covers the twelve required route/viewport/language views and a real language switch.
- **RF-05 — Scope and historical evidence:** Older records intentionally retain the sentences; existing metadata defects must not become accidental fixes or be mistaken for this change's regressions. Steps 5 and 8 compare preservation identities, disclose the URL defect separately and use only this specification's criteria.

---

### Task 1: Remove and verify the six sentences [size: S | risk: none | mechanical: true | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07.

**Files:**

- Modify: `data/projects/a11y-journey-evidence.mdx` only for the six approved deletions.
- Maintain lifecycle/checklist metadata in this new specification/plan pair.
- Create: `docs/superpowers/evidence/2026-11-05-remove-a11y-external-validation-wording/verification.md`, `reviews.md` and representative screenshots/observations for this increment.
- Reuse existing tests: `components/projects/`, `components/home/ProjectsPreview.test.tsx`, `components/search/SearchProvider.test.tsx`, `components/mdx/Lang.test.tsx`, `contexts/LanguageContext.test.tsx`, `layouts/ProjectLayout.test.tsx`, `app/seo.test.ts`.

**Interfaces:** Consumes the exact removal table and final summaries in the approved specification and the existing localized MDX schema. Produces the same `/projects/a11y-journey-evidence` route and cover reference, with shortened `summary.en`/`summary.it` and otherwise unchanged content; normal generation updates the existing outputs. No application interface is introduced.

- [ ] **Step 1: Establish authorization and the implementation branch.** Record the selected artifact pair, scope “confirmed,” specification “approved” after Stage 2, and the future separate plan approval after this Stage 3 handoff. Recheck Git status and preserve unrelated changes. Only after that approval, safely run `git pull --ff-only` on `main` when its upstream remains configured, then `git switch -c chore/remove-a11y-external-validation-wording`; reconcile changed checkout state without reset, force or discarding work. Review incoming changes before proceeding. Commit only this approved artifact pair with `git add docs/superpowers/specs/2026-11-05-remove-a11y-external-validation-wording.md docs/superpowers/plans/2026-11-05-remove-a11y-external-validation-wording.md` and `git commit -m "docs: record approved A11y wording cleanup plan"`. Expected: both approvals are recorded, the implementation branch is active, and approved artifacts are committed before product edits.

- [ ] **Step 2: Record the content and repository baseline.** Run `npm run test`; expected exit 0, with actual suite/test counts recorded. Save the complete target source and identities of existing project assets, other project sources, historical project artifacts/evidence and shared application source in this plan's ignored workspace. Directly inspect the approved locations: expected six sentence occurrences, split three per language; the desired absence check currently fails for those six occurrences. Record that content baseline rather than adding a unit test for literal copy. Disclose pre-existing failures without repairing unrelated code.

- [ ] **Step 3: Apply the exact editorial deletion.** Remove the six sentences from the source, including their two opening bold wrappers. Compare the complete result with the baseline after only the specification's exact removals and separating-whitespace cleanup. Verify both exact shortened summaries, zero removed sentence variants, seven headings per language, unchanged other frontmatter/copy and no empty emphasis markup. Expected: the direct absence check now passes and the source diff changes only the six intended locations (RF-01/RF-03).

- [ ] **Step 4: Run the existing regression checks.** Run `npm run test -- components/projects components/home/ProjectsPreview.test.tsx components/search/SearchProvider.test.tsx components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx layouts/ProjectLayout.test.tsx app/seo.test.ts`, followed by `npm run test`. Expected: both exit 0, all selected/full suites pass and actual counts are recorded. No new tests, dependencies or shared-code fixes are required for this content-only edit.

- [ ] **Step 5: Build and inspect actual output.** Run `npm run build`; expected exit 0 including configured lint/types, Contentlayer generation, static export and postbuild. Inspect `.contentlayer/generated/Project/projects__a11y-journey-evidence.mdx.json`, `out/projects/a11y-journey-evidence.html`, `out/index.html`, `out/projects.html` and `out/search.json`. Compare localized summaries to the approved text; verify exactly one search entry per language at the same route and the English page description, Open Graph description and `CreativeWork.description`. Verify all four removed sentence variants are absent from this project's generated document/export/search entries, with no empty bold content and unchanged route/cover links. Check preservation identities against Step 2. Record the pre-existing `CreativeWork.url` issue separately if still present; do not repair it or treat it as a new description failure. Expected: AC-02/AC-04 and RF-02/RF-05 have actual-output evidence, not fixture-only confidence.

- [ ] **Step 6: Verify responsive production rendering.** Open a suitable local preview of the fresh static export using available browser tooling; do not use `next start`. At 1440 × 900 and 390 × 844, inspect `/`, `/projects` and `/projects/a11y-journey-evidence` in English and Italian (twelve views, existing light theme). Check the updated project summaries where rendered, no pending-validation sentences in visible project copy, natural wrapping, no horizontal overflow, loaded covers and the correct seven article headings. Exercise the language toggle on the detail page and the project/back links. Record viewport/language/route observations and representative desktop/mobile screenshots. Expected: all twelve views and the real flows pass with no new browser errors or broken covers (RF-03/RF-04).

- [ ] **Step 7: Format, verify the scoped diff and commit.** Record command exits, actual results, browser evidence and any pre-existing limitations in this increment's `verification.md`. Run `npx prettier --check data/projects/a11y-journey-evidence.mdx docs/superpowers/specs/2026-11-05-remove-a11y-external-validation-wording.md docs/superpowers/plans/2026-11-05-remove-a11y-external-validation-wording.md docs/superpowers/evidence/2026-11-05-remove-a11y-external-validation-wording/verification.md` and `git diff --check`; expected exit 0. Fix formatting only in this increment's files and repeat affected checks if semantics change. Stage only the changed MDX, this artifact pair and new increment evidence/screenshots; commit with `git commit -m "chore: remove pending validation wording from A11y project"`. Expected: existing hooks pass, no generated files/dependencies or unrelated edits are committed, and all unchanged-source/asset identities still match.

- [ ] **Step 8: Complete the sequential final review and report.** Through `personal-workflows:spec-implement`, invoke `personal-workflows:code-review` exactly once as the integrated final whole-branch seat: specification review, then quality review, with the approved pair, branch diff, actual output/browser evidence and all five Review Focus items. Handle findings under the enclosing execution workflow; retain separate approval gates for material scope/plan changes. Save review results in this increment's `reviews.md`, check its formatting with `npx prettier --check docs/superpowers/evidence/2026-11-05-remove-a11y-external-validation-wording/reviews.md`, commit reviewed evidence/corrections and verify final Git status. Expected: all seven criteria have evidence and no required cleanup check/review remains unresolved. Report the local commit(s), six removals, checks and existing limitations; stop without push, merge, deployment or another increment.

## Acceptance-Criterion Traceability

| Criterion | Task 1 evidence                                                                     |
| --------- | ----------------------------------------------------------------------------------- |
| AC-01     | Steps 2–3 exact six-location baseline and deletion-only comparison                  |
| AC-02     | Steps 3/5 exact summaries and real generated descriptions/search/body               |
| AC-03     | Step 3 complete-source comparison; Steps 6/8 rendered copy and review               |
| AC-04     | Steps 2/5 preservation identities; Steps 5–6 route, assets and navigation           |
| AC-05     | Steps 2/4/5/7 repository checks, formatting and hooks                               |
| AC-06     | Step 6 twelve export-browser views and language/navigation flows                    |
| AC-07     | Steps 1/7/8 approval evidence, local commits, final review and publication boundary |

## Self-Review and Execution Endpoint

All specification requirements and seven criterion IDs map to the single task. The five Review Focus items have direct content/output/browser checks in its steps. One task is proportionate to six literal deletions propagated by existing generators. The declared S/none/true/true/true/none routing selects `lite`; it does not bypass final review or the native method's model limitation. No material clarification remains, and no product changes or project test/build/browser checks occurred during planning. The user's separate approval after Stage 3 now authorizes execution.

**Execution endpoint:** After plan approval, locally commit and report the verified, reviewed six-sentence removal with its generated-output and responsive evidence; stop before publication or further work.
