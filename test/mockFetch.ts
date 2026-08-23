import { vi } from 'vitest'

/**
 * Installable `fetch` mock for components that submit to an endpoint.
 *
 * `components/contact/ContactForm.tsx` POSTs to `/__forms.html` (Netlify's
 * form-detection endpoint). jsdom provides no server, so tests install one of
 * these modes and assert on the recorded call.
 *
 * @example
 * const fetchMock = mockFetch()               // resolves { ok: true }
 * // ...submit...
 * const [url, init] = fetchMock.mock.calls[0]
 *
 * @example
 * mockFetch({ ok: false, status: 500 })       // drives the error branch
 *
 * @example
 * mockFetch({ reject: new Error('offline') }) // network failure branch
 */

interface FetchMockOptions {
  /** `Response.ok`. Defaults to `true`. */
  ok?: boolean
  /** HTTP status. Defaults to `200` when ok, `500` otherwise. */
  status?: number
  /** Body returned by `response.text()`. Defaults to `''`. */
  body?: string
  /** When set, the call rejects with this error instead of resolving. */
  reject?: Error
}

/** The original global fetch, captured so `restoreFetch()` can put it back. */
const originalFetch = globalThis.fetch

/**
 * Replace `globalThis.fetch` with a spy for the current test.
 *
 * @returns the spy, for call assertions.
 */
export function mockFetch(options: FetchMockOptions = {}) {
  const { ok = true, status = ok ? 200 : 500, body = '', reject } = options

  const fetchMock = vi.fn(async () => {
    if (reject) throw reject
    return {
      ok,
      status,
      text: async () => body,
      json: async () => (body ? JSON.parse(body) : {}),
    } as unknown as Response
  })

  globalThis.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

/** Restore the original `fetch`. Call from `afterEach`. */
export function restoreFetch() {
  globalThis.fetch = originalFetch
}

/**
 * Parse a recorded `fetch` body of type
 * `application/x-www-form-urlencoded` into a plain object, so tests can
 * assert on individual submitted fields.
 */
export function parseFormBody(init: RequestInit | undefined): Record<string, string> {
  const raw = typeof init?.body === 'string' ? init.body : ''
  return Object.fromEntries(new URLSearchParams(raw))
}
