import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ThemeProviders } from '@/app/theme-providers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import siteMetadata from '@/data/siteMetadata'
import en from '@/locales/en.json'

/**
 * Composition tests for the Resume page.
 *
 * These cover what the per-component suites cannot: section *order*, the
 * deliberate absence of certifications, the JSON-LD payload, and the page-wide
 * heading hierarchy.
 *
 * ## Why the module is mocked the way it is
 * `contentlayer/generated` is a build artifact, so `allAuthors` is replaced with
 * a fixture (same approach as `app/about/page.test.tsx` and
 * `app/sitemap.test.ts`). A mutable `authorOverrides` lets each test reshape the
 * author to exercise the empty-section branches without re-mocking.
 *
 * The page is an async-free server component (it just reads `allAuthors`), so it
 * can be invoked as a plain function and its element tree rendered directly.
 */

const BASE_AUTHOR = {
  slug: 'default',
  name: 'Davide Aliti',
  occupation: 'Senior Application Architect',
  company: 'IBM',
  linkedin: 'https://www.linkedin.com/in/davide-aliti',
  github: 'https://github.com/Light2288',
  experience: [
    {
      id: 'current',
      role: { en: 'Strategy Leader', it: 'Responsabile Strategia' },
      company: 'IBM',
      startDate: '2025-04',
      highlights: [{ en: 'Drove transformation.', it: 'Ho guidato la trasformazione.' }],
    },
    {
      id: 'past',
      role: { en: 'Consultant', it: 'Consulente' },
      company: 'Acme',
      startDate: '2013-09',
      endDate: '2018-08',
    },
  ],
  education: [
    {
      id: 'master',
      degree: { en: "Master's Degree", it: 'Laurea Magistrale' },
      institution: 'Politecnico di Milano',
      endDate: '2013-12',
    },
  ],
  certifications: [{ title: 'AWS SAA', issuer: 'Amazon', year: 2024 }],
  cv: { url: '/static/cv/cv.pdf' },
}

/** Per-test author reshaping, applied on top of the base fixture. */
let authorOverrides: Record<string, unknown> = {}
/** Set to true to simulate no matching author document. */
let noAuthor = false

vi.mock('contentlayer/generated', () => ({
  get allAuthors() {
    if (noAuthor) return []
    return [{ ...BASE_AUTHOR, ...authorOverrides }]
  },
}))

beforeEach(() => {
  authorOverrides = {}
  noAuthor = false
})

async function renderResumePage() {
  const { default: ResumePage } = await import('./page')
  return render(
    <ThemeProviders>
      <LanguageProvider>{ResumePage()}</LanguageProvider>
    </ThemeProviders>
  )
}

/** Parse the page's JSON-LD payload. */
function readJsonLd(container: HTMLElement): Record<string, unknown> {
  const script = container.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  return JSON.parse(script!.textContent || '{}')
}

describe('Resume page', () => {
  describe('metadata', () => {
    it('exports metadata with a title', async () => {
      const { metadata } = await import('./page')

      expect(metadata.title).toBeTruthy()
    })

    it('points the canonical/OG url at the resume slug', async () => {
      const { metadata } = await import('./page')

      expect(metadata.openGraph?.url).toBe(`${siteMetadata.siteUrl}/resume`)
    })

    it('provides a description', async () => {
      const { metadata } = await import('./page')

      expect(metadata.description).toBeTruthy()
    })
  })

  describe('composition', () => {
    it('renders the header, experience, and education sections', async () => {
      await renderResumePage()

      expect(screen.getByTestId('resume-header')).toBeInTheDocument()
      expect(screen.getByTestId('resume-experience')).toBeInTheDocument()
      expect(screen.getByTestId('resume-education')).toBeInTheDocument()
    })

    it('orders the sections header, experience, then education', async () => {
      await renderResumePage()

      const header = screen.getByTestId('resume-header')
      const experience = screen.getByTestId('resume-experience')
      const education = screen.getByTestId('resume-education')

      expect(header.compareDocumentPosition(experience)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      expect(experience.compareDocumentPosition(education)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('owns vertical rhythm in a single flex column', async () => {
      await renderResumePage()

      const rhythm = screen.getByTestId('resume-rhythm')
      expect(rhythm.className).toMatch(/flex/)
      expect(rhythm.className).toMatch(/flex-col/)
      expect(rhythm.className).toMatch(/gap-/)
    })

    it('does not render certifications, which stay on /about', async () => {
      await renderResumePage()

      expect(screen.queryByText('AWS SAA')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: en.about.certifications.title })
      ).not.toBeInTheDocument()
    })
  })

  describe('content rendering', () => {
    it('renders the experience entries', async () => {
      await renderResumePage()

      expect(await screen.findByText('Strategy Leader')).toBeInTheDocument()
      expect(screen.getByText('Consultant')).toBeInTheDocument()
    })

    it('renders the education entries', async () => {
      await renderResumePage()

      expect(await screen.findByText("Master's Degree")).toBeInTheDocument()
    })

    it('renders the CV download link', async () => {
      await renderResumePage()

      const link = await screen.findByRole('link', { name: en.resume.cv.download })
      expect(link).toHaveAttribute('href', '/static/cv/cv.pdf')
    })
  })

  describe('graceful degradation', () => {
    it('returns null when no author document matches', async () => {
      noAuthor = true
      const { container } = await renderResumePage()

      // Only next-themes' injected script remains.
      expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
    })

    it('renders the header when experience and education are empty', async () => {
      authorOverrides = { experience: [], education: [] }
      await renderResumePage()

      expect(screen.getByTestId('resume-header')).toBeInTheDocument()
      expect(screen.queryByTestId('resume-experience')).not.toBeInTheDocument()
      expect(screen.queryByTestId('resume-education')).not.toBeInTheDocument()
    })

    it('renders without crashing when experience and education are absent', async () => {
      authorOverrides = { experience: undefined, education: undefined }
      await renderResumePage()

      expect(screen.getByTestId('resume-header')).toBeInTheDocument()
    })

    it('renders the header without a CV asset', async () => {
      authorOverrides = { cv: undefined }
      await renderResumePage()

      expect(screen.getByTestId('resume-header')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: en.resume.cv.download })).not.toBeInTheDocument()
    })
  })

  describe('JSON-LD structured data', () => {
    it('emits a ProfilePage', async () => {
      const { container } = await renderResumePage()

      const jsonLd = readJsonLd(container)
      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(jsonLd['@type']).toBe('ProfilePage')
    })

    it('describes a Person as the main entity', async () => {
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      expect(person['@type']).toBe('Person')
      expect(person.name).toBe('Davide Aliti')
      expect(person.jobTitle).toBe('Senior Application Architect')
      expect(person.url).toBe(`${siteMetadata.siteUrl}/resume`)
    })

    it('lists the social profiles in sameAs', async () => {
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      expect(person.sameAs).toEqual(
        expect.arrayContaining([BASE_AUTHOR.linkedin, BASE_AUTHOR.github])
      )
    })

    it('derives hasOccupation from the experience entries', async () => {
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      const occupations = person.hasOccupation as Record<string, unknown>[]

      expect(occupations).toHaveLength(2)
      expect(occupations.map((entry) => entry.name)).toEqual(
        expect.arrayContaining(['Strategy Leader', 'Consultant'])
      )
    })

    it('derives alumniOf from the education entries', async () => {
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      const alumniOf = person.alumniOf as Record<string, unknown>[]

      expect(alumniOf).toHaveLength(1)
      expect(alumniOf[0].name).toBe('Politecnico di Milano')
      expect(alumniOf[0]['@type']).toBe('EducationalOrganization')
    })

    it('omits hasOccupation and alumniOf when the arrays are empty', async () => {
      authorOverrides = { experience: [], education: [] }
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      expect(person).not.toHaveProperty('hasOccupation')
      expect(person).not.toHaveProperty('alumniOf')
    })

    it('omits sameAs when no social profiles exist', async () => {
      authorOverrides = { linkedin: undefined, github: undefined }
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      expect(person).not.toHaveProperty('sameAs')
    })

    it('uses English role names regardless of the active language', async () => {
      // Structured data is not language-toggled; crawlers get one stable form.
      const { container } = await renderResumePage()

      const person = readJsonLd(container).mainEntity as Record<string, unknown>
      const occupations = person.hasOccupation as Record<string, unknown>[]

      expect(occupations.map((entry) => entry.name)).not.toContain('Responsabile Strategia')
    })
  })

  describe('heading hierarchy', () => {
    it('renders exactly one h1', async () => {
      await renderResumePage()

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })

    it('renders the section headings as h2s', async () => {
      await renderResumePage()

      const level2 = screen.getAllByRole('heading', { level: 2 })
      expect(level2.map((heading) => heading.textContent)).toEqual(
        expect.arrayContaining([en.resume.experience.title, en.resume.education.title])
      )
    })

    it('skips no heading levels between h1 and h3', async () => {
      await renderResumePage()

      const levels = screen
        .getAllByRole('heading')
        .map((heading) => Number(heading.tagName.replace('H', '')))
      const unique = Array.from(new Set(levels)).sort()

      expect(unique).toEqual([1, 2, 3])
    })

    it('nests entry headings inside their sections', async () => {
      await renderResumePage()

      const experience = screen.getByTestId('resume-experience')
      expect(within(experience).getAllByRole('heading', { level: 3 })).toHaveLength(2)
    })
  })
})
