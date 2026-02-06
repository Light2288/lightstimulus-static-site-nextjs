'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import SectionHeader from '@/components/common/SectionHeader'
import ProjectCardSmall from '@/components/projects/ProjectCardSmall'
import Link from '@/components/Link'
import { Project } from 'contentlayer/generated'

interface ProjectsPreviewProps {
  projects: Project[]
}

export default function ProjectsPreview({ projects }: ProjectsPreviewProps) {
  const { lang, t } = useLanguage()

  return (
    <section className="mx-auto mt-12 max-w-6xl px-6">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeader labelKey="home.projects.title" />

        <Link
          href="/projects"
          className="text-accent-primary hover:text-accent-secondary text-sm transition"
        >
          {t('home.projects.view_all')} →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p) => (
          <ProjectCardSmall
            key={p.slug}
            href={`/projects/${p.slug}`}
            title={p.title[lang] ?? p.title.en}
            summary={p.summary[lang] ?? p.summary.en}
            coverImage={p.coverImage}
          />
        ))}
      </div>
    </section>
  )
}
