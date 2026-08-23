import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import ProjectCardGrid from './ProjectCardGrid'
import type { LocalizedTag } from '@/types/localizedTag'

/**
 * Characterisation tests for `ProjectCardGrid` — a thin wrapper that forwards
 * its props to `ProjectCardBase`.
 *
 * `ProjectCardGrid` adds no markup of its own, so these tests document the
 * delegation through the rendered DOM (the base component's own behaviour is
 * covered in `ProjectCardBase.test.tsx`):
 *
 * - `href`, `title`, `summary`, `coverImage`, `date`, `tags` and `priority` are
 *   all forwarded.
 * - `small` is **not** forwarded, so the base always renders its full-size
 *   image (`h-48`).
 * - Unlike the base, `date` is a required prop here.
 *
 * Dates are only asserted via stable substrings / the `dateTime` attribute
 * because `Intl` output depends on the running Node build's ICU data.
 *
 * The base consumes `useLanguage`, which applies the locale in a mount effect,
 * so assertions are async.
 */

/** Midday UTC keeps the calendar month stable across CI timezones. */
const DATE = '2026-07-22T12:00:00.000Z'
const COVER = '/static/images/projects/certflow.png'

const tags: LocalizedTag[] = [
  { id: 'nextjs', label: { en: 'Next.js', it: 'Next.js' } },
  { id: 'education', label: { en: 'Education', it: 'Formazione' } },
]

function renderCard(
  overrides: Partial<React.ComponentProps<typeof ProjectCardGrid>> = {},
  locale: 'en' | 'it' = 'en'
) {
  return renderWithProviders(
    <ProjectCardGrid
      href="/projects/certflow"
      title="CertFlow"
      summary="An AI-augmented certification study platform."
      date={DATE}
      {...overrides}
    />,
    { locale }
  )
}

describe('ProjectCardGrid', () => {
  it('forwards title and href to the base card heading link', async () => {
    renderCard()

    expect(await screen.findByRole('heading', { level: 2, name: 'CertFlow' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CertFlow' })).toHaveAttribute(
      'href',
      '/projects/certflow'
    )
  })

  it('forwards the summary', async () => {
    renderCard()

    expect(
      await screen.findByText('An AI-augmented certification study platform.')
    ).toBeInTheDocument()
  })

  it('forwards coverImage so the base renders the image block', async () => {
    renderCard({ coverImage: COVER })

    expect(await screen.findByRole('img', { name: 'CertFlow' })).toBeInTheDocument()
  })

  it('omits the image block when coverImage is not provided', async () => {
    renderCard()

    expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('forwards date so the base renders the badge', async () => {
    const { container } = renderCard({ coverImage: COVER })

    const time = container.querySelector('time')
    expect(time).toHaveAttribute('datetime', DATE)
    expect(time).toHaveTextContent('2026')
  })

  it('forwards tags to the base card', async () => {
    renderCard({ tags })

    expect(await screen.findByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('renders localised tag labels under the Italian locale', async () => {
    renderCard({ tags }, 'it')

    expect(await screen.findByText('Formazione')).toBeInTheDocument()
  })

  it('renders no tag list when tags is omitted', async () => {
    renderCard()

    expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('forwards priority as fetchpriority="high"', async () => {
    renderCard({ coverImage: COVER, priority: true })

    expect(await screen.findByRole('img', { name: 'CertFlow' })).toHaveAttribute(
      'fetchpriority',
      'high'
    )
  })

  it('leaves fetchpriority at "auto" when priority is not set', async () => {
    renderCard({ coverImage: COVER })

    expect(await screen.findByRole('img', { name: 'CertFlow' })).toHaveAttribute(
      'fetchpriority',
      'auto'
    )
  })

  it('does not pass `small`, so the image keeps the full-size h-48 class', async () => {
    renderCard({ coverImage: COVER })

    const img = await screen.findByRole('img', { name: 'CertFlow' })
    expect(img).toHaveClass('h-48')
    expect(img).not.toHaveClass('h-40')
  })
})
