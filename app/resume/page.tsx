import { allAuthors } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import { ResumeHeader } from '@/components/resume/ResumeHeader'
import { ExperienceTimeline } from '@/components/resume/ExperienceTimeline'
import { EducationSection } from '@/components/resume/EducationSection'
import {
  localize,
  type ExperienceEntry,
  type EducationEntry,
} from '@/components/resume/resumeDates'
import { sortExperience, sortEducation } from '@/components/resume/resumeSorting'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from '@/app/seo'

export const metadata = genPageMetadata({
  title: 'Resume',
  description:
    'Full professional experience of Davide Aliti — architecture and technical leadership roles, key deliveries, and education, with the CV available as a PDF.',
  slug: 'resume',
})

const RESUME_URL = `${siteMetadata.siteUrl}/resume`

/**
 * Build the `ProfilePage` JSON-LD payload.
 *
 * Structured data is intentionally **English-only**: the page has a single URL
 * with a client-side language toggle, so emitting one stable form avoids telling
 * crawlers the same URL has two different sets of facts.
 *
 * Empty collections are omitted entirely rather than serialised as `[]`, which
 * would assert "this person has no education" instead of staying silent.
 */
function buildJsonLd(author: {
  name?: string
  occupation?: string
  linkedin?: string
  github?: string
  experience?: ExperienceEntry[]
  education?: EducationEntry[]
}) {
  const sameAs = [author.linkedin, author.github].filter(Boolean)

  const hasOccupation = sortExperience(author.experience ?? []).map((entry) => ({
    '@type': 'OccupationalExperience' as const,
    name: localize(entry.role, 'en'),
    ...(entry.company
      ? { employer: { '@type': 'Organization' as const, name: entry.company } }
      : {}),
    ...(entry.startDate ? { startDate: entry.startDate } : {}),
    ...(entry.endDate ? { endDate: entry.endDate } : {}),
  }))

  const alumniOf = sortEducation(author.education ?? []).map((entry) => ({
    '@type': 'EducationalOrganization' as const,
    name: entry.institution,
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: RESUME_URL,
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      ...(author.occupation ? { jobTitle: author.occupation } : {}),
      url: RESUME_URL,
      ...(sameAs.length ? { sameAs } : {}),
      ...(hasOccupation.length ? { hasOccupation } : {}),
      ...(alumniOf.length ? { alumniOf } : {}),
    },
  }
}

/**
 * The `/resume` page: an HTML rendering of the work history that was previously
 * only available inside `/static/cv/cv.pdf`.
 *
 * Mirrors `app/about/page.tsx` structurally — a plain (non-async) server
 * component reading `allAuthors`, wrapped in `SectionContainer`, with a single
 * flex column owning vertical rhythm so that `null`-returning sections collapse
 * their gaps instead of leaving blank bands.
 *
 * Certifications are deliberately absent: they live on `/about`, and duplicating
 * them across two indexable pages would compete for the same queries.
 */
export default function ResumePage() {
  const author = allAuthors.find((a) => a.slug === 'default')

  // Guard before anything else so a missing document cannot throw during the
  // static export, matching the behaviour of app/about/page.tsx.
  if (!author) return null

  const experience = (author.experience ?? []) as ExperienceEntry[]
  const education = (author.education ?? []) as EducationEntry[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd({ ...author, experience, education })),
        }}
      />

      <SectionContainer>
        <section className="mx-auto max-w-6xl px-6 py-12">
          {/*
           * Single owner of vertical rhythm. `flex` + `gap` (rather than
           * `space-y-*`) is deliberate: gaps collapse cleanly around sections
           * that render `null`, so an empty section leaves no dangling space.
           */}
          <div data-testid="resume-rhythm" className="flex flex-col gap-14 sm:gap-16 lg:gap-24">
            <div data-testid="resume-header">
              <ResumeHeader
                name={author.name}
                occupation={author.occupation}
                company={author.company}
                cv={author.cv}
              />
            </div>

            {experience.length ? (
              <div data-testid="resume-experience">
                <ExperienceTimeline items={experience} />
              </div>
            ) : null}

            {education.length ? (
              <div data-testid="resume-education">
                <EducationSection items={education} />
              </div>
            ) : null}
          </div>
        </section>
      </SectionContainer>
    </>
  )
}
