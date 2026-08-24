'use client'

import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDateRange, localize, type EducationEntry } from './resumeDates'
import { sortEducation } from './resumeSorting'

/**
 * Education section for the `/resume` page.
 *
 * Deliberately reuses the rail-and-card structure of `ExperienceTimeline` so
 * the two sections read as one continuous system rather than two unrelated
 * treatments.
 *
 * ## Difference from the experience timeline
 * Both dates are optional here (a degree may carry only a completion year, or
 * none at all), so `formatDateRange` can legitimately return an empty string.
 * The date line is therefore conditionally rendered — otherwise an entry with
 * no dates would show a bare separator and look broken.
 */
export function EducationSection({ items }: { items: EducationEntry[] }) {
  const { lang, t } = useLanguage()

  // Null rather than an empty section, so the page's flex `gap` collapses.
  if (!items?.length) return null

  const entries = sortEducation(items)
  const presentLabel = t('resume.present')

  return (
    <section>
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        {t('resume.education.title')}
      </h2>

      <div className="relative">
        {/* Decorative rail, matching the experience timeline. */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-[var(--color-secondary-500)]/40 via-[var(--color-primary-500)]/30 to-transparent sm:left-[9px]"
        />

        <ul data-testid="resume-education-entries" className="space-y-6 sm:space-y-8">
          {entries.map((entry, index) => {
            const degree = localize(entry.degree, lang)
            const location = localize(entry.location, lang)
            const notes = localize(entry.notes, lang)
            const dateRange = formatDateRange(entry.startDate, entry.endDate, lang, presentLabel)

            return (
              <li
                // Frontmatter ids are unvalidated: pair with the index so
                // duplicates or omissions cannot break reconciliation.
                key={`${entry.id ?? 'entry'}-${index}`}
                data-testid="resume-education-entry"
                className="relative pl-8 sm:pl-10"
              >
                <span
                  aria-hidden="true"
                  className="glass-bg absolute top-6 left-0 h-[15px] w-[15px] rounded-full border-2 border-[var(--color-secondary-500)]/60 sm:h-[19px] sm:w-[19px]"
                />

                <motion.div
                  initial={{ y: 0 }}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="glass-bg min-w-0 rounded-xl border border-white/20 p-6 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
                >
                  <h3 className="mb-1 text-lg font-medium break-words">{degree}</h3>

                  <p className="text-text-secondary mb-1 text-sm break-words dark:text-gray-300">
                    {entry.institution}
                    {location ? ` · ${location}` : ''}
                  </p>

                  {/* Omitted entirely when neither date is available. */}
                  {dateRange && (
                    <p className="text-text-secondary text-xs tracking-wide uppercase dark:text-gray-400">
                      {dateRange}
                    </p>
                  )}

                  {notes && (
                    <p className="text-text-secondary mt-4 text-sm leading-relaxed break-words dark:text-gray-300">
                      {notes}
                    </p>
                  )}
                </motion.div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
