import { describe, it, expect } from 'vitest'
import {
  parseYearMonth,
  formatMonthYear,
  formatDateRange,
  localize,
  type ExperienceEntry,
  type EducationEntry,
} from './resumeDates'

/**
 * Unit tests for the pure resume date helpers.
 *
 * These functions sit between raw frontmatter (which Contentlayer does not
 * deeply validate) and the rendering components, so the contract they must
 * uphold is "never throw, never surface NaN/Invalid Date". The malformed-input
 * cases below are therefore the important ones — the happy paths are almost
 * incidental.
 */

describe('parseYearMonth', () => {
  it('parses a well-formed YYYY-MM value', () => {
    expect(parseYearMonth('2024-03')).toEqual({ year: 2024, month: 3 })
  })

  it('parses January and December boundaries', () => {
    expect(parseYearMonth('2020-01')).toEqual({ year: 2020, month: 1 })
    expect(parseYearMonth('2020-12')).toEqual({ year: 2020, month: 12 })
  })

  it('returns null for undefined', () => {
    expect(parseYearMonth(undefined)).toBeNull()
  })

  it('returns null for an empty or whitespace-only string', () => {
    expect(parseYearMonth('')).toBeNull()
    expect(parseYearMonth('   ')).toBeNull()
  })

  it('returns null for unparseable text', () => {
    expect(parseYearMonth('not-a-date')).toBeNull()
  })

  it('returns null for a month outside 1-12', () => {
    expect(parseYearMonth('2024-13')).toBeNull()
    expect(parseYearMonth('2024-00')).toBeNull()
  })

  it('returns null for a malformed shape', () => {
    expect(parseYearMonth('2024')).toBeNull()
    expect(parseYearMonth('2024-3-15')).toBeNull()
  })

  it('never throws on hostile input', () => {
    expect(() => parseYearMonth('----')).not.toThrow()
  })
})

describe('formatMonthYear', () => {
  it('formats a valid value in English', () => {
    const result = formatMonthYear('2024-03', 'en')

    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/2024/)
  })

  it('formats a valid value in Italian', () => {
    const result = formatMonthYear('2024-03', 'it')

    expect(result).toMatch(/2024/)
    // Italian abbreviates March as "mar" (lowercase); assert it is not the
    // English rendering so the locale is demonstrably applied.
    expect(result.toLowerCase()).toContain('mar')
  })

  it('produces different output per locale for the same input', () => {
    // January is a clear divergence: "Jan" (en) vs "gen" (it).
    expect(formatMonthYear('2024-01', 'en')).not.toBe(formatMonthYear('2024-01', 'it'))
  })

  it('returns an empty string for undefined', () => {
    expect(formatMonthYear(undefined, 'en')).toBe('')
  })

  it('returns the raw string when the value cannot be parsed', () => {
    expect(formatMonthYear('not-a-date', 'en')).toBe('not-a-date')
  })

  it('never renders Invalid Date or NaN', () => {
    const result = formatMonthYear('2024-99', 'en')

    expect(result).not.toMatch(/Invalid Date/i)
    expect(result).not.toMatch(/NaN/)
  })
})

describe('formatDateRange', () => {
  it('joins start and end with an en dash', () => {
    const result = formatDateRange('2020-01', '2022-06', 'en', 'Present')

    expect(result).toContain('–')
    expect(result).toMatch(/2020/)
    expect(result).toMatch(/2022/)
  })

  it('substitutes the present label when end is missing', () => {
    const result = formatDateRange('2020-01', undefined, 'en', 'Present')

    expect(result).toMatch(/2020/)
    expect(result).toContain('Present')
  })

  it('uses the caller-supplied localised present label', () => {
    expect(formatDateRange('2020-01', undefined, 'it', 'Oggi')).toContain('Oggi')
  })

  it('returns an empty string when both dates are missing', () => {
    expect(formatDateRange(undefined, undefined, 'en', 'Present')).toBe('')
  })

  it('renders only the end date when start is missing', () => {
    const result = formatDateRange(undefined, '2013-12', 'en', 'Present')

    expect(result).toMatch(/2013/)
    expect(result).not.toContain('–')
  })

  it('passes malformed dates through as raw text', () => {
    expect(formatDateRange('garbage', '2022-06', 'en', 'Present')).toContain('garbage')
  })

  it('never renders Invalid Date or NaN', () => {
    const result = formatDateRange('2024-99', 'nope', 'en', 'Present')

    expect(result).not.toMatch(/Invalid Date/i)
    expect(result).not.toMatch(/NaN/)
  })
})

describe('localize', () => {
  it('returns the value for the requested language', () => {
    expect(localize({ en: 'Hello', it: 'Ciao' }, 'en')).toBe('Hello')
    expect(localize({ en: 'Hello', it: 'Ciao' }, 'it')).toBe('Ciao')
  })

  it('falls back to English when the Italian value is missing', () => {
    expect(localize({ en: 'Hello' }, 'it')).toBe('Hello')
  })

  it('falls back to Italian when the English value is missing', () => {
    expect(localize({ it: 'Ciao' }, 'en')).toBe('Ciao')
  })

  it('returns an empty string for undefined or an empty object', () => {
    expect(localize(undefined, 'en')).toBe('')
    expect(localize({}, 'en')).toBe('')
  })

  it('never returns the literal undefined', () => {
    expect(localize({ en: undefined, it: undefined }, 'en')).toBe('')
  })
})

describe('exported types', () => {
  it('accepts an experience entry with only its required fields', () => {
    const entry: ExperienceEntry = {
      id: 'x',
      role: { en: 'Architect', it: 'Architetto' },
      company: 'IBM',
      startDate: '2020-01',
    }

    expect(entry.company).toBe('IBM')
  })

  it('accepts an education entry with only its required fields', () => {
    const entry: EducationEntry = {
      id: 'y',
      degree: { en: "Master's", it: 'Laurea Magistrale' },
      institution: 'Politecnico di Milano',
    }

    expect(entry.institution).toBe('Politecnico di Milano')
  })
})
