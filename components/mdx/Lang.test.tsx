import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import Lang from './Lang'

/**
 * `Lang` is the MDX escape hatch for locale-specific prose: it renders its
 * children only when the active language matches `value`.
 */
describe('Lang', () => {
  it('renders children when the value matches the active locale', async () => {
    renderWithProviders(<Lang value="en">English only</Lang>, { locale: 'en' })

    expect(await screen.findByText('English only')).toBeInTheDocument()
  })

  it('renders nothing when the value does not match', async () => {
    renderWithProviders(<Lang value="it">Italian only</Lang>, { locale: 'en' })

    await waitFor(() => expect(screen.queryByText('Italian only')).not.toBeInTheDocument())
  })

  it('renders Italian children under the Italian locale', async () => {
    renderWithProviders(<Lang value="it">Solo italiano</Lang>, { locale: 'it' })

    expect(await screen.findByText('Solo italiano')).toBeInTheDocument()
  })

  it('hides English children under the Italian locale', async () => {
    renderWithProviders(<Lang value="en">English only</Lang>, { locale: 'it' })

    await waitFor(() => expect(screen.queryByText('English only')).not.toBeInTheDocument())
  })

  it('renders nothing for an unknown locale value', async () => {
    renderWithProviders(<Lang value="fr">Français</Lang>, { locale: 'en' })

    await waitFor(() => expect(screen.queryByText('Français')).not.toBeInTheDocument())
  })

  it('renders complex children unchanged when the locale matches', async () => {
    renderWithProviders(
      <Lang value="en">
        <strong>Bold</strong> and <em>italic</em>
      </Lang>,
      { locale: 'en' }
    )

    expect(await screen.findByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })
})
