import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderWithProviders, screen, waitFor, act } from '../test/renderWithProviders'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import MobileNav from './MobileNav'
import headerNavLinks from '@/data/headerNavLinks'
import en from '@/locales/en.json'
import itLocale from '@/locales/it.json'

/**
 * Characterisation tests for the slide-over mobile navigation.
 *
 * ## How the closed state is represented
 * The Headless UI `Transition`/`Dialog` are both rendered with
 * `unmount={false}`, so the panel markup stays in the DOM permanently and is
 * merely hidden (`hidden` attribute + `display: none`). Consequences for the
 * assertions below:
 *
 * - `getByRole` / `getAllByRole` respect accessibility, so the nav links are
 *   queryable only while the dialog is open — that is the signal used here for
 *   "open" vs "closed".
 * - Plain DOM/text queries (`querySelectorAll('a')`, `getByText`) still find
 *   the hidden anchors, so they are *not* usable as an open/closed probe.
 * - There are always **two** `aria-label="Toggle Menu"` buttons: the hamburger
 *   (rendered outside the dialog) and the close "X" (inside the panel).
 *
 * ## body-scroll-lock
 * The library is globally mocked in `test/setup.ts`, so its three functions are
 * plain spies here and the calls are asserted directly.
 */

/** The hamburger — always the first of the two "Toggle Menu" buttons. */
const hamburger = () => screen.getAllByLabelText('Toggle Menu')[0]

/** The close "X" inside the panel — always the last one. */
const closeButton = () => {
  const buttons = screen.getAllByLabelText('Toggle Menu')
  return buttons[buttons.length - 1]
}

/** The nav links are only exposed to role queries while the dialog is open. */
const openLinks = () => screen.queryAllByRole('link')

/** Resolve once the slide-over has settled into the open state. */
const waitForOpen = () => waitFor(() => expect(openLinks()).toHaveLength(headerNavLinks.length))

/** Resolve once the slide-over has settled back into the closed state. */
const waitForClosed = () => waitFor(() => expect(openLinks()).toHaveLength(0))

/**
 * Flush Headless UI's post-mount transition bookkeeping.
 *
 * `Transition`/`TransitionChild` schedule a state update shortly after mount
 * (they resolve the initial `leave` phase for the permanently-mounted panel).
 * A purely synchronous test finishes before that lands, so React reports it as
 * an un-`act`-wrapped update against whichever test happens to run next. Await
 * this at the end of tests that do not otherwise await the DOM.
 */
const settle = () =>
  act(async () => {
    await Promise.resolve()
  })

afterEach(() => {
  // The global afterEach in test/setup.ts already clears call history, but the
  // spies keep any implementation installed by a test, so reset them fully.
  ;(disableBodyScroll as ReturnType<typeof vi.fn>).mockReset()
  ;(enableBodyScroll as ReturnType<typeof vi.fn>).mockReset()
  ;(clearAllBodyScrollLocks as ReturnType<typeof vi.fn>).mockReset()
})

describe('MobileNav', () => {
  describe('initial render', () => {
    it('renders the hamburger trigger and the panel close button', async () => {
      renderWithProviders(<MobileNav />)

      expect(screen.getAllByLabelText('Toggle Menu')).toHaveLength(2)
      await settle()
    })

    it('hides the hamburger from the small breakpoint upwards', async () => {
      renderWithProviders(<MobileNav />)

      expect(hamburger()).toHaveClass('sm:hidden')
      await settle()
    })

    it('starts closed, so no nav link is exposed to assistive tech', async () => {
      renderWithProviders(<MobileNav />)

      expect(openLinks()).toHaveLength(0)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await settle()
    })

    it('keeps the panel markup mounted even while closed', async () => {
      renderWithProviders(<MobileNav />)

      // `unmount={false}` on both the Transition and the Dialog: the anchors
      // exist in the DOM from the first render, just hidden. Headless UI
      // portals the panel outside the render container, so query the document.
      expect(document.querySelectorAll('a')).toHaveLength(headerNavLinks.length)
      await settle()
    })

    it('does not touch the body scroll lock on mount', async () => {
      renderWithProviders(<MobileNav />)

      expect(disableBodyScroll).not.toHaveBeenCalled()
      expect(enableBodyScroll).not.toHaveBeenCalled()
      await settle()
    })
  })

  describe('toggling', () => {
    it('opens the menu when the hamburger is pressed', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())

      await waitForOpen()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('marks the opened dialog as modal', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('closes the menu again from the panel close button', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()
      await user.click(closeButton())

      await waitForClosed()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('closes the menu when a nav link is followed', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()
      await user.click(screen.getByRole('link', { name: en.nav.blog }))

      await waitForClosed()
    })

    it('can be reopened after being closed', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()
      await user.click(closeButton())
      await waitForClosed()
      await user.click(hamburger())

      await waitForOpen()
    })
  })

  describe('body scroll locking', () => {
    it('locks the body scroll when the menu opens', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      expect(disableBodyScroll).toHaveBeenCalledTimes(1)
      expect(enableBodyScroll).not.toHaveBeenCalled()
    })

    it('locks against the panel nav element, not the document body', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      // `navRef` is attached to the scrollable <nav> inside the panel.
      const [target] = (disableBodyScroll as ReturnType<typeof vi.fn>).mock.calls[0]
      expect((target as HTMLElement).tagName).toBe('NAV')
    })

    it('releases the body scroll when the menu closes', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()
      await user.click(closeButton())
      await waitForClosed()

      expect(enableBodyScroll).toHaveBeenCalledTimes(1)
      const [target] = (enableBodyScroll as ReturnType<typeof vi.fn>).mock.calls[0]
      expect((target as HTMLElement).tagName).toBe('NAV')
    })

    it('releases the body scroll when a nav link closes the menu', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()
      await user.click(screen.getByRole('link', { name: en.nav.contact }))
      await waitForClosed()

      expect(enableBodyScroll).toHaveBeenCalledTimes(1)
    })

    it('clears every lock on unmount', async () => {
      const { unmount } = renderWithProviders(<MobileNav />)

      // The effect that returns `clearAllBodyScrollLocks` has run, but the
      // cleanup has not yet.
      expect(clearAllBodyScrollLocks).not.toHaveBeenCalled()

      unmount()

      expect(clearAllBodyScrollLocks).toHaveBeenCalled()
      await waitFor(() => expect(screen.queryAllByLabelText('Toggle Menu')).toHaveLength(0))
    })

    /**
     * FINDING — the `useEffect` returning `clearAllBodyScrollLocks` has **no
     * dependency array**, so its cleanup runs before *every* re-render, not
     * only on unmount. Opening the menu therefore calls `disableBodyScroll`
     * and then immediately `clearAllBodyScrollLocks`, undoing the lock it just
     * installed. Expected: one `disableBodyScroll` with no clear until
     * unmount. Actual: `disable` → `clearAll` on the very same interaction.
     */
    it('clears the lock it just installed, because the effect has no dep array', async () => {
      const order: string[] = []
      ;(disableBodyScroll as ReturnType<typeof vi.fn>).mockImplementation(() => {
        order.push('disable')
      })
      ;(clearAllBodyScrollLocks as ReturnType<typeof vi.fn>).mockImplementation(() => {
        order.push('clearAll')
      })

      const { user } = renderWithProviders(<MobileNav />)
      expect(order).toEqual([])

      await user.click(hamburger())
      await waitForOpen()

      expect(order).toEqual(['disable', 'clearAll'])
    })
  })

  describe('nav links (English)', () => {
    it('renders every configured header nav link', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      expect(openLinks()).toHaveLength(5)
    })

    it('labels each link with its English translation', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      expect(openLinks().map((link) => link.textContent)).toEqual([
        en.nav.home,
        en.nav.projects,
        en.nav.blog,
        en.nav.about,
        en.nav.contact,
      ])
    })

    it('points each link at the configured href', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      expect(openLinks().map((link) => link.getAttribute('href'))).toEqual(
        headerNavLinks.map((link) => link.href)
      )
    })

    it('keeps the home link, unlike the desktop header nav', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      expect(screen.getByRole('link', { name: en.nav.home })).toHaveAttribute('href', '/')
    })

    it('derives each label from the lowercased link title', async () => {
      const { user } = renderWithProviders(<MobileNav />)

      await user.click(hamburger())
      await waitForOpen()

      // `t('nav.<title.toLowerCase()>')` — every key must exist, otherwise the
      // translation function echoes the raw key back.
      const labels = openLinks().map((link) => link.textContent)
      expect(labels.some((label) => label?.startsWith('nav.'))).toBe(false)
    })
  })

  describe('nav links (Italian)', () => {
    it('labels each link with its Italian translation', async () => {
      const { user } = renderWithProviders(<MobileNav />, { locale: 'it' })

      await user.click(hamburger())
      await waitForOpen()

      expect(openLinks().map((link) => link.textContent)).toEqual([
        itLocale.nav.home,
        itLocale.nav.projects,
        itLocale.nav.blog,
        itLocale.nav.about,
        itLocale.nav.contact,
      ])
    })

    it('translates the entries that actually differ from English', async () => {
      const { user } = renderWithProviders(<MobileNav />, { locale: 'it' })

      await user.click(hamburger())
      await waitForOpen()

      expect(screen.getByRole('link', { name: 'Progetti' })).toHaveAttribute('href', '/projects')
      expect(screen.getByRole('link', { name: 'Chi sono' })).toHaveAttribute('href', '/about')
      expect(screen.getByRole('link', { name: 'Contatti' })).toHaveAttribute('href', '/contact')
    })

    it('leaves the hrefs untouched by the locale', async () => {
      const { user } = renderWithProviders(<MobileNav />, { locale: 'it' })

      await user.click(hamburger())
      await waitForOpen()

      expect(openLinks().map((link) => link.getAttribute('href'))).toEqual(
        headerNavLinks.map((link) => link.href)
      )
    })

    it('keeps "Home" and "Blog" identical across both locales', async () => {
      const { user } = renderWithProviders(<MobileNav />, { locale: 'it' })

      await user.click(hamburger())
      await waitForOpen()

      expect(itLocale.nav.home).toBe(en.nav.home)
      expect(itLocale.nav.blog).toBe(en.nav.blog)
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    })
  })
})
