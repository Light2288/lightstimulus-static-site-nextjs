// app/projects/page.tsx
import { allProjects } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ProjectsGrid from '@/components/projects/ProjectsGrid'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function ProjectsPage() {
  const projects = [...allProjects].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return <ProjectsGrid projects={projects} />
}
