import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, renderWithProviders, screen } from '../../test/renderWithProviders'
import { useLanguage } from '@/contexts/LanguageContext'
import { mockReducedMotion, resetMatchMedia } from '../../test/mockMatchMedia'
import type { Portrait } from './portraitData'
import PortraitCarousel from './PortraitCarousel'

const portraits: Portrait[] = [
  {
    id: 'guitar',
    title: { en: 'Guitar session', it: 'Sessione con la chitarra' },
    original: '/static/images/about/portraits/guitar.png',
    focalPoint: '45% 50%',
    originalFocalPoint: '48% 46%',
    originalScale: 1.06,
    variants: [
      {
        id: 'pixel',
        label: { en: '16-bit Rock', it: 'Rock a 16-bit' },
        src: '/static/images/about/portraits/guitar_pixel.png',
      },
      {
        id: 'anime',
        label: { en: '90s Anime', it: "Anime anni '90" },
        src: '/static/images/about/portraits/guitar_anime.png',
      },
      {
        id: 'cubist',
        label: { en: 'Cubist Riff', it: 'Riff cubista' },
        src: '/static/images/about/portraits/guitar_cubist.png',
      },
    ],
  },
  {
    id: 'family',
    title: { en: 'Family sunset', it: 'Tramonto in famiglia' },
    original: '/static/images/about/portraits/family.png',
    focalPoint: '50% 46%',
    originalFocalPoint: '50% 42%',
    originalScale: 1.05,
    variants: [
      {
        id: 'coastal',
        label: { en: 'Coastal Anime', it: 'Anime sulla costa' },
        src: '/static/images/about/portraits/family_coastal.png',
      },
      {
        id: 'storybook',
        label: { en: 'Storybook', it: 'Libro illustrato' },
        src: '/static/images/about/portraits/family_storybook.png',
      },
      {
        id: 'future',
        label: { en: 'Future Coast', it: 'Costa futura' },
        src: '/static/images/about/portraits/family_future.png',
      },
    ],
  },
]

const renderCarousel = (locale: 'en' | 'it' = 'en') =>
  renderWithProviders(
    <PortraitCarousel
      portraits={portraits}
      fallbackAvatar="/static/images/avatar.png"
      fallbackAlt="Davide Aliti"
    />,
    { locale }
  )

function CarouselWithLanguageSwitch() {
  const { switchLang } = useLanguage()

  return (
    <>
      <PortraitCarousel
        portraits={portraits}
        fallbackAvatar="/static/images/avatar.png"
        fallbackAlt="Davide Aliti"
      />
      <button type="button" onClick={() => switchLang('it')}>
        Switch to Italian
      </button>
    </>
  )
}

const getActiveImage = (portraitButton: HTMLElement) => {
  const images = portraitButton.querySelectorAll('img')
  return images.item(images.length - 1)
}

const expectActiveImage = (portraitButton: HTMLElement, src: string) => {
  const image = Array.from(portraitButton.querySelectorAll('img')).find((candidate) =>
    decodeURIComponent(candidate.getAttribute('src') ?? '').includes(src)
  )
  expect(image).toBeInTheDocument()
  return image
}

afterEach(() => resetMatchMedia())

describe('PortraitCarousel core controls', () => {
  it('shows an external style control with an action hint instead of a visible counter', async () => {
    const { container } = renderCarousel()
    const portraitButton = await screen.findByRole('button', {
      name: /Guitar session.*Original.*Cycle/i,
    })
    const styleControl = screen.getByTestId('portrait-style-control')

    const image = expectActiveImage(portraitButton, '/static/images/about/portraits/guitar.png')
    expect(image).toHaveStyle({ objectPosition: '48% 46%', transform: 'scale(1.06)' })
    expect(styleControl).toHaveTextContent('Original')
    expect(styleControl).toHaveTextContent('Change style')
    expect(styleControl).not.toHaveTextContent('1/4')
    expect(portraitButton).not.toContainElement(styleControl)
    expect(portraitButton.parentElement).toContainElement(styleControl)
    expect(styleControl).toHaveClass('absolute', 'bottom-full')
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(container.querySelector('[data-testid="portrait-caption"]')).not.toHaveTextContent(
      '16-bit Rock'
    )
  })

  it('cycles the creative state from either the portrait or the external style control', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })
    const styleControl = screen.getByTestId('portrait-style-control')

    await user.click(styleControl)
    const creativeImage = expectActiveImage(
      portraitButton,
      '/static/images/about/portraits/guitar_pixel.png'
    )
    expect(creativeImage).toHaveStyle({ objectPosition: '45% 50%', transform: 'scale(1)' })
    expect(styleControl).toHaveTextContent('16-bit Rock')

    await user.click(portraitButton)
    expectActiveImage(portraitButton, '/static/images/about/portraits/guitar_anime.png')
    expect(styleControl).toHaveTextContent('90s Anime')
  })

  it('cycles through all creative states in order and wraps to the original', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })
    const expectedStates = [
      ['/static/images/about/portraits/guitar_pixel.png', '16-bit Rock · 2/4'],
      ['/static/images/about/portraits/guitar_anime.png', '90s Anime · 3/4'],
      ['/static/images/about/portraits/guitar_cubist.png', 'Cubist Riff · 4/4'],
      ['/static/images/about/portraits/guitar.png', 'Original · 1/4'],
    ] as const

    for (const [src, label] of expectedStates) {
      await user.click(portraitButton)
      expectActiveImage(portraitButton, src)
      expect(screen.getByTestId('portrait-style-control')).toHaveTextContent(label.split(' · ')[0])
      expect(screen.getByTestId('portrait-caption')).not.toHaveTextContent(label.split(' · ')[0])
    }
  })

  it('wraps with previous and next controls and resets every photo to Original', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    await user.click(portraitButton)
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('16-bit Rock')

    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')

    await user.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')

    await user.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')

    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
  })

  it('renders one direct-selection dot per photo and resets on dot selection', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })
    const dots = screen.getAllByRole('button', { name: /Show (Guitar session|Family sunset)/ })

    expect(dots).toHaveLength(2)
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
    expect(dots[1]).not.toHaveAttribute('aria-current', 'true')

    await user.click(portraitButton)
    await user.click(dots[1])

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
    expect(dots[1]).toHaveAttribute('aria-current', 'true')
  })

  it('provides 24px direct-selection targets while keeping the visual dots compact', async () => {
    renderCarousel()
    const dots = await screen.findAllByRole('button', {
      name: /Show (Guitar session|Family sunset)/,
    })

    dots.forEach((dot) => {
      expect(dot).toHaveClass('h-6', 'w-6')
      expect(dot.firstElementChild).toHaveClass('h-2.5', 'w-2.5')
    })
  })

  it('groups previous and next controls with the direct-selection dots', async () => {
    renderCarousel()
    const navigation = await screen.findByTestId('portrait-navigation')
    const dots = screen.getAllByRole('button', { name: /Show (Guitar session|Family sunset)/ })

    expect(navigation).toContainElement(screen.getByRole('button', { name: 'Previous photo' }))
    expect(navigation).toContainElement(screen.getByRole('button', { name: 'Next photo' }))
    dots.forEach((dot) => expect(navigation).toContainElement(dot))
  })

  it('does not advance automatically after sixty seconds', async () => {
    renderCarousel()
    await screen.findByRole('button', { name: /Guitar session.*Original/i })

    vi.useFakeTimers()
    act(() => vi.advanceTimersByTime(60_000))
    vi.useRealTimers()

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
  })

  it('renders Italian photo and state labels from the active language', async () => {
    const { user } = renderCarousel('it')
    const portraitButton = await screen.findByRole('button', {
      name: /Sessione con la chitarra.*Originale/i,
    })

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Sessione con la chitarra')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Originale')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Cambia stile')

    await user.click(portraitButton)
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Rock a 16-bit')
  })

  it('cycles with Enter and Space while keeping focus on the portrait', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    portraitButton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('16-bit Rock')
    expect(portraitButton).toHaveFocus()

    await user.keyboard('[Space]')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('90s Anime')
    expect(portraitButton).toHaveFocus()
  })

  it('uses scoped arrow keys to wrap photos, reset state, and preserve focus', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    portraitButton.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
    expect(portraitButton).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')
    expect(portraitButton).toHaveFocus()
  })

  it('announces completed photo and state changes in a polite live region', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    await user.click(portraitButton)
    expect(screen.getByRole('status')).toHaveTextContent('16-bit Rock, 2 of 4 for Guitar session.')

    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByRole('status')).toHaveTextContent('Family sunset. Original, 1 of 4.')
  })

  it('updates visible, accessible, and announced copy without resetting state on language change', async () => {
    const { user } = renderWithProviders(<CarouselWithLanguageSwitch />, { locale: 'en' })
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    await user.click(portraitButton)
    await user.click(screen.getByRole('button', { name: 'Switch to Italian' }))

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Sessione con la chitarra')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Rock a 16-bit')
    expect(portraitButton).toHaveAccessibleName(
      /Sessione con la chitarra.*Rock a 16-bit.*Cambia la versione creativa/i
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Rock a 16-bit, 2 di 4 per Sessione con la chitarra.'
    )
  })

  it('treats a 31px horizontal release as one variant tap', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    fireEvent.pointerDown(portraitButton, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerUp(portraitButton, { clientX: 69, clientY: 50, pointerId: 1 })
    fireEvent.click(portraitButton)

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('16-bit Rock')
  })

  it('treats a 32px horizontal-dominant swipe as one photo change and suppresses click', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    fireEvent.pointerDown(portraitButton, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerUp(portraitButton, { clientX: 68, clientY: 60, pointerId: 1 })
    fireEvent.click(portraitButton)

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
  })

  it('does not suppress the next tap when a swipe produces no compatibility click', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    fireEvent.pointerDown(portraitButton, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerUp(portraitButton, { clientX: 68, clientY: 50, pointerId: 1 })
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')

    fireEvent.pointerDown(portraitButton, { clientX: 50, clientY: 50, pointerId: 2 })
    fireEvent.pointerUp(portraitButton, { clientX: 50, clientY: 50, pointerId: 2 })
    fireEvent.click(portraitButton)

    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Coastal Anime')
  })

  it('treats vertical-dominant movement as one variant tap instead of a photo swipe', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    fireEvent.pointerDown(portraitButton, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerUp(portraitButton, { clientX: 60, clientY: 100, pointerId: 1 })
    fireEvent.click(portraitButton)

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('16-bit Rock')
  })

  it('applies three rapid activations without dropping a state update', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    fireEvent.click(portraitButton)
    fireEvent.click(portraitButton)
    fireEvent.click(portraitButton)

    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Cubist Riff')
    expectActiveImage(portraitButton, '/static/images/about/portraits/guitar_cubist.png')
  })

  it('falls back from a creative image to its original once and announces the fallback', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    await user.click(portraitButton)
    fireEvent.error(getActiveImage(portraitButton))

    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
    expectActiveImage(portraitButton, '/static/images/about/portraits/guitar.png')
    expect(screen.getByRole('status')).toHaveTextContent(
      'The selected image could not be loaded. Showing the original.'
    )
  })

  it('falls back from a failed original to the legacy avatar without retrying it', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    fireEvent.error(getActiveImage(portraitButton))
    const fallbackImage = expectActiveImage(portraitButton, '/static/images/avatar.png')
    fireEvent.error(fallbackImage as HTMLImageElement)

    expectActiveImage(portraitButton, '/static/images/avatar.png')
    expect(screen.getByRole('status')).toHaveTextContent(
      'The original image could not be loaded. Showing the fallback portrait.'
    )
  })

  it('uses standard motion by default', async () => {
    renderCarousel()

    expect(await screen.findByTestId('portrait-carousel')).toHaveAttribute(
      'data-motion',
      'standard'
    )
  })

  it('uses immediate reduced-motion swaps when the preference is enabled', async () => {
    mockReducedMotion()
    const { user } = renderCarousel()
    const carousel = await screen.findByTestId('portrait-carousel')
    const portraitButton = screen.getByRole('button', { name: /Guitar session.*Original/i })

    expect(carousel).toHaveAttribute('data-motion', 'reduced')
    await user.click(portraitButton)
    expect(portraitButton.querySelectorAll('img')).toHaveLength(1)
    expectActiveImage(portraitButton, '/static/images/about/portraits/guitar_pixel.png')
  })
})
