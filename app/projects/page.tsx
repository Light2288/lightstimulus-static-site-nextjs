import { allProjects } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ProjectsListLayoutWithTags from '@/layouts/ProjectsListLayoutWithTags'
import { Suspense } from 'react'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function ProjectsPage() {
  const projects = [...allProjects].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <Suspense fallback={null}>
      <ProjectsListLayoutWithTags projects={projects} />
    </Suspense>
  )
}
