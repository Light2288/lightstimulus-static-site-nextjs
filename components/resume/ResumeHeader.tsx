'use client'

import { motion } from 'motion/react'
import clsx from 'clsx'
import { useLanguage } from '@/contexts/LanguageContext'

type CV = {
  url: string
}

interface Props {
  name?: string
  occupation?: string
  company?: string
  cv?: CV
}

/**
 * Header block for the `/resume` page.
 *
 * ## Why not reuse `AboutProfile`?
 * `AboutProfile` renders the name as an `h2` and hardcodes four
 * `about.profile.highlights.*` bullets that belong to the About narrative.
 * Reusing it here would either break the resume's heading hierarchy or force
 * variant props onto a component the spec keeps out of scope. A small dedicated
 * header is cheaper and leaves `/about` untouched.
 *
 * ## Responsibilities
 * Owns the page's single `h1` and the CV download action. The download is
 * conditional on `cv.url` and mirrors the href construction in
 * `CVDownloadCard` — including the `BASE_PATH` prefix, which is read at render
 * time so it works under a subpath deployment.
 */
export function ResumeHeader({ name, occupation, company, cv }: Props) {
  const { t } = useLanguage()

  const basePath = process.env.BASE_PATH || ''
  const hasDownload = Boolean(cv?.url)

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 26 }}
      className={clsx(
        'glass-bg rounded-xl border border-white/20 p-6 backdrop-blur',
        'flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between',
        'dark:border-white/10'
      )}
    >
      <div className="min-w-0">
        <h1 className="mb-2 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-4xl font-bold text-transparent">
          {t('resume.title')}
        </h1>

        {/*
         * The name is deliberately *not* a heading: the page already has its
         * h1, and the section headings below are h2s. Making this an h3 would
         * imply it subordinates them, which it does not.
         */}
        {name && <p className="text-lg font-semibold break-words">{name}</p>}

        {occupation && (
          <p className="text-text-secondary mt-1 text-sm break-words dark:text-gray-300">
            {occupation}
          </p>
        )}
        {company && (
          <p className="text-text-secondary text-sm break-words dark:text-gray-300">{company}</p>
        )}
      </div>

      {hasDownload && (
        <a
          href={`${basePath}${cv!.url}`}
          download
          className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-600 dark:hover:bg-primary-400 focus-visible:ring-primary-500/40 inline-flex shrink-0 items-center justify-center self-start rounded-lg border px-5 py-2 text-sm font-medium whitespace-nowrap transition hover:text-white focus-visible:ring-2 focus-visible:outline-none sm:self-auto"
        >
          {t('resume.cv.download')}
        </a>
      )}
    </motion.section>
  )
}
