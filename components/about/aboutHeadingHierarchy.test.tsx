import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { FocusAreas } from './FocusAreas'
import { ExploringNow } from './ExploringNow'
import { CertificationsGrid } from './CertificationsGrid'
import { CVDownloadCard } from './CVDownloadCard'

/**
 * Heading-hierarchy contract for the About page bands.
 *
 * The page reads as major full-width bands (`FocusAreas`, `CertificationsGrid`)
 * plus a subordinate paired row (`ExploringNow` + `CVDownloadCard`). The paired
 * row must therefore be visually *smaller* than the major bands.
 *
 * Crucially this is a **visual** demotion only: every section heading stays an
 * `<h2>` so the document outline and screen-reader navigation are unchanged.
 * These tests pin both halves of that contract — the level stays 2, the type
 * scale differs — so a future tweak cannot silently demote the element itself.
 */

const MAJOR_BAND_SCALE = 'text-2xl'
const SUBORDINATE_SCALE = 'text-lg'

const focusAreas = [
  {
    title: { en: 'Frontend Architecture', it: 'Architettura Frontend' },
    description: { en: 'Design systems at scale.', it: 'Design system su larga scala.' },
  },
]

const exploringNow = [{ id: 'xr', en: 'Spatial computing', it: 'Spatial computing' }]

const certifications = [{ title: 'AWS SAA', issuer: 'Amazon', year: 2024 }]

const cv = { url: '/static/cv/cv.pdf' }

/** The section's own heading — the first h2 rendered by the component. */
async function sectionHeading(): Promise<HTMLElement> {
  const headings = await screen.findAllByRole('heading', { level: 2 })
  return headings[0]
}

describe('About heading hierarchy', () => {
  describe('major bands keep the dominant scale', () => {
    it('FocusAreas renders its heading at the major-band scale', async () => {
      renderWithProviders(<FocusAreas areas={focusAreas} />)

      expect(await sectionHeading()).toHaveClass(MAJOR_BAND_SCALE)
    })

    it('CertificationsGrid renders its heading at the major-band scale', async () => {
      renderWithProviders(<CertificationsGrid items={certifications} />)

      expect(await sectionHeading()).toHaveClass(MAJOR_BAND_SCALE)
    })
  })

  describe('paired-row cards are visually subordinate', () => {
    it('ExploringNow renders its heading below the major-band scale', async () => {
      renderWithProviders(<ExploringNow items={exploringNow} />)

      const heading = await sectionHeading()
      expect(heading).toHaveClass(SUBORDINATE_SCALE)
      expect(heading).not.toHaveClass(MAJOR_BAND_SCALE)
    })

    it('CVDownloadCard renders its heading below the major-band scale', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      const heading = await sectionHeading()
      expect(heading).toHaveClass(SUBORDINATE_SCALE)
      expect(heading).not.toHaveClass(MAJOR_BAND_SCALE)
    })
  })

  describe('semantic level is preserved everywhere', () => {
    it('keeps ExploringNow as an h2 despite the smaller scale', async () => {
      renderWithProviders(<ExploringNow items={exploringNow} />)

      expect(await sectionHeading()).toHaveProperty('tagName', 'H2')
    })

    it('keeps CVDownloadCard as an h2 despite the smaller scale', async () => {
      renderWithProviders(<CVDownloadCard cv={cv} />)

      expect(await sectionHeading()).toHaveProperty('tagName', 'H2')
    })
  })
})
