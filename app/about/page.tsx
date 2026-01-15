import { allAuthors } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { FocusAreas } from '@/components/about/FocusAreas'
import { ExploringNow } from '@/components/about/ExploringNow'
import { CVDownloadCard } from '@/components/about/CVDownloadCard'
import AboutProfile from '@/components/about/AboutProfile'

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

        {/* Narrative author */}
        {/* Narrative author */}
        <div className="mt-8">
          <article className="prose prose-invert max-w-none">
            <MDXLayoutRenderer code={author.body.code} />
          </article>
        </div>

        {/* Structured sections */}
        <FocusAreas areas={author.focusAreas} />
        <ExploringNow items={author.exploringNow} />
        <CVDownloadCard cv={author.cv} />
      </section>
    </SectionContainer>
  )
}
