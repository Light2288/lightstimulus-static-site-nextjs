import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '../../test/renderWithProviders'
import { EducationSection } from './EducationSection'
import type { EducationEntry } from './resumeDates'
import en from '@/locales/en.json'
// Aliased so it cannot shadow Vitest's `it()`.
import itLocale from '@/locales/it.json'

/**
 * Behaviour tests for the education section.
 *
 * Education dates are *both* optional (unlike experience, where `startDate` is
 * required), so the "no usable date" path is a first-class case here rather than
 * an edge case — a bare separator would read as a rendering bug.
 */

const MASTER: EducationEntry = {
  id: 'master',
  degree: { en: "Master's Degree, Mathematical Engineering", it: 'Laurea Magistrale' },
  institution: 'Politecnico di Milano',
  location: { en: 'Milan, Italy', it: 'Milano, Italia' },
  endDate: '2013-12',
  notes: { en: 'Focus on applied mathematics.', it: 'Focus su matematica applicata.' },
}

const BACHELOR: EducationEntry = {
  id: 'bachelor',
  degree: { en: "Bachelor's Degree, Mathematical Engineering", it: 'Laurea Triennale' },
  institution: 'Politecnico di Milano',
  endDate: '2011-12',
}

function entries() {
  return screen.getAllByTestId('resume-education-entry')
}

/** See ExperienceTimeline.test.tsx: next-themes injects a <script>. */
function expectRenderedNothing(container: HTMLElement) {
  expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
}

describe('EducationSection', () => {
  describe('empty states', () => {
    it('renders nothing for an empty array', () => {
      const { container } = renderWithProviders(<EducationSection items={[]} />)

      expectRenderedNothing(container)
    })

    it('renders nothing when items is undefined', () => {
      const { container } = renderWithProviders(
        <EducationSection items={undefined as unknown as EducationEntry[]} />
      )

      expectRenderedNothing(container)
    })

    it('renders no residual heading', () => {
      renderWithProviders(<EducationSection items={[]} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('entry rendering', () => {
    it('renders one entry per item', () => {
      renderWithProviders(<EducationSection items={[MASTER, BACHELOR]} />)

      expect(entries()).toHaveLength(2)
    })

    it('displays the degree, institution, and date', async () => {
      renderWithProviders(<EducationSection items={[MASTER]} />)

      expect(await screen.findByText(/Master's Degree/)).toBeInTheDocument()
      expect(screen.getByText(/Politecnico di Milano/)).toBeInTheDocument()
      expect(screen.getByText(/2013/)).toBeInTheDocument()
    })

    it('renders the location when present', async () => {
      renderWithProviders(<EducationSection items={[MASTER]} />)

      expect(await screen.findByText(/Milan, Italy/)).toBeInTheDocument()
    })

    it('renders the notes when present', async () => {
      renderWithProviders(<EducationSection items={[MASTER]} />)

      expect(await screen.findByText(/Focus on applied mathematics/)).toBeInTheDocument()
    })

    it('marks entries up as list items', () => {
      renderWithProviders(<EducationSection items={[MASTER, BACHELOR]} />)

      expect(entries().every((entry) => entry.tagName === 'LI')).toBe(true)
    })
  })

  describe('ordering', () => {
    it('renders entries in reverse-chronological order', () => {
      // Passed oldest-first; the newest must lead.
      renderWithProviders(<EducationSection items={[BACHELOR, MASTER]} />)

      const [first, second] = entries()
      expect(within(first).getByText(/Master's Degree/)).toBeInTheDocument()
      expect(within(second).getByText(/Bachelor's Degree/)).toBeInTheDocument()
    })
  })

  describe('optional fields', () => {
    const bare: EducationEntry = {
      id: 'bare',
      degree: { en: 'Some Degree', it: 'Un Titolo' },
      institution: 'Some University',
    }

    it('omits the location when absent', () => {
      renderWithProviders(<EducationSection items={[bare]} />)

      expect(screen.queryByText(/Milan/)).not.toBeInTheDocument()
    })

    it('omits the notes when absent', () => {
      renderWithProviders(<EducationSection items={[bare]} />)

      expect(screen.queryByText(/Focus on/)).not.toBeInTheDocument()
    })

    it('renders no dangling separator when both dates are missing', async () => {
      renderWithProviders(<EducationSection items={[bare]} />)

      const entry = (await screen.findAllByTestId('resume-education-entry'))[0]
      expect(entry.textContent).not.toContain('–')
    })

    it('still renders the degree and institution', async () => {
      renderWithProviders(<EducationSection items={[bare]} />)

      expect(await screen.findByText('Some Degree')).toBeInTheDocument()
      expect(screen.getByText(/Some University/)).toBeInTheDocument()
    })
  })

  describe('bilingual rendering', () => {
    it('renders the English heading and degree', async () => {
      renderWithProviders(<EducationSection items={[MASTER]} />)

      expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
        en.resume.education.title
      )
    })

    it('renders the Italian heading and degree', async () => {
      renderWithProviders(<EducationSection items={[MASTER]} />, { locale: 'it' })

      expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
        itLocale.resume.education.title
      )
      expect(await screen.findByText('Laurea Magistrale')).toBeInTheDocument()
    })
  })

  describe('heading hierarchy', () => {
    it('renders the section heading as an h2', async () => {
      renderWithProviders(<EducationSection items={[MASTER]} />)

      expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('renders each degree as an h3', () => {
      renderWithProviders(<EducationSection items={[MASTER, BACHELOR]} />)

      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
    })

    it('renders no h1', () => {
      renderWithProviders(<EducationSection items={[MASTER]} />)

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })
  })

  describe('accessibility of decorative chrome', () => {
    it('hides the rail and dot markers from assistive technology', () => {
      const { container } = renderWithProviders(<EducationSection items={[MASTER, BACHELOR]} />)

      expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('resilient rendering', () => {
    it('renders both entries when ids are duplicated', () => {
      renderWithProviders(
        <EducationSection
          items={[
            { ...MASTER, id: 'dupe' },
            { ...BACHELOR, id: 'dupe' },
          ]}
        />
      )

      expect(entries()).toHaveLength(2)
    })

    it('falls back to English when the Italian degree is missing', async () => {
      const partial: EducationEntry = { ...MASTER, degree: { en: 'English Only' } }

      renderWithProviders(<EducationSection items={[partial]} />, { locale: 'it' })

      expect(await screen.findByText('English Only')).toBeInTheDocument()
    })

    it('never renders Invalid Date for a malformed date', () => {
      renderWithProviders(<EducationSection items={[{ ...MASTER, endDate: 'garbage' }]} />)

      expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    })
  })
})
