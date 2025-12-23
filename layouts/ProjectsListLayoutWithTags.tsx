'use client'

import { Project } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from '@/components/Link'
import ProjectCardGrid from '@/components/projects/ProjectCardGrid'
import tagData from 'app/project-tag-data.json'
import { LocalizedTag } from '../types/localizedTag'
import clsx from 'clsx'

interface Props {
  projects: Project[]
}

export default function ProjectsListLayoutWithTags({ projects }: Props) {
  const { lang } = useLanguage()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag')

  const filtered = activeTag
    ? projects.filter((p) => p.tags?.some((t) => (t as LocalizedTag).id === activeTag))
    : projects

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-4 text-4xl font-bold">{lang === 'it' ? 'Progetti' : 'Projects'}</h1>

      <p className="text-text-secondary mb-12 max-w-2xl">
        {lang === 'it'
          ? 'Una selezione di ricerche, prototipi ed esperimenti.'
          : 'A selection of research, prototypes, and experiments.'}
      </p>

      <div className="flex items-start gap-12">
        {/* Sidebar */}
        <aside className="hidden w-[260px] lg:block">
          <div className="glass-bg rounded-xl p-6">
            <Link
              href={pathname}
              className={clsx(
                'block border-l-2 pl-3 font-bold uppercase transition-colors',
                !activeTag
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-text-secondary hover:text-primary-500 dark:hover:text-primary-400 border-transparent'
              )}
            >
              {lang === 'it' ? 'Tutti i progetti' : 'All projects'}
            </Link>

            <ul className="mt-4 space-y-2">
              {Object.entries(tagData).map(([tagId, count]) => {
                const tag = projects
                  .flatMap((p) => p.tags as LocalizedTag[])
                  .find((t) => t.id === tagId)

                if (!tag) return null

                const isActive = tagId === activeTag
                const href = isActive ? pathname : `${pathname}?tag=${tagId}`

                return (
                  <li key={tagId}>
                    <Link
                      href={href}
                      className={clsx(
                        'block border-l-2 pl-3 transition-colors',
                        isActive
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
                          : 'text-text-secondary hover:text-primary-500 dark:hover:text-primary-400 border-transparent'
                      )}
                    >
                      {tag.label[lang]} ({count})
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
          {filtered.map((p) => (
            <ProjectCardGrid
              key={p.slug}
              href={`/projects/${p.slug}`}
              title={p.title[lang] ?? p.title.en}
              summary={p.summary[lang] ?? p.summary.en}
              coverImage={p.coverImage}
              date={p.date}
              tags={p.tags as LocalizedTag[]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
