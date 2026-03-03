'use client'

import { Info, Shapes, Activity, Calendar, Layers, ExternalLink } from 'lucide-react'

import Image from '@/components/Image'
import Tag from '@/components/Tag'
import PageTitle from '@/components/PageTitle'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'
import ProjectLinks from '@/components/projects/ProjectLinks'

interface ProjectHeaderProps {
  project: CoreContent<Project>
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const { lang, t } = useLanguage()

  const title = project.title?.[lang] ?? project.title?.en
  const summary = project.summary?.[lang] ?? project.summary?.en

  return (
    <header className="space-y-8 pt-12">
      {/* Cover image */}
      {project.coverImage && (
        <div className="glass-bg relative aspect-[16/9] max-h-[420px] w-full overflow-hidden rounded-2xl shadow-lg md:max-h-[480px]">
          <Image
            src={project.coverImage}
            alt={title}
            fill
            className="object-cover"
            priority
            fetchpriority="high"
          />
        </div>
      )}

      {/* Title & summary */}
      <div className="space-y-4 text-center">
        <PageTitle gradient>{title}</PageTitle>

        {summary && (
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">{summary}</p>
        )}
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {project.tags.map((tag) => (
            <Tag key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      {/* Meta cards */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1 — Details */}
        <div className="flex h-full flex-col rounded-2xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-gray-700/40 dark:bg-gray-800/70">
          <div
            className="text-secondary-500 mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase"
            role="heading"
            aria-level={2}
          >
            <Info className="h-4 w-4" />
            {t('projects.meta.details')}
          </div>

          <div className="space-y-3 text-sm">
            {project.projectType && (
              <p className="flex items-start gap-2">
                <Shapes className="text-primary-500 mt-0.5 h-4 w-4" />
                <span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t('projects.meta.type')}:{' '}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {t(`projects.meta.types.${project.projectType}`)}
                  </span>
                </span>
              </p>
            )}

            {project.status && (
              <p className="flex items-start gap-2">
                <Activity className="text-primary-500 mt-0.5 h-4 w-4" />
                <span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t('projects.meta.status')}:{' '}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {t(`projects.meta.statuses.${project.status}`)}
                  </span>
                </span>
              </p>
            )}

            {project.date && (
              <p className="flex items-start gap-2">
                <Calendar className="text-primary-500 mt-0.5 h-4 w-4" />
                <span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t('projects.meta.date')}:{' '}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(project.date).toLocaleDateString(lang)}
                  </span>
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Card 2 — Stack */}
        <div className="h-full rounded-2xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-gray-700/40 dark:bg-gray-800/70">
          <div
            className="text-secondary-500 mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase"
            role="heading"
            aria-level={2}
          >
            <Layers className="h-4 w-4" />
            {t('projects.meta.stack')}
          </div>

          {project.stack?.length ? (
            <ul className="space-y-1 text-sm">
              {project.stack.map((tech) => (
                <li key={tech} className="text-gray-800 dark:text-gray-200">
                  {tech}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">—</p>
          )}
        </div>

        {/* Card 3 — Links */}
        <div className="h-full rounded-2xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-gray-700/40 dark:bg-gray-800/70">
          <div
            className="text-secondary-500 mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase"
            role="heading"
            aria-level={2}
          >
            <ExternalLink className="h-4 w-4" />
            {t('projects.meta.links')}
          </div>

          <ProjectLinks project={project} />
        </div>
      </div>
    </header>
  )
}
