# USDZ cover and demonstration verification

**Created:** 2026-10-30  
**Updated:** 2026-10-30  
**Slug:** `usdz-validator-cover-and-asset-demo`  
**Status:** Verification passed; final sequential review pending

Specification: [approved increment](../../specs/2026-10-30-usdz-validator-cover-and-asset-demo.md). Plan: [approved implementation](../../plans/2026-10-30-usdz-validator-cover-and-asset-demo.md).

## Source and fidelity evidence

The asset [provenance record](../../../../public/static/models/usdz-validator/layered-cube/README.md) contains canonical identities, exact conversion commands, pinned/resolved Python and browser versions, numerical comparison results, and appearance limitations. Direct conversion of the original USDZ succeeded; the USDA fallback was unnecessary. Independent inspection matched 14 named meshes and 35,694 oriented triangles, with maximum positional difference 0 m (tolerance 1×10⁻⁶ m) and material values within 1×10⁻⁶. Glass retains BLEND and alpha approximately 0.1. The GLB has no external resources. Front, rear and side browser views were inspected; the frame, pyramid, grid and both platforms are complete with visible panel translucency. USD IOR 1.45 is omitted by conversion; shading need not match USD renderers.

The canonical USDZ and retained JSON were copied unchanged. The 2026-10-29 validator report was not rerun. Numerical conversion checks and new browser inspections are external tooling, separate from native validator acceptance.

Baseline SHA-256 comparison confirmed 479 unrelated site-image files and 8 external input files unchanged. The cover pipeline processed one cover and skipped five unrelated project inputs. It separately processed the two demonstration images. The retained Firefly source and both demonstration sources are tracked, with the main files and ten PNG/WebP derivatives each. No obsolete cover variants remain.

## Commands and observed results

All commands ran in the existing checkout on `feat/usdz-validator-cover-and-asset-demo`. No worktree, push, merge or publication occurred.

| Command                                                                                                                                                                                                                                                                                                                                                         | Exit | Observed result                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `npm ci`                                                                                                                                                                                                                                                                                                                                                        | 0    | Reproducible install; `npm ls kbar` shows a single deduplicated 0.1.0-beta.48 shared with Pliny |
| `npm run test -- components/projects components/MDXComponents.test.ts components/Image.test.ts components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx locales/locales.test.ts data/projects/usdzValidatorAssets.test.ts scripts/compressImagesTarget.test.ts components/home/ProjectsPreview.test.tsx layouts/ProjectLayout.test.tsx`                   | 0    | Final focused selection: 17 suites, 303 tests passed                                            |
| `npm run test -- components/projects components/search components/MDXComponents.test.ts components/Image.test.ts components/mdx/Lang.test.tsx contexts/LanguageContext.test.tsx locales/locales.test.ts data/projects/usdzValidatorAssets.test.ts scripts/compressImagesTarget.test.ts components/home/ProjectsPreview.test.tsx layouts/ProjectLayout.test.tsx` | 0    | Expanded focus passed after search integration (316 tests); final run recorded below            |
| `npm run test`                                                                                                                                                                                                                                                                                                                                                  | 0    | 86 suites, 1,406 tests passed after all integration fixes                                       |
| `BASE_PATH=/portfolio npm run build`                                                                                                                                                                                                                                                                                                                            | 0    | 37 pages generated; actual Contentlayer compilation, production type checks and export passed   |
| `npm run build`                                                                                                                                                                                                                                                                                                                                                 | 0    | 37 pages generated; final `out/` is the root export                                             |
| Isolated Python `scripts/verify-usdz-demo.py --self-test`                                                                                                                                                                                                                                                                                                       | 0    | 8 corruption/comparator tests passed                                                            |
| ESLint on the changed viewer/search/export scripts and tests                                                                                                                                                                                                                                                                                                    | 0    | No findings                                                                                     |

Builds retain pre-existing Contentlayer `topic_key` warnings, browser-data age warnings and an optional `@emotion/is-prop-valid` resolution warning. The separate, broader `npx tsc --noEmit` exits 2 on the pre-existing parameterized-test typing at `components/about/AboutProfile.test.tsx:147`; it reports no errors in changed files. This did not prevent the repository-configured production build checks from passing.

## Behavior and regression evidence

The original RED tests failed before cover replacement, before the comparator/component existed, and before MDX registration. Production testing then reproduced two integration defects, each covered RED→GREEN before correction:

- The existing search provider's locale key remounted the entire page. A real-provider viewer test lost the element on language switching. The provider now keeps its page subtree mounted and replaces localized search actions through the existing Pliny modal. Search fetch/error/navigation tests and a real browser palette check cover the change. KBar 0.1.0-beta.48 explicitly supports React 19; it is pinned and deduplicated across direct/Pliny imports to retain one context.
- Model-viewer caches failed or stalled GLB requests by URL. Replacing its element alone could not retry. Subsequent explicit activation attempts use distinct query keys for the same static GLB bytes, including returning after navigation. Language changes do not alter the URL or activate a request. Unit tests reject reuse of an abandoned element, URL or callback.

The viewer's 30-second timeout covers both import and model loading. Native event listeners, attempt invalidation and timers are cleaned up on failure/navigation. The poster, downloads and native report details remain available on failures and without JavaScript.

## Browser and hosting evidence

QA uses isolated Playwright 1.64.1 and installed Chrome with software WebGL (`--enable-unsafe-swiftshader`). It serves actual exported files with clean URL resolution; it does not use `next start`. The `/portfolio` export was retained separately while building the final root export. QA dependencies/intermediates are outside public delivery files.

The final browser command `node .superpowers/sdd/2026-10-30-usdz-validator-cover-and-asset-demo/qa/production.cjs` exited 0. Its [machine-readable observations](production-qa.json) record:

- All 24 views: `/`, `/projects`, project detail × 1440×900 / 390×844 × English / Italian × light / dark. No horizontal overflow; seven correctly ordered sections per language. The added narrative is 222 English / 233 Italian words with captions/headings/code counted; original prose/frontmatter compared unchanged after whitespace normalization.
- No requests for any of the three engine/Three.js chunks or either model before activation, including scrolling, locale switches and ordinary route prefetching. Activation requested self-hosted chunks and GLB. One model request; loaded element/camera retained during language changes. Search showed Italian actions after switching.
- Mouse drag, keyboard arrows/zoom, immediate reset, translated camera announcements, reduced-motion interpolation, touch rotation and vertical page scrolling passed.
- Engine failure, blocked GLB, HTTP-200 HTML GLB, unavailable WebGL, actual 30-second stall/late completion, retry, navigation during loading, and locale change during loading passed. Recovery downloaded a fresh GLB cache key rather than reusing the failed entry.
- Root and `/portfolio` hydrated images/downloads/license/provenance URLs resolved with one prefix. GLB signature/MIME and canonical USDZ/JSON response bytes passed. No-JavaScript output exposes poster, report details and downloads. No page/hydration errors occurred.

Inspected contact sheets: [home](home-sheet.png), [project list](list-sheet.png), [detail cover](detail-sheet.png), [demonstration](demo-sheet.png). [Loaded model after camera controls and language switching](root-ready-keyboard.png). Both the cover subject and transparent demonstration images remain readable and uncropped in their intended frames. [Front](glb-front.png), [rear](glb-rear.png), [side](glb-side.png) GLB views supplement the numerical comparison. The [final baseline result](baseline-final.json) records unchanged counts without redistributing private input paths.

A real no-JavaScript check reproduced Next 15.5.12 exporting the complete project inside a hidden streamed segment. The existing postbuild now resolves completed stream boundaries in only `out/projects/usdz-validator.html`, preserving React boundary comments and flight data. Six tests cover completion, nesting, already-complete input and unsupported/missing segments. Actual no-JavaScript and hydration checks cover the resulting export; the script fails on unknown pending or hidden formats. No other page is rewritten by this step.

## Limits

- Device-level Apple Quick Look launch is **unverified**: no supporting physical Apple mobile device was available. The separate native `rel="ar"` image-first link and original USDZ target were verified; ordinary downloads remain independent.
- Live Netlify delivery is **unverified** because publication is outside authorization. Local exports were tested with GLB/USDZ MIME types matching the narrowly scoped Netlify declarations; the existing host redirect and security configuration remain intact. Deliberate HTTP-200 HTML model responses must trigger the fallback.
- Hardware GPU and Safari/iOS appearance were not established by Chrome's software WebGL checks. The documented conversion shading limitation remains.

## Implementation rulings

1. Exclude only the canonical `validation.json` from Prettier to retain exact report bytes. Cost if wrong: that one saved report will not receive formatter normalization; identity tests enforce its required bytes.
2. Replace the locale-keyed search shell and align KBar versions as described above, because the existing ancestor remount prevented AC-10. Cost if wrong: search behavior could regress; search tests, full suite and actual palette checks cover it.

3. Complete only this page’s resolved React stream boundaries at build time to satisfy no-JavaScript access. Cost if wrong: a Next/React stream-format change can stop the build; explicit rejection is preferable to publishing an invisible demonstration.

Final sequential specification/quality review is pending.
