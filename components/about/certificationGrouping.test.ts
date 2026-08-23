import { describe, it, expect } from 'vitest'
import { groupCertifications, type Certification, type GroupingMode } from './certificationGrouping'

/**
 * Characterisation tests for the pure certification grouping module.
 *
 * Fixtures mirror the shapes in `data/authors/default.mdx`: a title, an issuer
 * and a numeric year, with optional issue/expiry dates.
 */

/** Build a certification with only the fields a test cares about. */
function cert(overrides: Partial<Certification> & { title: string }): Certification {
  return {
    issuer: 'Acme',
    year: 2024,
    ...overrides,
  }
}

/** Convenience: the ordered list of group keys. */
function keys(items: Certification[], mode: GroupingMode, undatedLabel?: string) {
  return groupCertifications(items, mode, undatedLabel).map((g) => g.key)
}

/** Convenience: the ordered titles inside a named group. */
function titlesIn(groups: ReturnType<typeof groupCertifications>, key: string) {
  return groups.find((g) => g.key === key)?.items.map((i) => i.title)
}

describe('groupCertifications', () => {
  it('returns an empty array for empty input', () => {
    expect(groupCertifications([], 'year')).toEqual([])
    expect(groupCertifications([], 'issuer')).toEqual([])
  })

  describe('year mode', () => {
    it('buckets by year with the newest year first', () => {
      const items = [
        cert({ title: 'Old', year: 2021 }),
        cert({ title: 'New', year: 2025 }),
        cert({ title: 'Mid', year: 2023 }),
      ]

      expect(keys(items, 'year')).toEqual(['2025', '2023', '2021'])
    })

    it('uses the year as both key and label', () => {
      const groups = groupCertifications([cert({ title: 'A', year: 2024 })], 'year')

      expect(groups[0].key).toBe('2024')
      expect(groups[0].label).toBe('2024')
    })

    it('reports the number of badges per group', () => {
      const items = [
        cert({ title: 'A', year: 2024 }),
        cert({ title: 'B', year: 2024 }),
        cert({ title: 'C', year: 2023 }),
      ]

      const groups = groupCertifications(items, 'year')

      expect(groups.map((g) => g.count)).toEqual([2, 1])
    })

    it('sorts within a year by issuer, then title', () => {
      const items = [
        cert({ title: 'Zebra', issuer: 'Amazon', year: 2024 }),
        cert({ title: 'Alpha', issuer: 'Amazon', year: 2024 }),
        cert({ title: 'Beta', issuer: 'Microsoft', year: 2024 }),
      ]

      const groups = groupCertifications(items, 'year')

      // Amazon before Microsoft; within Amazon, Alpha before Zebra.
      expect(titlesIn(groups, '2024')).toEqual(['Alpha', 'Zebra', 'Beta'])
    })

    it('compares issuers accent- and case-insensitively when sorting within a year', () => {
      const items = [
        cert({ title: 'B', issuer: 'Zeta', year: 2024 }),
        cert({ title: 'A', issuer: 'ácme', year: 2024 }),
      ]

      const groups = groupCertifications(items, 'year')

      // 'ácme' sorts before 'Zeta' under sensitivity: 'base'.
      expect(titlesIn(groups, '2024')).toEqual(['A', 'B'])
    })

    it('places badges without a usable year in a trailing bucket', () => {
      const items = [
        cert({ title: 'Dated', year: 2024 }),
        cert({ title: 'Undated', year: undefined as unknown as number }),
      ]

      expect(keys(items, 'year')).toEqual(['2024', '__undated__'])
    })

    it('labels the undated bucket "Other" by default', () => {
      const items = [cert({ title: 'Undated', year: undefined as unknown as number })]

      const groups = groupCertifications(items, 'year')

      expect(groups[0].key).toBe('__undated__')
      expect(groups[0].label).toBe('Other')
    })

    it('honours a custom undated label for localisation', () => {
      const items = [cert({ title: 'Undated', year: undefined as unknown as number })]

      const groups = groupCertifications(items, 'year', 'Altro')

      expect(groups[0].label).toBe('Altro')
    })

    it('treats non-finite years as undated', () => {
      const items = [
        cert({ title: 'NaN year', year: Number.NaN }),
        cert({ title: 'Infinite year', year: Number.POSITIVE_INFINITY }),
        cert({ title: 'Real', year: 2024 }),
      ]

      const groups = groupCertifications(items, 'year')

      expect(groups.map((g) => g.key)).toEqual(['2024', '__undated__'])
      expect(titlesIn(groups, '__undated__')).toEqual(['Infinite year', 'NaN year'])
    })

    it('keeps the undated bucket last even with several dated years', () => {
      const items = [
        cert({ title: 'Undated', year: undefined as unknown as number }),
        cert({ title: 'A', year: 2020 }),
        cert({ title: 'B', year: 2026 }),
      ]

      expect(keys(items, 'year')).toEqual(['2026', '2020', '__undated__'])
    })

    it('omits the undated bucket entirely when every badge has a year', () => {
      const items = [cert({ title: 'A', year: 2024 })]

      expect(keys(items, 'year')).not.toContain('__undated__')
    })
  })

  describe('issuer mode', () => {
    it('buckets by issuer in alphabetical order', () => {
      const items = [
        cert({ title: 'A', issuer: 'Microsoft' }),
        cert({ title: 'B', issuer: 'Amazon Web Services' }),
        cert({ title: 'C', issuer: 'Google' }),
      ]

      expect(keys(items, 'issuer')).toEqual(['Amazon Web Services', 'Google', 'Microsoft'])
    })

    it('uses the issuer as both key and label', () => {
      const groups = groupCertifications([cert({ title: 'A', issuer: 'Acme' })], 'issuer')

      expect(groups[0].key).toBe('Acme')
      expect(groups[0].label).toBe('Acme')
    })

    it('sorts issuers accent- and case-insensitively', () => {
      const items = [
        cert({ title: 'A', issuer: 'zeta' }),
        cert({ title: 'B', issuer: 'Ácme' }),
        cert({ title: 'C', issuer: 'beta' }),
      ]

      expect(keys(items, 'issuer')).toEqual(['Ácme', 'beta', 'zeta'])
    })

    it('sorts within an issuer by year descending, then title', () => {
      const items = [
        cert({ title: 'Older', issuer: 'Acme', year: 2020 }),
        cert({ title: 'Zeta 2024', issuer: 'Acme', year: 2024 }),
        cert({ title: 'Alpha 2024', issuer: 'Acme', year: 2024 }),
      ]

      const groups = groupCertifications(items, 'issuer')

      expect(titlesIn(groups, 'Acme')).toEqual(['Alpha 2024', 'Zeta 2024', 'Older'])
    })

    it('sorts undated badges last within an issuer', () => {
      const items = [
        cert({ title: 'Undated', issuer: 'Acme', year: undefined as unknown as number }),
        cert({ title: 'Dated', issuer: 'Acme', year: 2020 }),
      ]

      const groups = groupCertifications(items, 'issuer')

      expect(titlesIn(groups, 'Acme')).toEqual(['Dated', 'Undated'])
    })

    it('does not create a separate undated bucket in issuer mode', () => {
      const items = [
        cert({ title: 'Undated', issuer: 'Acme', year: undefined as unknown as number }),
      ]

      expect(keys(items, 'issuer')).toEqual(['Acme'])
    })

    it('reports the number of badges per issuer', () => {
      const items = [
        cert({ title: 'A', issuer: 'Acme' }),
        cert({ title: 'B', issuer: 'Acme' }),
        cert({ title: 'C', issuer: 'Beta' }),
      ]

      const groups = groupCertifications(items, 'issuer')

      expect(groups.map((g) => g.count)).toEqual([2, 1])
    })
  })

  it('does not mutate the input array', () => {
    const items = [cert({ title: 'B', year: 2020 }), cert({ title: 'A', year: 2024 })]
    const snapshot = items.map((i) => i.title)

    groupCertifications(items, 'year')
    groupCertifications(items, 'issuer')

    expect(items.map((i) => i.title)).toEqual(snapshot)
  })

  it('includes every input badge exactly once across all groups', () => {
    const items = [
      cert({ title: 'A', issuer: 'Acme', year: 2024 }),
      cert({ title: 'B', issuer: 'Beta', year: 2023 }),
      cert({ title: 'C', issuer: 'Acme', year: undefined as unknown as number }),
    ]

    for (const mode of ['year', 'issuer'] as GroupingMode[]) {
      const flattened = groupCertifications(items, mode).flatMap((g) => g.items)
      expect(flattened).toHaveLength(items.length)
      expect(new Set(flattened.map((i) => i.title))).toEqual(new Set(['A', 'B', 'C']))
    }
  })
})
