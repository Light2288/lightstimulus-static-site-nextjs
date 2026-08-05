# Filter Search Results by Active Language

| Field       | Value                                          |
| ----------- | ---------------------------------------------- |
| **Title**   | Filter Search Results by Active Language       |
| **Type**    | feature                                        |
| **Scope**   | kbar search provider + search index generation |
| **Created** | 2026-08-05 02:30:00                            |
| **Status**  | IMPLEMENTED                                    |

## Problem Statement

The command palette now indexes all content in both languages, emitting
one English and one Italian entry per document (see
`specs/expand-search-index-all-content.md`). Because both entries are
always loaded, a search shows results in the language the query was _not_
written in, and duplicate-looking results appear for the same page. Users
expect search to respect the language they have actively selected: an
English speaker searching English terms should not see Italian entries,
and vice versa.

## Current Behavior

- `public/search.json` contains two entries per localized document — one
  built from `en` fields, one from `it` fields — distinguished by an `id`
  suffix (`…#en` / `…#it`).
- `components/search/SearchProvider.tsx` maps **all** entries into kbar
  actions in `onSearchDocumentsLoad`, regardless of the active UI language.
- Result: with language set to English, typing an Italian phrase can still
  match the Italian entry; every page can surface as two near-identical
  results.

## Desired Outcome

Search results are limited to the currently selected UI language:

- With language = **en**, searching `i built` returns the blog entry
  "I built two robots…"; the Italian counterpart is **not** shown.
- With language = **it**, searching `ho costruito` returns only the
  Italian blog entry.
- With language = **en**, searching `ho costruito` returns **no results**
  (the Italian entry is not loaded into the palette).
- Toggling the language updates which results the palette can return,
  without a full page reload.

## Acceptance Criteria

- [ ] Each entry in `public/search.json` carries an explicit
      `lang` field (`'en' | 'it'`) rather than encoding language only in
      the `id`.
- [ ] `components/search/SearchProvider.tsx` reads the active language via
      the existing `useLanguage()` hook (`@/contexts/LanguageContext`).
- [ ] Only entries whose `lang` matches the active language are mapped into
      kbar actions.
- [ ] With language = en, an English-only query matches the English entry
      and never the Italian one; an Italian-only query returns no results.
- [ ] With language = it, the symmetric behavior holds.
- [ ] Switching language while browsing (without reloading the page)
      changes which language's results the palette returns.
- [ ] Each visible result still shows a localized title, a type/section
      label, a summary subtitle, and navigates to the correct URL.
- [ ] The build still generates `public/search.json` and the site builds
      and lints cleanly.

## Edge Cases & Error Handling

- **Missing localized field**: entries already fall back to the other
  language's text at generation time; a fallback entry still carries the
  `lang` of the slot it fills, so it appears only under that language.
- **Initial render / hydration**: the language context defaults to `en`
  on first paint and corrects after mount; the palette should reflect the
  resolved language once mounted (accept an initial `en` view before
  hydration, consistent with the rest of the site).
- **Unknown / future language value**: if `lang` is neither `en` nor `it`,
  the palette shows no entries rather than crashing.
- **Empty query**: unchanged kbar default behavior; only the candidate
  action set is language-scoped.

## Dependencies & Constraints

- Depends on the search index produced by
  `specs/expand-search-index-all-content.md` (already implemented).
- Language state is a client-only React Context
  (`@/contexts/LanguageContext`, `useLanguage()` → `{ lang, t, switchLang }`),
  persisted to `localStorage` (`lightstimulus.lang`). There are no
  language-specific URLs.
- `SearchProvider` is already a client component and sits inside the
  `LanguageProvider` tree, so it can consume `useLanguage()`.
- kbar builds its action list when the index loads; the provider must be
  keyed to the active language (e.g. `key={lang}`) so the action set
  rebuilds when the language toggles. The index is small (~22 entries), so
  a remount on toggle is acceptable.

## Out of Scope

- Adding language-specific URLs or i18n routing.
- Browser/Accept-Language auto-detection.
- Cross-language "did you mean" or fallback results when a query has no
  match in the active language (a mismatched query simply returns nothing).
- Full-text/body search or ranking changes.
- Reworking the language selection mechanism itself.

## Notes

- Active language read path (client): `useLanguage()` from
  `@/contexts/LanguageContext` returns `lang: 'en' | 'it'`.
- Chosen implementation approach: filter in `onSearchDocumentsLoad` by the
  active `lang` and remount the `KBarSearchProvider` on language change via
  a `key={lang}` prop (pragmatic given the tiny index).
- The `lang` field on each index entry is added in
  `lib/generateSearchIndex.ts` where entries are emitted per locale.
