# Integrated final review record

**Created:** 2026-10-30  
**Updated:** 2026-10-30  
**Mode:** Integrated; one sequential final review seat  
**Reviewed state:** `f679295d654a2fea8af67b5d642e45f6c59791e0`  
**Base:** `9264166d5093cb58a6ba557dda7d6bbae59433bb`  
**GATE_RUN_ID:** `67d97915-5712-4bc8-b219-b16145aefbd5`  
**PACKAGE_SHA256:** `d62ba8817655684a174277a6786c6163412150401afacb8bb3fcb583cc5ee13a`

The package contained the governing spec/plan, complete changed-file list and diff (plus the lockfile text diff), current supporting files, SHA-256 identities for all reviewed files, observed command/browser evidence, limitations and rulings. The unchanged package was provided first to `review-spec` on the configured light role, then to `review-quality` on the configured full role with the complete specification PASS report. Both independently verified and echoed the same gate/state/hash. No generic or duplicate whole-branch review was dispatched.

## Specification result

**SPEC REVIEW: PASS**

> The package identity checks pass. The complete diff and evidence support the acceptance criteria and all five plan review-focus items. The related search-provider and static-export changes are tied to the approved language-persistence and no-JavaScript requirements. No missing or extra scope found. AC-18’s pending bookkeeping is consistent with the active integrated review gate.

## Quality result and disposition

**QUALITY REVIEW: FINDINGS**

The reviewer verified all 75 reviewed file hashes and a clean working tree, examined all five plan focus items, independently passed 40 focused tests and 8 comparator self-tests, and checked npm installation dry-run. Full-suite/build/browser results were assessed as retained evidence rather than claimed as independently rerun.

1. **Important — Yarn installs split KBar context.** `SearchProvider.tsx:4` imports root 0.48; Pliny's modal imports its pinned 0.45. npm honors `overrides`, but the documented Yarn 1 route and `.github/workflows/pages.yml` ignore it. A fresh dependency-only Yarn fixture reproduced different module identities and `getState is not a function` when rendering the actual Pliny modal.

   **Fixed in the single permitted fix pass:** add Yarn `resolutions` for `**/kbar` = `0.1.0-beta.48`, matching the existing npm override. The original failing tree was independently checked with an assertion that exited 1 ([RED evidence](yarn-compat-red.log)). A fresh fixture generated from the corrected root dependency/override/resolution values resolved both imports to the same 0.48 module and rendered the actual modal ([GREEN evidence](yarn-compat-green.log)). The fixture copied the exact Pliny modal bytes, SHA-256 `7b73357c5a6b131541539c7ff3754de19c07ac30cd918cb55564f78e2db1023e`, and retained its actual 0.45 dependency constraint. Its [manifest](yarn-fixture-package.json) records the resolution. Yarn install used `--ignore-scripts --ignore-engines --non-interactive --registry https://registry.npmjs.org`; no site sources or deployment dependencies were replaced by the fixture. This establishes the dependency/context fix, not a new full Yarn deployment certification. npm dry-run still exits 0. After removing the fixture's vendored tests from repository test discovery, the full application suite passed **86 suites / 1,406 tests**. The existing real-search-provider viewer regression test also covers the context/rendering path.

2. **Minor — Repeating export completion on its own output throws.** `resolve-usdz-export.mjs:11` retains consumed `$RC` calls after moving their segments, so processing that same completed HTML again reports `Unexpected USDZ export boundary/segment: B:0, S:0`.

   **Deferred under the enclosing review policy.** The normal `npm run build` command generates a fresh export before postbuild and passes for root and subpath. Repeating `node scripts/postbuild.mjs` alone on the already-completed output remains unsupported. A later fix can remove consumed reveal calls and test the helper's actual first-pass output; this increment does not silently claim idempotence for that case.

The reviewer found the activation boundary, locale/camera persistence (with package-manager fix above), HTTP-200 HTML fallback, timeout/retry/navigation guards, image hashes/crops and transparency supported by the supplied code and evidence. Live hosting, physical-device Quick Look, Safari/iOS and hardware-GPU fidelity remain unproven as explicitly allowed/reported in the verification limitations.

No second whole-branch review was requested. The Important finding was verified RED→GREEN plus a green full suite, completing the enclosing one-pass remediation policy. The Minor is reported to the user and preserved here.
