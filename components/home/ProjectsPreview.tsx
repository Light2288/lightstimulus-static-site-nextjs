'use client'

import { allProjects } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'
import SectionHeader from '@/components/common/SectionHeader'
import ProjectCardSmall from '@/components/projects/ProjectCardSmall'
import Link from '@/components/Link'
import { useMemo } from 'react'

export default function ProjectsPreview() {
  const { lang, t } = useLanguage()

  const projects = useMemo(
    () =>
      allProjects
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 4)
        .map((p) => ({
          slug: p.slug,
          title: p.title[lang] ?? p.title.en,
          summary: p.summary[lang] ?? p.summary.en,
          coverImage: p.coverImage,
        })),
    [lang]
  )

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
            title={p.title}
            summary={p.summary}
            coverImage={p.coverImage}
          />
        ))}
      </div>
    </section>
  )
}
