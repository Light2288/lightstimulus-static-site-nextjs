import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

interface PageSEOProps extends Partial<Metadata> {
  title: string
  description?: string
  image?: string
  slug?: string
}

export function genPageMetadata({
  title,
  description,
  image,
  slug,
  ...rest
}: PageSEOProps): Metadata {
  const fullUrl = slug ? `${siteMetadata.siteUrl}/${slug}` : siteMetadata.siteUrl

  const ogImage = image
    ? `${siteMetadata.siteUrl}${image}`
    : `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`

  return {
    title,
    description: description || siteMetadata.description,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: fullUrl,
      siteName: siteMetadata.title,
      images: [ogImage],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: [ogImage],
    },
    ...rest,
  }
}
