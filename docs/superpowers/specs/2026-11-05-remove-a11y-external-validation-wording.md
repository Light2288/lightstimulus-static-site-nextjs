# Remove Pending External-Validation Wording from A11y Journey Evidence

**Slug:** `remove-a11y-external-validation-wording`
**Type:** chore
**Status:** APPROVED
**Created:** 2026-11-05
**Updated:** 2026-11-05
**Provenance:** The user's request, after merging the project-page branch, to remove references such as “External validation remains pending.” Stage 1 proposed removing six sentences from the English and Italian summaries, openings and closing paragraphs; the user replied “confirmed.” Repository inspection on `main` at `6157746` covered `data/projects/a11y-journey-evidence.mdx`, `components/projects/ProjectHeader.tsx`, `components/projects/ProjectsListClient.tsx`, `components/projects/ProjectCardBase.tsx`, `app/projects/[slug]/page.tsx`, `lib/generateSearchIndex.ts`, `package.json`, `next.config.js`, `.husky/pre-commit`, and the original project specification.
**Approval state:** Scope/design confirmed by the user's “confirmed” response, followed by separate specification approval “approved” after the Stage 2 presentation and separate plan approval “approved” after the Stage 3 presentation. Both saved artifacts now authorize implementation of this increment using the native method.

## Problem and Current Behavior

The published project source contains six sentences saying external validation is pending: one in the summary, opening paragraph and closing limitations paragraph for each language. The user wants these repeated status statements removed from the article.

The localized frontmatter summaries also supply the project header, project cards and search entries. The English summary supplies page and social descriptions and the project's structured-data description. Removing only body sentences would leave the requested wording in those other representations.

## Desired Outcome and Delivery Boundary

- **Wider direction:** Maintain accurate, bilingual portfolio content using the site's existing content pipeline.
- **Selected increment:** Remove the six pending-validation sentences from the existing project MDX and verify their absence from the resulting article, summaries, search and description metadata.
- **Uncertainty:** No material content or design decision remains open. Verification must confirm that generated output uses the shortened summaries and still renders correctly.
- **Safeguards:** Preserve experimental v0.1.0 status, technical limitations, bilingual equivalence and existing assets; run repository checks and inspect real generated/browser output.
- **Deferred work:** Other editorial changes, package/release updates, shared application or metadata-generator repairs, and publication.
- **Boundary rationale:** One content-source edit updates every affected representation through existing generators; separate component or generated-file edits are unnecessary.

## Approach and Exact Content Changes

Use the existing MDX document at `data/projects/a11y-journey-evidence.mdx`. Delete only the following complete sentences and their adjacent separating whitespace. Remove the associated bold delimiters where the entire deleted sentence is bold; leave no empty emphasis markup.

| Language | Locations                                         | Sentence to remove                           |
| -------- | ------------------------------------------------- | -------------------------------------------- |
| English  | `summary.en` and the opening Overview paragraph   | `External validation is pending.`            |
| English  | Final paragraph of Current Limits and Validation  | `External validation remains pending.`       |
| Italian  | `summary.it` and the opening Panoramica paragraph | `La validazione esterna è ancora in attesa.` |
| Italian  | Final paragraph of Limiti attuali e validazione   | `La validazione esterna resta in attesa.`    |

The resulting summaries must be:

**English:**

> Experimental v0.1.0 tooling for reviewable keyboard and focus evidence in native Playwright Test journeys, with bounded observations, failure captures, and portable Markdown bundles.

**Italian:**

> Strumento sperimentale v0.1.0 per raccogliere evidenze consultabili su tastiera e focus nei percorsi di test nativi di Playwright Test, con osservazioni entro limiti espliciti, acquisizioni in caso di errore e report Markdown portabili.

This deletion is the sole approach needed for the confirmed request. Rephrasing the status would retain the message the user asked to remove; broader paragraph rewrites would change unrelated copy.

The new instruction supersedes the original project's requirement to display pending external-validation wording in live copy. Preserve `docs/superpowers/specs/2026-11-04-add-a11y-journey-evidence-project.md`, its approved plan and previous verification records as historical evidence. Their descriptions of earlier requirements and observations are outside the article-removal scope.

## Acceptance Criteria

- **AC-01:** All six identified sentences are removed from the MDX, including the bold wrappers in the two openings, with natural spacing and punctuation.
- **AC-02:** Both frontmatter summaries match the exact shortened text above. The actual generated project data, localized search entries, exported article and summary-based metadata contain the updated text and none of the four removed sentence variants.
- **AC-03:** Experimental v0.1.0 status, all seven headings per language, package scope and compatibility qualifications, capture/data-sharing limitations, fair stock comparison and accessibility/screen-reader limitations remain unchanged. No claim of completed validation is introduced.
- **AC-04:** The project route, localized header/cards, source links, navigation, date, tags, stack, type/status, cover filename, cover proportions and all image assets remain unchanged. Existing generators continue to own search and metadata output.
- **AC-05:** Changed-file formatting, relevant existing project/homepage/search/language/layout tests, the full `npm run test` suite, `npm run build` with configured lint/type validation and postbuild, and applicable commit hooks pass. Evidence records actual commands and results; any failure is disclosed and assessed without silently broadening scope.
- **AC-06:** Production-export browser checks cover `/`, `/projects` and `/projects/a11y-journey-evidence` at desktop 1440 × 900 and mobile 390 × 844 in both English and Italian. Verify shortened visible summaries, correct language switching, intact article content, no horizontal overflow and loaded covers. Record observations and representative screenshots.
- **AC-07:** Final review and verification evidence accompany a local implementation commit on a conventional implementation branch after separate specification and plan approvals. No push, merge, workflow dispatch or deployment occurs.

## Verification Requirements

Inspect the scoped source diff and actual generated Contentlayer/export/search output, including description metadata. Historical specification and evidence files may still contain the removed wording and are not production-copy failures. A mocked component test alone does not establish that actual project output was updated.

Use existing tests and direct content/output checks; no new unit tests, dependencies or testing framework are needed for these literal editorial deletions. Run `npm run test` and `npm run build`; the build includes the configured lint/type checks and static export/postbuild. Check changed Markdown/MDX with the installed Prettier CLI and preserve `.husky/pre-commit`. Avoid broad autofixing scripts that could rewrite unrelated files. Browser verification must use the actual static export through a suitable local preview, since `next start` is unsuitable for this site's export configuration.

## Edge Cases and Constraints

- Delete English and Italian variants together, including both “is pending” and “remains pending” forms and their translations.
- Existing discussion of the author's comparison, absent independent endorsements and unverified compatibility is separate technical context and remains intact.
- Do not replace the deleted sentences with wording implying that external validation has happened.
- Preserve unrelated local edits and historical approvals. Keep this new specification and its future separate plan uncommitted until both approvals authorize safe `main` updating and implementation-branch creation. Use the existing checkout; do not create a worktree.
- Generate ignored search, Contentlayer and export files normally; do not hand-edit or force-add them. Existing unrelated defects remain outside this increment and must be distinguished from regressions introduced here.

**Execution endpoint:** After separate specification and plan approvals, deliver and locally commit the six-sentence removal with generated-output checks, responsive verification, required repository checks and final review; report the result and any limitations, then stop before publication or further work.
