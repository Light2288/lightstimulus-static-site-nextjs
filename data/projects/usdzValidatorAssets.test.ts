import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const images = path.join(process.cwd(), 'public/static/images')
const widths = [144, 200, 640, 800, 1000]
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')

describe('USDZ Validator cover assets', () => {
  it('retains the supplied Firefly bytes as the cover source', () => {
    expect(sha256(path.join(images, 'original-backups/projects/usdz-validator.png'))).toBe(
      'ee47141de59d396eb9baf75175a1b495108a33a9084dc5421c01d5d593f6e581'
    )
  })

  it('provides the complete responsive family without obsolete variants', async () => {
    const main = await sharp(path.join(images, 'projects/usdz-validator.png')).metadata()
    expect(main.format).toBe('png')
    expect(main.width).toBe(1000)
    expect(main.height).toBe(441)
    const expected = widths.flatMap((width) =>
      ['png', 'webp'].map((ext) => `usdz-validator-${width}w.${ext}`)
    )
    const actual = readdirSync(path.join(images, 'projects/responsive')).filter((name) =>
      /^usdz-validator-\d+w\./.test(name)
    )
    expect(actual.sort()).toEqual(expected.sort())
    for (const name of expected) {
      const image = sharp(path.join(images, 'projects/responsive', name))
      const metadata = await image.metadata()
      expect(metadata.width).toBe(Number(name.match(/-(\d+)w/)![1]))
      await expect(image.raw().toBuffer()).resolves.toBeInstanceOf(Buffer)
    }
  })
})
