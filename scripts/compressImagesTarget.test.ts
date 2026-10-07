import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('sharp', () => ({ default: vi.fn() }))

type CompressionModule = {
  resolveScanRoot: (relativeDir?: string) => string
  compressAllImages: (relativeDir?: string) => Promise<void>
}

describe('compress-images scan target', () => {
  let compressionModule: CompressionModule
  const imagesRoot = path.join(process.cwd(), 'public', 'static', 'images')
  const temporaryPaths: string[] = []

  beforeAll(async () => {
    compressionModule = (await import('./compress-images.mjs')) as CompressionModule
  })

  afterEach(() => {
    temporaryPaths.splice(0).forEach((temporaryPath) => {
      fs.rmSync(temporaryPath, { recursive: true, force: true })
    })
  })

  it('defaults to the complete public image root', () => {
    expect(compressionModule.resolveScanRoot()).toBe(imagesRoot)
  })

  it('resolves a relative subtree inside the public image root', () => {
    expect(compressionModule.resolveScanRoot('about/portraits')).toBe(
      path.join(imagesRoot, 'about', 'portraits')
    )
  })

  it('rejects a relative path that escapes the public image root', () => {
    expect(() => compressionModule.resolveScanRoot('../outside')).toThrow(/public\/static\/images/)
  })

  it('rejects an absolute path outside the public image root', () => {
    expect(() => compressionModule.resolveScanRoot('/tmp/outside')).toThrow(
      /public\/static\/images/
    )
  })

  it('rejects an in-root symlink whose real target escapes the image root', () => {
    const externalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compress-images-outside-'))
    const linkName = `.test-symlink-escape-${process.pid}`
    const linkPath = path.join(imagesRoot, linkName)

    try {
      fs.symlinkSync(externalDir, linkPath, 'dir')

      expect(() => compressionModule.resolveScanRoot(linkName)).toThrow(/public\/static\/images/)
    } finally {
      fs.rmSync(linkPath, { force: true })
      fs.rmSync(externalDir, { recursive: true, force: true })
    }
  })

  it('rejects when an image cannot be processed', async () => {
    const inputDir = fs.mkdtempSync(path.join(imagesRoot, '.compress-failure-'))
    const relativeDir = path.basename(inputDir)
    const backupDir = path.join(imagesRoot, 'original-backups', relativeDir)
    temporaryPaths.push(inputDir, backupDir)
    fs.writeFileSync(path.join(inputDir, 'broken.png'), 'not-an-image')

    await expect(compressionModule.compressAllImages(relativeDir)).rejects.toThrow(
      'Failed to process 1 image'
    )
  })

  it('returns a nonzero CLI status when the scan target is invalid', () => {
    const result = spawnSync(process.execPath, ['scripts/compress-images.mjs', '../outside'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/Image target must stay inside/)
  })
})
