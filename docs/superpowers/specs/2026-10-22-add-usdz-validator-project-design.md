# Add USDZ Validation Kit to the Portfolio

**Slug:** `add-usdz-validator-project`
**Type:** feature
**Status:** APPROVED
**Approval:** The user explicitly approved this written specification with “spec approved” on 2026-10-22. Implementation-plan approval remains a separate gate.
**Provenance:** User request to add `/Users/davide/Personal/Projects/usdz-validator` to the portfolio; user-confirmed proposal; native interactive artwork clarification; specification presented in chat on 2026-10-22; user instruction to write the specification and obtain separate specification and plan approvals before implementation. Source evidence: the source repository's `README.md`, `Package.swift`, `docs/cli.md`, `docs/inspection-boundary.md`, `docs/verification/release-summary.md`, and validation implementation; the site's `contentlayer.config.ts`, existing `data/projects/*.mdx`, project components, homepage, search/tag generators, sitemap, and image pipeline; GitHub verification of the published v0.1.0 release.

## Problem

The portfolio does not yet represent USDZ Validation Kit, a delivered Swift library and CLI for repeatable USDZ packaging, package-local reference, and delivery-budget checks. Add a technically accurate project page for developers, technical collaborators, and prospective employers assessing its purpose and engineering decisions.

## Current Behavior

Five bilingual MDX project documents supply the projects listing, detail pages, homepage preview, search entries, and sitemap. Contentlayer discovers project documents automatically. The homepage displays the four most recent projects by date.

The existing project schema supports localized titles, summaries and tags, a project date, type, status, cover image, stack, and external links. The image component expects responsive derivatives for static PNG covers. No schema or component change is needed for this addition.

## Desired Outcome

Add a bilingual project page at `/projects/usdz-validator`, with accurate technical content and a striking cover illustration consistent with the existing project artwork. Use the existing content pipeline and language controls throughout.

The source project is a read-only evidence source. This change describes its delivered v0.1 scope; it does not change or extend the validator.

## Content and Site Integration

### Project document and metadata

Add `data/projects/usdz-validator.mdx`, relative to the site repository root. Follow the existing frontmatter schema and use parallel `<Lang value="en">` and `<Lang value="it">` body blocks.

| Field                              | Required value                                                            |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Title, both languages              | USDZ Validation Kit                                                       |
| Date                               | `2026-10-22`, the release date in Europe/Rome                             |
| Project type                       | `product`                                                                 |
| Status                             | `completed`, describing the delivered v0.1 scope                          |
| Cover image, once the asset exists | `/static/images/projects/usdz-validator.png`                              |
| Stack                              | Swift 6, Swift Package Manager, Foundation, Swift Argument Parser, XCTest |
| `links.github`                     | `https://github.com/Light2288/usdz-validator`                             |
| `links.docs`                       | `https://github.com/Light2288/usdz-validator/blob/main/docs/cli.md`       |

Use these tags with localized labels:

| ID                | English         | Italian                    |
| ----------------- | --------------- | -------------------------- |
| `swift`           | Swift           | Swift                      |
| `usdz`            | USDZ            | USDZ                       |
| `developer-tools` | Developer Tools | Strumenti per sviluppatori |
| `3d-assets`       | 3D Assets       | Asset 3D                   |
| `validation`      | Validation      | Validazione                |

**English summary:**

> A Swift library and macOS command-line tool for checking USDZ packaging, package-local references, and delivery budgets, with explicit validation coverage and text, JSON, and SARIF reports.

**Italian summary:**

> Una libreria Swift e uno strumento da riga di comando per macOS per verificare la struttura dei pacchetti USDZ, i riferimenti interni e i limiti di dimensione degli asset, con copertura delle verifiche esplicita e report testuali, JSON e SARIF.

### Bilingual body

Provide six corresponding sections in both languages. The two versions must convey the same features, boundaries, and evidence.

1. **Overview / Panoramica:** Explain the library and macOS CLI, local operation, and use in 3D asset delivery workflows.
2. **Motivation / Motivazione:** Describe the need for repeatable packaging, reference, and budget checks before asset delivery.
3. **System Architecture / Architettura del sistema:** Explain the reusable validation library, thin CLI, native inspection pipeline, report encoders, and optional external checker.
4. **Key Features / Funzionalità principali:** Cover archive structure, 64-byte payload alignment, CRC checks, safe package paths, supported lexical USDA references, configurable file and texture budgets, and text/JSON/SARIF output. Explain that encoded texture budgets do not estimate decoded or GPU memory.
5. **Verification / Verifica:** Describe the repository's recorded automated tests, golden reports, schema checks, adversarial checks, and resource measurements. Attribute this evidence to the source project; do not imply those checks were rerun for the site change. Keep measured results qualified by their recorded host and corpus.
6. **Current Limits / Limiti attuali:** Explain incomplete binary-USDC reference inspection, coverage versus acceptance, macOS arm64 support, and the distinction between intended and verified platform compatibility.

### Accuracy and scope of claims

- Native inspection operates locally without extraction or network access.
- The optional installed `usdchecker` is explicitly requested and has a separate trusted-input boundary. Do not extend the native engine's filesystem/network restrictions to that external tool.
- Binary-USDC reference inspection remains incomplete even after a successful optional checker run.
- A passing gate does not establish complete USD conformance, Apple renderer compatibility, or asset-security certification. Accepting incomplete coverage changes acceptance, not coverage.
- The tool does not repair, convert, render, or preview assets.
- The package's Swift 6 and macOS 15 deployment declarations do not establish verified support on that minimum environment. The recorded verified combination is macOS 27.0.1, Xcode 27.1, Swift 6.4, arm64; macOS 15 / Xcode 16 / Swift 6.0 compatibility remains intended and unverified. Summarize this distinction without implying Intel or non-macOS support.
- Do not invent adoption figures, user impact, performance guarantees, or roadmap commitments.

### Integration behavior

Reuse the existing MDX discovery, metadata, language switching, project filtering, search, and sitemap behavior. No schema, component, localization-dictionary, dependency, or public API changes are required. Do not modify the unused starter `data/projectsData.ts`.

Rebuild generated project tags and bilingual search data through the existing workflow rather than editing generated files manually.

The new date places the project first in the projects listing and homepage preview. Keep the four-project homepage limit. Micelio moves out of that preview while retaining its project page and listing entry.

## Artwork

### Visual direction

Create a new raster illustration using `public/static/images/projects/blog-writer.png` and `public/static/images/projects/light-stimulus.png` as visual-style references.

Show a floating, partially exploded USDZ package rendered as a sculptural glass-and-metal cube. Visible layers suggest scene data, textures, and internal references. A luminous scanning plane passes through it, with restrained report motifs emerging nearby.

Match the references' cinematic depth, dark background, teal/cyan and amber/orange lighting, and polished digital materials. Keep a strong central silhouette that remains recognizable at card size. The user specifically requested something interesting and striking. Avoid a flat diagram, generic shield icon, fictional app screenshot, dense text, logos, and certification imagery.

Use a 16:9 master, preferably 2048 × 1152 or larger, with the main subject safely centered for existing card crops. Save the final PNG to `public/static/images/projects/usdz-validator.png` and use the existing image pipeline to produce responsive PNG/WebP widths of 144, 200, 640, 800, and 1000 pixels.

### Generation fallback

Image generation is the preferred production method. At specification time the built-in image generator is unavailable. The user explicitly requested a prompt for another image-generation tool if generation is unavailable; the prompt is included below.

If artwork remains unavailable during implementation, deliver the content and prompt, omit `coverImage` until the asset exists, and report the artwork requirement as incomplete. Do not introduce a broken image reference or silently substitute unrelated artwork, a vector diagram, or a fabricated screenshot. AC-04's artwork portion and AC-07 remain incomplete until the actual illustration and derivatives are supplied and verified.

## Acceptance Criteria

- **AC-01:** The new MDX document parses through the existing project schema with the specified metadata, subject to the explicitly permitted missing-artwork fallback.
- **AC-02:** English and Italian summaries and all six body sections are present, equivalent in meaning, and displayed by the existing language control.
- **AC-03:** Technical claims match the source repository, including the distinction between defects, incomplete coverage, and gate acceptance.
- **AC-04:** `/projects/usdz-validator` renders the title, summary, metadata, tags, stack, artwork, and working repository/documentation links. Under the missing-artwork fallback, content can be delivered without the cover, but the artwork portion remains explicitly incomplete.
- **AC-05:** The new project appears first in the projects listing and homepage preview without changing the four-project homepage limit.
- **AC-06:** All five tags filter correctly, bilingual search entries resolve to the new page, and the sitemap includes its URL.
- **AC-07:** The cover and responsive variants exist, load successfully, and remain visually clear in project-card and detail-page crops. This criterion remains incomplete if the missing-artwork fallback is used.
- **AC-08:** Existing project pages remain available and retain their content and behavior.
- **AC-09:** The production build and existing relevant project, homepage, and search tests pass.

## Verification

Run the production build and relevant existing Vitest tests using the commands defined in `package.json`. Inspect the resulting project route, generated bilingual search entries, tags, and sitemap. Do not treat the historical validator verification evidence as a fresh test run.

Perform browser inspection at representative desktop and narrow mobile widths, in English and Italian and in both light and dark themes. Inspect links, filtering, search, homepage ordering, layout, and metadata. If artwork is available, inspect its loading and responsive crops; otherwise verify that no missing cover is requested.

Additional content-only unit tests are unnecessary unless verification exposes a concrete gap. Do not change application behavior or add speculative test infrastructure for this content addition.

## Edge Cases

- Missing artwork follows the explicit fallback above; it must not cause broken requests or be reported as completed artwork.
- The two language versions must retain the same qualifications about checker behavior, coverage, and supported environments.
- The source release-summary document still says publication is pending. GitHub independently confirms a published, non-draft, non-prerelease v0.1.0 release at `https://github.com/Light2288/usdz-validator/releases/tag/v0.1.0`, published at `2026-10-21T23:43:03Z`, which is 2026-10-22 in Europe/Rome. Use the verified release state without modifying the source repository.

## Constraints and Out of Scope

- The source project remains read-only.
- Changes are limited to the new project content, artwork, generated site data, and workflow documents.
- Site redesign, unrelated refactoring, source-project changes, and publishing are out of scope.
- Obtain explicit approval of this written specification before creating the implementation plan. Obtain explicit approval of that written plan before implementation.
- Keep specification and plan changes uncommitted until the implementation branch is created. Only after both approvals, update `main` and create a branch using the repository's conventional branch prefixes.
- Work in the existing checkout; do not create a worktree unless explicitly requested. Implement, verify, and commit on the feature branch. Do not push, merge, or deploy unless requested.

## Notes

Artifact lookup found no existing specification for the exact slug `add-usdz-validator-project`. This is a new specification, not a revision of a legacy artifact.

### Fallback image-generation prompt

Create a striking cinematic cover illustration for “USDZ Validation Kit,” a Swift developer tool that inspects packaged 3D assets. Use the attached Blog-Writer and Light Stimulus portfolio covers as visual-style references only.

Show a floating, partially exploded USDZ package as a sculptural translucent glass-and-metal cube. Inside, reveal a carefully arranged miniature geometric scene, layered texture sheets, and luminous connections suggesting internal asset references. A bright scanning plane passes through the package, transforming its structural details into a few elegant, abstract report panels nearby.

Match the references' polished digital rendering, dramatic depth, dark atmosphere, luminous teal/cyan and amber/orange accents, volumetric light, reflective materials, and restrained particle trails. Make the package the dominant focal point, with an intriguing silhouette and enough negative space to keep the composition readable. The image should feel visually arresting and technically purposeful.

Use a 16:9 landscape composition, preferably 2048 × 1152 or larger. Keep essential objects near the center so the cover survives tighter card crops and remains recognizable at thumbnail size.

No written title, readable interface text, logos, watermarks, certification badges, generic security shields, or fictional application screenshots. Avoid cluttered dashboards, flat stock-icon compositions, and excessive tiny details.
