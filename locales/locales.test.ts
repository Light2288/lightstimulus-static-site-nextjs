import { describe, it, expect } from 'vitest'
import en from './en.json'
import itLocale from './it.json'

/**
 * Structural parity tests for the two locale files.
 *
 * These are guardrails rather than behaviour tests: they fail when a
 * translation is added to one locale but not the other, when a value is left
 * blank, or when interpolation placeholders drift apart. That class of bug is
 * invisible at runtime because `t()` silently returns the key.
 *
 * The flattening helper is deliberately local to this file — the spec forbids
 * adding utilities to production code for testing convenience.
 */

/** Recursively flatten a nested translation object to dot-notation paths. */
function flatten(value: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (value === null || typeof value !== 'object') return out

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (child !== null && typeof child === 'object') {
      Object.assign(out, flatten(child, path))
    } else {
      out[path] = String(child)
    }
  }
  return out
}

/** Extract the `{{var}}` placeholder names used by a translation string. */
function placeholders(value: string): Set<string> {
  // Mirrors the interpolation regex in contexts/LanguageContext.tsx.
  return new Set(Array.from(value.matchAll(/\{\{(\w+)\}\}/g), (match) => match[1]))
}

const flatEn = flatten(en)
const flatIt = flatten(itLocale)

describe('locale parity', () => {
  it('defines the same set of keys in both locales', () => {
    expect(Object.keys(flatEn).sort()).toEqual(Object.keys(flatIt).sort())
  })

  it('has no keys present only in English', () => {
    const onlyEn = Object.keys(flatEn).filter((key) => !(key in flatIt))

    expect(onlyEn).toEqual([])
  })

  it('has no keys present only in Italian', () => {
    const onlyIt = Object.keys(flatIt).filter((key) => !(key in flatEn))

    expect(onlyIt).toEqual([])
  })

  it('uses identical interpolation placeholders for every shared key', () => {
    const mismatches = Object.keys(flatEn)
      .filter((key) => key in flatIt)
      .filter((key) => {
        const a = placeholders(flatEn[key])
        const b = placeholders(flatIt[key])
        return a.size !== b.size || [...a].some((name) => !b.has(name))
      })

    expect(mismatches).toEqual([])
  })

  it.each([
    ['en', flatEn],
    ['it', flatIt],
  ])('has no empty or whitespace-only values in %s', (_locale, flat) => {
    const blanks = Object.entries(flat)
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key)

    expect(blanks).toEqual([])
  })

  it('exposes the same top-level namespaces regardless of declaration order', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(itLocale).sort())
  })

  it('covers the namespaces the components rely on', () => {
    for (const namespace of [
      'common',
      'about',
      'blog',
      'contact',
      'hero',
      'home',
      'nav',
      'projects',
    ]) {
      expect(en).toHaveProperty(namespace)
      expect(itLocale).toHaveProperty(namespace)
    }
  })

  it('resolves every leaf to a string (no stray objects or nulls)', () => {
    for (const [key, value] of Object.entries(flatEn)) {
      expect(typeof value, `en.${key}`).toBe('string')
    }
    for (const [key, value] of Object.entries(flatIt)) {
      expect(typeof value, `it.${key}`).toBe('string')
    }
  })

  it('provides all seven hero taglines in both locales', () => {
    for (let index = 0; index < 7; index += 1) {
      expect(flatEn).toHaveProperty(`hero.taglines.${index}`)
      expect(flatIt).toHaveProperty(`hero.taglines.${index}`)
    }
  })

  it('uses the expected placeholders for the interpolated blog strings', () => {
    expect(placeholders(flatEn['blog.reading_time'])).toEqual(new Set(['minutes']))
    expect(placeholders(flatEn['blog.previous_article'])).toEqual(new Set(['prevTitle']))
    expect(placeholders(flatEn['blog.next_article'])).toEqual(new Set(['nextTitle']))
  })

  it('provides the CV card strings, including the resume pointer label', () => {
    for (const flat of [flatEn, flatIt]) {
      expect(flat).toHaveProperty('about.cv.title')
      expect(flat).toHaveProperty('about.cv.description')
      expect(flat).toHaveProperty('about.cv.download')
      expect(flat).toHaveProperty('about.cv.resume_link')
    }
  })
})
