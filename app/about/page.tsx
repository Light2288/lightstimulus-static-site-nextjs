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

  // The sections self-guard with `return null`, but the page needs the same
  // knowledge up-front to decide the paired row's shape: a two-column grid is
  // only correct when *both* halves will actually render, otherwise the
  // surviving card would sit beside a visible empty half.
  //
  // The credentials half is always present — `CVDownloadCard` renders the
  // `/resume` pointer regardless of whether a CV asset exists — so only the
  // exploring half can drop out, collapsing the row to a single column.
  const isPaired = Boolean(author.exploringNow?.length)

  return (
    <SectionContainer>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-4 text-4xl font-bold">About</h1>

        {/*
         * Single owner of vertical rhythm. `flex` + `gap` (rather than
         * `space-y-*`) is deliberate: gaps collapse cleanly around sections
         * that render `null`, so an empty section leaves no dangling space.
         */}
        <div data-testid="about-rhythm" className="flex flex-col gap-14 sm:gap-16 lg:gap-24">
          <div data-testid="about-profile">
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
          </div>

          {/* Narrower measure than the full-width bands, for readability. */}
          <div data-testid="about-bio">
            <article className="prose dark:prose-invert mx-auto max-w-3xl">
              <MDXLayoutRenderer code={author.body.code} components={components} />
            </article>
          </div>

          {author.focusAreas?.length ? (
            <div data-testid="about-focus">
              <FocusAreas areas={author.focusAreas} />
            </div>
          ) : null}

          <div
            data-testid="about-paired-row"
            className={`grid grid-cols-1 gap-8 ${isPaired ? 'lg:grid-cols-2' : ''}`}
          >
            <ExploringNow items={author.exploringNow} />
            <CVDownloadCard cv={author.cv} />
          </div>

          {author.certifications?.length ? (
            <div data-testid="about-certifications">
              <CertificationsGrid items={author.certifications} />
            </div>
          ) : null}

          <div data-testid="about-bridge">
            <AboutContactBridge />
          </div>
        </div>
      </section>
    </SectionContainer>
  )
}
