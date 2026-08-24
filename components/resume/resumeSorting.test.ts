import { describe, it, expect } from 'vitest'
import { sortExperience, sortEducation } from './resumeSorting'
import type { ExperienceEntry, EducationEntry } from './resumeDates'

/**
 * Unit tests for the pure resume sorting helpers.
 *
 * Two properties matter most and are asserted explicitly rather than implied:
 *
 * 1. **Determinism** — the site is statically exported, so a non-deterministic
 *    comparator would make the built HTML churn between builds. Equal-date
 *    cases assert an exact order and re-sort idempotence.
 * 2. **Isolation of bad data** — one malformed date must not reorder the valid
 *    entries around it.
 */

/** Minimal experience entry factory; only the fields under test are set. */
function exp(overrides: Partial<ExperienceEntry> & { id: string }): ExperienceEntry {
  return {
    role: { en: overrides.id, it: overrides.id },
    company: 'IBM',
    ...overrides,
  }
}

/** Minimal education entry factory. */
function edu(overrides: Partial<EducationEntry> & { id: string }): EducationEntry {
  return {
    degree: { en: overrides.id, it: overrides.id },
    institution: 'Politecnico di Milano',
    ...overrides,
  }
}

/** Convenience: map a sorted result to its ids for readable assertions. */
function ids(entries: { id: string }[]): string[] {
  return entries.map((entry) => entry.id)
}

describe('sortExperience', () => {
  it('returns an empty array for empty input', () => {
    expect(sortExperience([])).toEqual([])
  })

  it('tolerates undefined input', () => {
    expect(sortExperience(undefined as unknown as ExperienceEntry[])).toEqual([])
  })

  it('places a current role ahead of a more recent completed role', () => {
    const entries = [
      exp({ id: 'completed', startDate: '2023-01', endDate: '2024-01' }),
      exp({ id: 'current', startDate: '2019-01' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['current', 'completed'])
  })

  it('orders multiple current roles by startDate descending', () => {
    const entries = [
      exp({ id: 'older-current', startDate: '2018-09' }),
      exp({ id: 'newer-current', startDate: '2025-04' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['newer-current', 'older-current'])
  })

  it('orders completed roles by startDate descending', () => {
    const entries = [
      exp({ id: 'oldest', startDate: '2013-09', endDate: '2018-08' }),
      exp({ id: 'newest', startDate: '2020-01', endDate: '2022-01' }),
      exp({ id: 'middle', startDate: '2018-09', endDate: '2020-01' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['newest', 'middle', 'oldest'])
  })

  it('sorts entries with a malformed startDate last', () => {
    const entries = [
      exp({ id: 'broken', startDate: 'not-a-date', endDate: '2020-01' }),
      exp({ id: 'valid', startDate: '2015-01', endDate: '2016-01' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['valid', 'broken'])
  })

  it('sorts entries with a missing startDate last', () => {
    const entries = [
      exp({ id: 'no-date', endDate: '2020-01' }),
      exp({ id: 'valid', startDate: '2015-01', endDate: '2016-01' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['valid', 'no-date'])
  })

  it('keeps valid entries correctly ordered around a malformed one', () => {
    const entries = [
      exp({ id: 'middle', startDate: '2018-01', endDate: '2019-01' }),
      exp({ id: 'broken', startDate: 'garbage', endDate: '2020-01' }),
      exp({ id: 'newest', startDate: '2021-01', endDate: '2022-01' }),
      exp({ id: 'oldest', startDate: '2010-01', endDate: '2011-01' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['newest', 'middle', 'oldest', 'broken'])
  })

  it('breaks equal startDate ties deterministically by company then role', () => {
    const entries = [
      exp({ id: 'b-second', company: 'Beta', startDate: '2020-01', endDate: '2021-01' }),
      exp({ id: 'a-first', company: 'Alpha', startDate: '2020-01', endDate: '2021-01' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['a-first', 'b-second'])
  })

  it('breaks ties on role when company matches', () => {
    const entries = [
      exp({
        id: 'zeta',
        company: 'IBM',
        role: { en: 'Zeta', it: 'Zeta' },
        startDate: '2020-01',
        endDate: '2021-01',
      }),
      exp({
        id: 'alpha',
        company: 'IBM',
        role: { en: 'Alpha', it: 'Alpha' },
        startDate: '2020-01',
        endDate: '2021-01',
      }),
    ]

    expect(ids(sortExperience(entries))).toEqual(['alpha', 'zeta'])
  })

  it('produces identical output when sorting the same input twice', () => {
    const entries = [
      exp({ id: 'b', company: 'Beta', startDate: '2020-01', endDate: '2021-01' }),
      exp({ id: 'a', company: 'Alpha', startDate: '2020-01', endDate: '2021-01' }),
      exp({ id: 'current', startDate: '2022-01' }),
      exp({ id: 'broken', startDate: 'nope' }),
    ]

    expect(ids(sortExperience(entries))).toEqual(ids(sortExperience(entries)))
  })

  it('does not mutate the input array', () => {
    const entries = [
      exp({ id: 'oldest', startDate: '2013-09', endDate: '2018-08' }),
      exp({ id: 'newest', startDate: '2020-01' }),
    ]
    const original = ids(entries)

    sortExperience(entries)

    expect(ids(entries)).toEqual(original)
  })

  it('returns a new array instance', () => {
    const entries = [exp({ id: 'only', startDate: '2020-01' })]

    expect(sortExperience(entries)).not.toBe(entries)
  })
})

describe('sortEducation', () => {
  it('returns an empty array for empty input', () => {
    expect(sortEducation([])).toEqual([])
  })

  it('tolerates undefined input', () => {
    expect(sortEducation(undefined as unknown as EducationEntry[])).toEqual([])
  })

  it('orders entries by endDate descending', () => {
    const entries = [
      edu({ id: 'bachelor', endDate: '2011-12' }),
      edu({ id: 'master', endDate: '2013-12' }),
    ]

    expect(ids(sortEducation(entries))).toEqual(['master', 'bachelor'])
  })

  it('falls back to startDate when endDate is absent', () => {
    const entries = [
      edu({ id: 'older', startDate: '2008-09' }),
      edu({ id: 'newer', startDate: '2014-09' }),
    ]

    expect(ids(sortEducation(entries))).toEqual(['newer', 'older'])
  })

  it('sorts entries with no usable date last', () => {
    const entries = [edu({ id: 'undated' }), edu({ id: 'dated', endDate: '2011-12' })]

    expect(ids(sortEducation(entries))).toEqual(['dated', 'undated'])
  })

  it('breaks ties deterministically by institution then degree', () => {
    const entries = [
      edu({ id: 'beta', institution: 'Beta University', endDate: '2013-12' }),
      edu({ id: 'alpha', institution: 'Alpha University', endDate: '2013-12' }),
    ]

    expect(ids(sortEducation(entries))).toEqual(['alpha', 'beta'])
  })

  it('does not mutate the input array', () => {
    const entries = [
      edu({ id: 'bachelor', endDate: '2011-12' }),
      edu({ id: 'master', endDate: '2013-12' }),
    ]
    const original = ids(entries)

    sortEducation(entries)

    expect(ids(entries)).toEqual(original)
  })
})
