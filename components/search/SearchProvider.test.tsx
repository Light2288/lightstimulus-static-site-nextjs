import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  renderWithProviders,
  screen,
  waitFor,
  waitForKbarIndex,
} from '../../test/renderWithProviders'
import { mockNavigation, resetNavigationMock } from '../../test/mockNavigation'
import { mockFetch, restoreFetch } from '../../test/mockFetch'
import siteMetadata from '@/data/siteMetadata'

/**
 * Characterisation tests for `SearchProvider` — the thin wrapper that hands
 * `pliny`'s `KBarSearchProvider` a `kbarConfig` with a custom document mapper.
 *
 * ## Why the kbar provider is stubbed
 * The unit under test contributes exactly two things: the `kbarConfig` object
 * and the `key={lang}` that forces a remount when the language changes.
 * Everything else (fetching the index, opening the palette, rendering results)
 * belongs to `pliny`/`kbar`. So the provider is replaced with a stub that
 * records every `kbarConfig` it receives and counts its own mounts/unmounts.
 * The recorded `onSearchDocumentsLoad` is then invoked directly with fixture
 * JSON, which is both faster and far more precise than driving it through
 * kbar's internal fetch.
 *
 * `fetch` is still stubbed for every test: the real provider fetches
 * `siteMetadata.search.kbarConfig.searchDocumentsPath` on mount, and if the
 * stub is ever removed an unstubbed jsdom request surfaces as an unhandled
 * `ECONNREFUSED` rather than a clean failure.
 *
 * ## Documented behaviour
 * - `searchDocumentsPath` is read once at module load from `siteMetadata` and
 *   is `false` unless the configured provider is `kbar`.
 * - `onSearchDocumentsLoad` filters on `entry.lang === lang` (an exact match,
 *   so `'en-US'` does not match `'en'`) and maps survivors to
 *   `{ id, name, keywords, section, subtitle, perform }`.
 * - `keywords` is `entry.summary || ''`, but `subtitle` is the raw
 *   `entry.summary` — so a missing summary yields `keywords: ''` alongside
 *   `subtitle: undefined`.
 * - `perform()` calls `router.push(entry.url)` with the index's URL verbatim
 *   (unlike pliny's default mapper, which prefixes `'/'` to `post.path`).
 * - The provider is keyed on `lang`, so switching language unmounts and
 *   remounts the whole subtree instead of updating it in place.
 */

/** One entry of the generated `search.json` index. */
interface SearchEntry {
  id: string
  title: string
  summary?: string
  type: string
  url: string
  lang: string
}

/** The shape `SearchProvider` maps each surviving entry into. */
interface SearchAction {
  id: string
  name: string
  keywords: string
  section: string
  subtitle: string | undefined
  perform: () => void
}

interface CapturedConfig {
  searchDocumentsPath: string | false
  onSearchDocumentsLoad?: (json: SearchEntry[]) => SearchAction[]
}

/**
 * Hoisted so the `vi.mock` factory below can reach it — `vi.mock` is lifted
 * above ordinary module-scope declarations, which would still be in their
 * temporal dead zone when the factory runs.
 */
const harness = vi.hoisted(() => ({
  configs: [] as unknown[],
  mounts: 0,
  unmounts: 0,
}))

vi.mock('pliny/search/KBar', async () => {
  const { useEffect } = await import('react')

  return {
    KBarSearchProvider: ({
      kbarConfig,
      children,
    }: {
      kbarConfig: unknown
      children: React.ReactNode
    }) => {
      harness.configs.push(kbarConfig)

      useEffect(() => {
        harness.mounts += 1
        return () => {
          harness.unmounts += 1
        }
      }, [])

      return <div data-testid="kbar-provider">{children}</div>
    },
  }
})

// Imported after the mock is registered; `vi.mock` is hoisted, so the stub is
// already in place by the time this module graph is evaluated.
import SearchProvider from './SearchProvider'

/** A mixed-language index: three English entries, two Italian ones. */
const MIXED_INDEX: SearchEntry[] = [
  {
    id: 'blog/opencode-retrospective-en',
    title: 'An OpenCode retrospective',
    summary: 'What worked and what did not when pairing with an agent.',
    type: 'Blog',
    url: '/blog/opencode-retrospective',
    lang: 'en',
  },
  {
    id: 'blog/opencode-retrospective-it',
    title: 'Una retrospettiva su OpenCode',
    summary: 'Cosa ha funzionato e cosa no lavorando con un agente.',
    type: 'Blog',
    url: '/blog/opencode-retrospective',
    lang: 'it',
  },
  {
    id: 'projects/certflow-en',
    title: 'CertFlow',
    summary: 'An AI-augmented certification study platform.',
    type: 'Project',
    url: '/projects/certflow',
    lang: 'en',
  },
  {
    id: 'projects/certflow-it',
    title: 'CertFlow',
    summary: 'Una piattaforma di studio potenziata dall’AI.',
    type: 'Project',
    url: '/projects/certflow',
    lang: 'it',
  },
  {
    id: 'pages/about-en',
    title: 'About',
    summary: '',
    type: 'Page',
    url: '/about',
    lang: 'en',
  },
]

/** The most recently recorded `kbarConfig`. */
function latestConfig() {
  const config = harness.configs.at(-1) as CapturedConfig | undefined
  if (!config) throw new Error('No kbarConfig was captured')
  return config
}

/** The recorded mapper, asserted to exist so callers get a non-optional fn. */
function latestMapper() {
  const { onSearchDocumentsLoad } = latestConfig()
  if (!onSearchDocumentsLoad) throw new Error('No onSearchDocumentsLoad was captured')
  return onSearchDocumentsLoad
}

/** Mount the provider and wait for the language effect + index load to settle. */
async function mountProvider(locale: 'en' | 'it' = 'en') {
  const view = renderWithProviders(
    <SearchProvider>
      <p>Search children</p>
    </SearchProvider>,
    { locale }
  )
  await screen.findByTestId('kbar-provider')
  await waitForKbarIndex()
  return view
}

beforeEach(() => {
  harness.configs.length = 0
  harness.mounts = 0
  harness.unmounts = 0
  mockNavigation({ pathname: '/' })
  mockFetch({ body: '[]' })
})

afterEach(() => {
  resetNavigationMock()
  restoreFetch()
})

describe('SearchProvider', () => {
  describe('provider wiring', () => {
    it('renders its children inside the kbar provider', async () => {
      await mountProvider()

      expect(screen.getByText('Search children')).toBeInTheDocument()
      expect(screen.getByTestId('kbar-provider')).toContainElement(
        screen.getByText('Search children')
      )
    })

    it('passes the configured search documents path through', async () => {
      await mountProvider()

      const expected =
        siteMetadata.search?.provider === 'kbar'
          ? siteMetadata.search.kbarConfig.searchDocumentsPath
          : false
      expect(latestConfig().searchDocumentsPath).toBe(expected)
    })

    it('resolves the documents path to the generated search index', async () => {
      await mountProvider()

      // `BASE_PATH` is unset in tests, so the path is the bare `/search.json`.
      expect(latestConfig().searchDocumentsPath).toBe('/search.json')
    })

    it('supplies a document mapper rather than relying on pliny’s default', async () => {
      await mountProvider()

      expect(latestConfig().onSearchDocumentsLoad).toBeTypeOf('function')
    })
  })

  describe('language scoping', () => {
    it('keeps only English entries under the English locale', async () => {
      await mountProvider('en')

      const actions = latestMapper()(MIXED_INDEX)
      expect(actions.map((action) => action.id)).toEqual([
        'blog/opencode-retrospective-en',
        'projects/certflow-en',
        'pages/about-en',
      ])
    })

    it('keeps only Italian entries under the Italian locale', async () => {
      await mountProvider('it')

      await waitFor(() => expect(harness.mounts).toBe(2))
      const actions = latestMapper()(MIXED_INDEX)
      expect(actions.map((action) => action.id)).toEqual([
        'blog/opencode-retrospective-it',
        'projects/certflow-it',
      ])
    })

    it('drops every entry when none carries the active language', async () => {
      await mountProvider('en')

      const actions = latestMapper()([
        { id: 'x', title: 'X', summary: 's', type: 'Blog', url: '/x', lang: 'it' },
      ])
      expect(actions).toEqual([])
    })

    it('returns an empty action list for an empty index', async () => {
      await mountProvider('en')

      expect(latestMapper()([])).toEqual([])
    })

    it('matches the language exactly, so regional tags are excluded', async () => {
      await mountProvider('en')

      const actions = latestMapper()([
        { id: 'regional', title: 'Regional', summary: 's', type: 'Page', url: '/r', lang: 'en-US' },
        { id: 'plain', title: 'Plain', summary: 's', type: 'Page', url: '/p', lang: 'en' },
      ])
      expect(actions.map((action) => action.id)).toEqual(['plain'])
    })

    it('drops entries with no lang field at all', async () => {
      await mountProvider('en')

      const actions = latestMapper()([
        { id: 'nolang', title: 'No lang', summary: 's', type: 'Page', url: '/n' } as SearchEntry,
      ])
      expect(actions).toEqual([])
    })

    it('preserves the index order of the surviving entries', async () => {
      await mountProvider('en')

      const actions = latestMapper()(MIXED_INDEX)
      expect(actions.map((action) => action.name)).toEqual([
        'An OpenCode retrospective',
        'CertFlow',
        'About',
      ])
    })
  })

  describe('action mapping', () => {
    it('maps an entry onto the full kbar action shape', async () => {
      await mountProvider('en')

      const [action] = latestMapper()([MIXED_INDEX[0]])
      expect(action).toMatchObject({
        id: 'blog/opencode-retrospective-en',
        name: 'An OpenCode retrospective',
        keywords: 'What worked and what did not when pairing with an agent.',
        section: 'Blog',
        subtitle: 'What worked and what did not when pairing with an agent.',
      })
      expect(action.perform).toBeTypeOf('function')
    })

    it('exposes exactly the six documented keys', async () => {
      await mountProvider('en')

      const [action] = latestMapper()([MIXED_INDEX[0]])
      expect(Object.keys(action).sort()).toEqual([
        'id',
        'keywords',
        'name',
        'perform',
        'section',
        'subtitle',
      ])
    })

    it('takes the palette section from entry.type verbatim', async () => {
      await mountProvider('en')

      const actions = latestMapper()(MIXED_INDEX)
      expect(actions.map((action) => action.section)).toEqual(['Blog', 'Project', 'Page'])
    })

    it('uses entry.id as the action id rather than deriving one from the url', async () => {
      await mountProvider('en')

      const [action] = latestMapper()([MIXED_INDEX[2]])
      expect(action.id).toBe('projects/certflow-en')
    })

    it('falls back to an empty keywords string when the summary is empty', async () => {
      await mountProvider('en')

      // `pages/about-en` carries `summary: ''`.
      const [action] = latestMapper()([MIXED_INDEX[4]])
      expect(action.keywords).toBe('')
    })

    it('falls back to an empty keywords string when the summary is absent', async () => {
      await mountProvider('en')

      const [action] = latestMapper()([
        { id: 'nosummary', title: 'No summary', type: 'Page', url: '/n', lang: 'en' },
      ])
      expect(action.keywords).toBe('')
    })

    /**
     * FINDING — `keywords` is guarded with `|| ''` but `subtitle` is not, so a
     * missing summary produces `subtitle: undefined` instead of an empty
     * string. Harmless for kbar today, but the two fields disagree.
     */
    it('leaves subtitle unguarded, so a missing summary yields undefined', async () => {
      await mountProvider('en')

      const [action] = latestMapper()([
        { id: 'nosummary', title: 'No summary', type: 'Page', url: '/n', lang: 'en' },
      ])
      expect(action.subtitle).toBeUndefined()
      expect(action.keywords).toBe('')
    })

    it('passes an empty summary straight through to subtitle', async () => {
      await mountProvider('en')

      const [action] = latestMapper()([MIXED_INDEX[4]])
      expect(action.subtitle).toBe('')
    })
  })

  describe('perform', () => {
    it('pushes the entry url onto the router', async () => {
      const router = mockNavigation({ pathname: '/' })
      await mountProvider('en')

      const [action] = latestMapper()([MIXED_INDEX[2]])
      action.perform()

      expect(router.push).toHaveBeenCalledWith('/projects/certflow')
      expect(router.push).toHaveBeenCalledOnce()
    })

    it('pushes the url verbatim without prefixing a slash', async () => {
      const router = mockNavigation({ pathname: '/' })
      await mountProvider('en')

      const [action] = latestMapper()([
        { id: 'absolute', title: 'Absolute', summary: '', type: 'Page', url: '/about', lang: 'en' },
      ])
      action.perform()

      // Contrast with pliny's default mapper, which pushes `'/' + post.path`.
      expect(router.push).toHaveBeenCalledWith('/about')
    })

    it('gives every action its own url', async () => {
      const router = mockNavigation({ pathname: '/' })
      await mountProvider('en')

      const actions = latestMapper()(MIXED_INDEX)
      actions.forEach((action) => action.perform())

      expect(router.push.mock.calls.map(([url]) => url)).toEqual([
        '/blog/opencode-retrospective',
        '/projects/certflow',
        '/about',
      ])
    })

    it('does not navigate merely by mapping the documents', async () => {
      const router = mockNavigation({ pathname: '/' })
      await mountProvider('en')

      latestMapper()(MIXED_INDEX)

      expect(router.push).not.toHaveBeenCalled()
    })

    it('can be performed more than once', async () => {
      const router = mockNavigation({ pathname: '/' })
      await mountProvider('en')

      const [action] = latestMapper()([MIXED_INDEX[0]])
      action.perform()
      action.perform()

      expect(router.push).toHaveBeenCalledTimes(2)
    })
  })

  describe('remount on language change', () => {
    it('mounts the provider once when the locale never changes', async () => {
      await mountProvider('en')

      // `LanguageProvider` starts at 'en' and the stored preference is also
      // 'en', so React bails out of the state update and nothing remounts.
      await waitFor(() => expect(harness.mounts).toBe(1))
      expect(harness.unmounts).toBe(0)
    })

    it('unmounts and remounts when the language resolves to Italian', async () => {
      await mountProvider('it')

      // The initial English render is torn down when `key` flips to 'it'.
      await waitFor(() => expect(harness.mounts).toBe(2))
      expect(harness.unmounts).toBe(1)
    })

    it('rebuilds the mapper against the new language after the remount', async () => {
      await mountProvider('it')
      await waitFor(() => expect(harness.mounts).toBe(2))

      const firstConfig = harness.configs[0] as CapturedConfig
      const lastConfig = latestConfig()

      // The first config was built while `lang` was still 'en'.
      expect(firstConfig.onSearchDocumentsLoad?.(MIXED_INDEX).map((a) => a.id)).toEqual([
        'blog/opencode-retrospective-en',
        'projects/certflow-en',
        'pages/about-en',
      ])
      expect(lastConfig.onSearchDocumentsLoad?.(MIXED_INDEX).map((a) => a.id)).toEqual([
        'blog/opencode-retrospective-it',
        'projects/certflow-it',
      ])
    })

    it('keeps rendering the children across the remount', async () => {
      await mountProvider('it')
      await waitFor(() => expect(harness.mounts).toBe(2))

      expect(screen.getByText('Search children')).toBeInTheDocument()
      expect(screen.getAllByTestId('kbar-provider')).toHaveLength(1)
    })

    it('keeps the search documents path stable across the remount', async () => {
      await mountProvider('it')
      await waitFor(() => expect(harness.mounts).toBe(2))

      const paths = (harness.configs as CapturedConfig[]).map(
        (config) => config.searchDocumentsPath
      )
      expect(new Set(paths)).toEqual(new Set(['/search.json']))
    })
  })
})
