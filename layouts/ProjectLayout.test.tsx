import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '../test/renderWithProviders'
import ProjectLayout from './ProjectLayout'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

/**
 * Characterisation tests for `ProjectLayout` — the server component that
 * composes a single project page.
 *
 * It is a pure composition shell:
 * `SectionContainer` (`<section>`) → `ScrollTopAndComment` → `<article>` →
 * `ProjectHeader` → prose-wrapped `children` → `ProjectLayoutClient`
 * (the "back to projects" footer).
 *
 * Everything localised (title, summary, tags, meta cards, back label) comes
 * from the client children, which have their own test files. What is pinned
 * here is the wiring:
 *
 * - `content` is forwarded to `ProjectHeader` as its `project` prop.
 * - `children` are rendered untouched inside the prose container, between the
 *   header and the footer.
 * - `ProjectLayoutClient` takes no props and always renders one `/projects`
 *   link, so the back link is unconditional.
 * - Unlike `BlogPostLayout`, `ScrollTopAndComment` sits *inside* the
 *   `SectionContainer` section (but outside the `<article>`).
 *
 * Notes on the environment:
 * - `siteMetadata.comments` is commented out in `data/siteMetadata.js`, so
 *   `ScrollTopAndComment` renders only the "Scroll To Top" button.
 * - `useLanguage` applies the locale in a mount effect, so every
 *   locale-dependent assertion is async.
 * - Dates go through `toLocaleDateString(lang)`; only the year (stable across
 *   ICU builds) is asserted.
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

const Body = () => (
  <>
    <h2>What it does</h2>
    <p>The rendered MDX project body.</p>
  </>
)

describe('ProjectLayout', () => {
  describe('composition', () => {
    it('renders the header, the children and the back link together', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      // ProjectHeader
      expect(await screen.findByRole('heading', { level: 1, name: 'CertFlow' })).toBeInTheDocument()
      // children
      expect(screen.getByText('The rendered MDX project body.')).toBeInTheDocument()
      // ProjectLayoutClient
      expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
        'href',
        '/projects'
      )
    })

    it('wraps the whole page in a SectionContainer <section>', async () => {
      const { container } = renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>
      )

      await screen.findByRole('heading', { level: 1 })
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      expect(section).toHaveClass('mx-auto', 'w-full', 'max-w-5xl')
      expect(section?.contains(screen.getByRole('article'))).toBe(true)
    })

    it('renders the header, prose wrapper and footer as the article children in order', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>
      )

      await screen.findByRole('heading', { level: 1 })
      const article = screen.getByRole('article')
      expect(Array.from(article.children).map((el) => el.tagName)).toEqual([
        'HEADER',
        'DIV',
        'FOOTER',
      ])
    })

    it('renders the ScrollTopAndComment control inside the section but outside the article', async () => {
      const { container } = renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>
      )

      const scrollTop = await screen.findByRole('button', { name: 'Scroll To Top' })
      const section = container.querySelector('section') as HTMLElement
      expect(section.contains(scrollTop)).toBe(true)
      expect(screen.getByRole('article').contains(scrollTop)).toBe(false)
    })

    it('renders no "Scroll To Comment" button because no comments provider is configured', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>
      )

      expect(await screen.findByRole('button', { name: 'Scroll To Top' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Scroll To Comment' })).not.toBeInTheDocument()
    })
  })

  describe('children', () => {
    it('renders arbitrary JSX children inside the prose container', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <div data-testid="mdx-body">
            <p>First paragraph.</p>
            <p>Second paragraph.</p>
          </div>
        </ProjectLayout>
      )

      const body = await screen.findByTestId('mdx-body')
      expect(body.parentElement).toHaveClass('prose')
      expect(within(body).getByText('First paragraph.')).toBeInTheDocument()
      expect(within(body).getByText('Second paragraph.')).toBeInTheDocument()
    })

    it('renders headings coming from the children as level-2 headings', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>
      )

      expect(
        await screen.findByRole('heading', { level: 2, name: 'What it does' })
      ).toBeInTheDocument()
    })

    it('places the children between the header and the back-link footer', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      const heading = await screen.findByRole('heading', { level: 1, name: 'CertFlow' })
      const body = screen.getByText('The rendered MDX project body.')
      const backLink = screen.getByRole('link', { name: 'Back to projects' })

      expect(heading.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(body.compareDocumentPosition(backLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('renders the prose container even when children are empty', async () => {
      const { container } = renderWithProviders(
        <ProjectLayout content={makeProject()}>{null}</ProjectLayout>
      )

      await screen.findByRole('heading', { level: 1 })
      const prose = container.querySelector('.prose')
      expect(prose).toBeInTheDocument()
      expect(prose?.childElementCount).toBe(0)
    })
  })

  describe('content forwarded to ProjectHeader', () => {
    it('renders the localised title and summary', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject({ title: { en: 'Micelio', it: 'Micelio IT' } })}>
          <Body />
        </ProjectLayout>,
        { locale: 'it' }
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Micelio IT' })
      ).toBeInTheDocument()
      expect(screen.getByText('Una piattaforma di studio potenziata dall’AI.')).toBeInTheDocument()
    })

    it('renders the cover image with the resolved title as alt text', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject({ coverImage: COVER })}>
          <Body />
        </ProjectLayout>
      )

      expect(await screen.findByRole('img', { name: 'CertFlow' })).toBeInTheDocument()
    })

    it('renders no image when the project has no cover image', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject({ coverImage: undefined })}>
          <Body />
        </ProjectLayout>
      )

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders the three meta card headings from the header', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      expect(await screen.findByRole('heading', { level: 2, name: 'Details' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Stack' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Links' })).toBeInTheDocument()
    })

    it('renders the project tags and the stack list from the header', async () => {
      renderWithProviders(
        <ProjectLayout
          content={makeProject({
            tags: [{ id: 'nextjs', label: { en: 'Next.js', it: 'Next.js' } }],
            stack: ['Next.js 16', 'Vitest'],
          })}
        >
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      expect(await screen.findByText('Next.js')).toBeInTheDocument()
      expect(screen.getByText('Next.js 16')).toBeInTheDocument()
      expect(screen.getByText('Vitest')).toBeInTheDocument()
    })

    it('renders the project date year from the header', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      const detailsCard = (await screen.findByRole('heading', { level: 2, name: 'Details' }))
        .parentElement as HTMLElement
      expect(detailsCard).toHaveTextContent('2026')
    })
  })

  describe('back link', () => {
    it('renders exactly one link when the project has no external links', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject({ links: undefined })}>
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      const links = await screen.findAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute('href', '/projects')
    })

    it('renders the back link inside the article footer', async () => {
      const { container } = renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>
      )

      await screen.findByRole('heading', { level: 1 })
      const footer = container.querySelector('article > footer')
      expect(footer).toBeInTheDocument()
      expect(footer?.querySelector('a')).toHaveAttribute('href', '/projects')
    })

    it('localises the back link label', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject()}>
          <Body />
        </ProjectLayout>,
        { locale: 'it' }
      )

      const link = await screen.findByRole('link', { name: 'Torna ai progetti' })
      expect(link).toHaveTextContent('← Torna ai progetti')
    })

    it('coexists with the external project links rendered by the header', async () => {
      renderWithProviders(
        <ProjectLayout content={makeProject({ links: { website: 'https://lightstimulus.dev' } })}>
          <Body />
        </ProjectLayout>,
        { locale: 'en' }
      )

      const backLink = await screen.findByRole('link', { name: 'Back to projects' })
      expect(backLink).toHaveAttribute('href', '/projects')

      const links = screen.getAllByRole('link')
      expect(links.map((a) => a.getAttribute('href'))).toEqual([
        'https://lightstimulus.dev',
        '/projects',
      ])
    })
  })
})
