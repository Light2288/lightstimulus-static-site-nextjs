'use client'

import { motion } from 'motion/react'
import Link from '@/components/Link'
import { useLanguage } from '@/contexts/LanguageContext'

type CV = {
  url: string
}

/**
 * Credentials card carrying two actions:
 *
 * - the **primary** CV download, which requires a `cv.url` and is therefore
 *   rendered conditionally, and
 * - the **secondary** pointer to `/resume`, which is independent of the CV
 *   asset and always renders.
 *
 * Because the resume pointer never depends on props, there is always something
 * worth rendering — hence no null guard. (The previous
 * `if (!cv?.url) return null` would have hidden the resume pointer whenever the
 * CV asset was missing.)
 *
 * ## Layout
 * Two blocks: an upper row pairing the description with the download button
 * (stacked below `sm`, side by side with the button trailing from `sm` up), then
 * the resume pointer pinned to the bottom via `mt-auto`. Combined with `h-full`
 * on the section and `flex-1` on the shell, that `mt-auto` is what lets this
 * card absorb the height difference when it sits beside the taller
 * `ExploringNow` card — the interior space grows instead of the bottom edge
 * going ragged.
 */
export function CVDownloadCard({ cv }: { cv?: CV }) {
  const { t } = useLanguage()

  const basePath = process.env.BASE_PATH || ''
  const hasDownload = Boolean(cv?.url)

  return (
    <section className="flex h-full flex-col">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-lg font-semibold text-transparent">
        {t('about.cv.title')}
      </h2>

      <motion.div
        initial={{ y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="glass-bg flex flex-1 flex-col gap-4 rounded-xl border border-white/20 p-6 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-text-secondary text-sm dark:text-gray-300">
            {t('about.cv.description')}
          </p>

          {hasDownload && (
            <a
              href={`${basePath}${cv!.url}`}
              download
              className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-600 dark:hover:bg-primary-400 focus-visible:ring-primary-500/40 inline-flex shrink-0 items-center justify-center self-start rounded-lg border px-5 py-2 text-sm font-medium whitespace-nowrap transition hover:text-white focus-visible:ring-2 focus-visible:outline-none sm:self-auto"
            >
              {t('about.cv.download')}
            </a>
          )}
        </div>

        <div className="mt-auto">
          <Link
            href="/resume"
            className="text-accent-primary hover:text-accent-secondary text-sm font-medium whitespace-nowrap transition"
          >
            {t('about.cv.resume_link')} →
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
