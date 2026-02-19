import { allProjects } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ProjectsListClient from '@/components/projects/ProjectsListClient'
import { Suspense } from 'react'

export const metadata = genPageMetadata({
  title: 'Projects',
  description:
    'Explore my portfolio of projects spanning AR/VR, computer vision, machine learning, mobile development, and experimental interfaces.',
})

export default function ProjectsPage() {
  const projects = allCoreContent(sortPosts(allProjects))

  return (
    <Suspense fallback={null}>
      <ProjectsListClient projects={projects} />
    </Suspense>
  )
}
