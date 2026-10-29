import { useState } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import { mockNavigation, resetNavigationMock } from '../../test/mockNavigation'
import { mockFetch, restoreFetch } from '../../test/mockFetch'
import { useLanguage } from '@/contexts/LanguageContext'
import SearchProvider from './SearchProvider'

const harness = vi.hoisted(() => ({
  actions: [] as {
    id: string
    name: string
    keywords: string
    section: string
    subtitle?: string
    perform: () => void
  }[],
  loading: true,
}))
vi.mock('pliny/search/KBarModal', () => ({
  KBarModal: ({ actions, isLoading }) => {
    harness.actions = actions
    harness.loading = isLoading
    return <div data-testid="palette" />
  },
}))

const index = [
  {
    id: 'project-en',
    title: 'Layered cube',
    summary: 'English summary',
    type: 'Project',
    url: '/projects/usdz-validator',
    lang: 'en',
  },
  {
    id: 'project-it',
    title: 'Cubo a strati',
    summary: 'Descrizione italiana',
    type: 'Project',
    url: '/projects/usdz-validator',
    lang: 'it',
  },
  { id: 'page-en', title: 'About', summary: '', type: 'Page', url: '/about', lang: 'en' },
]
function StatefulPage() {
  const [count, setCount] = useState(0)
  const { switchLang } = useLanguage()
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count {count}</button>
      <button onClick={() => switchLang('it')}>Italian</button>
    </>
  )
}
async function mount(locale: 'en' | 'it' = 'en') {
  const result = renderWithProviders(
    <SearchProvider>
      <StatefulPage />
    </SearchProvider>,
    { locale }
  )
  await waitFor(() => expect(harness.loading).toBe(false))
  return result
}
beforeEach(() => {
  harness.actions = []
  harness.loading = true
  mockNavigation({ pathname: '/' })
  mockFetch({ body: JSON.stringify(index) })
})
afterEach(() => {
  resetNavigationMock()
  restoreFetch()
})

describe('SearchProvider', () => {
  it('fetches the configured index and maps only the active language', async () => {
    const fetcher = mockFetch({ body: JSON.stringify(index) })
    await mount()
    expect(fetcher).toHaveBeenCalledWith('/search.json', { signal: expect.any(AbortSignal) })
    expect(harness.actions.map((a) => a.id)).toEqual(['project-en', 'page-en'])
    expect(harness.actions[0]).toMatchObject({
      name: 'Layered cube',
      keywords: 'English summary',
      section: 'Project',
      subtitle: 'English summary',
    })
    expect(harness.actions[1].keywords).toBe('')
  })
  it('applies a saved Italian preference', async () => {
    await mount('it')
    expect(harness.actions.map((a) => a.id)).toEqual(['project-it'])
  })
  it('updates search actions without refetching or remounting page content', async () => {
    const fetcher = mockFetch({ body: JSON.stringify(index) })
    const { user } = await mount()
    await user.click(screen.getByRole('button', { name: 'Count 0' }))
    const node = screen.getByRole('button', { name: 'Count 1' })
    await user.click(screen.getByRole('button', { name: 'Italian' }))
    expect(screen.getByRole('button', { name: 'Count 1' })).toBe(node)
    expect(harness.actions.map((a) => a.id)).toEqual(['project-it'])
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('navigates to the generated URL only when an action is performed', async () => {
    const router = mockNavigation({ pathname: '/' })
    await mount()
    expect(router.push).not.toHaveBeenCalled()
    harness.actions[0].perform()
    expect(router.push).toHaveBeenCalledWith('/projects/usdz-validator')
  })
  it('handles an empty index', async () => {
    mockFetch({ body: '[]' })
    await mount()
    expect(harness.actions).toEqual([])
  })
  it.each([
    { ok: false, status: 404 },
    { reject: new Error('Offline') },
    { body: '<html>Fallback</html>' },
  ])('handles index failure with context and usable page content: %j', async (response) => {
    mockFetch(response)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await mount()
      expect(error).toHaveBeenCalledWith('Unable to load the site search index', expect.any(Error))
      expect(harness.actions).toEqual([])
      expect(screen.getByRole('button', { name: 'Count 0' })).toBeInTheDocument()
    } finally {
      error.mockRestore()
    }
  })
  it('aborts the index request on navigation and ignores late completion', async () => {
    let resolve!: (value: Response) => void
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((r) => {
          resolve = r
        })
    )
    globalThis.fetch = fetcher
    const view = renderWithProviders(
      <SearchProvider>
        <p>Page</p>
      </SearchProvider>
    )
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal
    view.unmount()
    expect(signal?.aborted).toBe(true)
    resolve({ ok: true, json: async () => index } as Response)
  })
})
