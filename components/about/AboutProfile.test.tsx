import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import AboutProfile from './AboutProfile'

/**
 * Characterisation tests for `AboutProfile` — the identity card at the top of
 * the About page.
 *
 * Covers:
 * - the identity block (name as a level-2 heading, optional occupation/company),
 * - the avatar, which is rendered only when the `avatar` prop is set, and whose
 *   `alt` falls back to the literal string `'Avatar'` when `name` is absent,
 * - the social icons: only `email` (as a `mailto:`), `github` and `linkedin` are
 *   rendered — `twitter` and `bluesky` are accepted by the prop type but never
 *   rendered by the component,
 * - the four fixed highlight bullets `about.profile.highlights.0..3`, in EN and IT.
 *
 * `SocialIcon` composes its accessible name from an sr-only kind label plus the
 * icon's own SVG `<title>` (see `components/social-icons/index.test.tsx`), so
 * links are matched by href rather than by name where that is clearer.
 */

const socials = {
  email: 'davide.aliti@gmail.com',
  github: 'https://github.com/Light2288',
  linkedin: 'https://www.linkedin.com/in/davide-aliti',
}

const baseProps = {
  name: 'Davide Aliti',
  avatar: '/static/images/avatar.png',
  occupation: 'Public Sector Strategy and Transformation Leader',
  company: 'IBM',
  socials,
}

const EN_HIGHLIGHTS = [
  'Senior Application Architect & Technical Leader',
  'People Manager (20+ professionals team)',
  'Public sector platforms used by millions',
  'Frontend, Mobile, Cloud & AI systems at scale',
]

const IT_HIGHLIGHTS = [
  'Senior Application Architect & Technical Leader',
  'People Manager (team di oltre 20 professionisti)',
  'Piattaforme per la pubblica amministrazione usate da milioni di utenti',
  'Sistemi Frontend, Mobile, Cloud e AI su larga scala',
]

describe('AboutProfile', () => {
  describe('identity block', () => {
    it('renders the name as a level-2 heading', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      expect(
        await screen.findByRole('heading', { level: 2, name: 'Davide Aliti' })
      ).toBeInTheDocument()
    })

    it('renders the occupation and the company', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      expect(
        await screen.findByText('Public Sector Strategy and Transformation Leader')
      ).toBeInTheDocument()
      expect(screen.getByText('IBM')).toBeInTheDocument()
    })

    it('omits the occupation when it is not provided', async () => {
      renderWithProviders(<AboutProfile {...baseProps} occupation={undefined} />)

      await screen.findByRole('heading', { level: 2 })
      expect(
        screen.queryByText('Public Sector Strategy and Transformation Leader')
      ).not.toBeInTheDocument()
    })

    it('omits the company when it is not provided', async () => {
      renderWithProviders(<AboutProfile {...baseProps} company={undefined} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.queryByText('IBM')).not.toBeInTheDocument()
    })

    it('still renders the heading (empty) when no name is provided', async () => {
      renderWithProviders(<AboutProfile {...baseProps} name={undefined} />)

      const heading = await screen.findByRole('heading', { level: 2 })
      expect(heading).toBeEmptyDOMElement()
    })
  })

  describe('avatar', () => {
    it('renders an image using the name as alt text when avatar is set', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      const img = await screen.findByRole('img', { name: 'Davide Aliti' })
      expect(img).toBeInTheDocument()
    })

    it('falls back to the "Avatar" alt text when no name is provided', async () => {
      renderWithProviders(<AboutProfile {...baseProps} name={undefined} />)

      expect(await screen.findByRole('img', { name: 'Avatar' })).toBeInTheDocument()
    })

    it('renders no image at all when avatar is omitted', async () => {
      renderWithProviders(<AboutProfile {...baseProps} avatar={undefined} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('social icons', () => {
    it('renders the email as a mailto link', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getByRole('link', { name: /^mail/ })).toHaveAttribute(
        'href',
        'mailto:davide.aliti@gmail.com'
      )
    })

    it('renders the github link', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getByRole('link', { name: /^github/ })).toHaveAttribute(
        'href',
        'https://github.com/Light2288'
      )
    })

    it('renders the linkedin link', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getByRole('link', { name: /^linkedin/ })).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/davide-aliti'
      )
    })

    it('renders no social links when socials is empty', async () => {
      renderWithProviders(<AboutProfile {...baseProps} socials={{}} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })

    it('renders only the icons for the provided fields', async () => {
      renderWithProviders(
        <AboutProfile {...baseProps} socials={{ github: 'https://github.com/Light2288' }} />
      )

      await screen.findByRole('heading', { level: 2 })
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute('href', 'https://github.com/Light2288')
    })

    it('ignores twitter and bluesky even though the prop type accepts them', async () => {
      renderWithProviders(
        <AboutProfile
          {...baseProps}
          socials={{ twitter: 'https://x.com/someone', bluesky: 'https://bsky.app/someone' }}
        />
      )

      await screen.findByRole('heading', { level: 2 })
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('highlights', () => {
    it('renders the four English highlights as list items', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />, { locale: 'en' })

      for (const highlight of EN_HIGHLIGHTS) {
        expect(await screen.findByText(`• ${highlight}`)).toBeInTheDocument()
      }
    })

    it('renders the four Italian highlights as list items', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />, { locale: 'it' })

      for (const highlight of IT_HIGHLIGHTS) {
        expect(await screen.findByText(`• ${highlight}`)).toBeInTheDocument()
      }
    })

    it('renders exactly four bullets', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      await screen.findByRole('heading', { level: 2 })
      expect(screen.getAllByRole('listitem')).toHaveLength(4)
    })

    it('never leaks the raw highlight keys', async () => {
      renderWithProviders(<AboutProfile {...baseProps} />)

      await screen.findByRole('heading', { level: 2 })
      for (const index of [0, 1, 2, 3]) {
        expect(screen.queryByText(`• about.profile.highlights.${index}`)).not.toBeInTheDocument()
      }
    })
  })
})
