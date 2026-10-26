# Specification — Update USDZ Validation Kit for v0.2

**Slug:** `update-usdz-validator-v0-2`  
**Type:** chore  
**Status:** APPROVED  
**Created:** 2026-10-26  
**Updated:** 2026-10-26  
**Stage:** 4 — Implementation authorized after separate plan approval  
**Provenance:** User request to reflect version 0.2 and consider the project complete for now; scope confirmed with “continue.” Evidence includes the source repository at `/Users/davide/Personal/Projects/usdz-validator`, commit `dad53f0`, its Swift implementation, dependency manifest, inspection boundaries, report contracts, and recorded verification. GitHub independently confirms published, non-prerelease v0.2.0 on 2026-10-25. This specification was presented in chat in Plan mode and approved when the user submitted the exact specification with “PLEASE IMPLEMENT THIS PLAN” on 2026-10-26. Under the mandatory approval workflow, that approval authorizes implementation planning only; no separate implementation plan had been presented or approved at that specification-approval gate.

## Problem and desired outcome

The existing portfolio page describes v0.1 as an initial demo, marks the project as in progress, states that the library has no third-party dependencies, and excludes native binary-USDC reference inspection. These descriptions no longer represent v0.2.0.

Update the existing bilingual project document to describe the completed current scope accurately for developers, collaborators, and prospective employers. “Completed” describes the delivered project scope; it does not promise exhaustive USD validation or preclude future extensions.

The selected approach is a content-only refresh using the existing MDX pipeline. A metadata-only edit would leave inaccurate technical claims; application changes are unnecessary.

## Content requirements

Update the existing project document at `data/projects/usdz-validator.mdx`.

### Metadata and summaries

- Set `status: completed`, displayed through the existing **Completed / Completato** labels.
- Append `LZ4` to the existing stack.
- Preserve the title, `product` type, original date `2026-10-22`, five localized tags, repository/documentation links, cover, and responsive assets.
- Preserve `/projects/usdz-validator`. Describe the v0.2.0 release date separately in the body.

**English summary**

> A Swift library and macOS command-line tool for checking USDZ packaging, supported package-local USDA and USDC references, and delivery budgets, with explicit validation coverage and text, JSON, and SARIF reports.

**Italian summary**

> Una libreria Swift e uno strumento da riga di comando per macOS per verificare la struttura dei pacchetti USDZ, i riferimenti interni USDA e USDC supportati e i limiti di dimensione degli asset, con copertura delle verifiche esplicita e report testuali, JSON e SARIF.

### Bilingual body

Retain the existing six corresponding sections and `<Lang>` wrappers:

1. **Overview / Panoramica:** Present v0.2.0 as the current delivered release, published October 25, 2026. Replace the initial-demo description and link to `https://github.com/Light2288/usdz-validator/releases/tag/v0.2.0`.
2. **Motivation / Motivazione:** Retain the rationale for repeatable packaging, reference, and delivery-budget checks, and the distinction between findings, coverage, and acceptance.
3. **System Architecture / Architettura del sistema:** Describe the reusable Swift library, thin CLI, native USDA/USDC inspection, shared package-local resolver, report encoders, and optional checker. Replace the dependency-free claim with the private, pinned **LZ4 1.10.0 C target** used for bounded crate-metadata decoding.
4. **Key Features / Funzionalità principali:** Retain archive integrity, safe paths, configurable budgets, profiles, and report formats. Add automatic authored-reference inspection for the supported subsets of exact USDC crate versions **0.8.0, 0.9.0, and 0.10.0**, including supported asset values, sublayers, references/payloads, dictionaries, and time samples. Explain safety envelope **3**: admitted numeric-array bodies remain opaque while bounded headers and actual traversal/resource accounting remain enforced. Mention that schema major 1 remains, with updated report-schema support for envelopes 1/2/3; older strict schemas may require updating.
5. **Verification / Verifica:** Attribute results to the repository’s recorded v0.2 evidence: **19/19 required gates passed**, **338 cases each** in debug/release/ASAN with zero failures and **11 documented opt-in skips**, plus independent fixtures, schema/golden checks, resource measurements, and private-corpus verification covering **59 authored-reference occurrences across five originals**. Do not imply these validator checks were rerun for the site update.
6. **Current Limits / Limiti attuali:** Replace blanket USDC exclusion with conditional support. Unsupported versions, representations, reference expressions/templates, and ambiguous layouts retain explicit coverage gaps. Preserve verified-versus-intended platform qualifications and the separate trusted-input boundary for the optional installed checker.

## Accuracy boundaries

Both languages must make clear that:

- Native inspection remains local, read-only, and package-local, without extraction, host-reference resolution, network access, native subprocesses, or stage composition.
- Bounded internal crate-metadata decoding is the decompression exception; ZIP members remain stored-only.
- Complete reference coverage concerns the declared supported policy. It does not establish geometry validity, full USD conformance, composed dependencies, renderer compatibility, or asset-security certification.
- A successful external checker cannot upgrade native coverage. Accepting incomplete coverage changes acceptance, not coverage.
- The optional `usdchecker` remains explicitly requested for trusted input, without an external filesystem/network sandbox.
- Recorded host verification does not establish macOS 15, other-host, or cross-host compatibility. A published release and completed portfolio status do not change those verification limits.
- The tool does not repair, convert, render, or preview assets. No adoption figures, roadmap commitments, or universal performance guarantees are introduced.

## Acceptance criteria and verification

- **AC-01:** The MDX parses with `completed` status, appended LZ4 stack entry, and all preserved metadata/artwork.
- **AC-02:** Both exact summaries and all six corresponding sections render through the existing language control.
- **AC-03:** USDC versions, conditional coverage, LZ4 dependency, and envelope-3 behavior match the inspected implementation.
- **AC-04:** Coverage, gate acceptance, conformance limits, and external-checker boundaries remain accurate in both languages.
- **AC-05:** Verification claims identify the current recorded evidence and its skips, host scope, and deferred checks; no fresh validator run is implied.
- **AC-06:** Current-release links and descriptions refer to v0.2.0; obsolete initial-demo, dependency-free, and blanket-USDC-exclusion claims are removed.
- **AC-07:** The listing, four-project homepage preview, bilingual search, and sitemap retain existing integration and ordering. Generated summaries reflect the updated content.
- **AC-08:** The production build and relevant existing project, language, homepage, and search tests pass. Browser checks at desktop and narrow mobile widths, in both languages and themes, confirm status, content, links, and retained artwork.

Use the existing generation workflow. Additional content-only unit tests are unnecessary unless verification exposes a concrete gap.

## Constraints and handoff

The validator repository remains read-only. Changes are limited to the project MDX, generated ignored site data, and this update’s workflow documents. No artwork regeneration, redesign, component/schema/dictionary/dependency changes, publishing, push, or merge is included. Existing October 22 specification and plan files remain historical records.

This approved specification is saved at `docs/superpowers/specs/2026-10-26-update-usdz-validator-v0-2.md`. Its separate implementation plan, `docs/superpowers/plans/2026-10-26-update-usdz-validator-v0-2.md`, was subsequently presented and explicitly approved when the user submitted that exact plan with “PLEASE IMPLEMENT THIS PLAN” on 2026-10-26. Both approvals authorize Stage 4 implementation. Keep both artifacts uncommitted until the implementation branch is created, following the existing-checkout Git workflow. A mode change grants no additional approval.
