import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

import SectionContainer from '@/components/SectionContainer'
import ProjectHeader from '@/components/projects/ProjectHeader'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import ProjectLayoutClient from '@/components/projects/ProjectLayoutClient'

interface ProjectLayoutProps {
  content: CoreContent<Project>
  children: ReactNode
}

export default function ProjectLayout({ content, children }: ProjectLayoutProps) {
  return (
    <SectionContainer>
      <ScrollTopAndComment />

      <article className="mx-auto w-full max-w-5xl">
        <ProjectHeader project={content} />

        <div className="pt-12">
          <div className="prose dark:prose-invert max-w-none">{children}</div>
        </div>

        <ProjectLayoutClient />
      </article>
    </SectionContainer>
  )
}
