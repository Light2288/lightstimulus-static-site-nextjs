'use client'

import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDateRange, localize, type ExperienceEntry } from './resumeDates'
import { sortExperience } from './resumeSorting'

/**
 * Vertical experience timeline for the `/resume` page.
 *
 * ## Structure
 * A single left-hand rail with a dot marker per role and a glassmorphism card
 * to its right. The layout is deliberately identical at every breakpoint —
 * only the horizontal offsets tighten on small screens — so there is no
 * structural reflow to reason about or test twice.
 *
 * ## Semantics over decoration
 * The rail and dots are pure decoration and are marked `aria-hidden`, while the
 * entries themselves are a real `<ul>`/`<li>` list. Screen readers and crawlers
 * therefore receive an ordered set of roles rather than a pile of styled divs —
 * which is the whole point of publishing the resume as HTML instead of a PDF.
 *
 * ## Ordering is owned here
 * Sorting happens in the component via `sortExperience`, not in the frontmatter,
 * so content authors can append entries in any order without affecting display.
 */
export function ExperienceTimeline({ items }: { items: ExperienceEntry[] }) {
  const { lang, t } = useLanguage()

  // Return null (rather than an empty section) so the page's flex `gap` rhythm
  // collapses cleanly instead of leaving a dangling blank band.
  if (!items?.length) return null

  const entries = sortExperience(items)
  const presentLabel = t('resume.present')

  return (
    <section>
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        {t('resume.experience.title')}
      </h2>

      <div className="relative">
        {/*
         * The rail. Absolutely positioned so it never participates in the
         * list's layout, and hidden from assistive tech since it conveys
         * nothing the list structure does not already express.
         */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-[var(--color-primary-500)]/40 via-[var(--color-secondary-500)]/30 to-transparent sm:left-[9px]"
        />

        <ul data-testid="resume-experience-entries" className="space-y-6 sm:space-y-8">
          {entries.map((entry, index) => {
            const role = localize(entry.role, lang)
            const location = localize(entry.location, lang)
            const dateRange = formatDateRange(entry.startDate, entry.endDate, lang, presentLabel)

            return (
              <li
                // `id` alone is not a safe key: frontmatter is unvalidated, so
                // ids may be duplicated or missing. Pairing it with the index
                // keeps keys unique either way.
                key={`${entry.id ?? 'entry'}-${index}`}
                data-testid="resume-experience-entry"
                className="relative pl-8 sm:pl-10"
              >
                {/* Dot marker — decorative, matches the rail's offset. */}
                <span
                  aria-hidden="true"
                  className="glass-bg absolute top-6 left-0 h-[15px] w-[15px] rounded-full border-2 border-[var(--color-primary-500)]/60 sm:h-[19px] sm:w-[19px]"
                />

                <motion.div
                  initial={{ y: 0 }}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="glass-bg min-w-0 rounded-xl border border-white/20 p-6 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
                >
                  <h3 className="mb-1 text-lg font-medium break-words">{role}</h3>

                  <p className="text-text-secondary mb-1 text-sm break-words dark:text-gray-300">
                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('resume.company_link')}
                        className="text-accent-primary hover:text-accent-secondary focus-visible:ring-primary-500/40 rounded transition focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {entry.company}
                      </a>
                    ) : (
                      entry.company
                    )}
                    {location ? ` · ${location}` : ''}
                  </p>

                  {dateRange && (
                    <p className="text-text-secondary mb-4 text-xs tracking-wide uppercase dark:text-gray-400">
                      {dateRange}
                    </p>
                  )}

                  {/* Guarded so an entry without highlights emits no empty list. */}
                  {entry.highlights?.length ? (
                    <ul
                      data-testid="resume-highlights"
                      className="text-text-secondary list-disc space-y-2 pl-5 text-sm leading-relaxed marker:text-[var(--color-primary-500)] dark:text-gray-300"
                    >
                      {entry.highlights.map((highlight, highlightIndex) => (
                        <li key={highlightIndex} className="break-words">
                          {localize(highlight, lang)}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {entry.stack?.length ? (
                    <ul aria-label={t('resume.stack.label')} className="mt-4 flex flex-wrap gap-2">
                      {entry.stack.map((tech) => (
                        <li
                          key={tech}
                          className="text-text-secondary rounded-full border border-white/20 px-3 py-1 text-xs dark:border-white/10 dark:text-gray-300"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </motion.div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
