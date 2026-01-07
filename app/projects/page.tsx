import { allProjects } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ProjectsListClient from '@/components/projects/ProjectsListClient'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function ProjectsPage() {
  const projects = allCoreContent(sortPosts(allProjects))

  return <ProjectsListClient projects={projects} />
}
