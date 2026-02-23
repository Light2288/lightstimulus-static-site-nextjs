/**
 * Preferences Service
 *
 * Manages user preferences (theme and language) using localStorage.
 * All preferences are namespaced with 'lightstimulus.' prefix to avoid conflicts.
 *
 * @module PreferencesService
 */
export const PreferencesService = {
  /**
   * Retrieves a user preference from localStorage
   *
   * @param {('theme' | 'lang')} key - The preference key to retrieve ('theme' or 'lang')
   * @returns {string | null} The stored preference value, or null if not set or running server-side
   *
   * @example
   * const theme = PreferencesService.getPref('theme') // Returns 'light', 'dark', or null
   * const lang = PreferencesService.getPref('lang')   // Returns 'en', 'it', or null
   */
  getPref(key: 'theme' | 'lang'): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(`lightstimulus.${key}`)
  },

  /**
   * Stores a user preference in localStorage
   *
   * Persists user preferences across browser sessions using localStorage.
   * Safe to call server-side (no-op if window is undefined).
   *
   * @param {('theme' | 'lang')} key - The preference key to store ('theme' or 'lang')
   * @param {string} value - The preference value to store
   * @returns {void}
   *
   * @example
   * PreferencesService.setPref('theme', 'dark') // Switches to dark mode
   * PreferencesService.setPref('lang', 'it')    // Switches to Italian
   */
  setPref(key: 'theme' | 'lang', value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`lightstimulus.${key}`, value)
  },
}
