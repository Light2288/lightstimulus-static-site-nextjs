import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { mockNavigation, resetNavigationMock } from '../../test/mockNavigation'
import { mockFetch, restoreFetch } from '../../test/mockFetch'
import Layout from './Layout'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import en from '@/locales/en.json'

/**
 * Characterisation tests for the app shell.
 *
 * ## Why plain `render` and not `renderWithProviders`
 * `Layout` composes `ThemeProviders` → `LanguageProvider` → `SearchProvider`
 * itself, so wrapping it in the test helper's providers would nest a second set
 * and make the assertions ambiguous. These tests deliberately use the raw
 * Testing Library `render`, which also proves the shell is self-sufficient.
 *
 * A side effect of skipping the helper is that no `lightstimulus.lang`
 * preference is seeded, so `LanguageProvider` falls back to detecting the
 * browser language. jsdom reports `en-US`, so the resolved locale is English.
 *
 * ## Async settling
 * kbar fetches `/search.json` on mount (hence the `fetch` stub) and `MobileNav`
 * arrives through `next/dynamic({ ssr: false })`. Both land after the initial
 * render, so tests wait for the dynamic mobile-nav dialog before asserting and
 * flush the remaining microtasks at the end.
 */

/** Probe that reads the language context supplied by `Layout` itself. */
function LanguageProbe() {
  const { lang, t } = useLanguage()
  return (
    <div>
      <span data-testid="probe-lang">{lang}</span>
      <span data-testid="probe-translated">{t('common.all')}</span>
      <span data-testid="probe-nested">{t('nav.contact')}</span>
      <span data-testid="probe-missing">{t('definitely.not.a.key')}</span>
    </div>
  )
}

/** Probe that reads the next-themes context supplied by `Layout` itself. */
function ThemeProbe() {
  const { theme, themes } = useTheme()
  return (
    <div>
      <span data-testid="probe-theme">{theme}</span>
      <span data-testid="probe-themes">{themes.join(',')}</span>
    </div>
  )
}

const mainEl = () => document.querySelector('main#main-content') as HTMLElement

/** Render the shell and wait for the dynamic MobileNav chunk to resolve. */
async function renderLayout(children: React.ReactNode) {
  const view = render(<Layout>{children}</Layout>)
  await waitFor(() => expect(screen.getAllByLabelText('Toggle Menu')).toHaveLength(2))
  await act(async () => {
    await Promise.resolve()
  })
  return view
}

beforeEach(() => {
  mockNavigation({ pathname: '/' })
  mockFetch({ body: '[]' })
})

afterEach(() => {
  resetNavigationMock()
  restoreFetch()
})

describe('Layout', () => {
  describe('shell landmarks', () => {
    it('renders the header banner', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Main Navigation')
    })

    it('renders the main content region with the skip-link target id', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(mainEl()).toBeInTheDocument()
      expect(mainEl().tagName).toBe('MAIN')
    })

    it('renders the footer', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders all three landmarks together, in order', async () => {
      await renderLayout(<p>Body copy</p>)

      const shell = mainEl().closest('div') as HTMLElement
      const tags = Array.from(shell.children).map((child) => child.tagName)
      expect(tags).toEqual(['HEADER', 'SECTION', 'FOOTER'])
    })

    it('offsets the main region for the fixed header', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(mainEl()).toHaveClass('flex-1', 'pt-16')
    })

    it('wraps main in the shared SectionContainer', async () => {
      await renderLayout(<p>Body copy</p>)

      const section = mainEl().parentElement as HTMLElement
      expect(section.tagName).toBe('SECTION')
      expect(section).toHaveClass('mx-auto', 'w-full', 'max-w-5xl')
    })

    it('applies the full-height themed shell classes', async () => {
      await renderLayout(<p>Body copy</p>)

      const shell = mainEl().closest('div') as HTMLElement
      expect(shell).toHaveClass('flex', 'min-h-screen', 'flex-col')
    })
  })

  describe('children', () => {
    it('renders the children inside main', async () => {
      await renderLayout(<p data-testid="child">Body copy</p>)

      expect(mainEl()).toContainElement(screen.getByTestId('child'))
    })

    it('renders multiple children in order', async () => {
      await renderLayout(
        <>
          <p data-testid="first">First</p>
          <p data-testid="second">Second</p>
        </>
      )

      expect(Array.from(mainEl().children).map((child) => child.textContent)).toEqual([
        'First',
        'Second',
      ])
    })

    it('renders an empty main when given no children', async () => {
      await renderLayout(null)

      expect(mainEl()).toBeEmptyDOMElement()
    })

    it('keeps the children out of the header and the footer', async () => {
      await renderLayout(<p data-testid="child">Body copy</p>)

      const child = screen.getByTestId('child')
      expect(screen.getByRole('banner')).not.toContainElement(child)
      expect(screen.getByRole('contentinfo')).not.toContainElement(child)
    })
  })

  describe('provider composition', () => {
    it('supplies the language context without any extra wrapper', async () => {
      await renderLayout(<LanguageProbe />)

      // A real translation, not the echoed key: `LanguageProvider` is present
      // and the locale JSON resolved through it.
      expect(screen.getByTestId('probe-translated')).toHaveTextContent(en.common.all)
      expect(screen.getByTestId('probe-translated')).not.toHaveTextContent('common.all')
    })

    it('resolves nested translation keys through the provider', async () => {
      await renderLayout(<LanguageProbe />)

      expect(screen.getByTestId('probe-nested')).toHaveTextContent(en.nav.contact)
    })

    it('exposes the resolved language, defaulting to English in jsdom', async () => {
      await renderLayout(<LanguageProbe />)

      // No persisted preference, so `detectBrowserLang()` reads jsdom's
      // `navigator.language` (`en-US`) and resolves to 'en'.
      expect(screen.getByTestId('probe-lang')).toHaveTextContent('en')
    })

    it('still echoes unknown keys back, proving the real `t` is in play', async () => {
      await renderLayout(<LanguageProbe />)

      // The default context value would echo *every* key; this one echoes only
      // the missing key, so the assertion distinguishes the two.
      expect(screen.getByTestId('probe-missing')).toHaveTextContent('definitely.not.a.key')
    })

    it('supplies the next-themes context without any extra wrapper', async () => {
      await renderLayout(<ThemeProbe />)

      await waitFor(() =>
        expect(screen.getByTestId('probe-theme')).toHaveTextContent(siteMetadata.theme)
      )
    })

    it('restricts the theme list to light and dark', async () => {
      await renderLayout(<ThemeProbe />)

      expect(screen.getByTestId('probe-themes')).toHaveTextContent('light,dark')
    })

    it('supplies the search context, so the header search button renders', async () => {
      await renderLayout(<p>Body copy</p>)

      // `SearchButton` renders kbar's `KBarButton`, which needs the provider's
      // context; without `SearchProvider` the header would throw.
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
    })

    it('drives the header nav labels through its own language provider', async () => {
      await renderLayout(<p>Body copy</p>)

      const navLabels = Array.from(screen.getByRole('navigation').querySelectorAll('a')).map(
        (a) => a.textContent
      )
      expect(navLabels).toEqual([en.nav.projects, en.nav.blog, en.nav.about, en.nav.contact])
    })

    it('shares one language provider between the header and the children', async () => {
      await renderLayout(<LanguageProbe />)

      // Same provider instance: the child's `lang` and the header's rendered
      // labels agree.
      expect(screen.getByTestId('probe-lang')).toHaveTextContent('en')
      expect(screen.getByRole('link', { name: en.nav.contact })).toBeInTheDocument()
    })
  })

  describe('header controls inside the shell', () => {
    it('renders the language toggle', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getByLabelText('Switch to Italian')).toBeInTheDocument()
    })

    it('renders the theme toggle', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
    })

    it('renders the dynamically imported mobile nav', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getAllByLabelText('Toggle Menu')).toHaveLength(2)
    })
  })

  describe('footer inside the shell', () => {
    it('credits the author from site metadata', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getByRole('contentinfo')).toHaveTextContent(siteMetadata.author)
    })

    it('links the site title home from the footer', async () => {
      await renderLayout(<p>Body copy</p>)

      expect(screen.getByRole('link', { name: siteMetadata.title })).toHaveAttribute('href', '/')
    })
  })
})
