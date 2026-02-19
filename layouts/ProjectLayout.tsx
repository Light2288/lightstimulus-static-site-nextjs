import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

import SectionContainer from '@/components/SectionContainer'
import ProjectHeader from '@/components/projects/ProjectHeader'
import dynamic from 'next/dynamic'
import ProjectLayoutClient from '@/components/projects/ProjectLayoutClient'

// Dynamic import for ScrollTopAndComment - reduces initial bundle size
// Component is not needed for SEO and can load after initial render
const ScrollTopAndComment = dynamic(() => import('@/components/ScrollTopAndComment'), {
  ssr: false,
})

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

        {/* Client component for language-dependent back link */}
        <ProjectLayoutClient />
      </article>
    </SectionContainer>
  )
}
