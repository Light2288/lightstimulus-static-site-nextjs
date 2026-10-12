import { afterEach, describe, expect, it } from 'vitest'
import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
  within,
} from '../../test/renderWithProviders'
import { useLanguage } from '@/contexts/LanguageContext'
import { resetMatchMedia } from '../../test/mockMatchMedia'
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
  it('renders a separate 44px contextual expand control without activating the portrait', async () => {
    const { user } = renderCarousel()
    const portraitButton = await screen.findByRole('button', {
      name: /Guitar session.*Original.*Cycle/i,
    })
    const expandButton = screen.getByRole('button', {
      name: 'View larger: Guitar session, Original',
    })

    expect(expandButton).toHaveClass('h-11', 'w-11')
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
