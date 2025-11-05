'use client'

import { ReactNode } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import SectionContainer from '@/components/SectionContainer'
import { ThemeProviders } from '@/app/theme-providers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { PreferencesService } from '@/lib/preferences/PreferencesService'

export default function Layout({ children }: { children: ReactNode }) {
  const theme = PreferencesService.getPref('theme') || 'system'
  const lang = PreferencesService.getPref('lang') || 'en'

  return (
    <ThemeProviders>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)] text-[var(--color-text-light)] transition-colors duration-300 dark:bg-[var(--color-bg-dark)] dark:text-[var(--color-text-dark)]">
          <Header />
          <SectionContainer>
            <main className="flex-1 pt-16">{children}</main>
          </SectionContainer>
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProviders>
  )
}
