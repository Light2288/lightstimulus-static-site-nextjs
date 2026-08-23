import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { ContactMethods } from './ContactMethods'

/**
 * Characterisation tests for `ContactMethods` — the "reach me directly" panel
 * below the contact form.
 *
 * Covers:
 * - the always-present intro copy (`contact.methods_intro`) in EN and IT,
 * - the email block, rendered only when `email` is given, as a `mailto:` anchor
 *   whose visible label is the raw address,
 * - the LinkedIn block, rendered only when `linkedin` is given: a `SocialIcon`
 *   anchor plus a hint (`contact.linkedin_hint`) followed by a second anchor
 *   labelled "LinkedIn" that opens in a new tab,
 * - the empty case where neither prop is given: the section still renders its
 *   intro but contains no links at all.
 *
 * Note on the hint: `contact.linkedin_hint` ends with a trailing space and is
 * concatenated in the DOM with the "LinkedIn" anchor, so it is asserted with a
 * substring matcher (`exact: false`) rather than an exact text match.
 */

const email = 'davide.aliti@gmail.com'
const linkedin = 'https://www.linkedin.com/in/davide-aliti'

const EN_INTRO = 'Prefer not to use the form? You can also reach me directly by email.'
const IT_INTRO = 'Preferisci non usare il modulo? Puoi anche contattarmi direttamente via email.'

const EN_HINT = 'You can also reach me on'
const IT_HINT = 'Puoi anche trovarmi su'

describe('ContactMethods', () => {
  describe('intro copy', () => {
    it('renders the English intro', async () => {
      renderWithProviders(<ContactMethods />, { locale: 'en' })

      expect(await screen.findByText(EN_INTRO)).toBeInTheDocument()
    })

    it('renders the Italian intro', async () => {
      renderWithProviders(<ContactMethods />, { locale: 'it' })

      expect(await screen.findByText(IT_INTRO)).toBeInTheDocument()
    })
  })

  describe('email', () => {
    it('renders a mailto link labelled with the address', async () => {
      renderWithProviders(<ContactMethods email={email} />)

      const link = await screen.findByRole('link', { name: email })
      expect(link).toHaveAttribute('href', `mailto:${email}`)
    })

    it('renders no mailto link when email is omitted', async () => {
      renderWithProviders(<ContactMethods linkedin={linkedin} />)

      await screen.findByText(EN_INTRO)
      expect(screen.queryByRole('link', { name: email })).not.toBeInTheDocument()
      expect(
        screen.queryAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('mailto:'))
      ).toHaveLength(0)
    })
  })

  describe('linkedin', () => {
    it('renders the English hint', async () => {
      renderWithProviders(<ContactMethods linkedin={linkedin} />, { locale: 'en' })

      expect(await screen.findByText(EN_HINT, { exact: false })).toBeInTheDocument()
    })

    it('renders the Italian hint', async () => {
      renderWithProviders(<ContactMethods linkedin={linkedin} />, { locale: 'it' })

      expect(await screen.findByText(IT_HINT, { exact: false })).toBeInTheDocument()
    })

    it('renders the social icon anchor pointing at the profile', async () => {
      renderWithProviders(<ContactMethods linkedin={linkedin} />)

      await screen.findByText(EN_INTRO)
      // SocialIcon composes its accessible name from the sr-only kind plus the
      // SVG <title>: "linkedinLinkedin".
      expect(screen.getByRole('link', { name: 'linkedinLinkedin' })).toHaveAttribute(
        'href',
        linkedin
      )
    })

    it('renders the inline "LinkedIn" anchor opening in a new tab', async () => {
      renderWithProviders(<ContactMethods linkedin={linkedin} />)

      await screen.findByText(EN_INTRO)
      const inline = screen.getByRole('link', { name: 'LinkedIn' })
      expect(inline).toHaveAttribute('href', linkedin)
      expect(inline).toHaveAttribute('target', '_blank')
      expect(inline).toHaveAttribute('rel', 'noreferrer')
    })

    it('renders no linkedin hint or icon when linkedin is omitted', async () => {
      renderWithProviders(<ContactMethods email={email} />, { locale: 'en' })

      await screen.findByText(EN_INTRO)
      expect(screen.queryByText(EN_HINT, { exact: false })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'linkedinLinkedin' })).not.toBeInTheDocument()
    })
  })

  describe('with neither prop', () => {
    it('still renders the section with its intro but no links', async () => {
      renderWithProviders(<ContactMethods />, { locale: 'en' })

      expect(await screen.findByText(EN_INTRO)).toBeInTheDocument()
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('with both props', () => {
    it('renders the mailto plus both linkedin anchors', async () => {
      renderWithProviders(<ContactMethods email={email} linkedin={linkedin} />)

      await screen.findByRole('link', { name: email })
      expect(screen.getAllByRole('link')).toHaveLength(3)
    })
  })
})
