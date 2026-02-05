import { allAuthors } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { FocusAreas } from '@/components/about/FocusAreas'
import { ExploringNow } from '@/components/about/ExploringNow'
import { CVDownloadCard } from '@/components/about/CVDownloadCard'
import AboutProfile from '@/components/about/AboutProfile'
import { CertificationsGrid } from '@/components/about/CertificationsGrid'
import { AboutContactBridge } from '@/components/about/AboutContactBridge'
import { components } from '@/components/MDXComponents'
import { genPageMetadata } from '@/app/seo'

export const metadata = genPageMetadata({
  title: 'About',
  description:
    'Learn about Davide Aliti - Senior Application Architect, Technical Leader, and technology enthusiast exploring AR, XR, AI, and computer vision.',
})

export default function AboutPage() {
  const author = allAuthors.find((a) => a.slug === 'default')

  if (!author) return null

  return (
    <SectionContainer>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-4 text-4xl font-bold">About</h1>

        <AboutProfile
          name={author.name}
          avatar={author.avatar}
          occupation={author.occupation}
          company={author.company}
          socials={{
            email: author.email,
            github: author.github,
            linkedin: author.linkedin,
            twitter: author.twitter,
            bluesky: author.bluesky,
          }}
        />

        <div className="mt-8">
          <article className="prose dark:prose-invert max-w-none">
            <MDXLayoutRenderer code={author.body.code} components={components} />
          </article>
        </div>

        {/* Structured sections */}
        <FocusAreas areas={author.focusAreas} />
        <ExploringNow items={author.exploringNow} />
        <CertificationsGrid items={author.certifications ?? []} />
        <CVDownloadCard cv={author.cv} />
        <AboutContactBridge />
      </section>
    </SectionContainer>
  )
}
