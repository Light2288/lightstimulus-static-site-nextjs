import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import ProjectsPreview from './ProjectsPreview'
import type { Project } from 'contentlayer/generated'

/**
 * Characterisation tests for `ProjectsPreview` — the "featured projects" block
 * on the home page.
 *
 * Documented behaviour:
 * - Unlike its sibling `BlogPreview`, it has **no empty guard**: with
 *   `projects={[]}` it still renders the `<section>`, the `home.projects.title`
 *   heading and the `/projects` "view all" link, followed by an empty grid.
 *   That asymmetry is asserted below rather than fixed (see file header note in
 *   the report).
 * - Otherwise it renders one `ProjectCardSmall` per project, keyed on `slug`,
 *   with `href={'/projects/' + slug}`.
 * - Bilingual `title` / `summary` fields are resolved as
 *   `p.<field>[lang] ?? p.<field>.en`, so a missing Italian value silently
 *   falls back to English.
 * - The heading rendered by `SectionHeader` and the per-card headings are both
 *   level 2, so the section header is not the only `h2` in the tree.
 *
 * `useLanguage` resolves the locale in a mount effect, so every
 * locale-dependent assertion is async.
 */

/** Midday UTC keeps the calendar day stable across CI timezones. */
const DATE = '2026-07-22T12:00:00.000Z'
const COVER = '/static/images/projects/certflow.png'

function makeProject(overrides: Partial<Project> = {}): Project {
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
    coverImage: undefined,
    readingTime: { minutes: 4 },
    slug: 'certflow',
    path: 'projects/certflow',
    filePath: 'projects/certflow.mdx',
    titleEn: 'CertFlow',
    summaryEn: 'An AI-augmented certification study platform.',
    structuredData: {},
    ...overrides,
  } as Project
}

const SECOND_PROJECT = makeProject({
  title: { en: 'Micelio', it: 'Micelio' },
  summary: {
    en: 'A SwiftUI companion for mushroom foraging.',
    it: 'Un compagno SwiftUI per la raccolta dei funghi.',
  },
  slug: 'micelio',
})

describe('ProjectsPreview', () => {
  describe('empty projects array', () => {
    it('still renders the section header (no empty guard, unlike BlogPreview)', async () => {
      renderWithProviders(<ProjectsPreview projects={[]} />)

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Featured Projects' })
      ).toBeInTheDocument()
    })

    it('still renders the view-all link', async () => {
      renderWithProviders(<ProjectsPreview projects={[]} />)

      expect(await screen.findByRole('link', { name: /View all projects/ })).toHaveAttribute(
        'href',
        '/projects'
      )
    })

    it('renders a section element with an empty card grid', async () => {
      const { container } = renderWithProviders(<ProjectsPreview projects={[]} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      })
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      // The grid wrapper is the second child of the section and has no cards.
      const grid = section?.lastElementChild
      expect(grid).not.toBeNull()
      expect(grid?.children).toHaveLength(0)
      expect(container.querySelectorAll('article')).toHaveLength(0)
    })
  })

  describe('with projects', () => {
    it('renders the section header for home.projects.title', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject()]} />)

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Featured Projects' })
      ).toBeInTheDocument()
    })

    it('appends the arrow glyph to the view-all label', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject()]} />)

      expect(await screen.findByText('View all projects →')).toBeInTheDocument()
    })

    it('renders one card per project', async () => {
      const { container } = renderWithProviders(
        <ProjectsPreview projects={[makeProject(), SECOND_PROJECT]} />
      )

      expect(await screen.findByRole('heading', { level: 2, name: 'CertFlow' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Micelio' })).toBeInTheDocument()
      expect(container.querySelectorAll('article')).toHaveLength(2)
    })

    it('counts the section header alongside the per-card headings at level 2', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject(), SECOND_PROJECT]} />)

      await waitFor(() => {
        // 1 section header + 2 card titles.
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
      })
    })

    it('links each card to /projects/<slug>', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject(), SECOND_PROJECT]} />)

      expect(await screen.findByRole('link', { name: 'CertFlow' })).toHaveAttribute(
        'href',
        '/projects/certflow'
      )
      expect(screen.getByRole('link', { name: 'Micelio' })).toHaveAttribute(
        'href',
        '/projects/micelio'
      )
    })

    it('renders the project summary', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject()]} />)

      expect(
        await screen.findByText('An AI-augmented certification study platform.')
      ).toBeInTheDocument()
    })

    it('forwards coverImage so the card renders its image', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject({ coverImage: COVER })]} />)

      expect(await screen.findByRole('img', { name: 'CertFlow' })).toBeInTheDocument()
    })

    it('renders no image when the project has no coverImage', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject()]} />)

      expect(await screen.findByRole('heading', { level: 2, name: 'CertFlow' })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders no date badge or tag list because neither prop is forwarded', async () => {
      const { container } = renderWithProviders(
        <ProjectsPreview
          projects={[
            makeProject({
              coverImage: COVER,
              tags: [{ id: 'ai', label: { en: 'AI', it: 'IA' } }],
            }),
          ]}
        />
      )

      expect(await screen.findByRole('img', { name: 'CertFlow' })).toBeInTheDocument()
      expect(container.querySelector('time')).not.toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      expect(screen.queryByText('AI')).not.toBeInTheDocument()
    })
  })

  describe('locales', () => {
    it('renders the English header and link label under locale "en"', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject()]} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Featured Projects' })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /View all projects/ })).toBeInTheDocument()
      expect(screen.getByText('An AI-augmented certification study platform.')).toBeInTheDocument()
    })

    it('renders the Italian header, link label and summary under locale "it"', async () => {
      renderWithProviders(<ProjectsPreview projects={[makeProject()]} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Progetti in evidenza' })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Vedi tutti i progetti/ })).toBeInTheDocument()
      expect(screen.getByText('Una piattaforma di studio potenziata dall’AI.')).toBeInTheDocument()
    })

    it('falls back to the English title/summary when the Italian value is missing', async () => {
      const project = makeProject({
        title: { en: 'English only title' },
        summary: { en: 'English only summary.' },
      })
      renderWithProviders(<ProjectsPreview projects={[project]} />, { locale: 'it' })

      // The header still switches to Italian, proving the locale did apply.
      expect(
        await screen.findByRole('heading', { level: 2, name: 'Progetti in evidenza' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 2, name: 'English only title' })
      ).toBeInTheDocument()
      expect(screen.getByText('English only summary.')).toBeInTheDocument()
    })
  })
})
