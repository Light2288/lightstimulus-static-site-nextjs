import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import SectionHeader from './SectionHeader'

/** Characterisation tests for the gradient section heading. */
describe('SectionHeader', () => {
  it('renders the translated label as a level-2 heading', async () => {
    renderWithProviders(<SectionHeader labelKey="home.blog.title" />)

    const heading = await screen.findByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).not.toHaveTextContent('home.blog.title')
  })

  it('renders the Italian label under the Italian locale', async () => {
    renderWithProviders(<SectionHeader labelKey="common.all" />, { locale: 'it' })

    expect(await screen.findByRole('heading', { level: 2, name: 'Tutti' })).toBeInTheDocument()
  })

  it('renders the English label under the English locale', async () => {
    renderWithProviders(<SectionHeader labelKey="common.all" />, { locale: 'en' })

    expect(await screen.findByRole('heading', { level: 2, name: 'All' })).toBeInTheDocument()
  })

  it('falls back to the key itself when the translation is missing', async () => {
    renderWithProviders(<SectionHeader labelKey="not.a.real.key" />)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'not.a.real.key' })
    ).toBeInTheDocument()
  })

  it('applies the gradient clip-text treatment', async () => {
    renderWithProviders(<SectionHeader labelKey="common.all" />)

    const heading = await screen.findByRole('heading', { level: 2 })
    expect(heading).toHaveClass('bg-clip-text', 'text-transparent')
  })
})
