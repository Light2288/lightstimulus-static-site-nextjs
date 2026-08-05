'use client'

import { KBarSearchProvider } from 'pliny/search/KBar'
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

/**
 * Custom kbar search provider that renders the expanded search index
 * (blog posts, projects, the about page, and static pages). Each index
 * entry is already localized and carries an absolute `url`, so unlike the
 * default Pliny mapper we push `entry.url` directly and read the `type`
 * field as the palette section.
 *
 * Results are scoped to the active UI language: only entries whose `lang`
 * matches the current language are mapped into kbar actions. The provider
 * is keyed on `lang` so toggling the language remounts it and rebuilds the
 * action set (the index is tiny, so the remount cost is negligible).
 */
const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { lang } = useLanguage()

  return (
    <KBarSearchProvider
      key={lang}
      kbarConfig={{
        searchDocumentsPath,
        onSearchDocumentsLoad(json: SearchEntry[]) {
          return json
            .filter((entry) => entry.lang === lang)
            .map((entry) => ({
              id: entry.id,
              name: entry.title,
              keywords: entry.summary || '',
              section: entry.type,
              subtitle: entry.summary,
              perform: () => router.push(entry.url),
            }))
        },
      }}
    >
      {children}
    </KBarSearchProvider>
  )
}

export default SearchProvider
