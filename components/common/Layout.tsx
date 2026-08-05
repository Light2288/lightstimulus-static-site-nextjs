'use client'

import { ReactNode } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import SectionContainer from '@/components/SectionContainer'
import { ThemeProviders } from '@/app/theme-providers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import SearchProvider from '@/components/search/SearchProvider'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProviders>
      <LanguageProvider>
        <SearchProvider>
          <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)] text-[var(--color-text-light)] transition-colors duration-300 dark:bg-[var(--color-bg-dark)] dark:text-[var(--color-text-dark)]">
            <Header />
            <SectionContainer>
              <main id="main-content" className="flex-1 pt-16">
                {children}
              </main>
            </SectionContainer>
            <Footer />
          </div>
        </SearchProvider>
      </LanguageProvider>
    </ThemeProviders>
  )
}
