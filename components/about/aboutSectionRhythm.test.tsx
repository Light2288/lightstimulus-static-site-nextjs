import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { FocusAreas } from './FocusAreas'
import { ExploringNow } from './ExploringNow'
import { CertificationsGrid } from './CertificationsGrid'
import { CVDownloadCard } from './CVDownloadCard'
import { AboutContactBridge } from './AboutContactBridge'

/**
 * Rhythm-ownership contract for the About page sections.
 *
 * Vertical rhythm belongs to the page container in `app/about/page.tsx`, not to
 * the individual sections. A section that sets its own outer margin (the old
 * `mt-14` / `mt-16`) would fight the page's spacing scale and make the rhythm
 * impossible to tune in one place — so each section's root element must declare
 * no margin utility at all.
 *
 * Internal spacing (heading `mb-*`, grid `gap-*`, `space-y-*` between groups) is
 * deliberately *not* covered here: that is each component's own business.
 */

/** Every margin utility Tailwind could put on the root, including negatives. */
const MARGIN_UTILITY = /^-?m[trblxy]?-/

function rootSectionOf(container: HTMLElement): HTMLElement {
  const section = container.querySelector('section')
  if (!section) throw new Error('expected the component to render a root <section>')
  return section as HTMLElement
}

function marginClassesOf(container: HTMLElement): string[] {
  return Array.from(rootSectionOf(container).classList).filter((name) => MARGIN_UTILITY.test(name))
}

const focusAreas = [
  {
    title: { en: 'Frontend Architecture', it: 'Architettura Frontend' },
    description: { en: 'Design systems at scale.', it: 'Design system su larga scala.' },
  },
]

const exploringNow = [{ id: 'xr', en: 'Spatial computing', it: 'Spatial computing' }]

const certifications = [{ title: 'AWS SAA', issuer: 'Amazon', year: 2024 }]

const cv = { url: '/static/cv/cv.pdf' }

describe('About section rhythm ownership', () => {
  it('FocusAreas declares no outer margin', () => {
    const { container } = renderWithProviders(<FocusAreas areas={focusAreas} />)

    expect(marginClassesOf(container)).toEqual([])
  })

  it('ExploringNow declares no outer margin', () => {
    const { container } = renderWithProviders(<ExploringNow items={exploringNow} />)

    expect(marginClassesOf(container)).toEqual([])
  })

  it('CertificationsGrid declares no outer margin', () => {
    const { container } = renderWithProviders(<CertificationsGrid items={certifications} />)

    expect(marginClassesOf(container)).toEqual([])
  })

  it('CVDownloadCard declares no outer margin', () => {
    const { container } = renderWithProviders(<CVDownloadCard cv={cv} />)

    expect(marginClassesOf(container)).toEqual([])
  })

  it('AboutContactBridge declares no outer margin', () => {
    const { container } = renderWithProviders(<AboutContactBridge />)

    expect(marginClassesOf(container)).toEqual([])
  })
})

/**
 * The two cards sharing the paired row must agree on height regardless of which
 * one has more content.
 *
 * The mechanism: each section is a full-height flex column, and the glass shell
 * inside it takes `flex-1`. `h-full` on the shell would be wrong — it resolves
 * against the section, ignoring the heading above it, so the shell would
 * overflow its grid cell by the heading's height. `flex-1` instead consumes
 * exactly the space the heading leaves behind.
 */
describe('Paired-row equal height', () => {
  it('ExploringNow stretches its section and fills the remaining height', () => {
    const { container } = renderWithProviders(<ExploringNow items={exploringNow} />)

    const section = rootSectionOf(container)
    expect(section).toHaveClass('h-full')
    expect(section).toHaveClass('flex-col')
    expect(section.querySelector('.glass-bg')).toHaveClass('flex-1')
  })

  it('CVDownloadCard stretches its section and fills the remaining height', () => {
    const { container } = renderWithProviders(<CVDownloadCard cv={cv} />)

    const section = rootSectionOf(container)
    expect(section).toHaveClass('h-full')
    expect(section).toHaveClass('flex-col')
    expect(section.querySelector('.glass-bg')).toHaveClass('flex-1')
  })

  it.each([
    ['ExploringNow', () => <ExploringNow items={exploringNow} />],
    ['CVDownloadCard', () => <CVDownloadCard cv={cv} />],
  ])('does not pin the %s shell to the section height, which would overflow', (_name, ui) => {
    const { container } = renderWithProviders(ui())

    expect(container.querySelector('.glass-bg')).not.toHaveClass('h-full')
  })
})
