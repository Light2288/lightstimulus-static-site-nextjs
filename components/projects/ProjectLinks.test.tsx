import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import ProjectLinks from './ProjectLinks'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

/**
 * Characterisation tests for `ProjectLinks` — the external-links list inside a
 * project's meta cards.
 *
 * The component takes the whole `project` (not a `links` prop) and reads
 * `project.links`, a free-form JSON frontmatter object.
 *
 * Documented behaviour:
 * - Returns `null` when `project.links` is falsy (absent / null).
 * - Entries survive only when the value is a non-empty string **and** the key
 *   exists in `ICON_MAP` (github, demo, website, article, paper, docs, video,
 *   npm, figma). Unknown keys, empty strings and non-string values are dropped.
 * - Returns `null` when no entry survives filtering — including for an empty
 *   `{}` object.
 * - Each surviving entry renders a `Link` to the raw href with an icon and the
 *   `projects.links.<key>` label; `Link` treats non-internal hrefs as external
 *   and adds `target="_blank"` / `rel="noopener noreferrer"`.
 * - Insertion order of the `links` object is preserved.
 *
 * Two harness/behaviour notes that shape the assertions below:
 *
 * 1. `renderWithProviders` mounts `ThemeProviders`, which injects a next-themes
 *    inline `<script>` into the render container. The container is therefore
 *    never truly empty, so the "renders nothing" cases assert the absence of
 *    the component's own markup (`ul` / links) instead of an empty container.
 * 2. The three `@icons-pack/react-simple-icons` glyphs (github, npm, figma)
 *    render an SVG `<title>` that is *not* `aria-hidden`, so it is concatenated
 *    into the link's accessible name (e.g. `"GitHubGitHub"`, `"npmNPM
 *    Package"`). The lucide icons do not. This is an accessibility quirk of the
 *    current code, captured here as-is.
 *
 * `useLanguage` applies the locale in a mount effect, so all assertions that
 * depend on translated labels are async.
 */

/** Minimal `CoreContent<Project>`; the component only reads `links`. */
function makeProject(links?: unknown): CoreContent<Project> {
  return {
    type: 'Project',
    title: { en: 'Remedmind', it: 'Remedmind' },
    summary: { en: 'A medication reminder app.', it: 'Un promemoria per i farmaci.' },
    date: '2024-03-15T12:00:00.000Z',
    tags: [],
    stack: [],
    links,
    readingTime: { minutes: 3 },
    slug: 'remedmind',
    path: 'projects/remedmind',
    filePath: 'projects/remedmind.mdx',
    titleEn: 'Remedmind',
    summaryEn: 'A medication reminder app.',
    structuredData: {},
  } as CoreContent<Project>
}

describe('ProjectLinks', () => {
  describe('null results', () => {
    /**
     * Assert the component contributed no markup. The container still holds the
     * next-themes inline script injected by `ThemeProviders` (see file header),
     * so emptiness is checked against the component's own elements.
     */
    function expectNothingRendered(container: HTMLElement) {
      expect(container.querySelector('ul')).toBeNull()
      expect(container.querySelector('a')).toBeNull()
      expect(container.querySelector('svg')).toBeNull()
    }

    it('renders nothing when project.links is undefined', () => {
      const { container } = renderWithProviders(<ProjectLinks project={makeProject(undefined)} />)

      expectNothingRendered(container)
    })

    it('renders nothing when project.links is null', () => {
      const { container } = renderWithProviders(<ProjectLinks project={makeProject(null)} />)

      expectNothingRendered(container)
    })

    it('renders nothing for an empty links object', () => {
      const { container } = renderWithProviders(<ProjectLinks project={makeProject({})} />)

      expectNothingRendered(container)
    })

    it('renders nothing when every key is outside ICON_MAP', () => {
      const { container } = renderWithProviders(
        <ProjectLinks
          project={makeProject({
            twitter: 'https://twitter.com/example',
            mastodon: 'https://example.social/@example',
          })}
        />
      )

      expectNothingRendered(container)
    })

    it('renders nothing when the only known key has an empty-string value', () => {
      const { container } = renderWithProviders(
        <ProjectLinks project={makeProject({ github: '' })} />
      )

      expectNothingRendered(container)
    })

    it('renders nothing when the only known key has a non-string value', () => {
      const { container } = renderWithProviders(
        <ProjectLinks project={makeProject({ github: 42 })} />
      )

      expectNothingRendered(container)
    })
  })

  describe('rendering surviving entries', () => {
    it('renders one list item per surviving entry', async () => {
      renderWithProviders(
        <ProjectLinks
          project={makeProject({
            github: 'https://github.com/Light2288/remedmind',
            website: 'https://light2288.github.io/remedmind/',
          })}
        />
      )

      expect(await screen.findByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('links each entry to its raw href', async () => {
      renderWithProviders(
        <ProjectLinks project={makeProject({ github: 'https://github.com/Light2288/remedmind' })} />
      )

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', 'https://github.com/Light2288/remedmind')
    })

    it('opens external links in a new tab with a safe rel', async () => {
      renderWithProviders(
        <ProjectLinks project={makeProject({ github: 'https://github.com/Light2288/remedmind' })} />
      )

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders an icon alongside the label', async () => {
      const { container } = renderWithProviders(
        <ProjectLinks project={makeProject({ website: 'https://lightstimulus.dev' })} />
      )

      expect(await screen.findByRole('link', { name: 'Website' })).toBeInTheDocument()
      expect(container.querySelector('a svg')).toBeInTheDocument()
    })

    it('drops unknown keys while keeping the known ones', async () => {
      renderWithProviders(
        <ProjectLinks
          project={makeProject({
            github: 'https://github.com/Light2288/remedmind',
            twitter: 'https://twitter.com/example',
            slack: 'https://example.slack.com',
          })}
        />
      )

      expect(await screen.findByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://github.com/Light2288/remedmind'
      )
    })

    it('drops empty-string values while keeping the populated ones', async () => {
      renderWithProviders(
        <ProjectLinks project={makeProject({ github: '', website: 'https://lightstimulus.dev' })} />
      )

      expect(await screen.findByRole('link', { name: 'Website' })).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })

    it('preserves the insertion order of the links object', async () => {
      renderWithProviders(
        <ProjectLinks
          project={makeProject({
            website: 'https://lightstimulus.dev',
            docs: 'https://lightstimulus.dev/docs',
          })}
        />
      )

      const links = await screen.findAllByRole('link')
      expect(links[0]).toHaveTextContent('Website')
      expect(links[1]).toHaveTextContent('Documentation')
    })
  })

  describe('labels for every ICON_MAP key', () => {
    /** All nine ICON_MAP keys. */
    const allKeys = [
      'github',
      'demo',
      'website',
      'article',
      'paper',
      'docs',
      'video',
      'npm',
      'figma',
    ] as const

    const allLinks = Object.fromEntries(allKeys.map((k) => [k, `https://example.com/${k}`]))

    it('renders all nine known keys', async () => {
      renderWithProviders(<ProjectLinks project={makeProject(allLinks)} />)

      expect(await screen.findByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(9)
    })

    it.each([
      ['github', 'GitHub'],
      ['demo', 'Live Demo'],
      ['website', 'Website'],
      ['article', 'Article'],
      ['paper', 'Research Paper'],
      ['docs', 'Documentation'],
      ['video', 'Video'],
      ['npm', 'NPM Package'],
      ['figma', 'Figma'],
    ])('labels %s with the English "%s" text', async (key, label) => {
      renderWithProviders(
        <ProjectLinks project={makeProject({ [key]: 'https://example.com/x' })} />,
        { locale: 'en' }
      )

      // The label lives in its own <span>. The `selector` narrows the match
      // because for github/figma the simple-icons SVG <title> carries the very
      // same text and would otherwise make the query ambiguous.
      const span = await screen.findByText(label, { selector: 'span' })
      expect(span.closest('a')).toHaveAttribute('href', 'https://example.com/x')
    })

    it.each([
      ['github', 'GitHub'],
      ['demo', 'Demo'],
      ['website', 'Sito web'],
      ['article', 'Articolo'],
      ['paper', 'Articolo di ricerca'],
      ['docs', 'Documentazione'],
      ['video', 'Video'],
      ['npm', 'Pacchetto NPM'],
      ['figma', 'Figma'],
    ])('labels %s with the Italian "%s" text', async (key, label) => {
      renderWithProviders(
        <ProjectLinks project={makeProject({ [key]: 'https://example.com/x' })} />,
        { locale: 'it' }
      )

      const span = await screen.findByText(label, { selector: 'span' })
      expect(span.closest('a')).toHaveAttribute('href', 'https://example.com/x')
    })
  })

  describe('accessible names (current, slightly buggy, behaviour)', () => {
    it.each([
      ['github', 'GitHubGitHub'],
      ['npm', 'npmNPM Package'],
      ['figma', 'FigmaFigma'],
    ])(
      'duplicates the brand name for %s because the simple-icons <title> is not hidden',
      async (key, accessibleName) => {
        renderWithProviders(
          <ProjectLinks project={makeProject({ [key]: 'https://example.com/x' })} />,
          { locale: 'en' }
        )

        expect(await screen.findByRole('link', { name: accessibleName })).toBeInTheDocument()
      }
    )

    it.each([
      ['demo', 'Live Demo'],
      ['website', 'Website'],
      ['article', 'Article'],
      ['paper', 'Research Paper'],
      ['docs', 'Documentation'],
      ['video', 'Video'],
    ])('uses just the label for the lucide-icon key %s', async (key, accessibleName) => {
      renderWithProviders(
        <ProjectLinks project={makeProject({ [key]: 'https://example.com/x' })} />,
        { locale: 'en' }
      )

      expect(await screen.findByRole('link', { name: accessibleName })).toBeInTheDocument()
    })
  })
})
