import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import ThemeToggle from './ThemeToggle'

/**
 * Characterisation tests for `ThemeToggle` — the light → dark → system cycler
 * in the header.
 *
 * Harness notes that shape these tests:
 *
 * - **Hydration guard.** `mounted` starts `false`, so on the server the button
 *   exists but renders no icon and falls back to the generic
 *   `aria-label="Toggle theme"`. That branch is asserted with a server render;
 *   every client-side assertion is async.
 * - **next-themes storage key.** `ThemeProviders` configures
 *   `storageKey="lightstimulus.theme"` — the same key `PreferencesService`
 *   uses for `'theme'`. Seeding `lightstimulus.theme` before render therefore
 *   picks the initial theme, and both writers end up on that one key.
 * - **`matchMedia` reports light.** The global stub in `test/setup.ts` always
 *   answers `matches: false`, so `(prefers-color-scheme: dark)` is false and
 *   the `system` theme resolves to `light`.
 * - **Motion exit animations.** The icon lives inside `AnimatePresence
 *   mode="popLayout"`, so right after a theme change the outgoing and incoming
 *   icons are both mounted. `waitForSingleIcon` waits for the exit to finish
 *   before the icon identity is asserted.
 */

/** Lucide adds a stable `lucide-<name>` class; that is how the icon is identified. */
const ICON_CLASS = {
  system: 'lucide-laptop-minimal',
  light: 'lucide-sun',
  dark: 'lucide-moon',
} as const

/** Wait until the exiting icon has been removed and one icon remains. */
async function waitForSingleIcon(container: HTMLElement) {
  await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(1))
  return container.querySelector('svg') as SVGElement
}

/** Render with a pre-seeded next-themes value so the cycle starts predictably. */
function renderWithTheme(theme?: 'light' | 'dark' | 'system') {
  if (theme) window.localStorage.setItem('lightstimulus.theme', theme)
  return renderWithProviders(<ThemeToggle />)
}

describe('ThemeToggle', () => {
  describe('hydration guard', () => {
    it('renders no icon and the generic label before mount', () => {
      // Server render: effects never run, so `mounted` stays false. Note the
      // button itself IS rendered (unlike LanguageToggle) — only the icon and
      // the tooltip label are suppressed.
      const markup = renderToStaticMarkup(<ThemeToggle />)

      expect(markup).toContain('aria-label="Toggle theme"')
      expect(markup).not.toContain('<svg')
    })

    it('renders the button with a themed label once mounted', async () => {
      renderWithTheme()

      expect(
        await screen.findByRole('button', { name: 'Switch to light mode' })
      ).toBeInTheDocument()
    })

    it('renders an icon once mounted', async () => {
      const { container } = renderWithTheme()

      await screen.findByRole('button')
      expect(await waitForSingleIcon(container)).toBeInTheDocument()
    })
  })

  describe('default (system) state', () => {
    it('uses the laptop icon for the system theme', async () => {
      const { container } = renderWithTheme()

      await screen.findByRole('button')
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.system)
    })

    it('labels the next step "Switch to light mode"', async () => {
      renderWithTheme()

      expect(await screen.findByRole('button')).toHaveAttribute(
        'aria-label',
        'Switch to light mode'
      )
    })

    it('shows the "System" tooltip', async () => {
      renderWithTheme()

      expect(await screen.findByText('System')).toBeInTheDocument()
    })
  })

  describe('cycle light → dark → system → light', () => {
    it('goes from light to dark on the first click', async () => {
      const { user, container } = renderWithTheme('light')
      const button = await screen.findByRole('button', { name: 'Switch to dark mode' })

      await user.click(button)

      await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Switch to system theme'))
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.dark)
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    it('goes from dark to system on the second click', async () => {
      const { user, container } = renderWithTheme('dark')
      const button = await screen.findByRole('button', { name: 'Switch to system theme' })

      await user.click(button)

      await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Switch to light mode'))
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.system)
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('goes from system back to light on the third click', async () => {
      const { user, container } = renderWithTheme('system')
      const button = await screen.findByRole('button', { name: 'Switch to light mode' })

      await user.click(button)

      await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Switch to dark mode'))
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.light)
      expect(screen.getByText('Light')).toBeInTheDocument()
    })

    it('walks the whole cycle with three successive clicks', async () => {
      const { user } = renderWithTheme('light')
      const button = await screen.findByRole('button', { name: 'Switch to dark mode' })
      const labels: (string | null)[] = [button.getAttribute('aria-label')]

      for (let i = 0; i < 3; i++) {
        const previous = button.getAttribute('aria-label')
        await user.click(button)
        await waitFor(() => expect(button.getAttribute('aria-label')).not.toBe(previous))
        labels.push(button.getAttribute('aria-label'))
      }

      // light → dark → system → light
      expect(labels).toEqual([
        'Switch to dark mode',
        'Switch to system theme',
        'Switch to light mode',
        'Switch to dark mode',
      ])
    })

    it('cycles the tooltip label alongside the theme', async () => {
      const { user } = renderWithTheme('light')
      const button = await screen.findByRole('button')
      await screen.findByText('Light')

      await user.click(button)
      expect(await screen.findByText('Dark')).toBeInTheDocument()

      await user.click(button)
      expect(await screen.findByText('System')).toBeInTheDocument()

      await user.click(button)
      expect(await screen.findByText('Light')).toBeInTheDocument()
    })
  })

  describe('resolved theme drives the icon', () => {
    it('shows the sun for an explicit light theme', async () => {
      const { container } = renderWithTheme('light')

      await screen.findByRole('button')
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.light)
    })

    it('shows the moon for an explicit dark theme', async () => {
      const { container } = renderWithTheme('dark')

      await screen.findByRole('button')
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.dark)
    })

    it('shows the laptop for the system theme even though it resolves to light', async () => {
      // `matchMedia` is stubbed to `matches: false`, so system resolves to
      // light — but the `theme === 'system'` check wins over `resolvedTheme`.
      const { container } = renderWithTheme('system')

      await screen.findByRole('button')
      expect(await waitForSingleIcon(container)).toHaveClass(ICON_CLASS.system)
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  describe('persistence via PreferencesService', () => {
    it('writes the resolved default theme on mount', async () => {
      renderWithProviders(<ThemeToggle />)

      await screen.findByRole('button')
      // `defaultTheme` comes from siteMetadata.theme ('system'); the mount
      // effect persists it even though the user never chose it.
      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.theme')).toBe('system'))
    })

    it('persists each theme change', async () => {
      const { user } = renderWithTheme('light')
      const button = await screen.findByRole('button', { name: 'Switch to dark mode' })

      await user.click(button)
      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.theme')).toBe('dark'))

      await user.click(button)
      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.theme')).toBe('system'))

      await user.click(button)
      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.theme')).toBe('light'))
    })

    it('does not write an unprefixed theme key', async () => {
      const { user } = renderWithTheme('light')

      await user.click(await screen.findByRole('button'))

      await waitFor(() => expect(window.localStorage.getItem('lightstimulus.theme')).toBe('dark'))
      expect(window.localStorage.getItem('theme')).toBeNull()
    })
  })

  describe('structure', () => {
    it('renders exactly one button', async () => {
      renderWithTheme('light')

      await screen.findByRole('button')
      expect(screen.getAllByRole('button')).toHaveLength(1)
    })

    it('hides the icon from assistive technology and relies on the aria-label', async () => {
      const { container } = renderWithTheme('light')

      await screen.findByRole('button')
      const icon = await waitForSingleIcon(container)
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('button')).toHaveAccessibleName('Switch to dark mode')
    })

    it('marks the tooltip as non-interactive', async () => {
      renderWithTheme('light')

      const tooltip = await screen.findByText('Light')
      expect(tooltip).toHaveClass('pointer-events-none')
    })
  })
})
