import 'css/prism.css'

import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import { allProjects } from 'contentlayer/generated'
import { coreContent } from 'pliny/utils/contentlayer'

import { genPageMetadata } from '@/app/seo'
import siteMetadata from '@/data/siteMetadata'
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

  // Breadcrumb structured data for SEO
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteMetadata.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Projects',
        item: `${siteMetadata.siteUrl}/projects`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title?.en || project.title,
        item: `${siteMetadata.siteUrl}/projects/${project.slug}`,
      },
    ],
  }

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

      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <ProjectLayout content={content}>
        <ProjectContent code={project.body.code} />
      </ProjectLayout>
    </>
  )
}
