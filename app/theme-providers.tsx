'use client'

import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={siteMetadata.theme || 'system'}
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark']}
    >
      {children}
    </ThemeProvider>
  )
}
