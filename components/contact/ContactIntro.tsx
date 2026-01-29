'use client'

import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

export function ContactIntro() {
  const { t } = useLanguage()

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 26 }}
      className="mx-auto max-w-2xl text-center"
    >
      <h1 className="mb-4 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-3xl font-semibold text-transparent">
        {t('contact.title')}
      </h1>

      <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line dark:text-gray-300">
        {t('contact.intro')}
      </p>
    </motion.section>
  )
}
