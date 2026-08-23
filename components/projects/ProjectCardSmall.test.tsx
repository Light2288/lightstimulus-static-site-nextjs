import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import ProjectCardSmall from './ProjectCardSmall'

/**
 * Characterisation tests for `ProjectCardSmall` — the compact project card used
 * by the home-page preview, a thin wrapper over `ProjectCardBase`.
 *
 * `ProjectCardSmall` adds no markup of its own, so these tests document the
 * delegation through the rendered DOM (the base component's own behaviour is
 * covered in `ProjectCardBase.test.tsx`):
 *
 * - Only `href`, `title`, `summary` and `coverImage` are accepted; they are all
 *   forwarded, and `small` is hard-coded to `true` (image gets `h-40`).
 * - It has no `date`, `tags` or `priority` props, so the base never renders the
 *   date badge or the tag list, and `fetchpriority` stays `"auto"`.
 * - Despite being a wrapper around a `'use client'` component, this file itself
 *   carries no `'use client'` directive.
 *
 * The base consumes `useLanguage`, which applies the locale in a mount effect,
 * so assertions are async.
 */

const COVER = '/static/images/projects/micelio.png'

function renderCard(
  overrides: Partial<React.ComponentProps<typeof ProjectCardSmall>> = {},
  locale: 'en' | 'it' = 'en'
) {
  return renderWithProviders(
    <ProjectCardSmall
      href="/projects/micelio"
      title="Micelio"
      summary="A SwiftUI companion for mushroom foraging."
      {...overrides}
    />,
    { locale }
  )
}

describe('ProjectCardSmall', () => {
  it('forwards title and href to the base card heading link', async () => {
    renderCard()

    expect(await screen.findByRole('heading', { level: 2, name: 'Micelio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Micelio' })).toHaveAttribute(
      'href',
      '/projects/micelio'
    )
  })

  it('forwards the summary', async () => {
    renderCard()

    expect(
      await screen.findByText('A SwiftUI companion for mushroom foraging.')
    ).toBeInTheDocument()
  })

  it('forwards coverImage so the base renders the image block', async () => {
    renderCard({ coverImage: COVER })

    const img = await screen.findByRole('img', { name: 'Micelio' })
    expect(img).toBeInTheDocument()
    // The image is wrapped in its own aria-labelled link plus the heading link.
    expect(screen.getAllByRole('link', { name: 'Micelio' })).toHaveLength(2)
  })

  it('omits the image block when coverImage is not provided', async () => {
    renderCard()

    expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('passes `small`, so the image uses the compact h-40 class', async () => {
    renderCard({ coverImage: COVER })

    const img = await screen.findByRole('img', { name: 'Micelio' })
    expect(img).toHaveClass('h-40')
    expect(img).not.toHaveClass('h-48')
  })

  it('renders no date badge because no date prop is forwarded', async () => {
    const { container } = renderCard({ coverImage: COVER })

    expect(await screen.findByRole('img', { name: 'Micelio' })).toBeInTheDocument()
    expect(container.querySelector('time')).not.toBeInTheDocument()
  })

  it('renders no tag list because no tags prop is forwarded', async () => {
    renderCard({ coverImage: COVER })

    expect(await screen.findByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('leaves fetchpriority at "auto" because priority is never forwarded', async () => {
    renderCard({ coverImage: COVER })

    expect(await screen.findByRole('img', { name: 'Micelio' })).toHaveAttribute(
      'fetchpriority',
      'auto'
    )
  })

  it('renders identically under the Italian locale (no localised strings of its own)', async () => {
    renderCard({ coverImage: COVER }, 'it')

    expect(await screen.findByRole('heading', { level: 2, name: 'Micelio' })).toBeInTheDocument()
    expect(screen.getByText('A SwiftUI companion for mushroom foraging.')).toBeInTheDocument()
  })
})
