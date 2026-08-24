import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '../../test/renderWithProviders'
import { ExperienceTimeline } from './ExperienceTimeline'
import type { ExperienceEntry } from './resumeDates'
import en from '@/locales/en.json'
// Aliased: a bare `it` import would shadow Vitest's `it()`. The same convention
// is used in locales/locales.test.ts.
import itLocale from '@/locales/it.json'

/**
 * Behaviour tests for the experience timeline.
 *
 * The emphasis is on the contracts a future refactor could silently break:
 * semantic list markup, decorative chrome hidden from assistive technology,
 * conditional rendering of every optional field, and sort order being owned by
 * the component rather than by frontmatter order.
 */

const CURRENT: ExperienceEntry = {
  id: 'current-role',
  role: { en: 'Strategy Leader', it: 'Responsabile Strategia' },
  company: 'IBM',
  location: { en: 'Milan, Italy', it: 'Milano, Italia' },
  startDate: '2025-04',
  highlights: [{ en: 'Drove transformation.', it: 'Ho guidato la trasformazione.' }],
  stack: ['Architecture'],
}

const PAST: ExperienceEntry = {
  id: 'past-role',
  role: { en: 'Consultant', it: 'Consulente' },
  company: 'Acme',
  startDate: '2013-09',
  endDate: '2018-08',
  highlights: [
    { en: 'Shipped a banking app.', it: 'Ho rilasciato un’app bancaria.' },
    { en: 'Built risk tooling.', it: 'Ho realizzato strumenti di risk.' },
  ],
}

/**
 * The timeline's own entries.
 *
 * Scoped to the entries list rather than `getAllByRole('listitem')`, because
 * highlights and stack badges are themselves list items and would otherwise be
 * counted as roles.
 */
function entries() {
  return screen.getAllByTestId('resume-experience-entry')
}

/**
 * Assert the component contributed no markup.
 *
 * `ThemeProviders` (next-themes) injects a no-flash `<script>` into the render
 * container, so the container is never literally empty. Same convention as
 * components/about/FocusAreas.test.tsx.
 */
function expectRenderedNothing(container: HTMLElement) {
  expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
}

describe('ExperienceTimeline', () => {
  describe('empty states', () => {
    it('renders nothing for an empty array', () => {
      const { container } = renderWithProviders(<ExperienceTimeline items={[]} />)

      expectRenderedNothing(container)
    })

    it('renders nothing when items is undefined', () => {
      const { container } = renderWithProviders(
        <ExperienceTimeline items={undefined as unknown as ExperienceEntry[]} />
      )

      expectRenderedNothing(container)
    })

    it('renders no heading when there is nothing to show', () => {
      renderWithProviders(<ExperienceTimeline items={[]} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('entry rendering', () => {
    it('renders one list item per entry', () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT, PAST]} />)

      expect(entries()).toHaveLength(2)
    })

    it('marks the entries up as a real list', () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT, PAST]} />)

      const list = screen.getByTestId('resume-experience-entries')
      expect(list.tagName).toBe('UL')
      // Every entry must be a direct child `<li>` of that list.
      expect(entries().every((entry) => entry.tagName === 'LI')).toBe(true)
      expect(entries().every((entry) => entry.parentElement === list)).toBe(true)
    })

    it('displays the role, company, and date range', async () => {
      renderWithProviders(<ExperienceTimeline items={[PAST]} />)

      expect(await screen.findByText('Consultant')).toBeInTheDocument()
      expect(screen.getByText(/Acme/)).toBeInTheDocument()
      expect(screen.getByText(/2013/)).toBeInTheDocument()
      expect(screen.getByText(/2018/)).toBeInTheDocument()
    })

    it('renders the highlights as a nested list', async () => {
      renderWithProviders(<ExperienceTimeline items={[PAST]} />)

      expect(await screen.findByText('Shipped a banking app.')).toBeInTheDocument()
      expect(screen.getByText('Built risk tooling.')).toBeInTheDocument()
    })

    it('renders the location when present', async () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />)

      expect(await screen.findByText(/Milan, Italy/)).toBeInTheDocument()
    })

    it('renders the stack entries when present', async () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />)

      expect(await screen.findByText('Architecture')).toBeInTheDocument()
    })
  })

  describe('current vs completed roles', () => {
    it('labels a role with no endDate using the English present label', async () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />)

      expect(await screen.findByText(new RegExp(en.resume.present))).toBeInTheDocument()
    })

    it('labels a current role in Italian', async () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />, { locale: 'it' })

      expect(await screen.findByText(new RegExp(itLocale.resume.present))).toBeInTheDocument()
    })

    it('does not use the present label for a completed role', () => {
      renderWithProviders(<ExperienceTimeline items={[PAST]} />)

      expect(screen.queryByText(new RegExp(en.resume.present))).not.toBeInTheDocument()
    })
  })

  describe('ordering', () => {
    it('sorts entries rather than trusting frontmatter order', () => {
      // PAST is passed first, but the ongoing role must lead.
      renderWithProviders(<ExperienceTimeline items={[PAST, CURRENT]} />)

      const [first, second] = entries()
      expect(within(first).getByText('Strategy Leader')).toBeInTheDocument()
      expect(within(second).getByText('Consultant')).toBeInTheDocument()
    })
  })

  describe('optional fields are omitted when absent', () => {
    const bare: ExperienceEntry = {
      id: 'bare',
      role: { en: 'Engineer', it: 'Ingegnere' },
      company: 'Bare Co',
      startDate: '2020-01',
      endDate: '2021-01',
    }

    it('renders no highlights list when highlights are missing', () => {
      renderWithProviders(<ExperienceTimeline items={[bare]} />)

      expect(screen.queryByTestId('resume-highlights')).not.toBeInTheDocument()
    })

    it('renders no location when absent', () => {
      renderWithProviders(<ExperienceTimeline items={[bare]} />)

      expect(screen.queryByText(/Milan/)).not.toBeInTheDocument()
    })

    it('renders no company link when url is absent', () => {
      renderWithProviders(<ExperienceTimeline items={[bare]} />)

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('still renders role, company, and dates', async () => {
      renderWithProviders(<ExperienceTimeline items={[bare]} />)

      expect(await screen.findByText('Engineer')).toBeInTheDocument()
      expect(screen.getByText(/Bare Co/)).toBeInTheDocument()
    })
  })

  describe('external company link', () => {
    const linked: ExperienceEntry = { ...PAST, url: 'https://example.com' }

    it('renders a link to the company url', async () => {
      renderWithProviders(<ExperienceTimeline items={[linked]} />)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('opens external links safely', async () => {
      renderWithProviders(<ExperienceTimeline items={[linked]} />)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    })

    it('exposes a visible focus ring', async () => {
      renderWithProviders(<ExperienceTimeline items={[linked]} />)

      const link = await screen.findByRole('link')
      expect(link.className).toMatch(/focus-visible:/)
    })
  })

  describe('heading hierarchy', () => {
    it('renders the section heading as an h2', async () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />)

      const heading = await screen.findByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent(en.resume.experience.title)
    })

    it('renders each entry role as an h3', () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT, PAST]} />)

      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
    })

    it('renders no h1, leaving that to the page', () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />)

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it('translates the section heading', async () => {
      renderWithProviders(<ExperienceTimeline items={[CURRENT]} />, { locale: 'it' })

      expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
        itLocale.resume.experience.title
      )
    })
  })

  describe('accessibility of decorative chrome', () => {
    it('hides the rail and dot markers from assistive technology', () => {
      const { container } = renderWithProviders(<ExperienceTimeline items={[CURRENT, PAST]} />)

      // Every decorative element must be explicitly hidden; there is at least
      // the rail plus one dot per entry.
      const hidden = container.querySelectorAll('[aria-hidden="true"]')
      expect(hidden.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('resilient rendering', () => {
    it('renders both entries when ids are duplicated', () => {
      const a: ExperienceEntry = { ...PAST, id: 'dupe' }
      const b: ExperienceEntry = { ...CURRENT, id: 'dupe' }

      renderWithProviders(<ExperienceTimeline items={[a, b]} />)

      expect(entries()).toHaveLength(2)
    })

    it('renders an entry whose id is missing', () => {
      const noId = { ...PAST, id: undefined } as unknown as ExperienceEntry

      renderWithProviders(<ExperienceTimeline items={[noId]} />)

      expect(entries()).toHaveLength(1)
    })

    it('renders a malformed date as raw text instead of Invalid Date', async () => {
      const broken: ExperienceEntry = { ...PAST, startDate: 'garbage', endDate: undefined }

      renderWithProviders(<ExperienceTimeline items={[broken]} />)

      expect(await screen.findByText(/garbage/)).toBeInTheDocument()
      expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    })

    it('falls back to English when the Italian role is missing', async () => {
      const partial: ExperienceEntry = {
        ...PAST,
        role: { en: 'English Only' },
      }

      renderWithProviders(<ExperienceTimeline items={[partial]} />, { locale: 'it' })

      expect(await screen.findByText('English Only')).toBeInTheDocument()
    })
  })

  describe('long content', () => {
    it('allows long text to wrap inside the card', async () => {
      const long: ExperienceEntry = {
        ...PAST,
        role: { en: 'A'.repeat(120), it: 'A'.repeat(120) },
      }

      renderWithProviders(<ExperienceTimeline items={[long]} />)

      const heading = await screen.findByRole('heading', { level: 3 })
      expect(heading.className).toMatch(/break-words|wrap/)
    })
  })
})
