'use client'

import { Project } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePathname, useSearchParams } from 'next/navigation'
import { slug } from 'github-slugger'
import Link from '@/components/Link'
import ProjectCardGrid from '@/components/projects/ProjectCardGrid'

interface Props {
  projects: Project[]
}

export default function ProjectsGrid({ projects }: Props) {
  const { lang } = useLanguage()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTag = searchParams.get('tag')

  // ----------------------------
  // Tag aggregation
  // ----------------------------
  const tagCounts: Record<string, number> = {}

  projects.forEach((p) => {
    p.tags?.forEach((tag) => {
      const s = slug(tag)
      tagCounts[s] = (tagCounts[s] ?? 0) + 1
    })
  })

  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])

  // ----------------------------
  // Filtering
  // ----------------------------
  const filteredProjects = activeTag
    ? projects.filter((p) => p.tags?.some((t) => slug(t) === activeTag))
    : projects

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex gap-12">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 sm:block">
          <div className="rounded-xl bg-gray-50 p-6 shadow-md dark:bg-gray-900/70 dark:shadow-gray-800/40">
            {!activeTag ? (
              <h3 className="text-primary-500 font-bold uppercase">All Projects</h3>
            ) : (
              <Link
                href={pathname}
                className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
              >
                All Projects
              </Link>
            )}

            <ul className="mt-4 space-y-2">
              {sortedTags.map((t) => {
                const isActive = activeTag === t

                return (
                  <li key={t}>
                    {isActive ? (
                      <span className="text-primary-500 block rounded px-3 py-2 text-sm font-semibold uppercase">
                        {t} ({tagCounts[t]})
                      </span>
                    ) : (
                      <Link
                        href={`${pathname}?tag=${t}`}
                        className="hover:text-primary-500 dark:hover:text-primary-500 block rounded px-3 py-2 text-sm font-medium text-gray-600 uppercase dark:text-gray-300"
                      >
                        {t} ({tagCounts[t]})
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {!filteredProjects.length && (
            <p className="text-text-secondary dark:text-text-secondary-dark">No projects found.</p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {filteredProjects.map((p) => (
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
        </div>
      </div>
    </section>
  )
}
