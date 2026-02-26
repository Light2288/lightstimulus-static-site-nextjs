'use client'

import ProjectCardBase from '@/components/projects/ProjectCardBase'
import { LocalizedTag } from '@/types/localizedTag'

interface Props {
  href: string
  title: string
  summary: string
  coverImage?: string
  date: string
  tags?: LocalizedTag[]
  priority?: boolean
}

export default function ProjectCardGrid({
  href,
  title,
  summary,
  coverImage,
  date,
  tags,
  priority,
}: Props) {
  return (
    <ProjectCardBase
      href={href}
      title={title}
      summary={summary}
      coverImage={coverImage}
      date={date}
      tags={tags}
      priority={priority}
    />
  )
}
