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

        {/* Resource Hints - Preconnect for Google Fonts (faster font loading) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Standard Favicons */}
        <link rel="icon" type="image/x-icon" href={`${basePath}/static/favicons/favicon.ico`} />
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

        {/* PWA Manifest */}
        <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />

        {/* Apple Touch Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${basePath}/static/favicons/apple-touch-icon.png`}
        />

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
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="focus:bg-primary-500 focus:ring-primary-500 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
        <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
          <Layout>{children}</Layout>
        </SearchProvider>
      </body>
    </html>
  )
}
