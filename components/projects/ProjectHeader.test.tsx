import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor, within } from '../../test/renderWithProviders'
import ProjectHeader from './ProjectHeader'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

/**
 * Characterisation tests for `ProjectHeader` — the cover image, title/summary,
 * tag row and three meta cards at the top of a project page.
 *
 * It takes the whole `project` (a `CoreContent<Project>`), not individual
 * fields.
 *
 * Documented behaviour:
 * - `title` / `summary` are bilingual JSON fields resolved as
 *   `project.<field>?.[lang] ?? project.<field>?.en`, so a missing Italian
 *   value silently falls back to English. The summary paragraph is gated on the
 *   resolved value being truthy.
 * - `coverImage` gates the hero image, which is always rendered with
 *   `priority` / `fetchpriority="high"` and the resolved title as its alt text.
 * - The tag row is gated on `project.tags && project.tags.length > 0`.
 * - The three meta cards are always rendered, each with a `role="heading"`
 *   `aria-level={2}` div (`projects.meta.details` / `.stack` / `.links`).
 * - Inside the details card, `projectType`, `status` and `date` rows are each
 *   individually gated. The values come from `projects.meta.types.<x>` and
 *   `projects.meta.statuses.<x>`; the date uses `toLocaleDateString(lang)`.
 * - The stack card lists `project.stack` when non-empty, otherwise renders an
 *   em dash (`—`).
 * - The links card always renders and delegates to `ProjectLinks` (covered in
 *   its own test file).
 *
 * Date formatting depends on the running Node build's ICU data, so only stable
 * substrings (the year) or values recomputed in the test are asserted.
 *
 * `useLanguage` applies the locale in a mount effect, so every
 * locale-dependent assertion is async.
 */

/** Midday UTC keeps the calendar day stable across CI timezones. */
const DATE = '2026-07-22T12:00:00.000Z'
/** A `/static/images/*.png` src makes `Image` take its `<picture>` branch. */
const COVER = '/static/images/projects/certflow.png'

function makeProject(overrides: Partial<CoreContent<Project>> = {}): CoreContent<Project> {
  return {
    type: 'Project',
    title: { en: 'CertFlow', it: 'CertFlow' },
    summary: {
      en: 'An AI-augmented certification study platform.',
      it: 'Una piattaforma di studio potenziata dall’AI.',
    },
    date: DATE,
    tags: [],
    stack: [],
    projectType: undefined,
    status: undefined,
    coverImage: undefined,
    links: undefined,
    readingTime: { minutes: 4 },
    slug: 'certflow',
    path: 'projects/certflow',
    filePath: 'projects/certflow.mdx',
    titleEn: 'CertFlow',
    summaryEn: 'An AI-augmented certification study platform.',
    structuredData: {},
    ...overrides,
  } as CoreContent<Project>
}

/** Locate one of the three meta cards by its `role="heading"` label. */
async function findCard(headingName: string) {
  const heading = await screen.findByRole('heading', { level: 2, name: headingName })
  const card = heading.parentElement
  if (!card) throw new Error(`No card found for heading "${headingName}"`)
  return card as HTMLElement
}

describe('ProjectHeader', () => {
  describe('title', () => {
    it('renders the localised title as the level-1 heading', async () => {
      renderWithProviders(
        <ProjectHeader project={makeProject({ title: { en: 'Micelio', it: 'Micelio IT' } })} />,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Micelio IT' })
      ).toBeInTheDocument()
    })

    it('renders the English title under locale "en"', async () => {
      renderWithProviders(
        <ProjectHeader project={makeProject({ title: { en: 'Micelio', it: 'Micelio IT' } })} />,
        { locale: 'en' }
      )

      expect(await screen.findByRole('heading', { level: 1, name: 'Micelio' })).toBeInTheDocument()
    })

    it('falls back to the English title when the Italian one is missing', async () => {
      renderWithProviders(
        <ProjectHeader project={makeProject({ title: { en: 'English only title' } })} />,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: 'English only title' })
      ).toBeInTheDocument()
    })
  })

  describe('summary', () => {
    it('renders the localised summary when present', async () => {
      renderWithProviders(<ProjectHeader project={makeProject()} />, { locale: 'it' })

      expect(
        await screen.findByText('Una piattaforma di studio potenziata dall’AI.')
      ).toBeInTheDocument()
    })

    it('falls back to the English summary when the Italian one is missing', async () => {
      renderWithProviders(
        <ProjectHeader project={makeProject({ summary: { en: 'English only summary.' } })} />,
        { locale: 'it' }
      )

      expect(await screen.findByText('English only summary.')).toBeInTheDocument()
    })

    it('omits the summary paragraph when the summary is absent', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ summary: undefined })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(
        screen.queryByText('An AI-augmented certification study platform.')
      ).not.toBeInTheDocument()
    })

    it('omits the summary paragraph when the summary resolves to an empty string', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ summary: { en: '' } })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(
        screen.queryByText('An AI-augmented certification study platform.')
      ).not.toBeInTheDocument()
    })
  })

  describe('cover image', () => {
    it('renders the hero image with the resolved title as alt text', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ coverImage: COVER })} />)

      expect(await screen.findByRole('img', { name: 'CertFlow' })).toBeInTheDocument()
    })

    it('marks the hero image as high fetch priority', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ coverImage: COVER })} />)

      expect(await screen.findByRole('img', { name: 'CertFlow' })).toHaveAttribute(
        'fetchpriority',
        'high'
      )
    })

    it('omits the hero image entirely when coverImage is absent', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ coverImage: undefined })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('tags', () => {
    const tags = [
      { id: 'nextjs', label: { en: 'Next.js', it: 'Next.js' } },
      { id: 'education', label: { en: 'Education', it: 'Formazione' } },
    ]

    it('renders a Tag per entry when tags is non-empty', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ tags })} />, { locale: 'en' })

      expect(await screen.findByText('Next.js')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('renders the Italian tag labels under locale "it"', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ tags })} />, { locale: 'it' })

      expect(await screen.findByText('Formazione')).toBeInTheDocument()
    })

    it('renders no tags when the array is empty', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ tags: [] })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByText('Education')).not.toBeInTheDocument()
    })

    it('does not throw when tags is undefined', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ tags: undefined })} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('meta card headings', () => {
    it('renders the three English card headings as aria-level 2 headings', async () => {
      renderWithProviders(<ProjectHeader project={makeProject()} />, { locale: 'en' })

      expect(await screen.findByRole('heading', { level: 2, name: 'Details' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Stack' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Links' })).toBeInTheDocument()
    })

    it('renders the three Italian card headings', async () => {
      renderWithProviders(<ProjectHeader project={makeProject()} />, { locale: 'it' })

      expect(await screen.findByRole('heading', { level: 2, name: 'Dettagli' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Stack' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Link' })).toBeInTheDocument()
    })
  })

  describe('projectType row', () => {
    it.each([
      ['research', 'Research'],
      ['experiment', 'Experiment'],
      ['prototype', 'Prototype'],
      ['product', 'Product'],
    ])('renders %s as "%s" in English', async (projectType, label) => {
      renderWithProviders(
        <ProjectHeader
          project={makeProject({ projectType: projectType as CoreContent<Project>['projectType'] })}
        />,
        { locale: 'en' }
      )

      const card = await findCard('Details')
      await waitFor(() => {
        expect(within(card).getByText('Type:')).toBeInTheDocument()
      })
      expect(within(card).getByText(label)).toBeInTheDocument()
    })

    it.each([
      ['research', 'Ricerca'],
      ['experiment', 'Esperimento'],
      ['prototype', 'Prototipo'],
      ['product', 'Prodotto'],
    ])('renders %s as "%s" in Italian', async (projectType, label) => {
      renderWithProviders(
        <ProjectHeader
          project={makeProject({ projectType: projectType as CoreContent<Project>['projectType'] })}
        />,
        { locale: 'it' }
      )

      const card = await findCard('Dettagli')
      await waitFor(() => {
        expect(within(card).getByText('Tipo:')).toBeInTheDocument()
      })
      expect(within(card).getByText(label)).toBeInTheDocument()
    })

    it('omits the type row when projectType is absent', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ projectType: undefined })} />, {
        locale: 'en',
      })

      const card = await findCard('Details')
      expect(within(card).queryByText('Type:')).not.toBeInTheDocument()
    })

    it('falls back to the raw translation key for an unmapped projectType', async () => {
      renderWithProviders(
        <ProjectHeader
          project={makeProject({
            projectType: 'unmapped' as CoreContent<Project>['projectType'],
          })}
        />,
        { locale: 'en' }
      )

      // `t()` returns the key itself when the lookup misses — no locale entry
      // exists for `projects.meta.types.unmapped`.
      expect(await screen.findByText('projects.meta.types.unmapped')).toBeInTheDocument()
    })
  })

  describe('status row', () => {
    it.each([
      ['concept', 'Concept'],
      ['in-progress', 'In progress'],
      ['completed', 'Completed'],
    ])('renders %s as "%s" in English', async (status, label) => {
      renderWithProviders(
        <ProjectHeader
          project={makeProject({ status: status as CoreContent<Project>['status'] })}
        />,
        { locale: 'en' }
      )

      const card = await findCard('Details')
      await waitFor(() => {
        expect(within(card).getByText('Status:')).toBeInTheDocument()
      })
      expect(within(card).getByText(label)).toBeInTheDocument()
    })

    it.each([
      ['concept', 'Concetto'],
      ['in-progress', 'In corso'],
      ['completed', 'Completato'],
    ])('renders %s as "%s" in Italian', async (status, label) => {
      renderWithProviders(
        <ProjectHeader
          project={makeProject({ status: status as CoreContent<Project>['status'] })}
        />,
        { locale: 'it' }
      )

      const card = await findCard('Dettagli')
      await waitFor(() => {
        expect(within(card).getByText('Stato:')).toBeInTheDocument()
      })
      expect(within(card).getByText(label)).toBeInTheDocument()
    })

    it('omits the status row when status is absent', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ status: undefined })} />, {
        locale: 'en',
      })

      const card = await findCard('Details')
      expect(within(card).queryByText('Status:')).not.toBeInTheDocument()
    })
  })

  describe('date row', () => {
    it('labels the date row and renders the year', async () => {
      renderWithProviders(<ProjectHeader project={makeProject()} />, { locale: 'en' })

      const card = await findCard('Details')
      await waitFor(() => {
        expect(within(card).getByText('Date:')).toBeInTheDocument()
      })
      expect(card).toHaveTextContent('2026')
    })

    it('formats the date with the English locale under locale "en"', async () => {
      renderWithProviders(<ProjectHeader project={makeProject()} />, { locale: 'en' })

      const card = await findCard('Details')
      await waitFor(() => {
        expect(within(card).getByText(new Date(DATE).toLocaleDateString('en'))).toBeInTheDocument()
      })
    })

    it('formats the date with the Italian locale under locale "it"', async () => {
      renderWithProviders(<ProjectHeader project={makeProject()} />, { locale: 'it' })

      const card = await findCard('Dettagli')
      await waitFor(() => {
        expect(within(card).getByText('Data:')).toBeInTheDocument()
      })
      expect(within(card).getByText(new Date(DATE).toLocaleDateString('it'))).toBeInTheDocument()
    })

    it('omits the date row when date is absent', async () => {
      renderWithProviders(
        <ProjectHeader project={makeProject({ date: undefined as unknown as string })} />,
        { locale: 'en' }
      )

      const card = await findCard('Details')
      expect(within(card).queryByText('Date:')).not.toBeInTheDocument()
    })

    it('does not render the visible date inside a <time> element', async () => {
      // Current behaviour: unlike the blog header / project cards, the project
      // date is a plain <span> with no machine-readable dateTime attribute.
      const { container } = renderWithProviders(<ProjectHeader project={makeProject()} />)

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(container.querySelector('time')).toBeNull()
    })
  })

  describe('stack card', () => {
    it('lists each stack entry when the stack is non-empty', async () => {
      renderWithProviders(
        <ProjectHeader project={makeProject({ stack: ['Next.js 16', 'React 19', 'Vitest'] })} />,
        { locale: 'en' }
      )

      const card = await findCard('Stack')
      const items = within(card).getAllByRole('listitem')
      expect(items).toHaveLength(3)
      expect(items.map((li) => li.textContent)).toEqual(['Next.js 16', 'React 19', 'Vitest'])
    })

    it('renders an em dash instead of a list when the stack is empty', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ stack: [] })} />, { locale: 'en' })

      const card = await findCard('Stack')
      expect(within(card).queryByRole('list')).not.toBeInTheDocument()
      expect(within(card).getByText('—')).toBeInTheDocument()
    })

    it('renders an em dash when the stack is undefined', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ stack: undefined })} />, {
        locale: 'en',
      })

      const card = await findCard('Stack')
      expect(within(card).getByText('—')).toBeInTheDocument()
    })

    it('keeps the em dash under the Italian locale (stack values are not translated)', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ stack: [] })} />, { locale: 'it' })

      const card = await findCard('Stack')
      expect(within(card).getByText('—')).toBeInTheDocument()
    })
  })

  describe('links card', () => {
    it('renders the delegated ProjectLinks list when links are present', async () => {
      renderWithProviders(
        <ProjectHeader
          project={makeProject({ links: { website: 'https://lightstimulus.dev' } })}
        />,
        { locale: 'en' }
      )

      const card = await findCard('Links')
      await waitFor(() => {
        expect(within(card).getByText('Website', { selector: 'span' })).toBeInTheDocument()
      })
      expect(within(card).getByRole('link')).toHaveAttribute('href', 'https://lightstimulus.dev')
    })

    it('renders the links card heading even when there are no links', async () => {
      renderWithProviders(<ProjectHeader project={makeProject({ links: undefined })} />, {
        locale: 'en',
      })

      const card = await findCard('Links')
      expect(within(card).queryByRole('list')).not.toBeInTheDocument()
      expect(within(card).queryByRole('link')).not.toBeInTheDocument()
    })
  })
})
