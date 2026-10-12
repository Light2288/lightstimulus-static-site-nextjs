import { afterEach, describe, expect, it } from 'vitest'
import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
  within,
} from '../../test/renderWithProviders'
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

afterEach(() => resetMatchMedia())

describe('PortraitCarousel lightbox shell', () => {
  it('renders a compact lower-right zoom control without activating the portrait', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', {
      name: /Guitar session.*Original.*Cycle/i,
    })
    const expandButton = screen.getByRole('button', {
      name: 'View larger: Guitar session, Original',
    })

    expect(expandButton).toHaveClass('h-11', 'w-11')
    expect(expandButton).toHaveClass('right-0', 'bottom-5', 'translate-x-1/2')
    expect(screen.getByTestId('portrait-expand-visual')).toHaveClass('h-9', 'w-9')
    expect(expandButton.querySelector('svg.lucide-zoom-in')).toHaveClass('h-4', 'w-4')
    expect(portraitButton).not.toContainElement(expandButton)
    expect(portraitButton.parentElement).toContainElement(expandButton)

    await user.click(expandButton)

    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('opens a labelled dialog with the active photo and style and focuses Close', async () => {
    const { user } = renderCarousel()
    const expandButton = await screen.findByRole('button', {
      name: 'View larger: Guitar session, Original',
    })

    await user.click(expandButton)

    const dialog = await screen.findByRole('dialog', { name: 'Larger view of Guitar session' })
    expect(
      within(dialog).getByRole('heading', { name: 'Larger view of Guitar session' })
    ).toHaveClass('sr-only')
    expect(
      within(dialog).getByRole('img', { name: 'Guitar session, Original' })
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Original')).toBeInTheDocument()
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Close larger view' })).toHaveFocus()
    )
  })

  it.each(['close button', 'Escape', 'backdrop'] as const)(
    'closes through %s and restores focus to expand',
    async (closePath) => {
      const { user } = renderCarousel()
      const expandButton = await screen.findByRole('button', {
        name: 'View larger: Guitar session, Original',
      })

      await user.click(expandButton)
      const dialog = await screen.findByRole('dialog')

      if (closePath === 'close button') {
        await user.click(within(dialog).getByRole('button', { name: 'Close larger view' }))
      } else if (closePath === 'Escape') {
        await user.keyboard('{Escape}')
      } else {
        await user.click(screen.getByTestId('portrait-lightbox-backdrop'))
      }

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(expandButton).toHaveFocus()
    }
  )

  it('keeps inside-panel clicks open and traps Tab focus within the dialog', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(screen.getByTestId('portrait-lightbox-panel'))
    expect(dialog).toBeInTheDocument()

    for (let index = 0; index < 3; index += 1) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
    await user.tab({ shift: true })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })

  it('updates English dialog context to Italian while open without resetting selection', async () => {
    const { user } = renderWithProviders(<CarouselWithLanguageSwitch />, { locale: 'en' })
    const portraitButton = await screen.findByRole('button', {
      name: /Guitar session.*Original.*Cycle/i,
    })

    await user.click(portraitButton)
    await user.click(
      screen.getByRole('button', { name: 'View larger: Guitar session, 16-bit Rock' })
    )
    expect(
      await screen.findByRole('dialog', { name: 'Larger view of Guitar session' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Italian', hidden: true }))

    const dialog = await screen.findByRole('dialog', {
      name: 'Vista ingrandita di Sessione con la chitarra',
    })
    expect(within(dialog).getByRole('img')).toHaveAccessibleName(
      'Sessione con la chitarra, Rock a 16-bit'
    )
    expect(within(dialog).getByText('Rock a 16-bit')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Chiudi vista ingrandita' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('portrait-expand-control')).toHaveAccessibleName(
      'Visualizza ingrandita: Sessione con la chitarra, Rock a 16-bit'
    )
  })
})

describe('PortraitCarousel lightbox controls', () => {
  it('cycles shared styles in the lightbox and wraps both surfaces to Original', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Change style: Original' }))
    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Guitar session, 16-bit Rock')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('16-bit Rock')

    await user.click(within(dialog).getByRole('button', { name: 'Change style: 16-bit Rock' }))
    await user.click(within(dialog).getByRole('button', { name: 'Change style: 90s Anime' }))

    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Guitar session, Original')
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
  })

  it('navigates previous next and dots with wrap and resets each photo to Original', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Change style: Original' }))
    await user.click(within(dialog).getByRole('button', { name: 'Previous photo' }))
    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Family sunset, Original')
    expect(within(dialog).getByRole('button', { name: 'Show Family sunset' })).toHaveAttribute(
      'aria-current',
      'true'
    )

    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }))
    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Guitar session, Original')

    await user.click(within(dialog).getByRole('button', { name: 'Show Family sunset' }))
    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Family sunset, Original')
  })

  it('preserves the final shared selection across close and reopen', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    let dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }))
    await user.click(within(dialog).getByRole('button', { name: 'Change style: Original' }))
    await user.click(within(dialog).getByRole('button', { name: 'Close larger view' }))

    await user.click(
      await screen.findByRole('button', { name: 'View larger: Family sunset, Coastal Anime' })
    )
    dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Family sunset, Coastal Anime')
  })

  it('keeps a one-photo carousel stable under every lightbox navigation control', async () => {
    const { user } = renderWithProviders(
      <PortraitCarousel
        portraits={[portraits[0]]}
        fallbackAvatar="/static/images/avatar.png"
        fallbackAlt="Davide Aliti"
      />
    )
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Previous photo' }))
    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }))
    await user.click(within(dialog).getByRole('button', { name: 'Show Guitar session' }))

    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Guitar session, Original')
    expect(within(dialog).getByRole('button', { name: 'Show Guitar session' })).toHaveAttribute(
      'aria-current',
      'true'
    )
  })

  it('renders a square content-sized image region with mobile-safe touch controls', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')
    const image = within(dialog).getByRole('img')
    const webpSource = image.closest('picture')?.querySelector('source[type="image/webp"]')

    expect(image).toHaveClass('object-contain')
    expect(webpSource).toHaveAttribute('srcset', expect.stringContaining('-640w.webp'))
    expect(webpSource).toHaveAttribute('srcset', expect.stringContaining('-800w.webp'))
    expect(webpSource).toHaveAttribute('srcset', expect.stringContaining('-1000w.webp'))
    expect(screen.getByTestId('portrait-lightbox-panel')).toHaveClass(
      'max-h-[calc(100dvh-2rem)]',
      'overflow-y-auto',
      'w-[min(calc(100vw-2rem),46rem)]'
    )
    expect(screen.getByTestId('portrait-lightbox-image-region')).toHaveClass(
      'aspect-square',
      'w-full'
    )
    expect(screen.getByTestId('portrait-lightbox-toolbar')).toHaveClass(
      'grid',
      'grid-cols-[2.75rem_minmax(0,1fr)_2.75rem]'
    )
    const styleControl = within(dialog).getByRole('button', { name: 'Change style: Original' })
    expect(styleControl).toHaveClass('col-start-2', 'justify-self-center', 'px-3', 'sm:px-4')
    for (const name of ['Close larger view', 'Previous photo', 'Next photo']) {
      expect(within(dialog).getByRole('button', { name })).toHaveClass('h-11', 'w-11')
    }
    const activeDot = within(dialog).getByRole('button', { name: 'Show Guitar session' })
    expect.soft(activeDot.parentElement).toHaveClass('gap-0', 'sm:gap-1')
    expect.soft(activeDot).toHaveClass('h-9', 'w-9', 'sm:h-11', 'sm:w-11')
    expect.soft(activeDot.firstElementChild).toHaveClass('h-1.5', 'w-1.5', 'sm:h-2', 'sm:w-2')
  })

  it('stacks a long Italian style label above the action on mobile only', async () => {
    const longLabelPortrait: Portrait = {
      ...portraits[0],
      variants: [
        {
          id: 'topographic-watercolor',
          label: { en: 'Topographic Watercolor', it: 'Acquerello topografico' },
          src: '/static/images/about/portraits/guitar_topographic_watercolor.png',
        },
      ],
    }
    const { user } = renderWithProviders(
      <PortraitCarousel
        portraits={[longLabelPortrait]}
        fallbackAvatar="/static/images/avatar.png"
        fallbackAlt="Davide Aliti"
      />,
      { locale: 'it' }
    )

    await user.click(
      await screen.findByRole('button', {
        name: 'Visualizza ingrandita: Sessione con la chitarra, Originale',
      })
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cambia stile: Originale' }))
    const styleControl = within(dialog).getByRole('button', {
      name: 'Cambia stile: Acquerello topografico',
    })

    expect(styleControl).toHaveTextContent('Acquerello topografico')
    expect(styleControl).toHaveTextContent('Cambia stile')
    expect.soft(styleControl).toHaveClass('flex-col', 'gap-0', 'text-xs')
    expect.soft(styleControl).toHaveClass('sm:flex-row', 'sm:gap-2', 'sm:text-sm')
    expect.soft(within(styleControl).getByText('·')).toHaveClass('hidden', 'sm:inline')
    expect
      .soft(within(styleControl).getByText('Cambia stile').parentElement)
      .toHaveClass('flex', 'shrink-0')
  })

  it('uses existing light and dark theme classes with visible focus styles', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')
    const panel = screen.getByTestId('portrait-lightbox-panel')
    const styleControl = within(dialog).getByRole('button', { name: 'Change style: Original' })

    expect(panel.className).toMatch(/bg-white/)
    expect(panel.className).toMatch(/dark:bg-gray-900/)
    expect(styleControl.className).toMatch(/focus-visible:ring-2/)
    expect(styleControl.className).toMatch(/dark:/)
  })

  it('uses immediate lightbox swaps when reduced motion is enabled', async () => {
    mockReducedMotion()
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveAttribute('data-motion', 'reduced')
    await user.click(within(dialog).getByRole('button', { name: 'Change style: Original' }))
    expect(within(dialog).getAllByRole('img')).toHaveLength(1)
    expect(within(dialog).getByRole('img')).toHaveAccessibleName('Guitar session, 16-bit Rock')
  })
})

describe('PortraitCarousel lightbox fallback', () => {
  it('falls back from a failed creative lightbox image to shared Original', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Change style: Original' }))

    fireEvent.error(within(dialog).getByRole('img', { name: 'Guitar session, 16-bit Rock' }))

    await waitFor(() =>
      expect(within(dialog).getByRole('img')).toHaveAccessibleName('Guitar session, Original')
    )
    expect(screen.getByTestId('portrait-style-control')).toHaveTextContent('Original')
  })

  it('falls back from a failed Original to the legacy avatar', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')

    fireEvent.error(within(dialog).getByRole('img', { name: 'Guitar session, Original' }))

    await waitFor(() =>
      expect(within(dialog).getByRole('img')).toHaveAccessibleName('Davide Aliti')
    )
    expect(within(dialog).getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('avatar-225w.webp')
    )
  })

  it('shows localized unavailable content when the final avatar fails', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')
    fireEvent.error(within(dialog).getByRole('img'))
    const avatar = await within(dialog).findByRole('img', { name: 'Davide Aliti' })

    fireEvent.error(avatar)

    expect(await within(dialog).findByText('This image is unavailable.')).toBeInTheDocument()
    expect(within(dialog).queryByRole('img')).not.toBeInTheDocument()
    expect(
      within(dialog).getByRole('heading', { name: 'Larger view of Guitar session' })
    ).toHaveClass('sr-only')
    expect(within(dialog).getByRole('button', { name: 'Next photo' })).toBeInTheDocument()
  })

  it('shows unavailable content when Original fails without an avatar', async () => {
    const { user } = renderWithProviders(
      <PortraitCarousel portraits={portraits} fallbackAlt="Davide Aliti" />,
      { locale: 'it' }
    )
    await user.click(
      await screen.findByRole('button', {
        name: 'Visualizza ingrandita: Sessione con la chitarra, Originale',
      })
    )
    const dialog = await screen.findByRole('dialog')

    fireEvent.error(within(dialog).getByRole('img'))

    expect(
      await within(dialog).findByText('Questa immagine non è disponibile.')
    ).toBeInTheDocument()
    expect(within(dialog).queryByRole('img')).not.toBeInTheDocument()
  })

  it('clears terminal failure after selecting a new photo or style source', async () => {
    const { user } = renderCarousel()
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')
    fireEvent.error(within(dialog).getByRole('img'))
    const avatar = await within(dialog).findByRole('img', { name: 'Davide Aliti' })
    fireEvent.error(avatar)
    await within(dialog).findByText('This image is unavailable.')

    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }))

    await waitFor(() =>
      expect(within(dialog).getByRole('img')).toHaveAccessibleName('Family sunset, Original')
    )
    expect(within(dialog).queryByText('This image is unavailable.')).not.toBeInTheDocument()
  })

  it('uses existing native-width responsive assets for nonstandard originals and avatar fallback', async () => {
    const { user } = renderWithProviders(
      <PortraitCarousel
        portraits={[
          {
            ...portraits[0],
            original: '/static/images/about/portraits/guitar_session.png',
          },
          {
            ...portraits[1],
            id: 'mountain',
            title: { en: 'Mountain portrait', it: 'Ritratto in montagna' },
            original: '/static/images/about/portraits/mountain_day.png',
          },
        ]}
        fallbackAvatar="/static/images/avatar.png"
        fallbackAlt="Davide Aliti"
      />
    )
    await user.click(
      await screen.findByRole('button', { name: 'View larger: Guitar session, Original' })
    )
    const dialog = await screen.findByRole('dialog')
    const original = within(dialog).getByRole('img', { name: 'Guitar session, Original' })

    expect(original).toHaveAttribute('src', expect.stringContaining('guitar_session-636w.webp'))

    fireEvent.error(original)
    const avatar = await within(dialog).findByRole('img', { name: 'Davide Aliti' })
    expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar-225w.webp'))

    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }))
    const mountain = await within(dialog).findByRole('img', {
      name: 'Mountain portrait, Original',
    })
    expect(mountain).toHaveAttribute('src', expect.stringContaining('mountain_day-870w.webp'))
  })
})
