import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitForKbarIndex } from './renderWithProviders'
import { resetNavigationMock, mockNavigation } from './mockNavigation'
import { mockFetch, restoreFetch } from './mockFetch'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Verifies the render helper's provider wiring — in particular the opt-in
 * `SearchProvider`, which `Header` and `Layout` need but which must stay off
 * by default so existing tests are unaffected.
 *
 * kbar fetches the search index on mount, so `fetch` is stubbed to keep the
 * suite offline (otherwise jsdom attempts a real localhost request).
 */
beforeEach(() => {
  mockNavigation()
  mockFetch({ body: '[]' })
})

afterEach(() => {
  resetNavigationMock()
  restoreFetch()
})

/** Probe exposing the language context so provider wiring is observable. */
function LanguageProbe() {
  const { lang, t } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translated">{t('common.all')}</span>
    </div>
  )
}

describe('renderWithProviders', () => {
  it('provides the language context with the default English locale', async () => {
    renderWithProviders(<LanguageProbe />)

    expect(await screen.findByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('translated')).toHaveTextContent('All')
  })

  it('honours an explicit Italian locale', async () => {
    renderWithProviders(<LanguageProbe />, { locale: 'it' })

    expect(await screen.findByTestId('lang')).toHaveTextContent('it')
    expect(screen.getByTestId('translated')).toHaveTextContent('Tutti')
  })

  it('does not mount SearchProvider by default', async () => {
    const { unmount } = renderWithProviders(<LanguageProbe />)
    const withoutSearch = document.body.innerHTML
    unmount()

    renderWithProviders(<LanguageProbe />, { withSearch: true })

    // kbar mounts its own portal/wrapper markup at the document level, so the
    // rendered document must differ. This guards against `withSearch` being
    // silently ignored (a vacuously passing test).
    expect(document.body.innerHTML).not.toBe(withoutSearch)

    await waitForKbarIndex()
  })

  it('mounts SearchProvider when withSearch is set', async () => {
    renderWithProviders(<LanguageProbe />, { withSearch: true })

    // The children still render, proving the extra provider does not break the
    // tree and that kbar's context is available.
    expect(await screen.findByTestId('lang')).toHaveTextContent('en')

    // kbar loads the search index asynchronously; await the resulting state
    // update so it does not land outside act() after the test finishes.
    await waitForKbarIndex()
  })

  it('still applies the locale when SearchProvider is mounted', async () => {
    renderWithProviders(<LanguageProbe />, { withSearch: true, locale: 'it' })

    expect(await screen.findByTestId('translated')).toHaveTextContent('Tutti')

    await waitForKbarIndex()
  })

  it('returns a userEvent instance for interactions', () => {
    const { user } = renderWithProviders(<LanguageProbe />)

    expect(user).toBeDefined()
    expect(typeof user.click).toBe('function')
  })
})
