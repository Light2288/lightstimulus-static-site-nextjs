'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from '@/components/Link'

export default function ProjectLayoutClient() {
  const { t } = useLanguage()

  return (
    <footer className="pt-12">
      <Link
        href="/projects"
        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        aria-label={t('projects.back')}
      >
        &larr; {t('projects.back')}
      </Link>
    </footer>
  )
}
