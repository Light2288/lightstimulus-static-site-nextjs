import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { FocusAreas } from './FocusAreas'

/**
 * Characterisation tests for `FocusAreas` — the two-column card grid on the
 * About page.
 *
 * Covers:
 * - the `if (!areas.length) return null` guard,
 * - the section heading (`about.focus.title`) in EN and IT,
 * - each card's title (level-3 heading) and description, both selected by the
 *   active language via `area.title[lang]` / `area.description[lang]`, in EN and IT,
 * - one card per input area, in input order.
 *
 * Note: the cards are keyed by `area.title[lang]`, so duplicate titles would
 * collide; the fixture uses the real distinct titles from
 * `data/authors/default.mdx`.
 */

const areas = [
  {
    title: { en: 'Frontend Architecture', it: 'Architettura Frontend' },
    description: {
      en: 'Design systems, micro-frontend architectures, and scalable UI platforms for large, multi-team environments.',
      it: 'Design system, architetture micro-frontend e piattaforme UI scalabili per contesti complessi e multi-team.',
    },
  },
  {
    title: { en: 'Mobile Platforms', it: 'Piattaforme Mobile' },
    description: {
      en: 'Native iOS and Android development, cross-platform solutions, and performance-critical mobile systems used at scale.',
      it: 'Sviluppo nativo iOS e Android, soluzioni cross-platform e sistemi mobile ad alte prestazioni utilizzati su larga scala.',
    },
  },
  {
    title: { en: 'Computer Vision & XR', it: 'Computer Vision e XR' },
    description: {
      en: 'Experimental projects and proof-of-concepts in AR, XR, and computer vision using ARKit, RealityKit, Unity, and WebGL.',
      it: 'Progetti sperimentali e proof-of-concept in AR, XR e computer vision utilizzando ARKit, RealityKit, Unity e WebGL.',
    },
  },
  {
    title: { en: 'ML, Data & GenAI', it: 'ML, Data e GenAI' },
    description: {
      en: 'Applied machine learning, data platforms, and generative AI workflows using Snowflake and AWS, with a focus on agentic architectures.',
      it: 'Machine learning applicato, piattaforme dati e workflow di AI generativa basati su Snowflake e AWS, con focus su architetture agentiche.',
    },
  },
]

describe('FocusAreas', () => {
  it('renders nothing when the area list is empty', () => {
    const { container } = renderWithProviders(<FocusAreas areas={[]} />)

    // `ThemeProviders` (next-themes) injects its own no-flash <script> into the
    // render container, so the container is never literally empty; assert the
    // component itself contributed no markup.
    expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  describe('English locale', () => {
    it('renders the translated section heading', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Focus areas' })
      ).toBeInTheDocument()
    })

    it('renders every English title as a level-3 heading', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'en' })

      for (const area of areas) {
        expect(
          await screen.findByRole('heading', { level: 3, name: area.title.en })
        ).toBeInTheDocument()
      }
    })

    it('renders every English description', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'en' })

      for (const area of areas) {
        expect(await screen.findByText(area.description.en)).toBeInTheDocument()
      }
    })

    it('does not render the Italian variants', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 3, name: areas[0].title.en })
      for (const area of areas) {
        expect(screen.queryByText(area.description.it)).not.toBeInTheDocument()
      }
    })
  })

  describe('Italian locale', () => {
    it('renders the translated section heading', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Aree di focus' })
      ).toBeInTheDocument()
    })

    it('renders every Italian title as a level-3 heading', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'it' })

      for (const area of areas) {
        expect(
          await screen.findByRole('heading', { level: 3, name: area.title.it })
        ).toBeInTheDocument()
      }
    })

    it('renders every Italian description', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'it' })

      for (const area of areas) {
        expect(await screen.findByText(area.description.it)).toBeInTheDocument()
      }
    })

    it('does not render the English variants', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'it' })

      await screen.findByRole('heading', { level: 3, name: areas[0].title.it })
      for (const area of areas) {
        expect(screen.queryByText(area.description.en)).not.toBeInTheDocument()
      }
    })
  })

  describe('grid structure', () => {
    it('renders one level-3 heading per area', async () => {
      renderWithProviders(<FocusAreas areas={areas} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(areas.length)
    })

    it('preserves the input order', async () => {
      renderWithProviders(<FocusAreas areas={areas} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 3, name: areas[0].title.en })
      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
      expect(titles).toEqual(areas.map((area) => area.title.en))
    })

    it('renders a single card when only one area is given', async () => {
      renderWithProviders(<FocusAreas areas={[areas[0]]} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    })
  })
})
