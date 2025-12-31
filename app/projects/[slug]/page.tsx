import 'css/prism.css'

import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import { allProjects } from 'contentlayer/generated'
import { coreContent } from 'pliny/utils/contentlayer'

import { genPageMetadata } from '@/app/seo'
import ProjectLayout from '@/layouts/ProjectLayout'
import ProjectContent from '@/components/projects/ProjectContent'

// -----------------------------
// Static generation
// -----------------------------

export const generateStaticParams = async () => {
  return allProjects.map((project) => ({
    slug: project.slug,
  }))
}

// -----------------------------
// Metadata (language-agnostic for now)
// -----------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const { slug } = await params

  const project = allProjects.find((p) => p.slug === slug)
  if (!project) return

  return genPageMetadata({
    title: project.title?.en,
    description: project.summary?.en,
    image: project.coverImage,
    slug: `projects/${project.slug}`,
  })
}

// -----------------------------
// Page
// -----------------------------

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const project = allProjects.find((p) => p.slug === slug)
  if (!project) return notFound()

  const content = coreContent(project)

  return (
    <>
      {project.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(project.structuredData),
          }}
        />
      )}

      <ProjectLayout content={content}>
        <ProjectContent code={project.body.code} />
      </ProjectLayout>
    </>
  )
}
