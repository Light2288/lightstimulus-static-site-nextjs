# USDZ Validator cover and asset demonstration

**Slug:** `usdz-validator-cover-and-asset-demo`

**Type:** feature

**Status:** APPROVED

**Created:** 2026-10-30

**Updated:** 2026-10-30

**Stage:** 4 — Implementation complete; verified and sequentially reviewed. Important finding fixed; one Minor deferred.

**Completion evidence:** [Verification and limitations](../evidence/2026-10-30-usdz-validator-cover-and-asset-demo/verification.md).

**Provenance:** User request in `/Users/davide/.codex/attachments/e4ad895a-4148-4fd0-8af7-2928e0ff33c5/Pasted text.txt`; repository inspection; native clarification selecting “Model-viewer (Recommended)”; scope/design proposal subsequently approved by the user's “confirmed” message on 2026-10-30. That confirmation authorizes this DRAFT only. The earlier `docs/superpowers/specs/2026-10-22-add-usdz-validator-project-design.md` and `docs/superpowers/specs/2026-10-26-update-usdz-validator-v0-2.md` describe previous increments and remain unchanged.

**Specification approval:** The user's subsequent “approved” message on 2026-10-30 explicitly approved the presented specification, authorizing implementation planning.

**Plan approval:** The user separately reproduced the complete implementation plan with “PLEASE IMPLEMENT THIS PLAN” on 2026-10-30. The plan is saved at `docs/superpowers/plans/2026-10-30-usdz-validator-cover-and-asset-demo.md`. Both approvals authorize native Stage 4 implementation.

## Problem and desired outcome

The existing project page explains USDZ Validation Kit but does not connect its illustration to the canonical, validated example asset. Its current cover must also be replaced with the supplied Firefly image.

The wider direction is a portfolio page that both explains the validator and demonstrates a real asset without implying that the validator generates, converts, renders, or previews models. The selected increment delivers the replacement cover and one concise bilingual section with an interactive browser companion, retained evidence, and downloads. Visitors can understand the illustration-to-model relationship, rotate the example after activating it, and inspect exactly what native validation established.

This is one coherent end-to-end increment: cover processing, asset conversion, MDX integration, accessible interaction, static hosting, tests, documentation, and visual verification are included. Browser conversion fidelity, especially transparency, is the material uncertainty to resolve. Failure to establish it prevents completion; it does not authorize substituting an unrelated asset or silently reducing the section to a static demonstration.

## Current behavior and inspected evidence

- `data/projects/usdz-validator.mdx` has matching English and Italian sections within one `<Lang>` wrapper per language. It describes the completed v0.2.0 product, its architecture, features, verification, limits, and links. Its cover URL is `/static/images/projects/usdz-validator.png`.
- `ProjectContent` uses Pliny's `MDXLayoutRenderer` with `components/MDXComponents.tsx`. The registry supports named React components but has no 3D component. `Lang` unmounts children when its language is inactive. `LanguageContext` renders English initially and reconciles the preference after mount.
- The shared image component emits PNG and WebP responsive URLs. The image script backs up an input, compresses the main image, and generates responsive files; an existing backup causes that input to be skipped. No generated image manifest was found. The backup directory is Git-ignored.
- Firefly is 2140 × 944. The original illustration is 1254 × 1254. Page headers and project cards use `object-cover`, so the wider replacement needs crop review.
- The site statically exports to `out`. Observed production responses identify Netlify; its configuration includes a catch-all rewrite. A GitHub Pages workflow also builds with `BASE_PATH`. Next.js runtime headers alone cannot configure a static host. Existing client asset-prefix handling must be verified in an actual subpath export.
- All requested canonical materials exist in `/Users/davide/Personal/Projects/usdz-validator`, inspected at commit `71df0a8`. The example README identifies candidate-003, preserves its source bytes, documents a saved validation run, and explains historical external artwork checks. The scene declares meters, Y-up, 20 cm outer bounds, 14 meshes, and six materials; its translucent panel material has opacity 0.1.

## Approaches and selected design

The user selected a self-hosted `model-viewer` component. Its existing camera and keyboard controls are proportionate to this single model. A custom Three.js/OrbitControls viewer would provide greater UI control but require more camera, accessibility, and lifecycle code, so it is not selected. A poster and Apple Quick Look alone would not deliver browser rotation across supported desktop and mobile browsers.

Use pinned `usd2gltf` tooling with OpenUSD in an isolated conversion environment. Inspection of usd2gltf 0.3.5 shows conversion of USD Preview Surface opacity into glTF alpha blending, alongside base color, roughness, and metallic values. IOR is unsupported in that conversion; exact optical or renderer equivalence is not promised. Blender is a heavier alternative and is not currently installed. The selected approach must first meet the geometry/material/visual acceptance criteria below; changing conversion strategy after a material failure requires reviewing the affected plan and, if behavior changes, the specification.

The inspected browser package candidate is `@google/model-viewer` 4.4.0, with its Three.js peer dependency. Planning must verify and pin compatible versions in the existing npm lockfile. Conversion tools remain outside the site's runtime and deployment dependencies. Routine implementation details may be settled in the separate plan without changing this scope.

## Source identity and asset handling

The validator repository, private artwork directory, and Downloads files are read-only inputs. Prefer the canonical example, never another candidate.

| Input                    | Source                                                                | SHA-256                                                            |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| New cover                | `/Users/davide/Downloads/Firefly.png`                                 | `ee47141de59d396eb9baf75175a1b495108a33a9084dc5421c01d5d593f6e581` |
| Original illustration    | `assets/branding/usdz-validator.png` in the validator repository      | `74723d5ddd7017e0943882a3c9b35ef3aca4b137244007aaabbe4bc2804a256b` |
| Downloadable model       | `Examples/layered-cube/model.usdz` in the validator repository        | `89ee36e574d27275387367e67199a24ab7b4d356325f2b5f1fdfa60f1f2297a3` |
| Editable canonical scene | `Examples/layered-cube/source/model.usda` in the validator repository | `802c1a05ee68ecc5fc5c1b716a19a5dd1e2a69161bd512a10da981dd1e8ca1c3` |

The canonical illustration matches the supplied Downloads illustration; the canonical USDZ matches private candidate-003. These identities were measured during discovery, not inferred from filenames. Preserve the canonical `Examples/layered-cube/validation.json` bytes as the downloadable report and record its digest during implementation alongside the other copied assets.

### Cover pipeline

Keep the existing frontmatter cover URL and naming convention. The required retained source is `public/static/images/original-backups/projects/usdz-validator.png`, byte-identical to Firefly. The main image remains `public/static/images/projects/usdz-validator.png`.

Identify and remove only the old cover's generated files using the actual script naming rules: the main image and `projects/responsive/usdz-validator-<width>w.<format>`. With this source, the expected family is the main PNG plus PNG and WebP files at 144, 200, 640, 800, and 1000 pixels wide. Audit for obsolete sizes/formats of that exact cover stem; do not delete similarly named demonstration images or unrelated assets.

Use the existing workflow rather than a new compression implementation. Account for the existing-backup skip rule by reseeding this input from Firefly and allowing the workflow to recreate its backup from those original bytes. Verify the final backup hash. Run only the necessary subtree, with previously processed unrelated inputs skipped. If discovery during planning shows this cannot protect unrelated inputs, use a narrowly targeted invocation rather than broad image reprocessing.

Explicitly retain the required new source in Git despite the existing ignore rule. Keep unrelated original backups ignored and unchanged. Leave no old-cover variants, temporary backups, or processing files in the final working tree. Do not generate another cover or modify Firefly.

### Demonstration files and reproducibility

Use a distinct image family under `public/static/images/projects/usdz-validator-demo/` for `illustration.png` and `poster.png`, with their normal responsive derivatives and corresponding retained sources. Process both through the established image workflow. Preserve the original illustration's transparency; display both images with containment so their subject is not cropped.

Store the self-contained browser `model.glb`, original `model.usdz`, and original `validation.json` under `public/static/models/usdz-validator/layered-cube/`. Include the canonical MIT license notice and a concise provenance/reproduction README there. The README records source hashes, conversion tools and exact commands/versions, output hashes, fidelity checks, and any observed appearance differences. Link the editable USDA in the canonical repository rather than adding another editable-scene download to the site.

Convert the canonical USDZ directly if supported; otherwise use its canonical editable USDA after checking geometry/material equivalence with the packaged scene. This is the same documented asset, not a candidate substitution. Keep its scale, orientation, full geometry, material assignments, and usable translucent appearance. Avoid remeshing, geometry simplification, texture baking, or artistic redesign. Produce a self-contained GLB without remote textures or decoder requirements. Generate the poster from the visually accepted browser companion, then process it as a site image; do not reuse the cover as its poster.

## Bilingual section and evidence boundaries

Insert the section after Motivation/Motivazione and before System Architecture/Architettura del sistema. Use these corresponding headings:

- English: “From project illustration to validated 3D asset”.
- Italian: “Dall’illustrazione del progetto a un asset 3D validato”.

Keep approximately 150–250 words of explanatory content per language, including captions but excluding controls and expandable report details. Write equivalent English and Italian content. Preserve the existing overview, motivation, architecture, features, verification, limits, metadata, and links; reorganizing `<Lang>` wrappers is permitted to insert a single shared viewer without altering the existing prose or per-language section order.

The prose explains that a procedural reconstruction interprets the illustration's blue frame, pyramid, teal gridded platform, and lower pale-blue platform. Explicitly state that the magnifying glass is absent from the actual 3D model; the exterior glow is also omitted. It is an interpretation of one image, not exact recovery of hidden geometry or lighting. Describe the browser GLB as a converted companion and the USDZ download as the original validated package. Modeling, conversion, and rendering are external demonstration tooling, not validator capabilities.

Show the original illustration and the poster/viewer together on wider screens and stacked on narrow screens, with distinct localized captions and useful alt text. Keep the validation summary compact. Use native expandable details for report context, avoiding a long raw JSON block in the main page.

The saved report and canonical README establish:

- Captured October 29, 2026; validator 0.2.0; schema major 1; safety envelope 3.
- Asset `model.usdz`, 530,905 bytes, identified by its SHA-256.
- Default `general-v1` profile and built-in budgets; failure threshold `error`; incomplete coverage not accepted; sensitive details excluded; external checker unrequested.
- Recorded exit 0, gate pass, complete requested native coverage, no native findings, and no operational errors. Unrequested Apple advice/checker work must not be described as completed.
- One stored `model.usdc` entry, no textures, and no external dependencies. Thus the example does not demonstrate texture handling on actual texture data.

Distinguish native package/reference/budget acceptance from geometry or visual acceptance. The report applies to the original USDZ, not the GLB. Historical artwork checks on October 28 and any new GLB inspection are external checks; label their dates and scope accurately. Do not imply the validator was rerun during the site update unless a fresh run is actually performed and recorded. Full USD conformance, renderer compatibility, geometry validity, security certification, and identical appearance across viewers are not established by a native gate pass.

Provide USDZ and JSON download links, a link to `https://github.com/Light2288/usdz-validator/tree/main/Examples/layered-cube`, and the documented command, explicitly run from the validator repository after building its CLI:

```sh
.build/release/usdz-validator validate Examples/layered-cube/model.usdz --format json
```

Include MIT attribution and access to the redistributed license notice. Preserve the general page's existing verification claims and qualifications separately from this asset-specific summary.

## Viewer integration and behavior

Register one project-specific `USDZAssetDemo` client component in the existing MDX registry. Keep the shared viewer outside language-filtered subtrees so its activation and camera remain intact when language changes; localized text, instructions, status, and accessible names update from the existing language context. Keep bilingual narrative and section headings in MDX. No new locale routing or content schema is required.

Initially render a stable-size static poster, a native activation button, and working download/report links. Do not render an active model element, assign a model URL to an engine, preload models, or fetch the rendering engine before explicit activation. Merely scrolling into view, route prefetching, report expansion, or changing language must not activate it. Loading the static illustration/poster and embedded report summary is permitted.

On activation, dynamically import the self-hosted engine and mount the GLB viewer on the client. No browser-only engine evaluation may occur during static generation or initial hydration. Keep the poster while loading; announce localized status without layout shift. Attach and clean up native custom-element event listeners reliably with React 19 and Strict Mode; prevent asynchronous completion from updating unmounted instances.

Provide drag/touch rotation, keyboard-operable camera controls with translated instructions, a visible reset-view control, and clear focus styling. Preserve normal page scrolling on touch devices. Do not auto-rotate or start animated interaction prompts; respect reduced-motion preferences. Language switching must not initiate another model download or reset the camera.

Handle engine-import failure, model-load failure, unavailable WebGL, and a stalled load with an explicit localized error, the retained poster, and a retry control. Set the stall timeout in the implementation plan. Downloads and report details remain usable on error and without JavaScript. Keep the inactive poster and readable section in static HTML. An ordinary link to the original USDZ supports Apple Quick Look through appropriate `rel="ar"` image-link markup on supporting devices; retain a separate plain download link. No automatic AR launch or additional AR features are included.

Prefix image, GLB, USDZ, JSON, license, and any other local asset URLs exactly once using the build's `BASE_PATH`. Use plain asset anchors rather than route-prefetching links for downloads and Quick Look. Verify the prefix in client code after hydration, not just static HTML. Keep any necessary prefix/host configuration change small and test it against root and subpath exports. Do not redesign unrelated URL handling or hosting.

## Acceptance criteria

- **AC-01:** Firefly's source is retained at the exact required backup path, tracked for delivery, and matches the stated digest; all external inputs remain unchanged.
- **AC-02:** The main cover and every expected responsive PNG/WebP variant are newly generated from Firefly using the existing workflow. No stale old-cover derivative or temporary copy remains; unrelated image hashes are unchanged.
- **AC-03:** The project header, listing cards, and homepage card show the new cover. At desktop and narrow mobile widths, their existing crops preserve the central subject without clipping essential model/magnifying-glass content.
- **AC-04:** Both languages contain the new section in the specified position, with 150–250 words of explanatory prose and equivalent accuracy qualifications. Existing product prose, metadata, route, and links remain intact.
- **AC-05:** The original illustration is distinct from the new cover and GLB poster; the section explicitly states that the magnifying glass was omitted. All added images use the established responsive pipeline and resolve without cropping their subjects.
- **AC-06:** The USDZ, illustration source, and report copy match their canonical bytes. Their provenance, hashes, license, conversion versions/commands, and inspection observations are recorded; no other candidate is substituted.
- **AC-07:** Independent comparison of the GLB with the canonical scene establishes all 14 mesh identities, triangle counts, world-space bounds/scale/orientation, and material bindings within recorded numerical tolerances. Material checks retain base colors, roughness/metallic values, and panel opacity/alpha blending; expected shading limitations are recorded. The separate plan defines the comparison method and tolerances before conversion.
- **AC-08:** Browser review of the converted model from front, rear, and rotated views confirms the frame, pyramid, grid, both platforms, and visible translucency without missing parts or opaque panels. The poster depicts that accepted GLB. Numeric checks alone do not satisfy visual acceptance.
- **AC-09:** Actual Contentlayer compilation and the MDX registry render the section with no unknown component, hydration, or React custom-element errors. Exactly one viewer instance is present, and existing language switching remains correct.
- **AC-10:** Production-browser network observations show no model or rendering-engine download before activation, including scrolling, language switching, and ordinary Next.js prefetching. Activation loads only self-hosted rendering/model resources; language switching preserves the loaded view without a new model request.
- **AC-11:** Mouse, touch, keyboard, reset-view, focus visibility, and translated controls work. The viewer does not trap page scrolling or introduce automatic rotation/prompt motion; reduced-motion behavior is verified.
- **AC-12:** Import failure, asset failure, WebGL unavailability, and stalled loading produce a localized fallback with poster, retry, and usable links. Unmount/navigation during loading does not cause stale updates. No-JavaScript output retains the poster, narrative, report details, and downloads.
- **AC-13:** The summary and expanded details faithfully reflect the saved report's tool, policy, asset, outcome, and coverage. They distinguish unrequested checks, native acceptance, historical artwork checks, and new conversion/visual checks in both languages.
- **AC-14:** USDZ and JSON download bytes match the canonical files. Quick Look uses the original USDZ and correct markup; a supporting-device smoke test is recorded if available. If unavailable, explicitly report the device-level behavior as unverified rather than equating markup checks with a successful launch.
- **AC-15:** The canonical example link, reproduction command, attribution, and license notice are available and correct. Modeling/rendering are never presented as validator capabilities.
- **AC-16:** Root and nonempty-`BASE_PATH` production exports resolve every emitted cover, section-image, model, report, and license URL after hydration. Verify content types and file signatures/bytes as appropriate; a host's HTTP-200 HTML fallback is not treated as a valid asset response.
- **AC-17:** Focused component/MDX/language/image/asset checks, relevant existing project tests, and the production build pass. Visual review covers 1440 × 900 and 390 × 844, both languages and themes, with no overflow, unreadable crops, mixed-language controls, or broken assets. New meaningful interaction/failure tests cover the viewer; broad unrelated test expansion is excluded.
- **AC-18:** Final specification and quality reviews are completed for the increment. The completion report distinguishes executed checks from retained evidence, identifies browser/device/hosting limitations, and stops before further site work or publication.

## Constraints, edge cases, and delivery boundary

Missing canonical files, identity drift, unreadable cover crops, materially altered geometry, unusable transparency, or an unsupported conversion are failures to resolve or report, not reasons to substitute sources or assert completion. If the selected approach cannot satisfy this specification, return with concrete evidence and the smallest proposed change through the applicable approval gate.

Preserve existing image conventions and page styling. Prefer a project-specific component and small asset documentation over a general viewer framework. Necessary dependency, type, registry, locale, focused configuration, and test changes are in scope; unrelated refactors and site-image regeneration are not.

The source backup is intentionally retained; “no temporary backups” does not remove that required canonical source. Keep only the new cover source at its required path, plus the fresh derivative family. Any throwaway conversion or QA intermediates must not become accidental public assets or delivery files.

This increment does not authorize generating another cover, modifying external repositories/files, writing the modeling blog article, uploads, backend validation, a general model playground, additional AR behavior, new site features, deployment, push, or merge. Later capabilities remain provisional and receive their own approvals.

## Approval and Git handoff

This file is the new specification for slug `usdz-validator-cover-and-asset-demo`; lookup found no existing matching specification or plan. Its separate plan is now saved and explicitly approved; no approval of a previous increment applies to this work.

Current authorization: specification and separate plan are explicitly approved for this increment. The saved plan uses the same basename and slug with an explicit Spec reference. Follow both artifacts; do not infer approval for additional scope from clarification answers or mode changes.

Keep this specification uncommitted until both artifacts are approved and the implementation branch is created. Do not update `main` or create that branch beforehand. After approval, use the existing checkout, update `main` safely without discarding local work, and use a conventional `feat/` branch. Do not create a worktree without an explicit request. Implement, verify, review, and commit the approved increment on that branch; do not push or merge.

**Execution endpoint:** Complete the approved cover replacement and bilingual asset demonstration, viewer integration, asset/fidelity checks, focused tests, production exports/build, visual review, and final specification/quality review; report working results, evidence, and limitations; then stop before further features or publication.
