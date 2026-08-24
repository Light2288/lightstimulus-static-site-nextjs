import { describe, it, expect, afterEach } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { mockReducedMotion, resetMatchMedia } from '../../test/mockMatchMedia'
import { ExperienceTimeline } from './ExperienceTimeline'
import { EducationSection } from './EducationSection'
import { ResumeHeader } from './ResumeHeader'
import type { ExperienceEntry, EducationEntry } from './resumeDates'
import en from '@/locales/en.json'
// Aliased so it cannot shadow Vitest's `it()`.
import itLocale from '@/locales/it.json'

/**
 * Cross-component contract tests for the resume sections.
 *
 * These cover two properties no single component suite can assert on its own:
 *
 * 1. **Complete bilingual coverage.** A missing translation key is invisible at
 *    runtime because `t()` silently returns the key itself, so the assertions
 *    below check that no rendered text is a raw `resume.*` key and that Italian
 *    output actually differs from English.
 * 2. **Reduced-motion safety.** Damping is enforced globally by the
 *    `@media (prefers-reduced-motion: reduce)` block in `css/tailwind.css`
 *    (which tames every animation and transition site-wide), so these
 *    components deliberately add no per-instance `useReducedMotion()` guard.
 *    What matters is therefore that they still render their full content when
 *    reduced motion is requested — that the animation wrapper never becomes a
 *    precondition for the content appearing.
 */

const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'current',
    role: { en: 'Strategy Leader', it: 'Responsabile Strategia' },
    company: 'IBM',
    location: { en: 'Milan, Italy', it: 'Milano, Italia' },
    startDate: '2025-04',
    highlights: [{ en: 'Drove transformation.', it: 'Ho guidato la trasformazione.' }],
    stack: ['Architecture'],
  },
  {
    id: 'past',
    role: { en: 'Consultant', it: 'Consulente' },
    company: 'Acme',
    startDate: '2013-09',
    endDate: '2018-08',
    highlights: [{ en: 'Shipped an app.', it: 'Ho rilasciato un’app.' }],
  },
]

const EDUCATION: EducationEntry[] = [
  {
    id: 'master',
    degree: { en: "Master's Degree", it: 'Laurea Magistrale' },
    institution: 'Politecnico di Milano',
    endDate: '2013-12',
    notes: { en: 'Applied mathematics.', it: 'Matematica applicata.' },
  },
]

/** All three sections together, as the page composes them. */
function ResumeSections() {
  return (
    <>
      <ResumeHeader name="Davide Aliti" occupation="Architect" cv={{ url: '/static/cv/cv.pdf' }} />
      <ExperienceTimeline items={EXPERIENCE} />
      <EducationSection items={EDUCATION} />
    </>
  )
}

afterEach(() => {
  resetMatchMedia()
})

describe('resume bilingual rendering', () => {
  describe('English', () => {
    it('renders the English section headings', async () => {
      renderWithProviders(<ResumeSections />)

      expect(await screen.findByText(en.resume.experience.title)).toBeInTheDocument()
      expect(screen.getByText(en.resume.education.title)).toBeInTheDocument()
    })

    it('renders English entry content', async () => {
      renderWithProviders(<ResumeSections />)

      expect(await screen.findByText('Strategy Leader')).toBeInTheDocument()
      expect(screen.getByText('Drove transformation.')).toBeInTheDocument()
      expect(screen.getByText("Master's Degree")).toBeInTheDocument()
    })
  })

  describe('Italian', () => {
    it('renders the Italian section headings', async () => {
      renderWithProviders(<ResumeSections />, { locale: 'it' })

      expect(await screen.findByText(itLocale.resume.experience.title)).toBeInTheDocument()
      expect(screen.getByText(itLocale.resume.education.title)).toBeInTheDocument()
    })

    it('renders Italian entry content', async () => {
      renderWithProviders(<ResumeSections />, { locale: 'it' })

      expect(await screen.findByText('Responsabile Strategia')).toBeInTheDocument()
      expect(screen.getByText('Ho guidato la trasformazione.')).toBeInTheDocument()
      expect(screen.getByText('Laurea Magistrale')).toBeInTheDocument()
    })

    it('renders the Italian present label and download action', async () => {
      renderWithProviders(<ResumeSections />, { locale: 'it' })

      expect(await screen.findByText(new RegExp(itLocale.resume.present))).toBeInTheDocument()
      expect(screen.getByRole('link', { name: itLocale.resume.cv.download })).toBeInTheDocument()
    })

    it('leaves no English section heading behind', async () => {
      renderWithProviders(<ResumeSections />, { locale: 'it' })

      // Wait for the locale effect to settle before asserting an absence.
      await screen.findByText(itLocale.resume.experience.title)

      expect(screen.queryByText(en.resume.experience.title)).not.toBeInTheDocument()
      expect(screen.queryByText(en.resume.education.title)).not.toBeInTheDocument()
    })

    it('leaves no English entry content behind', async () => {
      renderWithProviders(<ResumeSections />, { locale: 'it' })

      await screen.findByText('Responsabile Strategia')

      expect(screen.queryByText('Strategy Leader')).not.toBeInTheDocument()
      expect(screen.queryByText('Drove transformation.')).not.toBeInTheDocument()
    })
  })

  describe('no untranslated keys leak into the DOM', () => {
    it.each([['en'], ['it']] as const)('renders no raw resume.* key in %s', async (locale) => {
      const { container } = renderWithProviders(<ResumeSections />, { locale })

      await screen.findByText(
        locale === 'en' ? en.resume.experience.title : itLocale.resume.experience.title
      )

      // `t()` returns the key verbatim when a translation is missing, so the
      // presence of "resume." anywhere in the text is a missing-key signal.
      expect(container.textContent).not.toMatch(/resume\.[a-z_.]+/i)
    })
  })

  describe('missing translation fallback', () => {
    it('falls back to English when an Italian role is missing', async () => {
      const partial: ExperienceEntry[] = [{ ...EXPERIENCE[0], role: { en: 'English Only Role' } }]

      renderWithProviders(<ExperienceTimeline items={partial} />, { locale: 'it' })

      expect(await screen.findByText('English Only Role')).toBeInTheDocument()
    })

    it('renders no literal undefined when a translation is absent', async () => {
      const partial: ExperienceEntry[] = [
        { ...EXPERIENCE[0], role: { en: 'Role' }, highlights: [{ en: 'Highlight' }] },
      ]

      const { container } = renderWithProviders(<ExperienceTimeline items={partial} />, {
        locale: 'it',
      })

      await screen.findByText('Role')
      expect(container.textContent).not.toContain('undefined')
    })
  })
})

describe('resume reduced-motion behaviour', () => {
  it('renders the full timeline when reduced motion is requested', async () => {
    mockReducedMotion()

    renderWithProviders(<ExperienceTimeline items={EXPERIENCE} />)

    expect(await screen.findByText('Strategy Leader')).toBeInTheDocument()
    expect(screen.getByText('Consultant')).toBeInTheDocument()
    expect(screen.getAllByTestId('resume-experience-entry')).toHaveLength(2)
  })

  it('renders the education section when reduced motion is requested', async () => {
    mockReducedMotion()

    renderWithProviders(<EducationSection items={EDUCATION} />)

    expect(await screen.findByText("Master's Degree")).toBeInTheDocument()
  })

  it('keeps the header and its download action under reduced motion', async () => {
    mockReducedMotion()

    renderWithProviders(<ResumeHeader name="Davide Aliti" cv={{ url: '/static/cv/cv.pdf' }} />)

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.resume.cv.download })).toBeInTheDocument()
  })

  it('still renders highlights and stack badges under reduced motion', async () => {
    mockReducedMotion()

    renderWithProviders(<ExperienceTimeline items={EXPERIENCE} />)

    expect(await screen.findByText('Drove transformation.')).toBeInTheDocument()
    expect(screen.getByText('Architecture')).toBeInTheDocument()
  })
})
