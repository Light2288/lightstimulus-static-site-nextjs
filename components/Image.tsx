import NextImage, { ImageProps } from 'next/image'

const basePath = process.env.BASE_PATH || ''

interface ResponsiveImageProps extends ImageProps {
  src: string
  fetchpriority?: 'high' | 'low' | 'auto'
}

/**
 * Enhanced Image component with manual responsive image support for static export
 * Generates srcset with WebP and fallback images for optimal performance
 */
const Image = ({ src, alt, fetchpriority, ...rest }: ResponsiveImageProps) => {
  // Get the full path with basePath
  const fullSrc = `${basePath}${src}`

  // Extract image info
  const isStaticImage = src.startsWith('/static/images/')
  const ext = src.substring(src.lastIndexOf('.'))

  // For static images, generate responsive variants
  if (isStaticImage && (ext === '.jpg' || ext === '.jpeg' || ext === '.png')) {
    const responsiveDir = `${basePath}${src.substring(0, src.lastIndexOf('/'))}/responsive/${src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))}`

    // Generate srcset for WebP (modern browsers)
    const webpSrcSet = `
      ${responsiveDir}-640w.webp 640w,
      ${responsiveDir}-800w.webp 800w,
      ${responsiveDir}-1000w.webp 1000w
    `.trim()

    // Generate srcset for fallback (JPEG/PNG)
    const fallbackSrcSet = `
      ${responsiveDir}-640w${ext} 640w,
      ${responsiveDir}-800w${ext} 800w,
      ${responsiveDir}-1000w${ext} 1000w
    `.trim()

    return (
      <picture>
        {/* WebP source for modern browsers */}
        <source type="image/webp" srcSet={webpSrcSet} sizes={rest.sizes} />

        {/* Fallback to JPEG/PNG for older browsers */}
        <source
          type={`image/${ext === '.png' ? 'png' : 'jpeg'}`}
          srcSet={fallbackSrcSet}
          sizes={rest.sizes}
        />

        {/* Fallback img tag with fetchpriority support */}
        <NextImage src={fullSrc} alt={alt} {...(fetchpriority && { fetchpriority })} {...rest} />
      </picture>
    )
  }

  // For non-static images or other formats, use original behavior with fetchpriority support
  return <NextImage src={fullSrc} alt={alt} {...(fetchpriority && { fetchpriority })} {...rest} />
}

export default Image
