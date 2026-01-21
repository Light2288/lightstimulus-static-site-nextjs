'use client'

import { motion } from 'motion/react'

type CV = {
  url: string
  label?: string
}

export function CVDownloadCard({ cv }: { cv?: CV }) {
  if (!cv?.url) return null

  const basePath = process.env.BASE_PATH || ''

  return (
    <section className="mt-16">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        Curriculum Vitae
      </h2>

      <motion.div
        initial={{ y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="glass-bg flex flex-col gap-4 rounded-xl border border-white/20 p-6 shadow-md backdrop-blur transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between dark:border-white/10"
      >
        <p className="text-text-secondary text-sm dark:text-gray-300">
          A concise overview of my experience, skills, and selected projects.
        </p>

        <a
          href={`${basePath}${cv.url}`}
          download
          className="inline-flex items-center justify-center rounded-lg border border-[var(--color-primary-500)] px-5 py-2 text-sm font-medium whitespace-nowrap text-[var(--color-primary-500)] transition hover:bg-[var(--color-primary-500)] hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]/40 focus-visible:outline-none"
        >
          {cv.label ?? 'Download CV'}
        </a>
      </motion.div>
    </section>
  )
}
