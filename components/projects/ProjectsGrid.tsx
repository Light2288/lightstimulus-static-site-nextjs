// components/projects/ProjectsGrid.tsx
'use client'

import { Project } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'
import ProjectCardGrid from '@/components/projects/ProjectCardGrid'

interface Props {
  projects: Project[]
}

export default function ProjectsGrid({ projects }: Props) {
  const { lang } = useLanguage()

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCardGrid
            key={p.slug}
            href={`/projects/${p.slug}`}
            title={p.title[lang] ?? p.title.en}
            summary={p.summary[lang] ?? p.summary.en}
            coverImage={p.coverImage}
            date={p.date}
            tags={p.tags}
          />
        ))}
      </div>
    </section>
  )
}
