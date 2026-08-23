import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { ExploringNow } from './ExploringNow'

/**
 * Characterisation tests for `ExploringNow` — the "what I'm exploring now" list
 * on the About page.
 *
 * Covers:
 * - the `if (!items.length) return null` guard,
 * - the section heading (`about.exploring.title`) in EN and IT,
 * - the per-item text, which is selected by the *active language* via
 *   `item[lang]` and rendered prefixed with an em-dash bullet (`— `), in EN and IT,
 * - the fact that the component renders one list item per input item, in input
 *   order.
 *
 * Because `LanguageProvider` picks the locale in a mount effect, the first paint
 * is always English; all locale-sensitive assertions therefore use async queries.
 */

const items = [
  {
    id: 'agentic-ai',
    en: 'Agentic AI workflows and orchestration patterns',
    it: 'Workflow di AI agentica e pattern di orchestrazione',
  },
  {
    id: 'practical-genai',
    en: 'Practical GenAI integration in real-world architectures',
    it: 'Integrazione pratica della GenAI in architetture reali',
  },
  {
    id: 'applied-cv',
    en: 'Applied computer vision beyond demos',
    it: 'Computer vision applicata oltre i prototipi dimostrativi',
  },
  {
    id: 'frontend-systems',
    en: 'Bridging frontend systems with data platforms',
    it: 'Integrazione tra sistemi frontend e piattaforme dati',
  },
]

describe('ExploringNow', () => {
  it('renders nothing when the item list is empty', () => {
    const { container } = renderWithProviders(<ExploringNow items={[]} />)

    // `ThemeProviders` (next-themes) injects its own no-flash <script> into the
    // render container, so the container is never literally empty; assert the
    // component itself contributed no markup.
    expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  describe('English locale', () => {
    it('renders the translated section heading', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'What I’m exploring now' })
      ).toBeInTheDocument()
    })

    it('renders every item using its English text, prefixed with an em dash', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'en' })

      for (const item of items) {
        expect(await screen.findByText(`— ${item.en}`)).toBeInTheDocument()
      }
    })

    it('does not render the Italian variants', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'en' })

      await screen.findByText(`— ${items[0].en}`)
      for (const item of items) {
        expect(screen.queryByText(`— ${item.it}`)).not.toBeInTheDocument()
      }
    })
  })

  describe('Italian locale', () => {
    it('renders the translated section heading', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Cosa sto esplorando ora' })
      ).toBeInTheDocument()
    })

    it('renders every item using its Italian text, prefixed with an em dash', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'it' })

      for (const item of items) {
        expect(await screen.findByText(`— ${item.it}`)).toBeInTheDocument()
      }
    })

    it('does not render the English variants', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'it' })

      await screen.findByText(`— ${items[0].it}`)
      for (const item of items) {
        expect(screen.queryByText(`— ${item.en}`)).not.toBeInTheDocument()
      }
    })
  })

  describe('list structure', () => {
    it('renders one list item per input item', async () => {
      renderWithProviders(<ExploringNow items={items} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getAllByRole('listitem')).toHaveLength(items.length)
    })

    it('preserves the input order', async () => {
      renderWithProviders(<ExploringNow items={items} />, { locale: 'en' })

      await screen.findByText(`— ${items[0].en}`)
      const rendered = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(rendered).toEqual(items.map((item) => `— ${item.en}`))
    })

    it('renders a single item list without a heading change', async () => {
      renderWithProviders(<ExploringNow items={[items[0]]} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 2, name: 'What I’m exploring now' })
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })
  })
})
