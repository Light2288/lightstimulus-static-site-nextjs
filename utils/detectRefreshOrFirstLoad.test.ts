import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectRefreshOrFirstLoad } from './detectRefreshOrFirstLoad'

/**
 * Characterisation tests for the refresh/first-load heuristic.
 *
 * The function compares a `sessionStorage` timestamp against `Date.now()`:
 * absent timestamp → `true`; gap > 100ms → `true` (a real reload);
 * gap <= 100ms → `false` (a fast internal-navigation remount).
 *
 * Time is faked so the 100ms boundary is exercised deterministically.
 */
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('detectRefreshOrFirstLoad', () => {
  it('returns true on the first call for a key (no stored timestamp)', () => {
    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(true)
  })

  it('stores the current timestamp for the next mount', () => {
    detectRefreshOrFirstLoad('logo_mount_ts')

    expect(window.sessionStorage.getItem('logo_mount_ts')).toBe(String(Date.now()))
  })

  it('returns false for a fast remount (<= 100ms) — internal navigation', () => {
    detectRefreshOrFirstLoad('logo_mount_ts')

    vi.advanceTimersByTime(20)

    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(false)
  })

  it('returns true for a slow remount (> 100ms) — a real reload', () => {
    detectRefreshOrFirstLoad('logo_mount_ts')

    vi.advanceTimersByTime(101)

    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(true)
  })

  it('treats exactly 100ms as internal navigation (boundary is exclusive)', () => {
    detectRefreshOrFirstLoad('logo_mount_ts')

    vi.advanceTimersByTime(100)

    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(false)
  })

  it('refreshes the stored timestamp on every call', () => {
    detectRefreshOrFirstLoad('logo_mount_ts')
    const first = window.sessionStorage.getItem('logo_mount_ts')

    vi.advanceTimersByTime(500)
    detectRefreshOrFirstLoad('logo_mount_ts')

    expect(window.sessionStorage.getItem('logo_mount_ts')).not.toBe(first)
  })

  it('keeps separate keys independent', () => {
    // The logo mounts first; the text component's key is still unseen.
    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(true)
    expect(detectRefreshOrFirstLoad('text_mount_ts')).toBe(true)

    vi.advanceTimersByTime(20)

    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(false)
    expect(detectRefreshOrFirstLoad('text_mount_ts')).toBe(false)
  })

  it('returns true again after the stored timestamp is cleared', () => {
    detectRefreshOrFirstLoad('logo_mount_ts')
    window.sessionStorage.removeItem('logo_mount_ts')

    expect(detectRefreshOrFirstLoad('logo_mount_ts')).toBe(true)
  })
})
