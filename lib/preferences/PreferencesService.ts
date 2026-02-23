export const PreferencesService = {
  getPref(key: 'theme' | 'lang'): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(`lightstimulus.${key}`)
  },
  setPref(key: 'theme' | 'lang', value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`lightstimulus.${key}`, value)
  },
}
