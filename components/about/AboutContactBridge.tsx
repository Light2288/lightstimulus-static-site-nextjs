'use client'

import Link from '@/components/Link'
import { useLanguage } from '@/contexts/LanguageContext'

export function AboutContactBridge() {
  const { t } = useLanguage()

  return (
    <section className="mt-16">
      <p className="text-text-secondary mx-auto max-w-2xl text-center text-sm leading-relaxed dark:text-gray-300">
        {t('about.contact_bridge.text')}
      </p>

      <div className="mt-4 text-center">
        <Link
          href="/contact"
          className="inline-block text-sm font-medium text-[var(--color-primary-500)] hover:underline"
        >
          {t('about.contact_bridge.link')}
        </Link>
      </div>
    </section>
  )
}
