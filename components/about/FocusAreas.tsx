'use client'

import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

type FocusArea = {
  title: { en: string; it: string }
  description: { en: string; it: string }
}

export function FocusAreas({ areas }: { areas: FocusArea[] }) {
  const { lang, t } = useLanguage()

  if (!areas.length) return null

  return (
    <section>
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        {t('about.focus.title')}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {areas.map((area) => (
          <motion.div
            key={area.title[lang]}
            initial={{ y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="glass-bg rounded-xl border border-white/20 p-6 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
          >
            <h3 className="mb-2 text-lg font-medium">{area.title[lang]}</h3>
            <p className="text-text-secondary text-sm leading-relaxed dark:text-gray-300">
              {area.description[lang]}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
