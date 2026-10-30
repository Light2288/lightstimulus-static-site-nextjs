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

describe('USDZ Validator demonstration assets', () => {
  const models = path.join(process.cwd(), 'public/static/models/usdz-validator/layered-cube')

  it('distributes the canonical USDZ and its measured report', () => {
    expect(sha256(path.join(models, 'model.usdz'))).toBe(
      '89ee36e574d27275387367e67199a24ab7b4d356325f2b5f1fdfa60f1f2297a3'
    )
    expect(sha256(path.join(models, 'validation.json'))).toBe(
      '605d9a93ecbdac350152de3065f615595db743187e18d92e28c48afc5481c77f'
    )
    const report = JSON.parse(readFileSync(path.join(models, 'validation.json'), 'utf8'))
    expect(report.tool.version).toBe('0.2.0')
    expect(report.input.byteSize).toBe(530905)
    expect(report.configuration.profile).toBe('general-v1')
    expect(report.configuration.gatePolicy).toEqual({ allowIncomplete: false, failOn: 'error' })
    expect(report.coverage.isComplete).toBe(true)
    expect(report.gateDecision).toBe('pass')
    expect(report.nativeFindings).toEqual([])
    expect(report.operationalErrors).toEqual([])
    expect(report.externalCheck.requested).toBe(false)
    expect(readFileSync(path.join(models, 'LICENSE.txt'), 'utf8')).toContain(
      'Copyright (c) 2026 USDZ Validation Kit contributors'
    )
  })

  it('provides a self-contained GLB with translucent panels', () => {
    const glb = readFileSync(path.join(models, 'model.glb'))
    expect(glb.subarray(0, 4).toString()).toBe('glTF')
    expect(glb.readUInt32LE(4)).toBe(2)
    expect(glb.readUInt32LE(8)).toBe(glb.length)
    const length = glb.readUInt32LE(12)
    const document = JSON.parse(glb.subarray(20, 20 + length).toString())
    expect(document.meshes).toHaveLength(14)
    expect(document.buffers.every((buffer: { uri?: string }) => !buffer.uri)).toBe(true)
    expect(document.images ?? []).toEqual([])
    expect(document.extensionsRequired ?? []).toEqual([])
    const glass = document.materials.find((material: { name: string }) => material.name === 'Glass')
    expect(glass.alphaMode).toBe('BLEND')
    expect(glass.pbrMetallicRoughness.baseColorFactor[3]).toBeCloseTo(0.1, 6)
  })

  it('retains the original illustration and complete processed image families', async () => {
    expect(
      sha256(path.join(images, 'original-backups/projects/usdz-validator-demo/illustration.png'))
    ).toBe('74723d5ddd7017e0943882a3c9b35ef3aca4b137244007aaabbe4bc2804a256b')
    for (const name of ['illustration', 'poster']) {
      const image = await sharp(
        path.join(images, `projects/usdz-validator-demo/${name}.png`)
      ).metadata()
      expect(image.width).toBe(1000)
      expect(image.height).toBe(1000)
      for (const width of widths) {
        for (const ext of ['png', 'webp']) {
          const variant = sharp(
            path.join(images, `projects/usdz-validator-demo/responsive/${name}-${width}w.${ext}`)
          )
          expect((await variant.metadata()).width).toBe(width)
          await expect(variant.raw().toBuffer()).resolves.toBeInstanceOf(Buffer)
        }
      }
    }
  })
})
