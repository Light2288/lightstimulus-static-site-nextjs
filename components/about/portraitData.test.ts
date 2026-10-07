import { describe, expect, it } from 'vitest'
import { normalizePortraits } from './portraitData'

const validVariant = {
  id: 'anime',
  label: { en: 'Anime', it: 'Anime' },
  src: '/static/images/about/portraits/guitar_anime.png',
}

const validPortrait = {
  id: 'guitar',
  title: { en: 'Guitar session', it: 'Sessione con la chitarra' },
  original: '/static/images/about/portraits/guitar.png',
  focalPoint: '45% 50%',
  originalFocalPoint: '48% 46%',
  originalScale: 1.06,
  variants: [validVariant],
}

const validFivePortraitFixture = [
  validPortrait,
  {
    ...validPortrait,
    id: 'family',
    title: { en: 'Family sunset', it: 'Tramonto in famiglia' },
    original: '/static/images/about/portraits/family.png',
  },
  {
    ...validPortrait,
    id: 'polaroid',
    title: { en: 'Polaroid portrait', it: 'Ritratto Polaroid' },
    original: '/static/images/about/portraits/polaroid.png',
  },
  {
    ...validPortrait,
    id: 'mountain',
    title: { en: 'Mountain portrait', it: 'Ritratto in montagna' },
    original: '/static/images/about/portraits/mountain.png',
  },
  {
    ...validPortrait,
    id: 'statue',
    title: { en: 'Statue encounter', it: 'Incontro con la statua' },
    original: '/static/images/about/portraits/statue.png',
  },
]

describe('normalizePortraits', () => {
  it('preserves five valid portraits in their configured order', () => {
    expect(normalizePortraits(validFivePortraitFixture).map(({ id }) => id)).toEqual([
      'guitar',
      'family',
      'polaroid',
      'mountain',
      'statue',
    ])
  })

  it('returns an empty list for absent or non-list content', () => {
    expect(normalizePortraits(null)).toEqual([])
    expect(normalizePortraits({ portraits: validFivePortraitFixture })).toEqual([])
  })

  it('discards portraits without complete identity, paths, or localized titles', () => {
    expect(normalizePortraits([{ id: '', original: '' }])).toEqual([])
    expect(normalizePortraits([{ ...validPortrait, title: { en: 'Only English' } }])).toEqual([])
  })

  it('keeps valid variants and discards malformed ones', () => {
    const result = normalizePortraits([
      { ...validPortrait, variants: [validVariant, { id: 7 }, null] },
    ])

    expect(result[0].variants).toEqual([validVariant])
  })

  it('defaults a missing or non-string focal point to the center', () => {
    expect(normalizePortraits([{ ...validPortrait, focalPoint: 12 }])[0].focalPoint).toBe('50% 50%')
    expect(normalizePortraits([{ ...validPortrait, focalPoint: undefined }])[0].focalPoint).toBe(
      '50% 50%'
    )
  })

  it('normalizes original-only crop tuning without changing the creative crop', () => {
    const tuned = normalizePortraits([validPortrait])[0]
    const defaults = normalizePortraits([
      { ...validPortrait, originalFocalPoint: undefined, originalScale: undefined },
    ])[0]
    const invalid = normalizePortraits([
      { ...validPortrait, originalFocalPoint: 12, originalScale: 0 },
    ])[0]

    expect(tuned).toMatchObject({
      focalPoint: '45% 50%',
      originalFocalPoint: '48% 46%',
      originalScale: 1.06,
    })
    expect(defaults).toMatchObject({ originalFocalPoint: '45% 50%', originalScale: 1 })
    expect(invalid).toMatchObject({ originalFocalPoint: '45% 50%', originalScale: 1 })
  })

  it('returns fresh objects without mutating the Contentlayer value', () => {
    const input = structuredClone(validFivePortraitFixture)
    const before = structuredClone(input)
    const result = normalizePortraits(input)

    expect(input).toEqual(before)
    expect(result).not.toBe(input)
    expect(result[0]).not.toBe(input[0])
    expect(result[0].title).not.toBe(input[0].title)
    expect(result[0].variants[0]).not.toBe(input[0].variants[0])
  })
})
