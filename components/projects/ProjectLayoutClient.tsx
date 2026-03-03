'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from '@/components/Link'

export default function ProjectLayoutClient() {
  const { t } = useLanguage()

  return (
    <footer className="pt-12">
      <Link
        href="/projects"
        className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
        aria-label={t('projects.back')}
      >
        &larr; {t('projects.back')}
      </Link>
    </footer>
  )
}
