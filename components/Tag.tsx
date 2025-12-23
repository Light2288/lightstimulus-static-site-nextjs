'use client'

import clsx from 'clsx'
import { useLanguage } from '@/contexts/LanguageContext'

interface TagType {
  id: string
  label: {
    en: string
    it: string
  }
}

interface Props {
  tag: TagType
  className?: string
}

export default function Tag({ tag, className }: Props) {
  const { lang } = useLanguage()
  const label = tag.label[lang] ?? tag.label.en

  return (
    <span
      className={clsx(
        'border-primary-500/40 text-primary-600 dark:text-primary-400 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        className
      )}
    >
      {label}
    </span>
  )
}
