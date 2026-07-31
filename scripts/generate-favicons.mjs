import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const FAVICONS_DIR = path.join(PROJECT_ROOT, 'public', 'static', 'favicons')
const DEFAULT_SOURCE = path.join(FAVICONS_DIR, 'source', 'new_logo_header.svg')

// PNG targets: [output filename, size in px]
const PNG_TARGETS = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['favicon-96x96.png', 96],
  ['android-chrome-96x96.png', 96],
  ['apple-touch-icon.png', 180],
  ['mstile-150x150.png', 150],
]

// PNG sizes bundled into favicon.ico
const ICO_SIZES = [16, 32, 48]

// Render density for crisp rasterization from the SVG.
const BASE_DENSITY = 384

async function renderPng(svgBuffer, size) {
  // Scale density with the requested size so large icons stay sharp.
  const density = Math.max(BASE_DENSITY, size * 4)
  return sharp(svgBuffer, { density })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

async function generateFavicons() {
  const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE

  console.log('🖼️  Generating favicons...\n')
  console.log(`Source SVG: ${path.relative(PROJECT_ROOT, sourcePath)}\n`)

  let svgBuffer
  try {
    svgBuffer = await fs.readFile(sourcePath)
  } catch {
    console.error(`✗ Source SVG not found at: ${sourcePath}`)
    process.exitCode = 1
    return
  }

  await fs.mkdir(FAVICONS_DIR, { recursive: true })

  // 1. Render all PNG targets.
  for (const [filename, size] of PNG_TARGETS) {
    const outPath = path.join(FAVICONS_DIR, filename)
    const buffer = await renderPng(svgBuffer, size)
    await fs.writeFile(outPath, buffer)
    console.log(`  ✓ ${filename} (${size}x${size})`)
  }

  // 2. Build favicon.ico from a set of PNG buffers.
  const icoBuffers = await Promise.all(ICO_SIZES.map((size) => renderPng(svgBuffer, size)))
  const icoBuffer = await pngToIco(icoBuffers)
  await fs.writeFile(path.join(FAVICONS_DIR, 'favicon.ico'), icoBuffer)
  console.log(`  ✓ favicon.ico (${ICO_SIZES.join(', ')})`)

  console.log('\n✅ Favicon generation complete!')
}

generateFavicons().catch((error) => {
  console.error(`✗ Error: ${error.message}`)
  process.exitCode = 1
})
