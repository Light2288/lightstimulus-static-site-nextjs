import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * Characterisation tests for the search-button provider switch.
 *
 * `siteMetadata` is read at render time, so it is mocked per test to drive the
 * three branches: algolia, kbar, and no search provider at all.
 */
const baseMetadata = {
  title: 'Test',
  siteUrl: 'https://example.com',
}

/** Render the button with a specific `search` config in siteMetadata. */
async function renderWithSearchConfig(search: unknown) {
  vi.doMock('@/data/siteMetadata', () => ({
    default: { ...baseMetadata, search },
  }))
  const { default: SearchButton } = await import('./SearchButton')
  return render(<SearchButton />)
}

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.doUnmock('@/data/siteMetadata')
})

describe('SearchButton', () => {
  it('renders a search button for the kbar provider', async () => {
    await renderWithSearchConfig({
      provider: 'kbar',
      kbarConfig: { searchDocumentsPath: '/search.json' },
    })

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('renders a search button for the algolia provider', async () => {
    await renderWithSearchConfig({
      provider: 'algolia',
      algoliaConfig: { appId: 'x', apiKey: 'y', indexName: 'z' },
    })

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('renders nothing when search is not configured', async () => {
    const { container } = await renderWithSearchConfig(undefined)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for an unrecognised provider', async () => {
    const { container } = await renderWithSearchConfig({ provider: 'elasticsearch' })

    expect(container).toBeEmptyDOMElement()
  })

  it('includes a magnifying-glass icon when rendered', async () => {
    const { container } = await renderWithSearchConfig({
      provider: 'kbar',
      kbarConfig: { searchDocumentsPath: '/search.json' },
    })

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
