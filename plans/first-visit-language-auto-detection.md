# Plan: First-Visit Language Auto-Detection

| Field       | Value                                        |
| ----------- | -------------------------------------------- |
| **Title**   | First-Visit Language Auto-Detection          |
| **Spec**    | specs/first-visit-language-auto-detection.md |
| **Type**    | feature                                      |
| **Branch**  | feat/first-visit-language-auto-detection     |
| **Created** | 2026-08-06 00:00:00                          |
| **Status**  | IMPLEMENTED                                  |

## Context

First-time visitors are always defaulted to English regardless of their
browser/OS language, and the provider eagerly persists `lang='en'` on the
first visit, freezing the language before the user makes a real choice. We
will detect the language from `navigator.language` on visits that have no
stored preference (never persisting the detected value so it follows OS
language changes), while persisting only manual toggles and always honoring
a stored preference. English stays the SSR-rendered default and is
reconciled on the client to keep the static export hydration-safe.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/first-visit-language-auto-detection`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/first-visit-language-auto-detection
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

| Action | Command      |
| ------ | ------------ |
| Lint   | `yarn lint`  |
| Build  | `yarn build` |

> Note: this project has **no automated test framework** (no jest/vitest,
> no test files). Verification relies on `yarn lint`, `yarn build`, and the
> manual checklist in the Verification section. Introducing a test harness
> is out of scope for this spec.

## Tasks

### Task 1: Add browser-language detection helper `[S]`

**Goal**: Add a pure, client-safe function that resolves the first-visit
language from `navigator.language`.

**Files**:

| File                           | Action | Description                                           |
| ------------------------------ | ------ | ----------------------------------------------------- |
| `contexts/LanguageContext.tsx` | modify | Add a `detectBrowserLang(): Lang` helper near the top |

**Reuse**:

| File                           | What to reuse                         |
| ------------------------------ | ------------------------------------- |
| `contexts/LanguageContext.tsx` | Existing `Lang` type (`'en' \| 'it'`) |

**Steps**:

1. Add a module-level helper `detectBrowserLang(): Lang`.
2. Guard for non-browser / missing API: if `typeof navigator === 'undefined'`
   or `navigator.language` is falsy, return `'en'`.
3. Read `navigator.language`, lowercase it, and return `'it'` if it
   `startsWith('it')` (covers `it`, `it-IT`, `it-CH`, `it-SM`,
   case-insensitively); otherwise return `'en'`.
4. Keep the function free of side effects (no `localStorage` writes) so it
   can run on every visit that lacks a stored preference.

**Tests**:

- No automated tests (no framework). Manually reasoned via Verification
  step 1 (Italian browser) and step 2 (non-Italian browser).

**Acceptance criteria covered**: Italian detection from `it*` locales;
non-Italian → English; multi-region Italian locales; `navigator.language`
undefined/empty → English; `navigator` unavailable during SSR (helper only
invoked client-side in Task 2).

**Commit**: `feat(i18n): add navigator.language detection helper`

---

### Task 2: Reconcile language on mount without persisting detection `[S]`

**Goal**: Replace the eager first-visit `setPref('lang','en')` write with
"honor stored preference, else detect (no persistence)", and ensure manual
toggles remain the only path that persists.

**Files**:

| File                           | Action | Description                                                              |
| ------------------------------ | ------ | ------------------------------------------------------------------------ |
| `contexts/LanguageContext.tsx` | modify | Rewrite the mount `useEffect`; remove eager write; validate stored value |

**Reuse**:

| File                                    | What to reuse                                                               |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `lib/preferences/PreferencesService.ts` | `getPref('lang')` / `setPref('lang', ...)`, SSR-safe, unchanged             |
| `contexts/LanguageContext.tsx`          | `detectBrowserLang()` from Task 1; existing `switchLang` (already persists) |

**Steps**:

1. Keep the initial `useState<Lang>('en')` so SSR/static output renders
   English (hydration-safe).
2. In the mount `useEffect`, read `PreferencesService.getPref('lang')`.
3. If the stored value is a valid `Lang` (`'en'` or `'it'`), set state to
   it and **return early** — do not detect or override.
4. If there is no stored value (or it is an invalid/legacy non-`Lang`
   string), call `detectBrowserLang()` and set state to the result.
   Do **not** call `setPref` — the detected value is never persisted.
5. Remove the existing `else { setLang('en'); PreferencesService.setPref('lang', 'en') }`
   branch entirely (the eager first-visit write).
6. Leave `switchLang` as-is: it already calls `setPref('lang', newLang)`,
   so every manual toggle persists and thereafter wins (checked first in
   step 3 on future visits).
7. Update the provider's doc comment (the "Initialization Logic" and
   "Does NOT use browser language detection" notes) to reflect the new
   behavior.

**Tests**:

- No automated tests (no framework). Covered by Verification steps 1–5.

**Acceptance criteria covered**: no `lang` written after auto-detected
visit; OS/browser language change reflected next visit; stored preference
always honored and detection skipped; manual toggle always persists;
toggling back to detected value still pins; SSR renders English with no
hydration mismatch; eager first-visit write removed; logic lives in
`LanguageContext.tsx` with `PreferencesService` API unchanged; invalid/legacy
stored value ignored and re-detected.

**Commit**: `feat(i18n): auto-detect language on first visit without persisting`

---

**Task ordering**: Task 2 depends on Task 1 (`detectBrowserLang`). Both
edit the same file; implement in order.

## Edge Cases & Error Handling

- `navigator.language` undefined/empty → helper returns `'en'` (Task 1).
- `navigator` unavailable during SSR → helper only invoked inside the mount
  `useEffect`, so server render uses the `'en'` default (Task 2).
- `localStorage` unavailable / read fails → `PreferencesService.getPref`
  returns `null` (SSR-guarded); treated as "no stored preference" → detect
  (Task 2). Write failures are already no-ops in the service and do not
  crash the toggle.
- Stored value is not a valid `Lang` (corrupt/legacy) → ignored, re-detect
  (Task 2, step 3–4).
- Multi-region Italian locales (`it-IT`, `it-CH`, `it-SM`) → covered by
  case-insensitive `startsWith('it')` (Task 1).
- Legacy users with `lang='en'` already stored → honored as a manual choice
  and pinned to English (documented in spec Notes; no migration in scope).

## Verification

1. **Italian first visit**: clear `localStorage` key `lightstimulus.lang`,
   set browser/OS language to Italian (e.g. `it-IT`), reload; site shows
   Italian after mount and `lightstimulus.lang` remains **absent**.
2. **Non-Italian first visit**: clear the key, set browser language to e.g.
   `en-US`/`fr-FR`, reload; site shows English and the key remains absent.
3. **Follows OS change**: with no stored key, switch browser language
   between IT and non-IT across reloads; displayed language follows each
   time.
4. **Manual toggle persists & wins**: click `LanguageToggle`;
   `lightstimulus.lang` is written; reload with a differing
   `navigator.language`; the stored value is honored (detection skipped).
5. **Toggle back still pins**: as a detected-IT user, toggle to EN then back
   to IT; `lightstimulus.lang='it'` is stored and pinned on reload.
6. Run `yarn lint` and `yarn build`; confirm no lint errors and no React
   hydration mismatch warnings (English SSR default).
