import fs from 'fs'
import os from 'os'
import path from 'path'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('sharp', () => ({ default: vi.fn() }))

type CompressionModule = {
  resolveScanRoot: (relativeDir?: string) => string
}

describe('compress-images scan target', () => {
  let compressionModule: CompressionModule
  const imagesRoot = path.join(process.cwd(), 'public', 'static', 'images')

  beforeAll(async () => {
    compressionModule = (await import('./compress-images.mjs')) as CompressionModule
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
})
