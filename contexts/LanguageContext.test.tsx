import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider, useLanguage } from './LanguageContext'
import { PreferencesService } from '@/lib/preferences/PreferencesService'

/**
 * Characterisation tests for the client-side i18n context.
 *
 * Two behaviours matter most and are easy to regress:
 *
 * - `t()` resolves dot-paths and returns the *key itself* when anything is
 *   missing, so a broken key is silent at runtime.
 * - Language resolution precedence: a stored preference is a manual choice and
 *   always wins; otherwise `navigator.language` is detected but never
 *   persisted.
 *
 * The provider applies the language in a mount effect, so assertions use
 * async queries.
 */

/**
 * Undo any `navigator.language` override.
 *
 * `language` is an accessor on `Navigator.prototype`, not an own property of
 * the instance, so `Object.getOwnPropertyDescriptor(navigator, 'language')`
 * returns `undefined` and cannot be used to restore it. `setNavigatorLanguage`
 * shadows the prototype accessor with an own property; deleting that own
 * property re-exposes jsdom's real value.
 *
 * Without this, an override leaks into later tests (and, because Vitest shares
 * a jsdom environment per file, into unrelated ones when the file order
 * changes) — which made the suite order-dependent.
 */
afterEach(() => {
  delete (window.navigator as unknown as { language?: string }).language
})

/** Force `navigator.language` for a test. */
function setNavigatorLanguage(value: string | undefined) {
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    get: () => value,
  })
}

/** Probe that surfaces the whole context for assertions. */
function Probe({ tKey, vars }: { tKey?: string; vars?: Record<string, string | number> }) {
  const { lang, t, switchLang } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translated">{tKey ? t(tKey, vars) : ''}</span>
      <button onClick={() => switchLang('it')}>to italian</button>
      <button onClick={() => switchLang('en')}>to english</button>
    </div>
  )
}

function renderProvider(ui: React.ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('LanguageProvider', () => {
  describe('t() lookup', () => {
    it('resolves a nested dot-notation key', async () => {
      renderProvider(<Probe tKey="nav.home" />)

      await waitFor(() => expect(screen.getByTestId('translated')).not.toBeEmptyDOMElement())
      expect(screen.getByTestId('translated')).toHaveTextContent('Home')
    })

    it('returns the key verbatim when the key is missing', async () => {
      renderProvider(<Probe tKey="nav.does_not_exist" />)

      await waitFor(() =>
        expect(screen.getByTestId('translated')).toHaveTextContent('nav.does_not_exist')
      )
    })

    it('returns the key verbatim when an intermediate segment is missing', async () => {
      renderProvider(<Probe tKey="nope.deeper.still" />)

      await waitFor(() =>
        expect(screen.getByTestId('translated')).toHaveTextContent('nope.deeper.still')
      )
    })

    it('returns the key when the resolved value is an object, not a string', async () => {
      // `nav` exists but is a namespace object.
      renderProvider(<Probe tKey="nav" />)

      await waitFor(() => expect(screen.getByTestId('translated')).toHaveTextContent('nav'))
    })

    it('returns the key for an empty key string', async () => {
      renderProvider(<Probe tKey="" />)

      // An empty key means the probe renders nothing at all.
      await waitFor(() => expect(screen.getByTestId('translated')).toBeEmptyDOMElement())
    })
  })

  describe('t() interpolation', () => {
    it('substitutes a provided variable', async () => {
      renderProvider(<Probe tKey="blog.reading_time" vars={{ minutes: 7 }} />)

      await waitFor(() => expect(screen.getByTestId('translated')).toHaveTextContent('7'))
    })

    it('replaces an unknown variable with an empty string', async () => {
      renderProvider(<Probe tKey="blog.reading_time" vars={{ wrongName: 7 }} />)

      await waitFor(() =>
        expect(screen.getByTestId('translated')).not.toHaveTextContent('{{minutes}}')
      )
      expect(screen.getByTestId('translated')).not.toHaveTextContent('7')
    })

    it('leaves placeholders untouched when no vars are passed', async () => {
      renderProvider(<Probe tKey="blog.reading_time" />)

      await waitFor(() => expect(screen.getByTestId('translated')).toHaveTextContent('{{minutes}}'))
    })

    it('coerces numeric variables to strings', async () => {
      renderProvider(<Probe tKey="blog.reading_time" vars={{ minutes: 0 }} />)

      await waitFor(() => expect(screen.getByTestId('translated')).toHaveTextContent('0'))
    })
  })

  describe('language resolution', () => {
    it('honours a stored English preference', async () => {
      PreferencesService.setPref('lang', 'en')
      setNavigatorLanguage('it-IT')

      renderProvider(<Probe />)

      // The stored manual choice wins over the Italian browser language.
      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'))
    })

    it('honours a stored Italian preference', async () => {
      PreferencesService.setPref('lang', 'it')
      setNavigatorLanguage('en-US')

      renderProvider(<Probe />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('it'))
    })

    it('falls through to detection for an invalid stored value', async () => {
      PreferencesService.setPref('lang', 'de')
      setNavigatorLanguage('it-IT')

      renderProvider(<Probe />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('it'))
    })

    it('does not persist an auto-detected language', async () => {
      setNavigatorLanguage('it-IT')

      renderProvider(<Probe />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('it'))
      expect(PreferencesService.getPref('lang')).toBeNull()
    })

    it.each([
      ['it', 'it'],
      ['it-IT', 'it'],
      ['IT-CH', 'it'],
      ['it-SM', 'it'],
      ['en-US', 'en'],
      ['fr-FR', 'en'],
      ['', 'en'],
    ])('detects %s as %s', async (navigatorLang, expected) => {
      setNavigatorLanguage(navigatorLang)

      renderProvider(<Probe />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent(expected))
    })

    it('defaults to English when navigator.language is undefined', async () => {
      setNavigatorLanguage(undefined)

      renderProvider(<Probe />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'))
    })
  })

  describe('switchLang', () => {
    it('updates the active language', async () => {
      const user = userEvent.setup()
      // Pin the starting language explicitly rather than relying on the
      // ambient navigator locale, so this test cannot depend on file order.
      PreferencesService.setPref('lang', 'en')
      renderProvider(<Probe tKey="common.all" />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'))
      await user.click(screen.getByRole('button', { name: 'to italian' }))

      expect(screen.getByTestId('lang')).toHaveTextContent('it')
      expect(screen.getByTestId('translated')).toHaveTextContent('Tutti')
    })

    it('persists the chosen language as a manual preference', async () => {
      const user = userEvent.setup()
      renderProvider(<Probe />)

      await user.click(screen.getByRole('button', { name: 'to italian' }))

      expect(PreferencesService.getPref('lang')).toBe('it')
    })

    it('can switch back to English and persist that too', async () => {
      const user = userEvent.setup()
      PreferencesService.setPref('lang', 'it')
      renderProvider(<Probe />)

      await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('it'))
      await user.click(screen.getByRole('button', { name: 'to english' }))

      expect(PreferencesService.getPref('lang')).toBe('en')
    })
  })

  describe('default context (no provider)', () => {
    it('echoes the key back from t()', () => {
      render(<Probe tKey="nav.home" />)

      expect(screen.getByTestId('translated')).toHaveTextContent('nav.home')
    })

    it('reports English as the language', () => {
      render(<Probe />)

      expect(screen.getByTestId('lang')).toHaveTextContent('en')
    })

    it('provides a no-op switchLang that does not persist', async () => {
      const user = userEvent.setup()
      render(<Probe />)

      await user.click(screen.getByRole('button', { name: 'to italian' }))

      expect(screen.getByTestId('lang')).toHaveTextContent('en')
      expect(PreferencesService.getPref('lang')).toBeNull()
    })
  })

  it('applies a stored preference by the time rendering settles', async () => {
    // Note: the provider's initial state is English (a hydration-safe default)
    // and the stored language is applied in a mount effect. Testing Library
    // flushes effects during `render`, so the pre-effect paint is not
    // observable here — only the settled result is asserted.
    PreferencesService.setPref('lang', 'it')

    renderProvider(<Probe tKey="common.all" />)

    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('it'))
    expect(screen.getByTestId('translated')).toHaveTextContent('Tutti')
  })
})
