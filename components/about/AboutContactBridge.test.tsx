import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { AboutContactBridge } from './AboutContactBridge'

/**
 * Characterisation tests for `AboutContactBridge` — the small closing block on
 * the About page that nudges visitors towards the contact page.
 *
 * Covers:
 * - the translated body copy (`about.contact_bridge.text`) in EN and IT,
 * - the translated call-to-action (`about.contact_bridge.link`) in EN and IT,
 * - the link target, which is the internal `/contact` route (rendered through
 *   `components/Link`, so it stays a same-tab `next/link` anchor).
 *
 * The locale is applied by `LanguageProvider` in a mount effect, so every
 * locale-dependent assertion uses an async query.
 */

const EN_TEXT =
  'If you’re working on complex systems, exploring new ideas, or simply enjoy thoughtful conversations about technology, I’m always open to exchanging perspectives.'
const IT_TEXT =
  'Se stai lavorando su sistemi complessi, esplorando nuove idee o semplicemente ti piace confrontarti su temi tecnologici, sono sempre disponibile a scambiare punti di vista.'

const EN_LINK = 'Continue to the contact page →'
const IT_LINK = 'Vai alla pagina contatti →'

describe('AboutContactBridge', () => {
  describe('English locale', () => {
    it('renders the bridge copy', async () => {
      renderWithProviders(<AboutContactBridge />, { locale: 'en' })

      expect(await screen.findByText(EN_TEXT)).toBeInTheDocument()
    })

    it('renders the call-to-action link label', async () => {
      renderWithProviders(<AboutContactBridge />, { locale: 'en' })

      expect(await screen.findByRole('link', { name: EN_LINK })).toBeInTheDocument()
    })
  })

  describe('Italian locale', () => {
    it('renders the bridge copy', async () => {
      renderWithProviders(<AboutContactBridge />, { locale: 'it' })

      expect(await screen.findByText(IT_TEXT)).toBeInTheDocument()
    })

    it('renders the call-to-action link label', async () => {
      renderWithProviders(<AboutContactBridge />, { locale: 'it' })

      expect(await screen.findByRole('link', { name: IT_LINK })).toBeInTheDocument()
    })
  })

  describe('link target', () => {
    it('points at the internal /contact route', async () => {
      renderWithProviders(<AboutContactBridge />)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', '/contact')
    })

    it('stays a same-tab link (no target/rel escape hatch)', async () => {
      renderWithProviders(<AboutContactBridge />)

      const link = await screen.findByRole('link')
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })

    it('renders exactly one link', async () => {
      renderWithProviders(<AboutContactBridge />)

      await screen.findByRole('link')
      expect(screen.getAllByRole('link')).toHaveLength(1)
    })
  })
})
