import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProviders } from '@/app/theme-providers'
import { LanguageProvider } from '@/contexts/LanguageContext'

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
 * @example
 * const { getByRole } = renderWithProviders(<PageTitle>Hi</PageTitle>)
 *
 * @example
 * renderWithProviders(<Tag tag={tag} />, { locale: 'it' })
 * expect(await screen.findByText('Tutti')).toBeInTheDocument()
 */

type Locale = 'en' | 'it'

interface ProviderRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Active language for `LanguageProvider`. Defaults to `'en'`. */
  locale?: Locale
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProviders>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProviders>
  )
}

export function renderWithProviders(ui: ReactElement, options: ProviderRenderOptions = {}) {
  const { locale = 'en', ...renderOptions } = options

  // Seed the persisted language preference so LanguageProvider honors it as a
  // manual choice instead of detecting from the (mocked) browser language.
  window.localStorage.setItem('lightstimulus.lang', locale)

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...renderOptions }),
  }
}

// Re-export the Testing Library API so tests import everything from here.
export * from '@testing-library/react'
export { userEvent }
