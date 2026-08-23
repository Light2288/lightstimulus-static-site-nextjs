import { describe, it, expect, afterEach, vi } from 'vitest'
import { PreferencesService } from './PreferencesService'

/**
 * Characterisation tests for the localStorage-backed preferences service.
 *
 * `test/setup.ts` installs an in-memory `Storage` and clears it in a global
 * `afterEach`, so each test starts from an empty store.
 */
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PreferencesService', () => {
  describe('getPref', () => {
    it('returns null for a key that was never set', () => {
      expect(PreferencesService.getPref('theme')).toBeNull()
      expect(PreferencesService.getPref('lang')).toBeNull()
      expect(PreferencesService.getPref('certGrouping')).toBeNull()
    })

    it('reads from the namespaced localStorage key', () => {
      window.localStorage.setItem('lightstimulus.theme', 'dark')

      expect(PreferencesService.getPref('theme')).toBe('dark')
    })

    it('ignores a same-named key without the namespace prefix', () => {
      window.localStorage.setItem('theme', 'dark')

      expect(PreferencesService.getPref('theme')).toBeNull()
    })
  })

  describe('setPref', () => {
    it('writes to the namespaced localStorage key', () => {
      PreferencesService.setPref('theme', 'dark')

      expect(window.localStorage.getItem('lightstimulus.theme')).toBe('dark')
    })

    it('does not write an unprefixed key', () => {
      PreferencesService.setPref('lang', 'it')

      expect(window.localStorage.getItem('lang')).toBeNull()
    })

    it('overwrites an existing value', () => {
      PreferencesService.setPref('theme', 'light')
      PreferencesService.setPref('theme', 'dark')

      expect(PreferencesService.getPref('theme')).toBe('dark')
    })
  })

  describe('round trip', () => {
    it.each([
      ['theme', 'dark'],
      ['lang', 'it'],
      ['certGrouping', 'issuer'],
    ] as const)('persists and retrieves %s', (key, value) => {
      PreferencesService.setPref(key, value)

      expect(PreferencesService.getPref(key)).toBe(value)
    })

    it('keeps the three preference keys independent', () => {
      PreferencesService.setPref('theme', 'dark')
      PreferencesService.setPref('lang', 'it')
      PreferencesService.setPref('certGrouping', 'year')

      expect(PreferencesService.getPref('theme')).toBe('dark')
      expect(PreferencesService.getPref('lang')).toBe('it')
      expect(PreferencesService.getPref('certGrouping')).toBe('year')
    })
  })

  describe('server-side guard', () => {
    it('getPref returns null when window is undefined', () => {
      vi.stubGlobal('window', undefined)

      expect(PreferencesService.getPref('theme')).toBeNull()
    })

    it('setPref is a no-op when window is undefined', () => {
      // Capture the real storage before stubbing so we can assert nothing was
      // written once `window` is restored.
      const storage = window.localStorage
      vi.stubGlobal('window', undefined)

      expect(() => PreferencesService.setPref('theme', 'dark')).not.toThrow()

      vi.unstubAllGlobals()
      expect(storage.getItem('lightstimulus.theme')).toBeNull()
    })
  })
})
