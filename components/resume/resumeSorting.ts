/**
 * Resume sorting helpers
 *
 * Pure, framework-free functions that order resume entries for display. Kept
 * free of React/DOM so they are trivially testable, following the same
 * convention as `components/about/certificationGrouping.ts`.
 *
 * ## Why determinism is a hard requirement
 * The site is statically exported, so the comparator's output *is* the shipped
 * HTML. A comparator that leaves equal-ranked entries in engine-dependent order
 * would produce diff noise on every rebuild, so every tie is broken explicitly
 * down to a total order.
 *
 * @module resumeSorting
 */

import { parseYearMonth, localize, type ExperienceEntry, type EducationEntry } from './resumeDates'

/**
 * Sort key for an absent or unparseable date.
 *
 * `-Infinity` makes undated entries compare as older than everything else, so
 * under a descending sort they land last without disturbing the relative order
 * of the valid entries around them.
 */
const UNDATED = -Infinity

/** Locale-aware, case-insensitive string comparison used for tiebreaks. */
function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

/**
 * Convert a `YYYY-MM` value into a single comparable number (`YYYYMM`).
 *
 * @returns The numeric key, or `UNDATED` when the value is missing/malformed.
 */
function dateKey(value?: string): number {
  const parsed = parseYearMonth(value)
  if (!parsed) return UNDATED
  return parsed.year * 100 + parsed.month
}

/**
 * Sort work history for display: current roles first, then reverse
 * chronological by start date.
 *
 * Ordering rules, in priority order:
 *
 * 1. Ongoing roles (no `endDate`) come first — they are the most relevant.
 * 2. Then by `startDate` descending.
 * 3. Entries with a missing or unparseable `startDate` sort last.
 * 4. Ties break on `company`, then the English `role`, giving a total order.
 *
 * @param items - The entries to sort. Not mutated.
 * @returns A new, deterministically ordered array.
 */
export function sortExperience(items: ExperienceEntry[]): ExperienceEntry[] {
  if (!items?.length) return []

  return [...items].sort((a, b) => {
    // 1. Ongoing roles float to the top regardless of start date.
    const aOngoing = !a.endDate
    const bOngoing = !b.endDate
    if (aOngoing !== bOngoing) return aOngoing ? -1 : 1

    // 2 & 3. Most recent start first; undated entries sink to the bottom.
    const aStart = dateKey(a.startDate)
    const bStart = dateKey(b.startDate)
    if (aStart !== bStart) return bStart - aStart

    // 4. Deterministic tiebreaks so static output is build-stable.
    const byCompany = compareText(a.company ?? '', b.company ?? '')
    if (byCompany !== 0) return byCompany

    return compareText(localize(a.role, 'en'), localize(b.role, 'en'))
  })
}

/**
 * Sort education for display: reverse chronological by completion date.
 *
 * Uses `endDate` when available and falls back to `startDate`, since both are
 * optional for education entries. Ties break on `institution`, then the English
 * `degree`.
 *
 * @param items - The entries to sort. Not mutated.
 * @returns A new, deterministically ordered array.
 */
export function sortEducation(items: EducationEntry[]): EducationEntry[] {
  if (!items?.length) return []

  return [...items].sort((a, b) => {
    // Prefer the completion date; fall back to the start date.
    const aKey = Math.max(dateKey(a.endDate), dateKey(a.startDate))
    const bKey = Math.max(dateKey(b.endDate), dateKey(b.startDate))
    if (aKey !== bKey) return bKey - aKey

    const byInstitution = compareText(a.institution ?? '', b.institution ?? '')
    if (byInstitution !== 0) return byInstitution

    return compareText(localize(a.degree, 'en'), localize(b.degree, 'en'))
  })
}
