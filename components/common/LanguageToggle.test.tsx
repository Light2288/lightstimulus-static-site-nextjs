import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import LanguageToggle from './LanguageToggle'

/**
 * Characterisation tests for `LanguageToggle` — the EN ↔ IT switch in the
 * header.
 *
 * Things that shape every test here:
 *
 * - **Hydration guard.** The component returns `null` until its mount effect
 *   sets `mounted`, so the pre-mount output is asserted through a server
 *   render (`renderToStaticMarkup`) and every client-side assertion is async.
 * - **Locale arrives in an effect.** `LanguageProvider` applies the seeded
 *   `lightstimulus.lang` preference in a mount effect, so the first client
 *   paint is always English. Locale-dependent assertions therefore use
 *   `findBy*` / `waitFor`.
 * - **Motion exit animations.** The flag and the label live inside
 *   `AnimatePresence mode="popLayout"`, so immediately after a switch *both*
 *   the outgoing and incoming spans are in the DOM. Assertions that care about
 *   a single value wait for the outgoing one to be removed.
 */

/** The exact `aria-label` rendered for each active language. */
const ARIA_LABEL = {
  en: 'Switch to Italian',
  it: "Passa all'inglese",
} as const

/** The flag emoji rendered for each active language. */
const FLAG = { en: '🇬🇧', it: '🇮🇹' } as const

/** Wait for the outgoing (exiting) flag to leave the DOM. */
async function waitForFlagToSettle(flag: string) {
  await waitFor(() => expect(screen.queryAllByText(flag)).toHaveLength(0))
}

describe('LanguageToggle', () => {
  describe('hydration guard', () => {
    it('renders nothing before the mount effect runs', () => {
      // A server render never runs effects, so `mounted` stays false and the
      // component short-circuits to `null` — no markup at all.
      expect(renderToStaticMarkup(<LanguageToggle />)).toBe('')
    })

    it('renders the button once mounted', async () => {
      renderWithProviders(<LanguageToggle />)

      expect(await screen.findByRole('button')).toBeInTheDocument()
    })

    it('renders exactly one button', async () => {
      renderWithProviders(<LanguageToggle />)

      await screen.findByRole('button')
      expect(screen.getAllByRole('button')).toHaveLength(1)
    })
  })

  describe('English locale', () => {
    it('labels the button "Switch to Italian"', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'en' })

      expect(await screen.findByRole('button', { name: ARIA_LABEL.en })).toBeInTheDocument()
    })

    it('shows the British flag', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'en' })

      expect(await screen.findByText(FLAG.en)).toBeInTheDocument()
    })

    it('hides the flag from assistive technology', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'en' })

      expect(await screen.findByText(FLAG.en)).toHaveAttribute('aria-hidden', 'true')
    })

    it('shows the uppercase language code EN', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'en' })

      expect(await screen.findByText('EN')).toBeInTheDocument()
    })

    it('does not show the Italian flag or code', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'en' })

      await screen.findByText('EN')
      expect(screen.queryByText(FLAG.it)).not.toBeInTheDocument()
      expect(screen.queryByText('IT')).not.toBeInTheDocument()
    })
  })

  describe('Italian locale', () => {
    it('labels the button "Passa all\'inglese"', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'it' })

      expect(await screen.findByRole('button', { name: ARIA_LABEL.it })).toBeInTheDocument()
    })

    it('shows the Italian flag', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'it' })

      expect(await screen.findByText(FLAG.it)).toBeInTheDocument()
    })

    it('shows the uppercase language code IT', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'it' })

      expect(await screen.findByText('IT')).toBeInTheDocument()
    })

    it('does not show the British flag or the EN code', async () => {
      renderWithProviders(<LanguageToggle />, { locale: 'it' })

      await screen.findByText('IT')
      expect(screen.queryByText(FLAG.en)).not.toBeInTheDocument()
      expect(screen.queryByText('EN')).not.toBeInTheDocument()
    })
  })

  describe('toggling', () => {
    it('switches from English to Italian on click', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'en' })

      await user.click(await screen.findByRole('button', { name: ARIA_LABEL.en }))

      expect(await screen.findByRole('button', { name: ARIA_LABEL.it })).toBeInTheDocument()
      await waitForFlagToSettle(FLAG.en)
      expect(screen.getByText(FLAG.it)).toBeInTheDocument()
      expect(screen.getByText('IT')).toBeInTheDocument()
    })

    it('switches from Italian to English on click', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'it' })

      await user.click(await screen.findByRole('button', { name: ARIA_LABEL.it }))

      expect(await screen.findByRole('button', { name: ARIA_LABEL.en })).toBeInTheDocument()
      await waitForFlagToSettle(FLAG.it)
      expect(screen.getByText(FLAG.en)).toBeInTheDocument()
      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('returns to the starting language after two clicks', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'en' })
      const button = await screen.findByRole('button', { name: ARIA_LABEL.en })

      await user.click(button)
      await screen.findByRole('button', { name: ARIA_LABEL.it })
      await user.click(button)

      expect(await screen.findByRole('button', { name: ARIA_LABEL.en })).toBeInTheDocument()
      await waitForFlagToSettle(FLAG.it)
      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('keeps the same button element across a switch', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'en' })
      const button = await screen.findByRole('button', { name: ARIA_LABEL.en })

      await user.click(button)

      await waitFor(() => expect(button).toHaveAttribute('aria-label', ARIA_LABEL.it))
    })
  })

  describe('persistence via PreferencesService', () => {
    it('writes the chosen language to lightstimulus.lang', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'en' })

      await user.click(await screen.findByRole('button', { name: ARIA_LABEL.en }))

      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.lang')).toBe('it'))
    })

    it('persists the switch back to English', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'it' })

      await user.click(await screen.findByRole('button', { name: ARIA_LABEL.it }))

      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.lang')).toBe('en'))
    })

    it('does not write an unprefixed lang key', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'en' })

      await user.click(await screen.findByRole('button', { name: ARIA_LABEL.en }))

      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.lang')).toBe('it'))
      expect(window.localStorage.getItem('lang')).toBeNull()
    })

    it('records the latest choice after several clicks', async () => {
      const { user } = renderWithProviders(<LanguageToggle />, { locale: 'en' })
      const button = await screen.findByRole('button')

      await user.click(button)
      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.lang')).toBe('it'))
      await user.click(button)

      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.lang')).toBe('en'))
    })
  })
})
