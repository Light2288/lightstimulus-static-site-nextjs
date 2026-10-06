import { describe, expect, it, vi } from 'vitest'
import { act, renderWithProviders, screen, within } from '../../test/renderWithProviders'
import type { Portrait } from './portraitData'
import PortraitCarousel from './PortraitCarousel'

const portraits: Portrait[] = [
  {
    id: 'guitar',
    title: { en: 'Guitar session', it: 'Sessione con la chitarra' },
    original: '/static/images/about/portraits/guitar.png',
    focalPoint: '45% 50%',
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

const expectActiveImage = (portraitButton: HTMLElement, src: string) => {
  const image = portraitButton.querySelector('img')
  expect(image).toBeInTheDocument()
  expect(decodeURIComponent(image?.getAttribute('src') ?? '')).toContain(src)
  return image
}

describe('PortraitCarousel core controls', () => {
  it('starts with the first original and places its state chip inside the portrait', async () => {
    const { container } = renderCarousel()
    const portraitButton = await screen.findByRole('button', {
      name: /Guitar session.*Original.*Cycle/i,
    })
    const chip = within(portraitButton).getByText('Original · 1/4')

    const image = expectActiveImage(portraitButton, '/static/images/about/portraits/guitar.png')
    expect(image).toHaveStyle({ objectPosition: '45% 50%' })
    expect(portraitButton).toContainElement(chip)
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(container.querySelector('[data-testid="portrait-caption"]')).not.toHaveTextContent(
      '16-bit Rock'
    )
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
      expect(within(portraitButton).getByText(label)).toBeInTheDocument()
      expect(screen.getByTestId('portrait-caption')).not.toHaveTextContent(label.split(' · ')[0])
    }
  })

  it('wraps with previous and next controls and resets every photo to Original', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    await user.click(portraitButton)
    expect(within(portraitButton).getByText('16-bit Rock · 2/4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Family sunset')
    expect(within(portraitButton).getByText('Original · 1/4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(within(portraitButton).getByText('Original · 1/4')).toBeInTheDocument()

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
    expect(within(portraitButton).getByText('Original · 1/4')).toBeInTheDocument()
    expect(dots[1]).toHaveAttribute('aria-current', 'true')
  })

  it('does not advance automatically after sixty seconds', async () => {
    renderCarousel()
    const portraitButton = await screen.findByRole('button', { name: /Guitar session.*Original/i })

    vi.useFakeTimers()
    act(() => vi.advanceTimersByTime(60_000))
    vi.useRealTimers()

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Guitar session')
    expect(within(portraitButton).getByText('Original · 1/4')).toBeInTheDocument()
  })

  it('renders Italian photo and state labels from the active language', async () => {
    const { user } = renderCarousel('it')
    const portraitButton = await screen.findByRole('button', {
      name: /Sessione con la chitarra.*Originale/i,
    })

    expect(screen.getByTestId('portrait-title')).toHaveTextContent('Sessione con la chitarra')
    expect(within(portraitButton).getByText('Originale · 1/4')).toBeInTheDocument()

    await user.click(portraitButton)
    expect(within(portraitButton).getByText('Rock a 16-bit · 2/4')).toBeInTheDocument()
  })
})
