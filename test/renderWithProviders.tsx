import { type ReactElement, type ReactNode } from 'react'
import { render, act, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProviders } from '@/app/theme-providers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import SearchProvider from '@/components/search/SearchProvider'

/**
 * Custom render helper that wraps a component in the app's real providers
 * (`ThemeProviders` for next-themes, `LanguageProvider` for i18n) so that
 * components consuming those contexts render as they do in the app.
 *
 * ## Locale selection
 * `LanguageProvider` resolves its language in a mount `useEffect`: a persisted
 * preference (`lightstimulus.lang` in localStorage) is treated as an explicit
 * manual choice and always wins over browser detection. We therefore seed that
 * preference before rendering to force EN or IT deterministically.
 *
 * Because the locale is applied in an effect (after the initial English
 * render), assertions that depend on the chosen locale should use async
 * queries — e.g. `await screen.findByText('Tutti')` — or `waitFor`.
 *
 * ## Search provider
 * `SearchProvider` (kbar) is **opt-in** via `withSearch`, because only
 * `Header` and `Layout` require it and mounting kbar everywhere would add
 * noise to unrelated tests. Two things to know when enabling it:
 *
 * - It calls `useRouter()`, so configure `mockNavigation()` from
 *   `test/mockNavigation.ts`.
 * - On mount it **fetches the search index** from
 *   `siteMetadata.search.kbarConfig.searchDocumentsPath`. In jsdom that is a
 *   real HTTP request to localhost and surfaces as an unhandled
 *   `ECONNREFUSED`, so install `mockFetch()` from `test/mockFetch.ts`
 *   (or use `withSearch` only in tests that already stub fetch).
 *
 * @example
 * const { getByRole } = renderWithProviders(<PageTitle>Hi</PageTitle>)
 *
 * @example
 * renderWithProviders(<Tag tag={tag} />, { locale: 'it' })
 * expect(await screen.findByText('Tutti')).toBeInTheDocument()
 *
 * @example
 * renderWithProviders(<Header />, { withSearch: true })
 */

type Locale = 'en' | 'it'

interface ProviderRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Active language for `LanguageProvider`. Defaults to `'en'`. */
  locale?: Locale
  /**
   * Mount `SearchProvider` (kbar) around the tree. Required by `Header` and
   * `Layout`. Defaults to `false`.
   */
  withSearch?: boolean
}

function makeProviders(withSearch: boolean) {
  return function AllProviders({ children }: { children: ReactNode }) {
    // Nesting order mirrors components/common/Layout.tsx.
    return (
      <ThemeProviders>
        <LanguageProvider>
          {withSearch ? <SearchProvider>{children}</SearchProvider> : children}
        </LanguageProvider>
      </ThemeProviders>
    )
  }
}

export function renderWithProviders(ui: ReactElement, options: ProviderRenderOptions = {}) {
  const { locale = 'en', withSearch = false, ...renderOptions } = options

  // Seed the persisted language preference so LanguageProvider honors it as a
  // manual choice instead of detecting from the (mocked) browser language.
  window.localStorage.setItem('lightstimulus.lang', locale)

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: makeProviders(withSearch), ...renderOptions }),
  }
}

/**
 * Flush kbar's asynchronous search-index load.
 *
 * `KBarSearchProvider` fetches the index on mount and sets state when it
 * resolves. Without awaiting that, the update lands after the test body and
 * React logs an `act(...)` warning. Call this at the end of any test rendered
 * with `withSearch: true`.
 */
export async function waitForKbarIndex() {
  // A single macrotask turn is enough for the stubbed fetch to settle and for
  // the resulting state update to be applied inside act().
  await act(async () => {
    await Promise.resolve()
  })
}

// Re-export the Testing Library API so tests import everything from here.
export * from '@testing-library/react'
export { userEvent }
