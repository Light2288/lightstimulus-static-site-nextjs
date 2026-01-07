'use client'

import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'
import ListWithTagsLayout from '@/layouts/ListWithTagsLayout'
import ProjectCardGrid from '@/components/projects/ProjectCardGrid'
import tagData from 'app/project-tag-data.json'
import type { LocalizedTag } from '@/types/localizedTag'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  projects: CoreContent<Project>[]
}

export default function ProjectsListClient({ projects }: Props) {
  const { t, lang } = useLanguage()

  return (
    <ListWithTagsLayout
      items={projects}
      allItems={projects}
      tagData={tagData}
      contentLayout="grid"
      title={t('projects.title')}
      description={t('projects.description')}
      getItemTags={(project) => project.tags as LocalizedTag[]}
      renderItem={(project) => (
        <ProjectCardGrid
          key={project.slug}
          href={`/projects/${project.slug}`}
          title={project.title?.[lang] ?? project.title?.en}
          summary={project.summary?.[lang] ?? project.summary?.en}
          coverImage={project.coverImage}
          date={project.date}
          tags={project.tags as LocalizedTag[]}
        />
      )}
    />
  )
}
