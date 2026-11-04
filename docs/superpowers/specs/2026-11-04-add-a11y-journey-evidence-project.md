# Add A11y Journey Evidence to the Portfolio

**Slug:** `add-a11y-journey-evidence-project`
**Type:** feature
**Status:** APPROVED
**Created:** 2026-11-04
**Updated:** 2026-11-05
**Provenance:** The user's request to create an A11y Journey Evidence project page; repository and authoritative-source inspection on 2026-11-04; the Stage 1 scope/design proposal confirmed by the user's “i confirm” message on 2026-11-04. Local evidence: `contentlayer.config.ts`, `data/projects/usdz-validator.mdx`, `data/projects/blog-writer.mdx`, `data/projects/certflow.mdx`, project components and layout, `components/Image.tsx`, `components/mdx/Lang.tsx`, language context and dictionaries, project/homepage routes, SEO and sitemap generation, search/tag generators, `scripts/compress-images.mjs`, `package.json`, existing tests, `.husky/pre-commit`, and `.github/workflows/pages.yml`. Public evidence is listed below.
**Approval state:** Scope/design confirmed by “i confirm,” followed by separate specification approval “approved” after the Stage 2 specification presentation and plan approval “approved” after the Stage 3 plan presentation, all on 2026-11-04. Both saved artifacts now authorize implementation of this increment using the approved native method.

## Problem

The portfolio does not represent A11y Journey Evidence, an open-source experimental package for reviewable keyboard and focus evidence around native Playwright Test journeys. Visitors need to understand its purpose, intended users, practical capabilities, examples, tradeoffs and limits without mistaking recorded evidence for an accessibility certification.

## Current Behavior

Six bilingual MDX project documents supply the project detail pages, project listing, date-sorted four-project homepage preview, localized search entries, tag filters and sitemap. The existing schema supports localized titles, summaries and tags, date, type, status, cover, stack and external links. Detail pages use the shared project header, metadata cards, MDX renderer and back link.

The site uses one route per project with client-side English/Italian switching. Project SEO metadata and structured data currently use English. The project image component expects pre-generated responsive derivatives. Existing project cover PNGs are 1000 pixels wide and approximately 2.3:1; the shared detail header and fixed-height cards crop those images differently.

`data/projectsData.ts` is unused starter content. The current project pipeline does not require a hand-maintained listing entry or a new navigation menu item.

## Desired Outcome and Delivery Boundary

- **Wider direction:** Keep the portfolio's open-source project coverage technically accurate, bilingual and consistent with the existing site.
- **Selected increment:** Deliver a complete project page at `/projects/a11y-journey-evidence`, its listing and homepage integration, an adapted supplied illustration, and the existing metadata, search and navigation integrations.
- **Uncertainty:** Verify that the project is understandable within the site's editorial format and that the supplied artwork survives all existing crops. The illustration has not yet been supplied; its source path, dimensions and exact crop remain execution inputs rather than an authorization to substitute artwork.
- **Necessary safeguards:** Equivalent qualifications in both languages, visible experimental status, source-grounded claims, responsive artwork and browser inspection, existing repository checks, final review and user-controlled publication.
- **Deferred work:** Interactive demonstrations, new reporting viewers, site-wide design or infrastructure changes, package changes, future release updates and later content increments.
- **Boundary rationale:** One content document and its cover can use the existing pipeline to deliver the complete outcome. Splitting the page, listing or artwork into separate increments would leave this requested outcome incomplete.

## Approach

Use the existing bilingual MDX project model and shared components. This is a bounded content-and-assets addition; no schema, component, localization-dictionary, dependency or public API change is required. The user confirmed this approach at Stage 1. A custom route or interactive component would add maintenance without serving the selected scope.

### Project document and metadata

Create `data/projects/a11y-journey-evidence.mdx` using localized frontmatter and corresponding `<Lang value="en">` and `<Lang value="it">` body blocks.

| Field                 | Required value                                                             |
| --------------------- | -------------------------------------------------------------------------- |
| Title, both languages | A11y Journey Evidence                                                      |
| Date                  | `2026-11-04`, the portfolio-entry date, not a claimed package-release date |
| Project type          | `experiment`                                                               |
| Status                | `in-progress`                                                              |
| Cover                 | `/static/images/projects/a11y-journey-evidence.png`                        |
| Stack                 | TypeScript, Node.js, Playwright Test                                       |
| `links.docs`          | `https://light2288.github.io/a11y-journey-evidence/`                       |
| `links.github`        | `https://github.com/Light2288/a11y-journey-evidence`                       |
| `links.npm`           | `https://www.npmjs.com/package/a11y-journey-evidence`                      |

The published experimental release and the site's ongoing-project status are separate facts. Explain experimental v0.1.0 explicitly in the summaries and opening sections; the generic status card alone is insufficient. State that external validation is pending.

**English summary:**

> Experimental v0.1.0 tooling for reviewable keyboard and focus evidence in native Playwright Test journeys, with bounded observations, failure captures, and portable Markdown bundles. External validation is pending.

**Italian summary:**

> Strumento sperimentale v0.1.0 per raccogliere evidenze consultabili su tastiera e focus nei percorsi di test nativi di Playwright Test, con osservazioni entro limiti espliciti, acquisizioni in caso di errore e report Markdown portabili. La validazione esterna è ancora in attesa.

Use localized tags with these stable IDs and labels. Reuse the established `typescript` and `developer-tools` labels.

| ID              | English         | Italian                    |
| --------------- | --------------- | -------------------------- |
| playwright      | Playwright      | Playwright                 |
| accessibility   | Accessibility   | Accessibilità              |
| testing         | Testing         | Test                       |
| developer-tools | Developer Tools | Strumenti per sviluppatori |
| typescript      | TypeScript      | TypeScript                 |

### Bilingual body

Match the measured technical tone of the current USDZ Validation Kit page. Target approximately 1,100–1,300 English words, with an equivalent Italian version rather than mechanically equal word counts. Avoid padding the limited experimental scope to imitate older pages' promotional or future-direction sections.

Provide these corresponding sections, using the site's existing third-level heading convention:

1. **Overview / Panoramica:** Identify `a11y-journey-evidence`, published experimental v0.1.0, and its intended users: developers and test authors using Playwright Test who need inspectable keyboard/focus evidence for review. State that external validation is pending and link the [v0.1.0 release](https://github.com/Light2288/a11y-journey-evidence/releases/tag/v0.1.0).
2. **Motivation / Motivazione:** Explain the need to review the focus path and the explicit expectations exercised in a keyboard journey alongside native diagnostics. Keep the problem specific; do not imply stock Playwright lacks focus assertions, failure capture or debugging support.
3. **Approach / Approccio:** Explain the opt-in fixture and reporter, fixture composition using native `mergeTests`, and one `journey.start({ root })` after setup for each selected test. Developers retain native keyboard actions, locators, assertions and named steps, and choose the expected behavior. Tests that do not opt in retain native reporting without journey observations.
4. **Key Features / Funzionalità principali:** Describe bounded, ordered keyboard/focus observations, native executed steps and assertions, actual/expected outcomes and separate attempts, available failure screenshots, declared-root ARIA snapshots, existing native traces when available, and portable Markdown bundles with relative assets. Explain capture controls and visible incomplete/unavailable evidence. Copying a bundle requires its whole run directory, including assets.
5. **Dialog and Form Examples / Esempi con dialoghi e moduli:** Describe runnable synthetic correct cases and intentional regressions. Dialog examples cover activation, declared initial focus, both containment boundaries, Escape dismissal and restoration; regressions omit containment or restoration. Form examples cover keyboard submission, visible errors and invalid state, `aria-describedby` error associations, focus on the first invalid field, correction and resubmission; regressions omit an association or focus movement. Link the complete recipes. Expected failures remain actual failed assertions even when the demonstration command exits successfully. Checks after a hard failure have not run.
6. **Comparison with Stock Playwright / Confronto con Playwright standard:** Explain that equivalent examples retain the same native actions and assertions. Stock Playwright combines native reporters/traces with an application-owned capture hook; the package adds ordered observations and a portable text entry point while introducing dependency, exact-version integration, maintenance and data-handling obligations. Stock reports and traces remain useful and may suit some investigations better. Attribute the comparison to the author; do not present it as external validation or a timed productivity study.
7. **Current Limits and Validation / Limiti attuali e validazione:** Cover the supported recording boundary, evidence semantics, verified package environment, data-sharing limits and pending external validation. Link the full limitations and comparison documentation.

Links to documentation and examples support the portfolio narrative; the page does not reproduce the full installation guide, API reference or example source files. Any small API illustration must match the published documentation and remain clearly illustrative.

### Accuracy and scope of claims

- The verified package scope is Chromium, one page/main document, ordinary light DOM and the explicit observed journey. Frames, additional pages, shadow traversal, navigation/document replacement, nested dialogs, other patterns and additional browsers are outside the verified release scope. Do not promise exhaustive unsupported-boundary detection.
- The documented package baseline was verified locally with Node 24.21.0, npm 11.19.0, TypeScript 7.0.2, Playwright Test 1.64.1, Chromium 156.0.8078.4 and macOS 27.0.1 arm64. Other hosts/runtimes/browsers and package CI compatibility remain unverified. The npm metadata declares Node 24.21.0 and the exact Playwright Test 1.64.1 peer. Site build/browser checks do not broaden this package compatibility claim.
- Browser observation order and native step order are separate sequences, not a shared clock or proof of causation. Do not describe them as one completely synchronized timeline.
- Failure screenshots and scoped ARIA snapshots are attempted at fixture teardown when available, not guaranteed at the instant an assertion failed. Captures may be empty or unavailable; completeness is distinct from native test success.
- Evidence records explicit executed tests and assertions. It does not infer complete keyboard coverage, accessibility conformance, screen-reader announcements, focus-indicator quality or inclusive usability.
- Printable-input filtering is not general sanitization. Attributes, diagnostics, screenshots, snapshots and traces can still contain application data. Recommend synthetic data and inspection before sharing; do not claim bundles are automatically safe to publish.
- Do not invent adoption figures, testimonials, endorsements, measured time savings, performance guarantees or roadmap commitments. External validation remains pending.
- Attribute source-project verification to its published records. Do not suggest package examples or compatibility checks were rerun as part of this site addition.

### Site integration and navigation

Contentlayer must discover the new source and generate its project route. Reuse existing components for header, cover, summary, localized tags, metadata cards, external links, cards and the back-to-projects link. Keep the three supported link keys above; the release link belongs in the body because the shared links component has no release key.

The entry must appear in `/projects`, applicable tag filters, both localized search indexes and the sitemap. The selected date makes it the newest entry in the listing and homepage preview. Preserve the four-project preview limit: A11y Journey Evidence, USDZ Validation Kit, Blog-Writer and CertFlow appear there. Light Stimulus remains available through the listing and its existing route, as do the other existing projects.

Use the existing English title/summary metadata, Open Graph and Twitter cover, `CreativeWork` structured data and breadcrumb generation. Do not introduce language-specific routes, new canonical/hreflang behavior or site-wide metadata changes. Verify the correct project URL and cover in generated output.

Build-time generators own project-tag counts and bilingual search entries. Do not hand-edit or force-add ignored generated files. Leave unused starter content and unrelated source documents unchanged.

### Supplied illustration and cover assets

Adapt the user's generated project illustration; generating replacement artwork is outside this increment. Preserve its subject and visual identity while fitting the current wide landscape cover treatment. Use crop, scaling and ordinary image processing as needed, then inspect the existing 16:9 detail-header crop and fixed-height homepage/listing card crops. Match the site's existing presentation without presenting artwork as an actual package screenshot or validation result.

Use a working master wider than 1000 pixels so the current image pipeline can produce every referenced PNG derivative. Prefer approximately 2.3:1 where the supplied composition allows it. The main processed PNG will be at most 1000 pixels wide. Produce PNG and WebP variants at 144, 200, 640, 800 and 1000 pixels under `public/static/images/projects/responsive/`, named `a11y-journey-evidence-<width>w.<format>`.

Preserve the supplied source through the existing ignored backup mechanism. Process only the new artwork; existing covers and their derivatives must remain unchanged. Verify actual files and requests, since the shared image component constructs responsive URLs without checking file existence.

The source illustration is a pending input, not an optional acceptance criterion. If it is absent or unsuitable during execution, complete independent authorized work and report the specific artwork dependency. Do not invent a source path, reference a nonexistent cover, substitute unrelated artwork or report the increment complete without an adapted, verified cover.

## Acceptance Criteria

- **AC-01:** The new MDX document is accepted by the existing project schema and produces `/projects/a11y-journey-evidence` with the specified localized metadata, date, type, status, stack, tags and three source links.
- **AC-02:** Both language versions include the seven corresponding sections, the required factual coverage and equivalent qualifications. Only the selected language's body is visible, and the English text is reasonably within the stated editorial length target.
- **AC-03:** Both summaries and openings identify experimental v0.1.0 and pending external validation. The content includes no unsupported adoption, endorsement, time-saving, compatibility or accessibility-conformance claim.
- **AC-04:** The approach and feature descriptions preserve native actions, locators, assertions, named steps and fixture composition, distinguish opted-in tests, and accurately explain bounded observations, native outcomes, captures, completeness and whole-directory bundle portability.
- **AC-05:** The page describes and links runnable correct and intentionally broken dialog/form examples, explains expected versus actual failure, and fairly compares equivalent stock Playwright capabilities and ownership/integration tradeoffs.
- **AC-06:** Both languages state Chromium/main-document/light-DOM scope, qualified local compatibility, capture timing, data-sharing risks and the distinction between explicit evidence and accessibility or screen-reader conclusions.
- **AC-07:** The detail page, projects listing and four-project homepage preview render the new entry using existing components. Tag filters, one English and one Italian search entry, external links and back navigation work. Existing project routes remain available and homepage ordering matches the selected date.
- **AC-08:** The primary supplied-artwork cover and all specified PNG/WebP derivatives exist and load. The subject remains recognizable in the detail, listing and homepage crops, with no missing-image request. Existing artwork is unchanged.
- **AC-09:** Production output includes the project sitemap entry, correct English title/description, correct Open Graph URL/cover, Twitter cover, `CreativeWork` and breadcrumb data. Generated tag/search data includes the new entry without manual generated-file edits.
- **AC-10:** Browser verification passes at desktop and narrow mobile widths in English/Italian and light/dark themes: no horizontal overflow, clipped text or unusable cover crop; working keyboard navigation, project links, search, filtering and language switching. Verification records identify routes, viewport sizes and observations.
- **AC-11:** Relevant existing tests, the full Vitest suite, production static build with configured lint/type validation, changed-file formatting and applicable repository hooks pass. Final review and recorded evidence cover the actual generated entry as well as fixture-based tests; any unresolved failure prevents an unqualified completion claim.
- **AC-12:** Delivery stays within the confirmed content/assets scope and Git workflow. The result is verified and committed on the implementation branch only after both artifact approvals, with no push, merge, workflow dispatch or deployment.

## Verification Requirements

Use the existing focused project, layout, homepage, language, search and sitemap tests, followed by the full `npm run test` suite and `npm run build`. The production build includes the repository's configured lint and type checks and static export/postbuild processing. Check changed Markdown/MDX formatting and preserve the existing pre-commit hooks. The broad lint scripts use `--fix`; do not use them to rewrite unrelated files. No new content-only unit tests, dependencies or test infrastructure are required for this addition.

Inspect actual generated Contentlayer/exported content, project-tag counts, both localized search entries, sitemap, social metadata and structured data. Existing tests often use fixtures, so passing tests alone does not demonstrate integration of the real new MDX document.

Inspect the homepage, `/projects` and the new detail route at representative 1440 × 900 desktop and 390 × 844 mobile sizes, in both languages and themes. Include the new project's tag filtering, search-result navigation, external links, back link, keyboard access, text wrapping and image loading/crops. Browser checks may use existing local tooling; do not add Playwright to the site's dependencies merely because the described project uses it.

Record commands, exit statuses, decisive output and browser observations. Treat package verification described in the page as attributed historical/source evidence, separate from checks run for the site. Report baseline or unrelated failures explicitly; unrelated remediation is outside this specification. Complete the personal workflow's final specification/quality review before claiming delivery.

## Edge Cases

- **Artwork not supplied or too small:** Keep the cover criterion pending and report the exact missing input; do not silently accept a coverless result or fabricate derivative dimensions.
- **Expected-failure demonstrations:** A successful command exit must not be described as passing containment, restoration, association or focus checks that actually failed.
- **Missing or incomplete captures:** Do not imply every failure produces every artifact or that a passed test necessarily has complete evidence.
- **Long Italian labels and title wrapping:** Use the existing responsive layout and verify natural wrapping at mobile width.
- **Source changes during execution:** Describe the verified published v0.1.0 scope. A later release does not silently expand this increment; conflicting material facts require explicit resolution before changing the approved specification.

## Constraints and Out of Scope

- No product changes until this specification and a separate plan have received explicit approvals and are both saved.
- Do not update `main`, create a branch or commit specification/plan documents during this drafting stage. After both approvals, safely update `main`, preserve local work, and create a conventional `feat/` branch in the existing checkout. Do not create a worktree unless requested. Commit the approved documents and implementation there.
- Publication remains user-controlled. The current GitHub Pages workflow deploys on pushes to `main` or manual dispatch; do not trigger either, push or merge without a user request. The project schema has no usable project-publication draft gate, so branch isolation and withholding publication actions preserve control without changing the site.
- No package implementation changes, independent package revalidation, new interactive demonstrations, installation playgrounds, evidence hosting, site-wide redesign, new navigation system, dependency changes, future-roadmap promises or automatic subsequent increments.

## Sources and Notes

Read on 2026-11-04 before drafting copy:

- [Published documentation](https://light2288.github.io/a11y-journey-evidence/) and its [getting-started guide](https://light2288.github.io/a11y-journey-evidence/getting-started.html): experimental release, intended workflow and tested baseline.
- [Repository](https://github.com/Light2288/a11y-journey-evidence) and [v0.1.0 release](https://github.com/Light2288/a11y-journey-evidence/releases/tag/v0.1.0): implementation, release capabilities, examples and verification boundaries.
- [Dialog recipe](https://light2288.github.io/a11y-journey-evidence/recipes/dialog.html), [form recipe](https://light2288.github.io/a11y-journey-evidence/recipes/form.html) and [bundle interpretation](https://light2288.github.io/a11y-journey-evidence/evidence/reading.html): explicit policies, intentional regressions, outcomes, capture point and completeness.
- [Stock Playwright comparison](https://light2288.github.io/a11y-journey-evidence/comparison.html) and [limitations](https://light2288.github.io/a11y-journey-evidence/limitations.html): fair tradeoffs, pending external validation, supported scope and application-data risks.
- [npm package](https://www.npmjs.com/package/a11y-journey-evidence): the website returned HTTP 403. The authoritative [npm registry record for 0.1.0](https://registry.npmjs.org/a11y-journey-evidence/0.1.0) confirmed the published name/version, description, ESM exports, exact Node engine and Playwright peer. Do not claim the blocked website was inspected successfully.

Artifact resolution before creation: specification `MISSING`; plan `MISSING`; no competing new-path or exact legacy artifact for this slug. This is a new specification, not a revision of the existing USDZ artifacts. No plan is created in this stage.

**Execution endpoint:** After separate specification and plan approvals, implement and commit the complete bilingual page, listing/metadata/navigation integration and adapted supplied cover; finish required verification and final review; report the working result, evidence, limitations and pending publication actions; stop before later work, push, merge or deployment.
