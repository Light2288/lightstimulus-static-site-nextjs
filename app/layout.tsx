import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import { SearchProvider, SearchConfig } from 'pliny/search'
import Layout from '@/components/common/Layout'
import siteMetadata from '@/data/siteMetadata'
import { Metadata } from 'next'

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: { index: true, follow: true },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.BASE_PATH || ''

  return (
    <html
      lang={siteMetadata.language}
      className={`${plexSans.variable} ${plexMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <title>{siteMetadata.title}</title>
        {/* Apple Touch Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${basePath}/static/favicons/apple-touch-icon.png`}
        />

        {/* Standard Favicons */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/static/favicons/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${basePath}/static/favicons/favicon-16x16.png`}
        />
        <link rel="icon" href={`${basePath}/static/favicons/favicon.ico`} />

        {/* PWA Manifest */}
        <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />

        {/* Safari Pinned Tab (monochrome SVG) */}
        <link
          rel="mask-icon"
          href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
          color="#ffb347" // your orange brand color
        />

        {/* Windows Tiles (optional, because you have the file) */}
        <meta
          name="msapplication-config"
          content={`${basePath}/static/favicons/browserconfig.xml`}
        />

        {/* Theme color for Chrome/Android */}
        <meta name="theme-color" content="#ffb347" />
      </head>
      <body className="bg-white text-black antialiased dark:bg-gray-950 dark:text-white">
        <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
        <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
          <Layout>{children}</Layout>
        </SearchProvider>
      </body>
    </html>
  )
}
