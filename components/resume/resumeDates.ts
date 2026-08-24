/**
 * Resume date helpers
 *
 * Pure, framework-free functions for parsing and formatting the `YYYY-MM`
 * partial dates used by the resume `experience[]` and `education[]` frontmatter
 * arrays. Kept free of React/DOM and of i18n imports so they are trivially
 * testable and reusable.
 *
 * ## Defensive by design
 * Contentlayer's `list of json` fields are not deeply validated, so these
 * helpers must treat every input as untrusted. The contract is that they never
 * throw and never surface `NaN` or `Invalid Date` to the UI: unparseable values
 * are passed through as raw text so a typo in frontmatter degrades to slightly
 * odd copy rather than a broken page.
 *
 * @module resumeDates
 */

/** Supported language codes, mirroring `contexts/LanguageContext.tsx`. */
export type Lang = 'en' | 'it'

/**
 * A bilingual string pair. Both sides are optional because frontmatter is not
 * deeply validated — `localize` handles the fallback.
 */
export type Localized = { en?: string; it?: string }

/** A single work-history entry from `experience[]`. */
export type ExperienceEntry = {
  id: string
  role: Localized
  company: string
  location?: Localized
  /** `YYYY-MM`. */
  startDate?: string
  /** `YYYY-MM`. Omitted means the role is current. */
  endDate?: string
  highlights?: Localized[]
  stack?: string[]
  url?: string
}

/** A single education entry from `education[]`. */
export type EducationEntry = {
  id: string
  degree: Localized
  institution: string
  location?: Localized
  /** `YYYY-MM`. */
  startDate?: string
  /** `YYYY-MM`. */
  endDate?: string
  notes?: Localized
}

/** En dash with hair spaces, used to join the two ends of a date range. */
const RANGE_SEPARATOR = ' – '

/** Strict `YYYY-MM` shape; anything else is treated as unparseable. */
const YEAR_MONTH = /^(\d{4})-(\d{2})$/

/** `Intl` locale tags for the two supported languages. */
const LOCALE_TAGS: Record<Lang, string> = {
  en: 'en-US',
  it: 'it-IT',
}

/**
 * Parse a `YYYY-MM` string into its numeric parts.
 *
 * @param value - The raw frontmatter value, possibly absent or malformed.
 * @returns The year and 1-based month, or `null` when the value is missing or
 *   cannot be parsed. Never throws.
 */
export function parseYearMonth(value?: string): { year: number; month: number } | null {
  if (typeof value !== 'string') return null

  const match = YEAR_MONTH.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])

  if (!Number.isFinite(year) || !Number.isFinite(month)) return null
  if (month < 1 || month > 12) return null

  return { year, month }
}

/**
 * Format a `YYYY-MM` value as a localised abbreviated month and year
 * (e.g. "Mar 2024" / "mar 2024").
 *
 * @param value - The raw frontmatter value.
 * @param lang - The active language.
 * @returns The formatted label, `''` when the value is absent, or the raw
 *   string when it cannot be parsed.
 */
export function formatMonthYear(value: string | undefined, lang: Lang): string {
  if (typeof value !== 'string' || value.trim() === '') return ''

  const parsed = parseYearMonth(value)
  // Unparseable input is surfaced verbatim rather than as "Invalid Date".
  if (!parsed) return value

  // Day 1 is arbitrary but safe: only month and year are ever rendered.
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, 1))

  return new Intl.DateTimeFormat(LOCALE_TAGS[lang], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/**
 * Format a start/end pair as a localised range.
 *
 * A missing `end` denotes a current role and is rendered with `presentLabel`.
 * The label is injected by the caller so this module stays free of i18n
 * imports — the same inversion `groupCertifications` uses for `undatedLabel`.
 *
 * @param start - Raw start value (`YYYY-MM`).
 * @param end - Raw end value (`YYYY-MM`); omit for an ongoing entry.
 * @param lang - The active language.
 * @param presentLabel - Already-translated "Present" label.
 * @returns The formatted range, or `''` when there is nothing to show.
 */
export function formatDateRange(
  start: string | undefined,
  end: string | undefined,
  lang: Lang,
  presentLabel: string
): string {
  const hasStart = typeof start === 'string' && start.trim() !== ''
  const hasEnd = typeof end === 'string' && end.trim() !== ''

  // Nothing to render: education entries may legitimately carry neither date,
  // and a bare separator would look like a rendering bug.
  if (!hasStart && !hasEnd) return ''

  // No start: show the end alone rather than a dangling separator.
  if (!hasStart) return formatMonthYear(end, lang)

  const startLabel = formatMonthYear(start, lang)
  const endLabel = hasEnd ? formatMonthYear(end, lang) : presentLabel

  return `${startLabel}${RANGE_SEPARATOR}${endLabel}`
}

/**
 * Resolve a bilingual field for the active language, falling back to the other
 * language so a missing translation never renders as `undefined`.
 *
 * Mirrors `localize` in `lib/generateSearchIndex.ts`.
 *
 * @param field - The bilingual pair, possibly absent.
 * @param lang - The active language.
 * @returns The best available string, or `''` when neither side is present.
 */
export function localize(field: Localized | undefined, lang: Lang): string {
  if (!field) return ''
  const other: Lang = lang === 'en' ? 'it' : 'en'
  return field[lang] ?? field[other] ?? ''
}
