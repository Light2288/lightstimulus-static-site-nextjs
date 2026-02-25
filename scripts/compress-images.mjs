import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const IMAGES_ROOT = path.join(PROJECT_ROOT, 'public', 'static', 'images')

const JPEG_QUALITY = 82
const PNG_QUALITY = 85
const MAX_WIDTH = 2400
const MAX_HEIGHT = 2400

// Directories to exclude from compression
const EXCLUDE_DIRS = ['original-backups']

async function compressImage(filePath, relativePath) {
  const fileName = path.basename(filePath)
  const dirName = path.dirname(relativePath)
  const backupDir = path.join(IMAGES_ROOT, 'original-backups', dirName)
  const backupPath = path.join(backupDir, fileName)

  console.log(`Processing: ${relativePath}`)

  try {
    // Create backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true })

    // Check if already backed up (skip if already processed)
    try {
      await fs.access(backupPath)
      console.log(`  ⊘ Already processed, skipping`)
      return
    } catch {
      // Backup doesn't exist, proceed with compression
    }

    // Backup original
    await fs.copyFile(filePath, backupPath)

    // Get image metadata
    const metadata = await sharp(filePath).metadata()
    const needsResize = metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT
    const ext = path.extname(filePath).toLowerCase()

    let sharpInstance = sharp(filePath).resize(
      needsResize ? MAX_WIDTH : undefined,
      needsResize ? MAX_HEIGHT : undefined,
      {
        fit: 'inside',
        withoutEnlargement: true,
      }
    )

    // Apply format-specific compression
    if (ext === '.png') {
      sharpInstance = sharpInstance.png({
        quality: PNG_QUALITY,
        compressionLevel: 9,
        palette: true,
      })
    } else {
      // JPEG compression for .jpg and .jpeg
      sharpInstance = sharpInstance.jpeg({
        quality: JPEG_QUALITY,
        progressive: true,
        mozjpeg: true,
      })
    }

    await sharpInstance.toFile(filePath + '.tmp')

    // Replace original with compressed version
    await fs.rename(filePath + '.tmp', filePath)

    // Get file sizes
    const originalSize = (await fs.stat(backupPath)).size
    const compressedSize = (await fs.stat(filePath)).size
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)

    console.log(
      `  ✓ ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${savings}% smaller)`
    )
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`)
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

async function findImages(dir, baseDir = dir) {
  const images = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (EXCLUDE_DIRS.includes(entry.name)) {
        continue
      }
      // Recursively search subdirectories
      images.push(...(await findImages(fullPath, baseDir)))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const relativePath = path.relative(baseDir, fullPath)
        images.push({ fullPath, relativePath })
      }
    }
  }

  return images
}

async function compressAllImages() {
  console.log('🖼️  Starting image compression for all static images...\n')

  // Find all images recursively
  const images = await findImages(IMAGES_ROOT)

  if (images.length === 0) {
    console.log('No images found to process.')
    return
  }

  console.log(`Found ${images.length} images to process\n`)

  let processed = 0
  let skipped = 0
  let totalOriginalSize = 0
  let totalCompressedSize = 0

  for (const { fullPath, relativePath } of images) {
    await compressImage(fullPath, relativePath)

    // Check if file was processed by comparing with backup
    const fileName = path.basename(fullPath)
    const dirName = path.dirname(relativePath)
    const backupPath = path.join(IMAGES_ROOT, 'original-backups', dirName, fileName)

    try {
      const backupStats = await fs.stat(backupPath)
      const currentStats = await fs.stat(fullPath)

      if (backupStats.mtimeMs < currentStats.mtimeMs) {
        processed++
        totalOriginalSize += backupStats.size
        totalCompressedSize += currentStats.size
      } else {
        skipped++
      }
    } catch {
      // Backup doesn't exist, likely skipped
      skipped++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Image compression complete!')
  console.log('='.repeat(50))
  console.log(`📊 Processed: ${processed} images`)
  console.log(`⊘ Skipped: ${skipped} images (already compressed)`)

  if (totalOriginalSize > 0) {
    const totalSavings = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)
    console.log(
      `💾 Total savings: ${formatBytes(totalOriginalSize - totalCompressedSize)} (${totalSavings}%)`
    )
  }

  console.log(`💡 Original images backed up to: public/static/images/original-backups/`)
}

compressAllImages().catch(console.error)
