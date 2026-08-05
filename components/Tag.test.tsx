import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../test/renderWithProviders'
import Tag from './Tag'

/**
 * Example test — 'use client' component that consumes `useLanguage`.
 * Proves the harness wires the LanguageProvider (and theme provider) and that
 * switching the active locale changes the rendered text.
 *
 * The fixture mirrors the shape produced by the app's tag data: a stable
 * bilingual label taken from the locale files (`common.all` → "All" / "Tutti").
 */
const tagFixture = {
  id: 'all',
  label: { en: 'All', it: 'Tutti' },
}

describe('Tag', () => {
  it('renders the English label when locale is "en"', async () => {
    renderWithProviders(<Tag tag={tagFixture} />, { locale: 'en' })

    expect(await screen.findByText('All')).toBeInTheDocument()
  })

  it('renders the Italian label when locale is "it"', async () => {
    renderWithProviders(<Tag tag={tagFixture} />, { locale: 'it' })

    expect(await screen.findByText('Tutti')).toBeInTheDocument()
  })
})
