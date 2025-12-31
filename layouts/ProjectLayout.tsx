// layouts/ProjectLayout.tsx
'use client'

import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'

import ProjectHeader from '@/components/projects/ProjectHeader'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

import { useLanguage } from '@/contexts/LanguageContext'

interface ProjectLayoutProps {
  content: CoreContent<Project>
  children: ReactNode
}

export default function ProjectLayout({ content, children }: ProjectLayoutProps) {
  const { t } = useLanguage()

  return (
    <SectionContainer>
      <ScrollTopAndComment />

      <article className="mx-auto w-full max-w-5xl">
        <ProjectHeader project={content} />

        <div className="pt-12">
          <div className="prose dark:prose-invert max-w-none">{children}</div>
        </div>

        <footer className="pt-12">
          <Link
            href="/projects"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={t('projects.back')}
          >
            &larr; {t('projects.back')}
          </Link>
        </footer>
      </article>
    </SectionContainer>
  )
}
