'use client'

import ProjectCardBase from '@/components/projects/ProjectCardBase'

interface Props {
  href: string
  title: string
  summary: string
  coverImage?: string
  date: string
  tags?: string[]
}

export default function ProjectCardGrid({
  href,
  title,
  summary,
  coverImage,
  date,
  tags = [],
}: Props) {
  return (
    <ProjectCardBase
      href={href}
      title={title}
      summary={summary}
      coverImage={coverImage}
      date={date}
      tags={tags}
    />
  )
}
