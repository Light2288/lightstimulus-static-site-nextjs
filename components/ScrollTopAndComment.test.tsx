import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ScrollTopAndComment from './ScrollTopAndComment'
import siteMetadata from '@/data/siteMetadata'

/**
 * Characterisation tests for the floating scroll widget.
 *
 * ## How visibility is expressed
 * The wrapper is **always** in the DOM — `show` only swaps the responsive
 * display class between `md:flex` (visible) and `md:hidden` (hidden), on top of
 * a permanent `hidden` class that keeps the widget off small screens
 * altogether. So "hidden" here means "wrapper carries `md:hidden`", never
 * "wrapper is absent". jsdom applies no CSS, so `toBeVisible()` cannot express
 * this and the class is asserted directly.
 *
 * ## The comment button
 * `data/siteMetadata.js` has its whole `comments` block commented out, so
 * `siteMetadata.comments?.provider` is `undefined` and the "Scroll To Comment"
 * button is never rendered. That absence is pinned below: if comments are ever
 * re-enabled, these tests fail loudly and intentionally.
 *
 * ## Threshold
 * The predicate is `window.scrollY > 50` — strictly greater — so exactly 50
 * still counts as "at the top".
 */

/** The single wrapper `<div>` the component renders. */
const wrapper = () => screen.getByLabelText('Scroll To Top').parentElement as HTMLElement

/** Set `window.scrollY` and dispatch a scroll event so the listener runs. */
function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y, writable: true })
  act(() => {
    fireEvent.scroll(window)
  })
}

afterEach(() => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true })
})

describe('ScrollTopAndComment', () => {
  describe('initial render', () => {
    it('renders the scroll-to-top button', () => {
      render(<ScrollTopAndComment />)

      expect(screen.getByLabelText('Scroll To Top')).toBeInTheDocument()
    })

    it('starts hidden, because scrollY is 0', () => {
      render(<ScrollTopAndComment />)

      expect(wrapper()).toHaveClass('md:hidden')
      expect(wrapper()).not.toHaveClass('md:flex')
    })

    it('is pinned to the bottom-right corner', () => {
      render(<ScrollTopAndComment />)

      expect(wrapper()).toHaveClass('fixed', 'right-8', 'bottom-8')
    })

    it('stays hidden below the md breakpoint regardless of scroll position', () => {
      render(<ScrollTopAndComment />)
      scrollTo(500)

      // The bare `hidden` class is unconditional; only the `md:` variant flips.
      expect(wrapper()).toHaveClass('hidden')
      expect(wrapper()).toHaveClass('md:flex')
    })

    it('renders an icon inside the button', () => {
      const { container } = render(<ScrollTopAndComment />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('visibility threshold', () => {
    it('stays hidden below 50px', () => {
      render(<ScrollTopAndComment />)

      scrollTo(49)

      expect(wrapper()).toHaveClass('md:hidden')
    })

    it('stays hidden at exactly 50px, because the check is strictly greater', () => {
      render(<ScrollTopAndComment />)

      scrollTo(50)

      expect(wrapper()).toHaveClass('md:hidden')
      expect(wrapper()).not.toHaveClass('md:flex')
    })

    it('becomes visible at 51px', () => {
      render(<ScrollTopAndComment />)

      scrollTo(51)

      expect(wrapper()).toHaveClass('md:flex')
      expect(wrapper()).not.toHaveClass('md:hidden')
    })

    it('stays visible far down the page', () => {
      render(<ScrollTopAndComment />)

      scrollTo(5000)

      expect(wrapper()).toHaveClass('md:flex')
    })

    it('hides again when the user scrolls back to the top', () => {
      render(<ScrollTopAndComment />)

      scrollTo(400)
      expect(wrapper()).toHaveClass('md:flex')

      scrollTo(0)
      expect(wrapper()).toHaveClass('md:hidden')
    })

    it('re-evaluates on every scroll event rather than latching', () => {
      render(<ScrollTopAndComment />)

      const seen: string[] = []
      for (const y of [100, 10, 200, 50, 51]) {
        scrollTo(y)
        seen.push(wrapper().className.includes('md:flex') ? 'shown' : 'hidden')
      }

      expect(seen).toEqual(['shown', 'hidden', 'shown', 'hidden', 'shown'])
    })

    /**
     * The initial `show` is `false` and the effect only registers a listener —
     * it never calls the handler once on mount. So a component mounted on an
     * already-scrolled page stays hidden until the next scroll event.
     */
    it('does not read the scroll position on mount', () => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 800, writable: true })

      render(<ScrollTopAndComment />)

      expect(wrapper()).toHaveClass('md:hidden')
    })
  })

  describe('scroll to top', () => {
    it('calls window.scrollTo with top 0', () => {
      const scrollToSpy = vi.fn()
      Object.defineProperty(window, 'scrollTo', {
        configurable: true,
        writable: true,
        value: scrollToSpy,
      })
      render(<ScrollTopAndComment />)

      fireEvent.click(screen.getByLabelText('Scroll To Top'))

      expect(scrollToSpy).toHaveBeenCalledTimes(1)
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0 })
    })

    it('omits the behavior option, so the jump is instant', () => {
      const scrollToSpy = vi.fn()
      Object.defineProperty(window, 'scrollTo', {
        configurable: true,
        writable: true,
        value: scrollToSpy,
      })
      render(<ScrollTopAndComment />)

      fireEvent.click(screen.getByLabelText('Scroll To Top'))

      const [options] = scrollToSpy.mock.calls[0]
      expect(Object.keys(options as object)).toEqual(['top'])
    })

    it('can be pressed repeatedly', () => {
      const scrollToSpy = vi.fn()
      Object.defineProperty(window, 'scrollTo', {
        configurable: true,
        writable: true,
        value: scrollToSpy,
      })
      render(<ScrollTopAndComment />)

      const button = screen.getByLabelText('Scroll To Top')
      fireEvent.click(button)
      fireEvent.click(button)

      expect(scrollToSpy).toHaveBeenCalledTimes(2)
    })

    it('works even while the widget is in its hidden state', () => {
      const scrollToSpy = vi.fn()
      Object.defineProperty(window, 'scrollTo', {
        configurable: true,
        writable: true,
        value: scrollToSpy,
      })
      render(<ScrollTopAndComment />)

      // The wrapper is only visually hidden by CSS, so the button stays in the
      // accessibility tree and remains clickable.
      expect(wrapper()).toHaveClass('md:hidden')
      fireEvent.click(screen.getByLabelText('Scroll To Top'))

      expect(scrollToSpy).toHaveBeenCalledOnce()
    })
  })

  describe('comment button', () => {
    /**
     * FINDING (intentional configuration, pinned here) — the `comments` block
     * in `data/siteMetadata.js` is fully commented out, so the giscus provider
     * is undefined and the "Scroll To Comment" affordance never renders. The
     * component name and its `handleScrollToComment` handler are therefore dead
     * weight in the current configuration.
     */
    it('is absent, because siteMetadata.comments is not configured', () => {
      render(<ScrollTopAndComment />)

      expect(siteMetadata.comments).toBeUndefined()
      expect(screen.queryByLabelText('Scroll To Comment')).not.toBeInTheDocument()
    })

    it('leaves the scroll-to-top button as the only control', () => {
      render(<ScrollTopAndComment />)

      expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
        'Scroll To Top',
      ])
    })

    it('stays absent once the widget becomes visible', () => {
      render(<ScrollTopAndComment />)

      scrollTo(300)

      expect(screen.queryByLabelText('Scroll To Comment')).not.toBeInTheDocument()
    })
  })

  describe('listener lifecycle', () => {
    it('registers exactly one scroll listener on mount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      render(<ScrollTopAndComment />)

      expect(addSpy.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(1)
      addSpy.mockRestore()
    })

    it('registers the listener without any options object', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      render(<ScrollTopAndComment />)

      const [scrollCall] = addSpy.mock.calls.filter(([event]) => event === 'scroll')
      // Contrast with Header, which passes `{ passive: true }`.
      expect(scrollCall).toHaveLength(2)
      addSpy.mockRestore()
    })

    it('removes the scroll listener on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(<ScrollTopAndComment />)
      unmount()

      expect(removeSpy.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(1)
      removeSpy.mockRestore()
    })

    it('removes the very same handler it registered', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(<ScrollTopAndComment />)
      unmount()

      const [, added] = addSpy.mock.calls.filter(([event]) => event === 'scroll')[0]
      const [, removed] = removeSpy.mock.calls.filter(([event]) => event === 'scroll')[0]
      expect(removed).toBe(added)
      addSpy.mockRestore()
      removeSpy.mockRestore()
    })

    it('stops reacting to scroll events after unmount', () => {
      const { unmount } = render(<ScrollTopAndComment />)
      unmount()

      // No React state update happens, so this must not warn or throw.
      expect(() => scrollTo(600)).not.toThrow()
      expect(screen.queryByLabelText('Scroll To Top')).not.toBeInTheDocument()
    })

    it('registers the listener only once across re-renders', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      const { rerender } = render(<ScrollTopAndComment />)
      rerender(<ScrollTopAndComment />)
      rerender(<ScrollTopAndComment />)

      // The effect has an empty dependency array.
      expect(addSpy.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(1)
      addSpy.mockRestore()
    })
  })
})
