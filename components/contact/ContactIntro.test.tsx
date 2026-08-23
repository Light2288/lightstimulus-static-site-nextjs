import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, getDefaultNormalizer } from '../../test/renderWithProviders'
import { ContactIntro } from './ContactIntro'

/**
 * Characterisation tests for `ContactIntro` — the heading + blurb at the top of
 * the contact page.
 *
 * Covers:
 * - `contact.title` rendered as the page's level-1 heading, in EN and IT,
 * - `contact.intro` rendered verbatim (it contains a blank line and is styled
 *   with `whitespace-pre-line`, so the newlines are preserved in the DOM and
 *   the assertions disable whitespace collapsing).
 *
 * `LanguageProvider` resolves the locale in a mount effect, hence the async
 * queries.
 */

// Preserve the literal newlines in `contact.intro`; the default normalizer
// would collapse them and the exact-text match would fail.
const preserveWhitespace = getDefaultNormalizer({ collapseWhitespace: false })

const EN_TITLE = 'Get in touch'
const IT_TITLE = 'Scrivimi'

const EN_INTRO =
  'I’m always open to thoughtful conversations around technology, systems, and ideas in progress.\n\nIf you’re working on complex challenges, exploring new directions, or simply want to exchange perspectives, feel free to reach out.'
const IT_INTRO =
  'Sono sempre disponibile a confrontarmi su tecnologia, sistemi e idee in evoluzione.\n\nSe stai lavorando su problemi complessi, esplorando nuove direzioni o semplicemente vuoi scambiare punti di vista, non esitare a contattarmi.'

describe('ContactIntro', () => {
  describe('English locale', () => {
    it('renders the translated title as the level-1 heading', async () => {
      renderWithProviders(<ContactIntro />, { locale: 'en' })

      expect(await screen.findByRole('heading', { level: 1, name: EN_TITLE })).toBeInTheDocument()
    })

    it('renders the translated intro copy including its blank line', async () => {
      renderWithProviders(<ContactIntro />, { locale: 'en' })

      expect(
        await screen.findByText(EN_INTRO, { normalizer: preserveWhitespace })
      ).toBeInTheDocument()
    })
  })

  describe('Italian locale', () => {
    it('renders the translated title as the level-1 heading', async () => {
      renderWithProviders(<ContactIntro />, { locale: 'it' })

      expect(await screen.findByRole('heading', { level: 1, name: IT_TITLE })).toBeInTheDocument()
    })

    it('renders the translated intro copy including its blank line', async () => {
      renderWithProviders(<ContactIntro />, { locale: 'it' })

      expect(
        await screen.findByText(IT_INTRO, { normalizer: preserveWhitespace })
      ).toBeInTheDocument()
    })
  })

  it('never leaks the raw translation keys', async () => {
    renderWithProviders(<ContactIntro />)

    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByText('contact.title')).not.toBeInTheDocument()
    expect(screen.queryByText('contact.intro')).not.toBeInTheDocument()
  })
})
