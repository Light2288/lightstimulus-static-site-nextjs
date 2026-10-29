'use client'

import { useEffect, useMemo, useState } from 'react'
import { KBarProvider } from 'kbar'
import { KBarModal } from 'pliny/search/KBarModal'
import { useRouter } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import { useLanguage } from '@/contexts/LanguageContext'

type SearchEntry = {
  id: string
  title: string
  summary: string
  type: string
  url: string
  lang: 'en' | 'it'
}

const searchDocumentsPath =
  siteMetadata.search?.provider === 'kbar'
    ? siteMetadata.search.kbarConfig.searchDocumentsPath
    : false

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { lang } = useLanguage()
  const [documents, setDocuments] = useState<SearchEntry[] | null>(null)

  useEffect(() => {
    if (!searchDocumentsPath) {
      setDocuments([])
      return
    }
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch(searchDocumentsPath, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json: SearchEntry[] = await response.json()
        if (!controller.signal.aborted) setDocuments(json)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Unable to load the site search index', error)
        setDocuments([])
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  const actions = useMemo(
    () =>
      (documents ?? [])
        .filter((entry) => entry.lang === lang)
        .map((entry) => ({
          id: entry.id,
          name: entry.title,
          keywords: entry.summary || '',
          section: entry.type,
          subtitle: entry.summary,
          perform: () => router.push(entry.url),
        })),
    [documents, lang, router]
  )

  // Only the palette's registered actions change with the locale. Remounting
  // its provider would also discard stateful page content, including the viewer.
  return (
    <KBarProvider>
      <KBarModal actions={actions} isLoading={documents === null} />
      {children}
    </KBarProvider>
  )
}
