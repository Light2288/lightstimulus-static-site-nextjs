# USDZ Validator Cover and Asset Demonstration Implementation Plan

> **For agentic workers:** Use `personal-workflows:spec-implement` with `superpowers:executing-plans` for the selected native execution method. Steps use checkboxes for tracking.

**Goal:** Replace the project cover and deliver the approved bilingual demonstration with a verified browser model, accessible viewer, evidence, and downloads.

**Architecture:** Keep the existing MDX and image pipelines. Insert one shared locale-aware viewer between translated narrative blocks, dynamically importing its rendering engine only after activation. Distribute the canonical USDZ/report unchanged and a separately verified GLB companion.

**Tech Stack:** Next.js 15, React 19, TypeScript, Contentlayer, existing image/locale components, Vitest, React Testing Library, `@google/model-viewer` 4.4.0, Three.js 0.183.0; isolated Python/OpenUSD conversion tooling.

**Spec:** `docs/superpowers/specs/2026-10-30-usdz-validator-cover-and-asset-demo.md`

**Slug:** `usdz-validator-cover-and-asset-demo`
**Created:** 2026-10-30
**Updated:** 2026-10-30
**Status:** APPROVED
**Execution tier:** full
**Implementation model role:** full
**Execution method:** Native, selected through the interactive control.

**Artifact:** Saved after leaving Plan mode, before product changes.
**Provenance:** The separate plan presented in chat and reproduced by the user with “PLEASE IMPLEMENT THIS PLAN” on 2026-10-30. This message explicitly approves this plan. The specification received its separate earlier “approved” message. Both approvals authorize Stage 4. The approval/status and saved-artifact fields are lifecycle updates to the approved text.

## 1. Constraints and repository evidence

- Preserve existing product prose, metadata, URLs, links, and English/Italian parity. Add only the approved demonstration.
- Treat Downloads, the validator repository, and private artwork directories as read-only.
- Preserve canonical source identities recorded in the specification. Retain the required cover source in Git despite its ignored directory.
- Use the existing compression workflow; preserve unrelated image hashes. Do not generate another cover.
- Keep conversion tooling outside site deployment dependencies. Pin `usd2gltf==0.3.5`, `usd-core==26.11`, `numpy==2.5.4`, and `gltflib==1.0.13` in an isolated environment; record the resolved transitive versions.
- Work in the existing checkout. After plan approval, safely update `main`, create `feat/usdz-validator-cover-and-asset-demo`, and commit the approved documents before product changes. No worktree, push, merge, or publication.
- Current repository HEAD is `9264166d5093cb58a6ba557dda7d6bbae59433bb`. The architecture map records historical HEAD `d3bdac6fc16202be7dba43666390f7da2dcae028`; its key paths still exist, but current files govern this plan. Do not regenerate it. No ADR files were found.
- Established test/build/image commands come from `package.json`. Conversion syntax comes from the upstream converter CLI. New verification helpers below are planned deliverables, not existing repository commands.
- Reject unsupported conversion or fidelity failures with evidence; do not silently substitute assets or change approaches.

## 2. Review focus

1. Route prefetching, scrolling, and language changes must not fetch the engine or models before activation.
2. Language changes during loading or rotation must preserve the single viewer and camera.
3. A missing asset returning HTTP 200 with HTML must produce an error, never count as successful delivery.
4. Timeout, retry, and navigation must invalidate late callbacks without breaking the next attempt.
5. Responsive processing and existing crops must preserve the cover subject and usable illustration/poster transparency.

## 3. Implementation tasks

### Task 1: Replace and verify the cover [size: M | risk: data | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: data]

**Risk:** Targeted deletion and regeneration must preserve external sources and unrelated site images.

**Files:** Existing cover source/main/responsive family; new `data/projects/usdzValidatorAssets.test.ts`.

**Interfaces:** Produces the unchanged cover URL backed by Firefly, its retained source, and ten responsive derivatives. The asset test uses repository-local files and the specification’s pinned hashes.

**Acceptance criteria:** AC-01, AC-02, AC-03.

- [x] Save this plan after leaving Plan mode, record its separate approval, and update specification lifecycle metadata. Inspect local changes, safely fast-forward `main`, create the branch, and commit only the approved workflow documents. Stop on unresolved divergence.
- [x] Record baseline hashes for unrelated site images and all external inputs.
- [x] Add an asset test asserting the retained cover source has SHA-256 `ee47141de59d396eb9baf75175a1b495108a33a9084dc5421c01d5d593f6e581`; main/responsive images decode; responsive widths are exactly 144/200/640/800/1000 in PNG and WebP; no obsolete cover-stem variants exist.
- [x] Run `npm run test -- data/projects/usdzValidatorAssets.test.ts`. Expected: failure against the old cover.
- [x] Clear only the old cover family and its old backup, reseed the main input from Firefly, and run `npm run compress-images -- projects`. Confirm unrelated inputs are skipped. Explicitly stage only the required new backup source despite the ignore rule.
- [x] Repeat the test; compare baseline hashes and inspect page/card crop previews. Expected: fresh cover family, identical external inputs, unchanged unrelated images, and readable central subject. Commit the verified cover change.

### Task 2: Prepare and independently verify the model assets [size: M | risk: other | mechanical: false | clear_pattern: false | objectively_verifiable: true | concerns: none]

**Risk:** Conversion may preserve file structure while changing geometry or translucent appearance.

**Files:** Approved model/image directories; new `scripts/verify-usdz-demo.py`; extend the asset test.

**Interfaces:**

- Produces `model.glb`, unchanged `model.usdz` and `validation.json`, license notice, provenance README, illustration, poster, and responsive image families.
- Comparator CLI: `verify-usdz-demo.py --source <canonical-usdz> --glb <candidate-glb> --output <report-json>`, plus `--self-test`. Exits nonzero on a failed invariant.

**Acceptance criteria:** AC-05, AC-06, AC-07, AC-08, AC-14, AC-15.

- [x] Extend asset tests to assert canonical USDZ/illustration hashes, report identity/policy, complete responsive image families, and a self-contained GLB.
- [x] Write comparator self-tests for changed geometry/bounds, missing meshes, opaque glass, and external resources. Implement independent inspection using OpenUSD for the source and direct GLB JSON/binary decoding for the output.
- [x] Compare all 14 named meshes, triangle counts and oriented triangle positions, world-space bounds, meter scale, Y-up orientation, material bindings, colors, roughness, metallic values, and opacity. Use **1×10⁻⁶ m** positional tolerance and **1×10⁻⁶** material-value tolerance; require finite geometry/normals and `BLEND` with approximately **0.1** alpha on the panels. Do not require identical vertex indexing.
- [x] Run `python3 scripts/verify-usdz-demo.py --self-test`. Expected: deliberately corrupted cases are rejected.
- [x] Provision the isolated pinned tools and convert the canonical USDZ with `usd2gltf -i <canonical-usdz> -o <candidate-glb>`. Use canonical USDA only if packaged input is unsupported, after independently comparing USDA and USDZ.
- [x] Run the comparator and inspect the GLB in the pinned viewer from front, rear, and rotated views. Expected: complete geometry and usable translucency. Record culling/shading differences, including unsupported IOR. Do not accept numeric checks alone.
- [x] Copy canonical downloads/license unchanged. Generate a square poster from the accepted GLB, copy the canonical illustration, and run `npm run compress-images -- projects/usdz-validator-demo`. Retain their sources and responsive derivatives.
- [x] Record exact commands, versions, hashes, numerical results, and visual observations in the provenance README. Run the asset test successfully and commit the accepted assets/checker.

### Task 3: Implement the accessible, activation-only viewer [size: M | risk: concurrency | mechanical: false | clear_pattern: false | objectively_verifiable: true | concerns: concurrency,performance]

**Risk:** Asynchronous imports, custom-element events, retries, and unmounting can race; eager loading would violate the activation boundary.

**Files:** New `components/projects/USDZAssetDemo.tsx` and its test; custom-element type declaration; locale dictionaries; package/lockfile; focused Next.js/Netlify configuration.

**Interfaces:**

- `USDZAssetDemo(): React.JSX.Element`, with no props.
- States: `idle`, `loading`, `ready`, `error`.
- Initial/reset camera: `45deg 65deg auto`, targeting `0m 0m 0m`.
- Load timeout: **30 seconds**, covering engine import and model loading.

**Acceptance criteria:** AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-16.

- [x] Add failing component tests for activation-only import, loading/success, import/model/WebGL failure, timeout/retry, unmount and late events, live language switching, reset-view, reduced motion, translated accessibility text, and persistent download/report links.
- [x] Run `npm run test -- components/projects/USDZAssetDemo.test.tsx`. Expected: failure before implementation.
- [x] Install the pinned browser dependencies. Add type-only custom-element declarations; dynamically import the engine inside the activation path. Do not place it in an eager import or preload.
- [x] Render the processed illustration/poster, compact report summary, native `<details>`, ordinary download/license anchors, and separate image-link Quick Look markup. Embed the canonical report at build time.
- [x] After activation, check WebGL2 availability, mount the custom element, and attach native load/error listeners. Use an attempt identifier, listener cleanup, and timer cleanup to reject stale completions. Errors restore the poster and expose retry.
- [x] Configure camera controls, `touch-action="pan-y"`, disabled panning, neutral built-in lighting, no auto-rotation, and no animated interaction prompt. Reset immediately with `jumpCameraToGoal()`; use zero interpolation under reduced motion.
- [x] Translate controls, status, instructions, and the viewer’s directional accessibility announcements through the existing language context. Language updates must not rewrite camera state or remount the element.
- [x] Expose the existing `BASE_PATH` value to browser bundles through Next.js configuration. Prefix raw asset URLs exactly once. Add narrowly scoped Netlify MIME declarations for GLB and USDZ; preserve existing redirects and security policy.
- [x] Run the component, image-prefix, and locale tests. Expected: passing states/failures, correct prefixes, and parity. Commit the viewer integration.

### Task 4: Integrate the bilingual MDX section [size: M | risk: none | mechanical: false | clear_pattern: true | objectively_verifiable: false | concerns: none]

**Files:** Existing project MDX and MDX registry/test.

**Interfaces:** Registers `<USDZAssetDemo />` once. Translated narrative blocks appear before the shared widget; translated architecture and remaining content follow it.

**Acceptance criteria:** AC-04, AC-05, AC-09, AC-13, AC-15.

- [x] Update the registry test to require `USDZAssetDemo`; run `npm run test -- components/MDXComponents.test.ts`. Expected: failure before registration.
- [x] Register the component and split the existing language wrappers at the insertion boundary. Preserve existing product prose and metadata.
- [x] Add the approved corresponding headings and approximately 150–250 explanatory words per language, including captions and excluding controls/report details. Explicitly identify omitted magnifying glass/glow and distinguish original USDZ, converted GLB, native acceptance, and external artwork tooling.
- [x] Include the canonical example, exact reproduction command, retained report date/version/policy, and license attribution.
- [x] Verify seven correctly ordered sections per language, one shared widget, equivalent qualifications, and preservation of the original sections. Repeat registry/language tests and commit.

### Task 5: Verify production delivery and complete final reviews [size: M | risk: other | mechanical: false | clear_pattern: true | objectively_verifiable: true | concerns: none]

**Risk:** Static output, real browser behavior, and device support require evidence beyond component mocks.

**Acceptance criteria:** AC-01–AC-18.

- [x] Run the focused suite:

  ```sh
  npm run test -- components/projects components/MDXComponents.test.ts components/Image.test.ts components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx locales/locales.test.ts data/projects/usdzValidatorAssets.test.ts scripts/compressImagesTarget.test.ts components/home/ProjectsPreview.test.tsx layouts/ProjectLayout.test.tsx
  ```

  Expected: all selected tests pass.

- [x] Run `BASE_PATH=/portfolio npm run build`, retain its export for subpath review, then run `npm run build` for the final root export. Expected: both production builds pass with actual Contentlayer compilation and no hydration/custom-element errors.
- [x] Serve the actual exported files with clean-URL resolution; do not use `next start`. Use isolated Playwright 1.64.1 with installed Chrome for network assertions and screenshots. Keep QA tooling/artifacts outside public delivery files.
- [x] Test `/`, `/projects`, and the project page at **1440×900** and **390×844**, English/Italian, light/dark. Inspect actual cover crops, comparison layout, word counts, section order, controls, overflow, and responsive requests.
- [x] Capture network evidence before activation, after activation, and across language changes. Test blocked engine/model responses, HTTP-200 HTML model responses, timeout/retry, unavailable WebGL, navigation during loading, keyboard/touch controls, and reduced motion.
- [x] Inspect no-JavaScript output and root/subpath asset responses. Check MIME types plus file signatures/hashes; verify downloads match canonical bytes. Record Quick Look device smoke if available, otherwise mark device behavior unverified.
- [x] Recheck external-input and unrelated-image hashes. Ensure no stale cover files or temporary public assets remain.
- [ ] Run `personal-workflows:code-review` once in integrated mode: specification review first, quality review second. Address findings and rerun affected checks. Record exact commands, outcomes, limitations, and review evidence; commit the verified result and workflow bookkeeping.

## 4. Acceptance traceability

| Criteria    | Primary implementation and proof                                       |
| ----------- | ---------------------------------------------------------------------- |
| AC-01–AC-03 | Task 1 hashes/family checks; Task 5 exported crops                     |
| AC-04       | Task 4 bilingual content; Task 5 rendered order/counts                 |
| AC-05–AC-08 | Task 2 source identity, comparator, images, visual acceptance          |
| AC-09–AC-12 | Tasks 3–4 component/MDX tests; Task 5 production browser scenarios     |
| AC-13–AC-15 | Tasks 2–4 evidence/downloads/attribution; Task 5 byte/device checks    |
| AC-16–AC-17 | Task 3 prefix/host configuration; Task 5 both builds and export matrix |
| AC-18       | Task 5 sequential reviews and completion report                        |

## 5. Approval and execution endpoint

The specification and this separate plan have received separate explicit approvals. The execution-method answer selected Native without replacing either approval. Both approved artifacts are now saved outside Plan mode before product changes.

**Execution endpoint:** Complete the cover replacement, bilingual demonstration, viewer, asset/fidelity checks, focused tests, production exports, visual verification, and sequential final reviews. Report working results, commits, evidence, and limitations; stop before further features, push, merge, or publication.
