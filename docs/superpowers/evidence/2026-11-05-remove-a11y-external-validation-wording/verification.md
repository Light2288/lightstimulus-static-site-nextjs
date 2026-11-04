# A11y Journey Evidence wording cleanup verification

**Created:** 2026-11-05
**Updated:** 2026-11-05
**Status:** Implementation verified; sequential final review pending.
**Spec:** `docs/superpowers/specs/2026-11-05-remove-a11y-external-validation-wording.md`
**Plan:** `docs/superpowers/plans/2026-11-05-remove-a11y-external-validation-wording.md`
**Branch:** `chore/remove-a11y-external-validation-wording`
**Baseline:** `6157746` (merged project page)

## Authorization and change

The user confirmed scope with “confirmed,” approved the separate specification with “approved” after Stage 2, and approved the separate implementation plan with “approved” after Stage 3. Both artifacts were saved and committed in `6e51d1d` before the content edit. `git pull --ff-only` reported “Already up to date.” Native execution uses the plan's eligible lite tier without switching the parent model, in the existing checkout. No push, merge, workflow dispatch or deployment was performed.

The only product change removes six sentences from `data/projects/a11y-journey-evidence.mdx`: the summary, opening and closing pending-external-validation statements in each language. The two bold opening sentences are removed with their markup. The shortened summaries propagate through the existing pipeline; no replacement claim of completed validation is introduced.

The complete source equals its baseline with exactly the six approved sentence removals and their separating whitespace. Other frontmatter and copy, experimental v0.1.0 status, all seven headings per language, limitations and comparison remain unchanged. All 848 other tracked baseline files retain their identities, including project images, shared application code, dependencies and historical project documents/evidence. Cover source, proportions, filenames and all ten derivatives are unchanged.

## Commands and observed results

| Check                                                                                                                                                                                                                                  | Exit        | Decisive result                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline `npm run test`                                                                                                                                                                                                                | 0           | 86 suites, 1,406 tests passed                                                                                                                                                                      |
| Direct source check before editing                                                                                                                                                                                                     | 1, expected | `Pending-validation sentences remain in source`; four sentence variants have counts `[2, 1, 2, 1]`, six total                                                                                      |
| Same direct source check after editing                                                                                                                                                                                                 | 0           | Exact six-sentence deletion; approved summaries, headings, frontmatter and 848 preservation identities verified                                                                                    |
| `npm run test -- components/projects components/home/ProjectsPreview.test.tsx components/search/SearchProvider.test.tsx components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx layouts/ProjectLayout.test.tsx app/seo.test.ts` | 0           | 14 suites, 281 tests passed                                                                                                                                                                        |
| Final `npm run test`                                                                                                                                                                                                                   | 0           | 86 suites, 1,406 tests passed                                                                                                                                                                      |
| `npm run build`                                                                                                                                                                                                                        | 0           | Configured lint/type validation, 40 static pages and postbuild succeeded                                                                                                                           |
| Actual production-output inspection                                                                                                                                                                                                    | 0           | Updated descriptions and two localized search entries; removed variants absent; 848 baseline identities unchanged; all eleven exported cover files byte-identical to their preserved source assets |
| Export browser checks                                                                                                                                                                                                                  | 0           | Twelve views and four language/navigation flows passed; zero page errors or failed image responses                                                                                                 |

The exact Step 7 command, `npx prettier --check data/projects/a11y-journey-evidence.mdx docs/superpowers/specs/2026-11-05-remove-a11y-external-validation-wording.md docs/superpowers/plans/2026-11-05-remove-a11y-external-validation-wording.md docs/superpowers/evidence/2026-11-05-remove-a11y-external-validation-wording/verification.md`, exited 0 and reported “All matched files use Prettier code style!” `git diff --check` also exited 0. Both checks ran before implementation commit `aea701b`. Its existing pre-commit hook completed lint-staged and Prettier for all six applicable staged text files successfully; no JavaScript/TypeScript files required ESLint. Artifact commit `6e51d1d` also passed its hooks. These formatting, whitespace and hook results were observed during execution, rather than inferred from the existence of the commits.

## Source and generated-output evidence

[Source inspection](source-inspection.json) records the exact-deletion comparison, correct shortened summaries, seven headings in each language and preservation count. Temporary checks and full command logs reside only in this plan's ignored execution workspace during execution.

[Production inspection](production-inspection.json) checks the real Contentlayer project document, `out/index.html`, `out/projects.html`, `out/projects/a11y-journey-evidence.html` and the project's two `out/search.json` entries. The page description, Open Graph description and `CreativeWork.description` match the shortened English summary. Both localized summaries match the approved specification; all four removed sentence variants are absent from the project's generated data and relevant export output. The project route and cover references are preserved.

The listing uses Suspense and client rendering: its static HTML carries project data before hydration, rather than listing anchors. An initial temporary inspection assertion incorrectly required an anchor in that HTML. Source/HTML inspection established the cause; only the ignored helper was corrected to check serialized route data. The real hydrated project and back links were then exercised in all four browser flows. No application correction or scope change was made.

Historical specifications and earlier verification records intentionally retain their original wording. Those files are not live article copy and remain unchanged.

## Responsive verification

[Browser observations](browser-qa.json) cover `/`, `/projects` and `/projects/a11y-journey-evidence`, at 1440 × 900 and 390 × 844, in English and Italian, using the existing light theme: twelve views. Chrome inspected the fresh static export from this plan's temporary preview at `http://127.0.0.1:3002`; it did not use `next start` or an older export. The isolated Playwright 1.64.1 runtime did not change repository dependencies.

Every view verified the corresponding shortened project summary, absence of pending-validation sentences from visible project copy, loaded project cover and no horizontal overflow. Detail views verified the seven correct language-specific headings and no empty emphasis. Four flows verified language switching, the back link and opening the project from the listing. There were no page errors or failed image responses. Desktop detail and mobile listing screenshots were also visually inspected.

Representative screenshots: [desktop detail](detail-1440-en.png), [mobile detail](detail-390-en.png), [desktop listing](listing-1440-en.png), [mobile listing](listing-390-en.png).

## Existing limitations

The shared Project JSON-LD resolver still emits `CreativeWork.url` as `https://lightstimulus.dev/projects/undefined`. It is unchanged from the merged baseline and is explicitly outside this approved cleanup; the description update passes. This increment neither repairs that defect nor claims the earlier project increment's metadata criterion has passed.

The successful build retains warnings about obsolete Next configuration, static-export headers, deprecated `punycode`, undeclared blog `topic_key` fields and optional `@emotion/is-prop-valid` resolution. No shared-source or dependency remediation was performed. These site checks do not establish package accessibility conformance, compatibility or external validation.

## Acceptance evidence

| Criterion | Evidence                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| AC-01     | Source inspection: six exact removals, including opening bold wrappers                                       |
| AC-02     | Exact summaries and real generated search/body/description metadata inspection                               |
| AC-03     | Complete-source comparison and unchanged seven headings/remaining copy; browser checks                       |
| AC-04     | 848 preservation identities, eleven unchanged exported cover assets, route and navigation checks             |
| AC-05     | Focused/full tests, build, exact Step 7 formatting, Git whitespace checks and applicable commit hooks passed |
| AC-06     | Twelve export-browser views, four language/navigation flows and screenshots                                  |
| AC-07     | Separate approval record, artifact-first local commit; sequential final review pending                       |

**Endpoint:** Product edit and required content/build/browser checks are verified. Complete the local implementation commit and sequential final review before reporting delivery complete; publication remains user-controlled.
