'use client'

import { motion } from 'motion/react'

type FocusArea = {
  title: string
  description: string
}

export function FocusAreas({ areas }: { areas: FocusArea[] }) {
  if (!areas.length) return null

  return (
    <section className="mt-14">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        Focus areas
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {areas.map((area) => (
          <motion.div
            key={area.title}
            initial={{ y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="glass-bg rounded-xl border border-white/20 p-6 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
          >
            <h3 className="mb-2 text-lg font-medium">{area.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed dark:text-gray-300">
              {area.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
