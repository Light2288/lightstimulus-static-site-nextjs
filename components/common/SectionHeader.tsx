'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import clsx from 'clsx'

export default function SectionHeader({ labelKey }: { labelKey: string }) {
  const { t } = useLanguage()

  return (
    <h2
      className={clsx(
        'text-2xl font-semibold tracking-tight md:text-3xl',
        'bg-gradient-to-r from-[var(--color-primary-400)] via-[var(--color-primary-500)] to-[var(--color-primary-300)]',
        'bg-clip-text text-transparent'
      )}
    >
      {t(labelKey)}
    </h2>
  )
}
