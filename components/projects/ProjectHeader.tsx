'use client'

import Image from '@/components/Image'
import Tag from '@/components/Tag'
import PageTitle from '@/components/PageTitle'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProjectHeaderProps {
  project: CoreContent<Project>
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const { lang } = useLanguage()

  const title = project.title?.[lang] ?? project.title?.en
  const summary = project.summary?.[lang] ?? project.summary?.en

  return (
    <header className="space-y-8">
      {/* Cover image */}
      {project.coverImage && (
        <div className="glass-bg relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image src={project.coverImage} alt={title} fill className="object-cover" priority />
        </div>
      )}

      {/* Title & summary */}
      <div className="space-y-4 text-center">
        <PageTitle>{title}</PageTitle>

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

      {/* Type / status */}
      {(project.projectType || project.status) && (
        <div className="flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          {project.projectType && (
            <span>
              <strong className="font-medium text-gray-700 dark:text-gray-300">Type:</strong>{' '}
              {project.projectType}
            </span>
          )}
          {project.status && (
            <span>
              <strong className="font-medium text-gray-700 dark:text-gray-300">Status:</strong>{' '}
              {project.status}
            </span>
          )}
        </div>
      )}
    </header>
  )
}
