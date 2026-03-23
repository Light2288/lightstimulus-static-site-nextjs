'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function ContactIntro() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto max-w-2xl translate-y-2 animate-[fadeInUp_0.4s_ease-out_forwards] text-center opacity-0">
      <h1 className="mb-4 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-3xl font-semibold text-transparent">
        {t('contact.title')}
      </h1>

      <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-300">
        {t('contact.intro')}
      </p>
    </section>
  )
}
