# AWS Data Engineer Associate Certification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Enter through `personal-workflows:spec-implement` and preserve the user's execution-method choice.

**Goal:** Add the supplied AWS Certified Data Engineer – Associate badge and its complete credential metadata to the existing About page.

**Architecture:** Add one entry to the author MDX frontmatter and publish its static badge assets through the existing compression pipeline. The current certification renderer, schema, grouping, and localization already support this entry.

**Tech Stack:** Next.js 15 static export, React 19, Contentlayer2, MDX/YAML, Sharp, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-09-aws-data-engineer-associate-certification.md`
**Slug:** `aws-data-engineer-associate-certification`
**Status:** APPROVED — user message: `plan approved`.
**Created:** 2026-11-09
**Updated:** 2026-11-09
**Provenance:** Approved specification above; current repository inspection; source PNG embedded Open Badges metadata.
**Execution tier:** lite
**Implementation model role:** light
**Execution method:** Native execution, the recommended method at the approved planning handoff. Inline execution keeps the current parent model; no model switch occurred.

## Global Constraints

- Store issuer exactly as `Amazon Web Services`, matching existing AWS entries.
- Preserve the exact title, ISO dates, image path, and credential URL in the approved specification.
- Preserve existing certifications, grouping/sorting, schema, components, localization strings, and the Downloads source.
- Generate only this badge's main PNG and responsive variants; do not change the image utility or add dependencies.
- Use the existing checkout. After separate plan approval, safely update `main`, create `feat/aws-data-engineer-associate-certification`, and commit the approved artifact pair before product changes. Preserve local work; do not force updates or create a worktree.
- Commit implementation locally after verification and review. Do not push, merge, or publish.
- This is a reversible content/asset addition: use direct artifact assertions and existing regression tests rather than adding tests that repeat the new literal entry.

## Repository Evidence and Artifact Resolution

- Specification resolution: `NEW_ONLY`, at the explicit Spec path above. The user approved that presented specification with `approved` after Stage 2. Scope confirmation previously included matching existing AWS issuers.
- Plan resolution before creation: `MISSING`; its new destination reuses the specification's exact basename. The user separately approved the presented plan with `plan approved`.
- Inspected HEAD: `cf8402f52a066e20633cedf4738f5b5af5c85fcb`, on `main` tracking `origin/main`. Revalidate after the authorized update.
- Architecture map: `docs/architecture/map.md`, generated 2026-08-28 at `d3bdac6fc16202be7dba43666390f7da2dcae028`; stale relative to current HEAD. All ten recorded key paths still exist. Directly inspected `app/about/page.tsx`, `data/authors/default.mdx`, `contentlayer.config.ts`, `components/about/CertificationsGrid.tsx`, `components/about/certificationGrouping.ts`, `components/Image.tsx`, and `scripts/compress-images.mjs` confirm the relevant content-to-rendering path. Do not regenerate the map.
- No ADR files were found under `docs/`; no applicable accepted or proposed decision constrains this addition.
- `package.json` defines `test` as `vitest run`, `build` as the Next build plus postbuild, and `compress-images` as `node scripts/compress-images.mjs`. `vitest.config.mts` discovers the named existing test files.
- `scripts/compress-images.mjs` accepts a directory relative to the public image root. All ten existing certification images currently have backups and will be skipped; `.gitignore` excludes those backups. Recheck this safeguard immediately before compression.
- Formatting command precedent: `docs/superpowers/plans/2026-11-05-remove-a11y-external-validation-wording.md` uses `npx prettier --check` on explicitly scoped files. Prettier is installed in `package.json`.
- No material design decisions remain. Browser automation packages are unavailable in the project; actual generated output plus existing grouping/localization tests provide integration evidence without adding tooling.

## Review Focus

- **RF-01 — Credential accuracy:** PNG metadata must agree with all new frontmatter fields after the deliberate issuer normalization; Step 4 compares them directly.
- **RF-02 — Responsive asset completeness:** Small badges require both PNG and WebP thumbnails, not just the main image; Steps 3–4 inspect every required file, dimension, and badge appearance.
- **RF-03 — Group identity:** The new entry must join the existing AWS issuer group and the 2026 year group; Steps 4–5 check actual content and existing grouping behavior.
- **RF-04 — Real exported content:** Fixture tests alone cannot prove the new data reaches the page; Step 5 checks the generated Author and exported About HTML, link, image references, and expiry.
- **RF-05 — Scope preservation:** Directory compression and MDX editing must leave other assets and entries intact; Steps 2–4 compare baseline identities, and Step 6 reviews the final diff.

---

### Task 1: Publish and verify the AWS Data Engineer certification [size: S | risk: none | mechanical: true | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Acceptance criteria:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06.

**Files:**

- Modify: `data/authors/default.mdx`, adding one certification entry before the existing AWS Developer entry.
- Create: `public/static/images/certifications/aws-certified-data-engineer-associate.png`.
- Create under `public/static/images/certifications/responsive/`: `aws-certified-data-engineer-associate-144w.png`, `aws-certified-data-engineer-associate-144w.webp`, `aws-certified-data-engineer-associate-200w.png`, `aws-certified-data-engineer-associate-200w.webp`, and `aws-certified-data-engineer-associate-600w.webp`.
- Maintain lifecycle, task progress, and observed verification/review results in this specification/plan pair.
- Reuse existing tests: `data/authors/certificationAssets.test.ts`, `components/about/`, `app/about/page.test.tsx`, `components/Image.test.tsx`, and `scripts/compressImagesTarget.test.ts`.

**Interfaces:** Consumes the approved credential fields, the supplied PNG, and existing `Certification` fields (`title`, `issuer`, `year`, optional dates/image/url). Produces one additional existing-shape credential consumed by `CertificationsGrid`, with the existing public static-image naming convention. No application interfaces are introduced.

- [x] **Step 1: Establish authorization and the implementation branch.** Identify both artifacts and the separate messages approving specification and plan; record the selected execution method/tier through `personal-workflows:spec-implement`. Recheck `git status --short`. With `main` and its upstream still configured, run `git pull --ff-only`, review incoming changes, and then `git switch -c feat/aws-data-engineer-associate-certification`. If state has changed, preserve all work and reconcile safely. Mark the plan approved and commit only this artifact pair with `git add docs/superpowers/specs/2026-11-09-aws-data-engineer-associate-certification.md docs/superpowers/plans/2026-11-09-aws-data-engineer-associate-certification.md` and `git commit -m "docs: record approved AWS Data Engineer certification plan"`. Expected: approved artifacts are committed on the implementation branch before product edits.

- [x] **Step 2: Record the baseline.** In unique scratch space, retain the author source, parsed certification list, and SHA-256 identities of the Downloads image and all existing certification assets. Verify the new title and asset family are absent; this is the expected unmet acceptance condition. Run `npm run test -- data/authors/certificationAssets.test.ts components/about app/about/page.test.tsx components/Image.test.tsx scripts/compressImagesTarget.test.ts`. Expected: existing checks exit 0; record counts and disclose any pre-existing failure before editing.

- [x] **Step 3: Add the credential and generate assets.** Insert the exact entry below into `data/authors/default.mdx`, copy the Downloads PNG to its approved public path, and recheck that all existing certification images have backups. Run `npm run compress-images -- certifications`. Expected: exactly one image processed, ten existing images skipped, exit 0, and the five responsive variants listed above generated. Keep the automatically created original backup ignored; leave the supplied Downloads file unchanged.

  ```yaml
  - title: AWS Certified Data Engineer – Associate
    issuer: Amazon Web Services
    year: 2026
    issueDate: '2026-11-06'
    expiryDate: '2029-11-06'
    image: /static/images/certifications/aws-certified-data-engineer-associate.png
    url: https://www.credly.com/badges/4f5219d8-7102-4fba-9b79-a345850c7b87/public_url
  ```

- [x] **Step 4: Verify actual data and images.** Use the installed `gray-matter` and `image-size` libraries for one-off read-only assertions, without adding a permanent test file. Require exactly one entry equal to Step 3, eleven certifications total, the original ten entries deeply unchanged, and the exact normalized issuer shared by the other AWS entries. Compare the issue/expiry dates and credential ID to the source PNG's embedded Open Badges metadata. Decode all six published assets, checking 600 × 600 for the main PNG/large WebP and 144 × 144 or 200 × 200 for thumbnails. Visually inspect the main badge and a thumbnail with the image-viewing tool. Recompute all baseline hashes: the source and existing asset identities must be unchanged. Expected: all assertions pass, no unrelated assets change, and the badge stays readable (AC-01, AC-02, AC-06; RF-01/RF-02/RF-05).

- [x] **Step 5: Verify integration and regressions.** Run the same focused `npm run test -- data/authors/certificationAssets.test.ts components/about app/about/page.test.tsx components/Image.test.tsx scripts/compressImagesTarget.test.ts` command after editing; expected exit 0 with grouping, localization, dates, image rendering, and About composition checks passing. Run `npm run build`; expected exit 0 through production static export and postbuild. Inspect the generated Author document under `.contentlayer/generated/Authors/` and `out/about.html`: require exactly one new card, the specified credential URL and image source/srcsets, issuer/year text, and the existing November 2029 expiry display. Verify the new entry belongs to year `2026` and the existing AWS issuer bucket using the unchanged `groupCertifications(items, mode)` logic and actual frontmatter, supported by its existing tests. Existing component tests cover Italian labels and switching modes; report that browser interaction itself was not observed. Record the exact commands, exit codes, decisive output, and counts in this plan (AC-03, AC-04, AC-05; RF-03/RF-04).

- [x] **Step 6: Format and review the completed change.** Run `npx prettier --check data/authors/default.mdx docs/superpowers/specs/2026-11-09-aws-data-engineer-associate-certification.md docs/superpowers/plans/2026-11-09-aws-data-engineer-associate-certification.md` and `git diff --check`; expected exit 0, correcting formatting only in scoped files. Check `git diff -- data/authors/default.mdx` and `git status --short`: expect one added entry, six new published assets, and this artifact pair only. Prepare the scratch review package and invoke `personal-workflows:code-review` exactly once as the integrated final whole-branch gate: specification review, then quality review of the same package. Supply the approved pair, complete change set, asset evidence, actual verification results, and all five Review Focus items. Resolve findings through the execution workflow; material scope or plan changes retain their approval gates. Expected: both review stages pass, or remaining findings are handled under the enclosing workflow before finishing.

- [x] **Step 7: Commit and report.** Record verification/review results and complete the plan checklist. Stage only the author entry, the six new assets, and this artifact pair; commit with `git commit -m "feat(about): add AWS Data Engineer Associate certification"`. Verify the commit's file list and final `git status --short`. Expected: local commits contain the approved scope, required checks/review are complete, and the result report includes observed evidence and limitations. Stop without push, merge, publication, or another increment.

## Self-Review and Execution Endpoint

All six acceptance criteria map to the single task: AC-01 to Steps 3–4;
AC-02 to Steps 3–4; AC-03/AC-04 to Steps 4–5; AC-05 to Steps 2/5/6;
AC-06 to Steps 2–4/6–7. Each Review Focus item has a direct verification
step. One content entry and its assets need no new abstractions, permanent
literal-data tests, or component/schema changes. All routing eligibility
fields select `lite`; final review still uses the required sequential roles.

**Execution endpoint:** Deliver and locally commit the verified, reviewed
certification addition, report its evidence and limitations, then stop.
The user separately approved this plan with `plan approved` before implementation began.

## Observed Execution Evidence

- Authorization: scope confirmed with `confirm` and issuer normalization; specification approved with `approved`; plan separately approved with `plan approved`.
- `git pull --ff-only`: exit 0, `Already up to date.` Implementation branch: `feat/aws-data-engineer-associate-certification`. Approved artifact commit: `74bc49a`.
- Baseline focused command from Step 2: exit 0, 16 files / 254 tests passed. The new credential and asset family were absent before editing.
- `npm run compress-images -- certifications`: exit 0, exactly 1 image processed / 10 skipped; six published assets generated. Original PNG remains in Downloads; the pipeline backup remains ignored.
- One-off actual-artifact assertions: pass. Exactly one new entry with the approved metadata; 11 total credentials; 5 AWS entries share `Amazon Web Services`. Actual data groups correctly by year and issuer. Original ten entries and complete remaining author source are unchanged.
- Main PNG and full WebP decode at 600 × 600; PNG/WebP thumbnails decode at 144 × 144 and 200 × 200. Main badge and 144w WebP visually inspected: badge text and shape are legible. Downloads source and all 70 existing certification assets retain their baseline SHA-256 hashes.
- Post-change focused command from Step 5: exit 0, 16 files / 254 tests passed. `npm run test` additionally exercised the full suite: exit 0, 86 files / 1,406 tests passed.
- `npm run build`: exit 0; generated 26 Contentlayer documents, 40 static pages, exported output, and completed postbuild. Generated Author credentials exactly equal the actual frontmatter. `out/about.html` contains one new card in the 2026 group, `Amazon Web Services · 2026`, `Expires Nov 2029`, the correct Credly link, and the expected image/srcsets; every referenced badge asset exists in the export.
- Build warnings concern unchanged Next configuration (`legacyBrowsers`, `swcMinify`, export headers), seven unrelated blog `topic_key` fields, optional `@emotion/is-prop-valid` resolution, Node punycode deprecation, and TypeScript project references. No unrelated fixes were made.
- Browser interaction is unobserved; existing passing component tests cover grouping controls and English/Italian labels. This addition preserves those components.

## Final Sequential Review

- Integrated gate run: `9a22df68e1324964a3a96d9f093a8133`.
- Reviewed state: `f92f05d5b1f668dde15eb3f278ff05c9bc80faf5267455c0d36744e506a5648b`.
- Frozen package SHA-256: `b1e3ec14029c7640618a8c6b1e95c7c48cddc33eb347e6a6247edd2f9049fe72`.
- `review-spec` on the configured light role: **SPEC REVIEW: PASS**; all six criteria and five review focuses supported, with no omissions or extra scope.
- Only after that PASS, `review-quality` on the configured full role reviewed the identical package: **QUALITY REVIEW: PASS; Findings: NONE**. The reviewer verified the package identities and all nine reviewed file hashes.
- The coordinator rechecked the frozen package and file hashes before recording these outcomes. No fixes, deferred findings, or scope rulings resulted.
- Scoped `npx prettier --check` and `git diff --check`: exit 0. Final product commit and final Git status are completed after this pre-commit gate.

## Completion

- Implementation committed locally as `312f893` (`feat(about): add AWS Data Engineer Associate certification`). The approved artifact commit is `74bc49a`.
- Native task completion ran the exact focused command after the product commit: exit 0, 16 files / 254 tests passed. All seven product files still match the reviewed SHA-256 manifest after commit hooks.
- The working tree was clean after the implementation commit and final focused run; this completion record is retained in a final documentation commit.
- Full suite result remains 86 files / 1,406 tests passed; production export and both review stages passed. No product changes followed those checks.
- No review findings, deferred minors, or scope rulings remain. Browser interaction was not observed, and the recorded unrelated build warnings remain.
- Keep the branch locally in the existing checkout. Nothing was pushed, merged, or published. The selected delivery endpoint is reached; no subsequent increment is started.
