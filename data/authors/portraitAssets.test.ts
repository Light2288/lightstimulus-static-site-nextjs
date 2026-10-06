import { existsSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { imageSize } from 'image-size'
import { describe, expect, it } from 'vitest'

type PortraitFrontmatter = {
  id: string
  original: string
  variants: Array<{ src: string }>
}

const authorPath = path.join(process.cwd(), 'data', 'authors', 'default.mdx')
const { data } = matter(readFileSync(authorPath, 'utf8'))
const portraits: PortraitFrontmatter[] = Array.isArray(data.portraits) ? data.portraits : []
const assetPaths = portraits.flatMap((portrait) => [
  portrait.original,
  ...portrait.variants.map(({ src }) => src),
])

const toPublicPath = (src: string) => path.join(process.cwd(), 'public', src)

const responsivePath = (src: string, width: 144 | 200, extension: 'png' | 'webp') => {
  const parsed = path.parse(toPublicPath(src))
  return path.join(parsed.dir, 'responsive', `${parsed.name}-${width}w.${extension}`)
}

describe('About portrait assets', () => {
  it('configures the five approved portrait groups in order', () => {
    expect(portraits.map(({ id }) => id)).toEqual([
      'guitar',
      'family-sunset',
      'polaroid',
      'mountain',
      'statue',
    ])
    expect(portraits.every(({ variants }) => variants.length === 3)).toBe(true)
  })

  it('uses 20 unique lowercase PNG paths in the portrait directory', () => {
    expect(assetPaths).toHaveLength(20)
    expect(new Set(assetPaths).size).toBe(20)
    expect(
      assetPaths.every((src) => /^\/static\/images\/about\/portraits\/[a-z0-9_]+\.png$/.test(src))
    ).toBe(true)
  })

  it.each(assetPaths)('provides compressed and thumbnail assets for %s', (src) => {
    const primaryPath = toPublicPath(src)
    expect(existsSync(primaryPath)).toBe(true)

    const primary = imageSize(readFileSync(primaryPath))
    expect(primary.width).toBeLessThanOrEqual(1000)
    expect(primary.height).toBeLessThanOrEqual(1000)

    for (const width of [144, 200] as const) {
      for (const extension of ['png', 'webp'] as const) {
        const variantPath = responsivePath(src, width, extension)
        expect(existsSync(variantPath)).toBe(true)
        expect(imageSize(readFileSync(variantPath)).width).toBe(width)
      }
    }
  })
})
