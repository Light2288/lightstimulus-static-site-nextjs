import { describe, it, expect, afterEach } from 'vitest'
import { mockFetch, restoreFetch, parseFormBody } from './mockFetch'

/** Verifies the `fetch` mock used by the contact-form tests. */
afterEach(() => {
  restoreFetch()
})

describe('mockFetch', () => {
  it('resolves an ok response by default', async () => {
    const fetchMock = mockFetch()

    const response = await fetch('/__forms.html', { method: 'POST' })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(response.ok).toBe(true)
    expect(response.status).toBe(200)
  })

  it('can resolve a failing response', async () => {
    mockFetch({ ok: false, status: 500 })

    const response = await fetch('/__forms.html')

    expect(response.ok).toBe(false)
    expect(response.status).toBe(500)
  })

  it('can reject to simulate a network failure', async () => {
    mockFetch({ reject: new Error('offline') })

    await expect(fetch('/__forms.html')).rejects.toThrow('offline')
  })

  it('records the url and init for assertions', async () => {
    const fetchMock = mockFetch()

    await fetch('/__forms.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'form-name=contact&name=Ada',
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/__forms.html')
    expect(init.method).toBe('POST')
  })

  it('restores the original fetch', async () => {
    const fetchMock = mockFetch()
    restoreFetch()

    expect(globalThis.fetch).not.toBe(fetchMock)
  })
})

describe('parseFormBody', () => {
  it('decodes a urlencoded body into an object', () => {
    const parsed = parseFormBody({ body: 'form-name=contact&name=Ada+L&message=hi+there' })

    expect(parsed).toEqual({
      'form-name': 'contact',
      name: 'Ada L',
      message: 'hi there',
    })
  })

  it('returns an empty object when there is no body', () => {
    expect(parseFormBody(undefined)).toEqual({})
    expect(parseFormBody({})).toEqual({})
  })
})
