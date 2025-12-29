// layouts/ProjectLayout.tsx

import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

import ProjectHeader from '@/components/projects/ProjectHeader'
import ProjectMeta from '@/components/projects/ProjectMeta'

interface ProjectLayoutProps {
  content: CoreContent<Project>
  children: ReactNode
}

export default function ProjectLayout({ content, children }: ProjectLayoutProps) {
  return (
    <SectionContainer>
      <ScrollTopAndComment />

      <article>
        <ProjectHeader project={content} />

        <div className="grid grid-cols-1 gap-12 pt-12 xl:grid-cols-4">
          {/* Main content */}
          <div className="xl:col-span-3">
            <div className="prose dark:prose-invert max-w-none">{children}</div>
          </div>

          {/* Meta / sidebar */}
          <aside className="xl:col-span-1">
            <ProjectMeta project={content} />
          </aside>
        </div>

        <footer className="pt-12">
          <Link
            href="/projects"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="Back to projects"
          >
            &larr; Back to projects
          </Link>
        </footer>
      </article>
    </SectionContainer>
  )
}
