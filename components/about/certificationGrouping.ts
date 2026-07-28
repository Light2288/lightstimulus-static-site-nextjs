/**
 * Certification grouping helpers
 *
 * Pure, framework-free functions that group and sort certification badges
 * either by year (newest first) or by issuer (alphabetical). Kept free of
 * React/DOM so it is trivially testable and reusable.
 *
 * @module certificationGrouping
 */

/** Shape of a single certification badge. */
export type Certification = {
  title: string
  issuer: string
  year: number
  issueDate?: string
  expiryDate?: string
  image?: string
  url?: string
}

/** The two supported grouping modes. */
export type GroupingMode = 'year' | 'issuer'

/** A single rendered group of certifications. */
export type CertificationGroup = {
  /** Stable key for React rendering. */
  key: string
  /** Human-readable heading label (e.g. "2026" or "Amazon Web Services"). */
  label: string
  /** Number of badges in the group. */
  count: number
  /** The badges belonging to this group, deterministically ordered. */
  items: Certification[]
}

/** Sentinel key/label for badges that have no usable year. */
const UNDATED_KEY = '__undated__'

/**
 * Type guard for a usable (finite) year value.
 */
function hasYear(cert: Certification): boolean {
  return typeof cert.year === 'number' && Number.isFinite(cert.year)
}

/**
 * Group and sort certifications for display.
 *
 * - `year` mode: buckets by `year`, groups ordered newest-first. Badges with
 *   no usable year fall into a trailing "Other" bucket. Within a year, badges
 *   are sorted by issuer then title.
 * - `issuer` mode: buckets by `issuer`, groups ordered alphabetically. Within
 *   an issuer, badges are sorted by year descending then title.
 *
 * @param items - The certifications to group.
 * @param mode - The grouping mode.
 * @param undatedLabel - Label to use for the trailing "no year" bucket
 *   (defaults to "Other"); allows the caller to localise it.
 * @returns Ordered groups, each with a stable key, label, count, and items.
 */
export function groupCertifications(
  items: Certification[],
  mode: GroupingMode,
  undatedLabel = 'Other'
): CertificationGroup[] {
  if (!items.length) return []

  const buckets = new Map<string, Certification[]>()

  if (mode === 'year') {
    for (const cert of items) {
      const key = hasYear(cert) ? String(cert.year) : UNDATED_KEY
      const bucket = buckets.get(key)
      if (bucket) bucket.push(cert)
      else buckets.set(key, [cert])
    }

    const groups: CertificationGroup[] = []
    for (const [key, groupItems] of buckets) {
      if (key === UNDATED_KEY) continue
      groups.push({
        key,
        label: key,
        count: groupItems.length,
        items: sortWithinYear(groupItems),
      })
    }

    // Newest year first.
    groups.sort((a, b) => Number(b.key) - Number(a.key))

    // Trailing "Other" bucket for undated badges.
    const undated = buckets.get(UNDATED_KEY)
    if (undated && undated.length) {
      groups.push({
        key: UNDATED_KEY,
        label: undatedLabel,
        count: undated.length,
        items: sortWithinYear(undated),
      })
    }

    return groups
  }

  // mode === 'issuer'
  for (const cert of items) {
    const key = cert.issuer
    const bucket = buckets.get(key)
    if (bucket) bucket.push(cert)
    else buckets.set(key, [cert])
  }

  const groups: CertificationGroup[] = []
  for (const [key, groupItems] of buckets) {
    groups.push({
      key,
      label: key,
      count: groupItems.length,
      items: sortWithinIssuer(groupItems),
    })
  }

  // Alphabetical by issuer, case-insensitive and locale-aware.
  groups.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))

  return groups
}

/** Within a year group: sort by issuer, then title. */
function sortWithinYear(items: Certification[]): Certification[] {
  return [...items].sort((a, b) => {
    const byIssuer = a.issuer.localeCompare(b.issuer, undefined, { sensitivity: 'base' })
    if (byIssuer !== 0) return byIssuer
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  })
}

/** Within an issuer group: sort by year descending, then title. */
function sortWithinIssuer(items: Certification[]): Certification[] {
  return [...items].sort((a, b) => {
    const ay = hasYear(a) ? a.year : -Infinity
    const by = hasYear(b) ? b.year : -Infinity
    if (ay !== by) return by - ay
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  })
}
