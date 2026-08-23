import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import ProjectLayoutClient from './ProjectLayoutClient'

/**
 * Characterisation tests for `ProjectLayoutClient` — the "back to projects"
 * footer of a project page.
 *
 * Documented behaviour:
 * - Takes no props and renders a single `<footer>` containing one internal
 *   `Link` to `/projects`.
 * - `projects.back` is used twice: as the link's `aria-label` *and* as its
 *   visible text, prefixed by a `←` glyph. The `aria-label` wins for the
 *   accessible name, so the accessible name has no arrow while the text content
 *   does.
 *
 * `useLanguage` applies the locale in a mount effect, so all assertions on the
 * translated label are async.
 */
describe('ProjectLayoutClient', () => {
  it('renders exactly one link, pointing at /projects', async () => {
    renderWithProviders(<ProjectLayoutClient />)

    const links = await screen.findAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/projects')
  })

  it('renders the link inside a footer element', () => {
    const { container } = renderWithProviders(<ProjectLayoutClient />)

    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.querySelector('a')).toHaveAttribute('href', '/projects')
  })

  it('uses projects.back as the aria-label in English', async () => {
    renderWithProviders(<ProjectLayoutClient />, { locale: 'en' })

    const link = await screen.findByRole('link', { name: 'Back to projects' })
    expect(link).toHaveAttribute('aria-label', 'Back to projects')
  })

  it('uses projects.back as the aria-label in Italian', async () => {
    renderWithProviders(<ProjectLayoutClient />, { locale: 'it' })

    const link = await screen.findByRole('link', { name: 'Torna ai progetti' })
    expect(link).toHaveAttribute('aria-label', 'Torna ai progetti')
  })

  it('also uses projects.back as the visible text, prefixed by a left arrow', async () => {
    renderWithProviders(<ProjectLayoutClient />, { locale: 'en' })

    const link = await screen.findByRole('link')
    expect(link).toHaveTextContent('← Back to projects')
  })

  it('renders the Italian visible text with the same arrow prefix', async () => {
    renderWithProviders(<ProjectLayoutClient />, { locale: 'it' })

    const link = await screen.findByRole('link')
    expect(link).toHaveTextContent('← Torna ai progetti')
  })

  it('exposes the same string as aria-label and as text, so the arrow is not announced', async () => {
    renderWithProviders(<ProjectLayoutClient />, { locale: 'en' })

    const link = await screen.findByRole('link')
    // aria-label overrides the text content for the accessible name.
    expect(link).toHaveAccessibleName('Back to projects')
    expect(link.textContent).toContain('←')
  })
})
