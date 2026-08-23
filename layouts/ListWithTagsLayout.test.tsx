import { type ReactNode } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { renderWithProviders, screen, waitFor, within } from '../test/renderWithProviders'
import { mockNavigation, resetNavigationMock } from '../test/mockNavigation'
import ListWithTagsLayout from './ListWithTagsLayout'
import type { LocalizedTag } from '@/types/localizedTag'
import enLocale from '@/locales/en.json'
import itLocale from '@/locales/it.json'

/**
 * Characterisation tests for `ListWithTagsLayout` — the generic tag-filtered,
 * paginated list shell shared by the blog index and the projects index.
 *
 * ## Actual prop signature (differs from the obvious guess)
 * There is **no `basePath` prop**. The component derives everything positional
 * from the router:
 *
 * - `activeTag` comes from `useSearchParams().get('tag')`.
 * - `currentPage` comes from matching `/page/(\d+)$` against `usePathname()`
 *   — the `pagination.currentPage` prop is accepted but **never read** for
 *   this purpose (it is only forwarded so callers can keep the SSR shape).
 * - the sidebar/pagination base path is `pathname.replace(/\/page\/\d+$/, '')`.
 *
 * The props actually consumed are `items`, `allItems?`, `tagData`,
 * `getItemTags`, `renderItem`, `title`, `description?`, `pagination?` and
 * `contentLayout?`.
 *
 * ## Documented pipeline
 * 1. `sourceItems = allItems ?? items`.
 * 2. `pageSize = pagination ? Math.ceil(sourceItems.length / pagination.totalPages) : null`
 *    — note this is computed from the **unfiltered** source length.
 * 3. Filtering: `getItemTags(item)?.some((tag) => tag.id === activeTag)`.
 * 4. Slicing: `filteredItems.slice((currentPage - 1) * pageSize, ... + pageSize)`.
 * 5. `totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))` —
 *    recomputed after filtering, so the rendered denominator can disagree with
 *    the `pagination.totalPages` that was passed in.
 * 6. Pagination renders only when `pagination && totalPages > 1`.
 *
 * ## Findings pinned below (current behaviour, not endorsements)
 * - **Pagination i18n asymmetry**: the *enabled* prev/next links use
 *   `t('common.previous')` / `t('common.next')`, but the *disabled* variants
 *   render the hardcoded English `"← Previous"` / `"Next →"`. Under the
 *   Italian locale the two ends of the same nav disagree.
 * - **Hardcoded empty state**: the empty list renders the untranslated
 *   `"No items found."`.
 * - `pagination.currentPage` is inert; only the pathname drives the page.
 * - `tagData` counts are rendered verbatim and are never reconciled against
 *   the items actually present.
 *
 * `useLanguage` applies the locale in a mount effect, so every
 * locale-dependent assertion is async.
 */

/** `common` copy, aliased so the `it` locale import cannot shadow vitest's `it`. */
const EN = enLocale.common
const IT = itLocale.common

interface Item {
  id: string
  name: string
  tags?: LocalizedTag[]
}

const REACT: LocalizedTag = { id: 'react', label: { en: 'React', it: 'React' } }
const AI: LocalizedTag = { id: 'ai', label: { en: 'AI', it: 'IA' } }
/** Deliberately missing the Italian label, to exercise `?? label.en`. */
const EN_ONLY = { id: 'en-only', label: { en: 'English only' } } as unknown as LocalizedTag

/** Ten items: 1–4 tagged `react`, 5–6 tagged `ai`, 7–10 untagged. */
const ITEMS: Item[] = [
  { id: 'item-1', name: 'Item One', tags: [REACT] },
  { id: 'item-2', name: 'Item Two', tags: [REACT] },
  { id: 'item-3', name: 'Item Three', tags: [REACT] },
  { id: 'item-4', name: 'Item Four', tags: [REACT] },
  { id: 'item-5', name: 'Item Five', tags: [AI] },
  { id: 'item-6', name: 'Item Six', tags: [AI] },
  { id: 'item-7', name: 'Item Seven' },
  { id: 'item-8', name: 'Item Eight', tags: [] },
  { id: 'item-9', name: 'Item Nine' },
  { id: 'item-10', name: 'Item Ten' },
]

/** `ghost` is present in the counts but on no item, so it must be skipped. */
const TAG_DATA: Record<string, number> = { react: 4, ai: 2, ghost: 99 }

interface LayoutProps {
  items: Item[]
  allItems?: Item[]
  tagData: Record<string, number>
  getItemTags: (item: Item) => LocalizedTag[] | undefined
  renderItem: (item: Item) => ReactNode
  title: string
  description?: string
  pagination?: { currentPage: number; totalPages: number }
  contentLayout?: 'list' | 'grid'
}

function renderLayout(overrides: Partial<LayoutProps> = {}, locale: 'en' | 'it' = 'en') {
  const props: LayoutProps = {
    items: ITEMS,
    tagData: TAG_DATA,
    getItemTags: (item) => item.tags,
    renderItem: (item) => <p key={item.id}>{item.name}</p>,
    title: 'Journal',
    ...overrides,
  }

  return renderWithProviders(<ListWithTagsLayout<Item> {...props} />, { locale })
}

/** The `flex-1` content column that holds the items and the pagination nav. */
function contentColumn(container: HTMLElement) {
  const column = container.querySelector('div.flex-1')
  if (!column) throw new Error('Content column not found')
  return column as HTMLElement
}

/** The sidebar `<aside>` holding the "All" link and the tag list. */
function sidebar(container: HTMLElement) {
  const aside = container.querySelector('aside')
  if (!aside) throw new Error('Sidebar not found')
  return aside as HTMLElement
}

/** Names of the items currently rendered, in document order. */
function renderedItemNames() {
  return screen
    .getAllByText(/^Item /)
    .map((node) => node.textContent)
    .filter((text): text is string => Boolean(text))
}

afterEach(() => {
  resetNavigationMock()
})

describe('ListWithTagsLayout', () => {
  describe('header', () => {
    it('renders the title as the level-1 heading', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ title: 'Journal' })

      expect(await screen.findByRole('heading', { level: 1, name: 'Journal' })).toBeInTheDocument()
    })

    it('renders the description when provided', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ description: 'Notes from the lab.' })

      expect(await screen.findByText('Notes from the lab.')).toBeInTheDocument()
    })

    it('omits the description paragraph when it is absent', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ description: undefined })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByText('Notes from the lab.')).not.toBeInTheDocument()
    })

    it('renders the title verbatim (it is pre-translated by the caller)', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ title: 'Progetti' }, 'it')

      expect(await screen.findByRole('heading', { level: 1, name: 'Progetti' })).toBeInTheDocument()
    })
  })

  describe('activeTag derived from ?tag=', () => {
    it('renders every item when no tag is present', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toHaveLength(10)
    })

    it('keeps only items whose tags contain the active tag id', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item One', 'Item Two', 'Item Three', 'Item Four'])
    })

    it('filters on tag id, not on tag label', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'AI' } })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      // `AI` is the *label* of the `ai` tag; matching is by id, so nothing hits.
      expect(screen.getByText('No items found.')).toBeInTheDocument()
    })

    it('drops items whose getItemTags returns undefined', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'ai' } })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item Five', 'Item Six'])
    })

    it('drops items whose getItemTags returns an empty array', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      // `item-8` has `tags: []` — `.some()` is false, so it is filtered out.
      expect(screen.queryByText('Item Eight')).not.toBeInTheDocument()
    })

    it('reads the tag from the query string form of searchParams too', async () => {
      mockNavigation({ pathname: '/blog', searchParams: 'tag=ai' })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item Five', 'Item Six'])
    })

    it('ignores unrelated query parameters', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { q: 'react' } })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toHaveLength(10)
    })
  })

  describe('sourceItems selection', () => {
    it('filters and slices from allItems when it is provided', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({
        items: ITEMS.slice(0, 2),
        allItems: ITEMS,
      })

      await screen.findByRole('heading', { level: 1 })
      // The page-scoped `items` prop is ignored in favour of the full list.
      expect(renderedItemNames()).toHaveLength(10)
    })

    it('falls back to items when allItems is omitted', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ items: ITEMS.slice(0, 3), allItems: undefined })

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item One', 'Item Two', 'Item Three'])
    })
  })

  describe('currentPage derived from the pathname', () => {
    it('defaults to page 1 when the pathname has no /page/N segment', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('1 / 2')
    })

    it('reads the page number from a trailing /page/N segment', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('2 / 2')
    })

    it('ignores the pagination.currentPage prop entirely', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 2, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      // The prop says page 2, the pathname says page 1 — the pathname wins.
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('1 / 2')
      expect(renderedItemNames()).toEqual([
        'Item One',
        'Item Two',
        'Item Three',
        'Item Four',
        'Item Five',
      ])
    })

    it('only matches /page/N at the end of the pathname', async () => {
      mockNavigation({ pathname: '/blog/page/2/extra' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('1 / 2')
    })

    it('accepts multi-digit page numbers', async () => {
      mockNavigation({ pathname: '/blog/page/12' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('12 / 2')
    })
  })

  describe('pageSize computation and slicing', () => {
    it('derives pageSize from the unfiltered source length over pagination.totalPages', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      // ceil(10 / 2) = 5 items per page.
      expect(renderedItemNames()).toEqual([
        'Item One',
        'Item Two',
        'Item Three',
        'Item Four',
        'Item Five',
      ])
    })

    it('slices the second page from the same pageSize', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      renderLayout({ pagination: { currentPage: 2, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual([
        'Item Six',
        'Item Seven',
        'Item Eight',
        'Item Nine',
        'Item Ten',
      ])
    })

    it('rounds pageSize up, leaving a short final page', async () => {
      mockNavigation({ pathname: '/blog/page/3' })
      // ceil(10 / 3) = 4 → pages of 4, 4, 2.
      renderLayout({ pagination: { currentPage: 3, totalPages: 3 } })

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item Nine', 'Item Ten'])
    })

    it('renders every item when no pagination prop is given', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: undefined })

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toHaveLength(10)
    })

    it('slices from the filtered list, not the source list', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      // pageSize = ceil(10 / 5) = 2, filtered length 4 → page 1 is items 1–2.
      renderLayout({ pagination: { currentPage: 1, totalPages: 5 } })

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item One', 'Item Two'])
    })

    it('pages through the filtered list', async () => {
      mockNavigation({ pathname: '/blog/page/2', searchParams: { tag: 'react' } })
      renderLayout({ pagination: { currentPage: 1, totalPages: 5 } })

      await screen.findByRole('heading', { level: 1 })
      expect(renderedItemNames()).toEqual(['Item Three', 'Item Four'])
    })

    it('renders the empty state for a page beyond the end of the list', async () => {
      mockNavigation({ pathname: '/blog/page/9' })
      renderLayout({ pagination: { currentPage: 9, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.getByText('No items found.')).toBeInTheDocument()
    })

    it('treats a zero pageSize as "no pagination" and renders everything', async () => {
      mockNavigation({ pathname: '/blog' })
      // ceil(0 / 1) = 0, which is falsy, so slicing is skipped entirely.
      renderLayout({
        items: [],
        allItems: ITEMS.slice(0, 0),
        pagination: { currentPage: 1, totalPages: 1 },
      })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.getByText('No items found.')).toBeInTheDocument()
    })

    /**
     * FINDING — `pagination.totalPages: 0` silently empties the list.
     *
     * `pageSize = Math.ceil(10 / 0)` is `Infinity`, so
     * `start = (1 - 1) * Infinity` is `0 * Infinity` → `NaN`, and
     * `slice(NaN, NaN)` returns `[]`. The recomputed
     * `Math.max(1, Math.ceil(10 / Infinity))` is `1`, so the nav is hidden and
     * the user sees the empty state with no way to page anywhere.
     */
    it('empties the list when pagination.totalPages is zero (0 * Infinity is NaN)', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: { currentPage: 1, totalPages: 0 } })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.getByText('No items found.')).toBeInTheDocument()
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('totalPages recomputation', () => {
    it('recomputes the denominator instead of echoing pagination.totalPages', async () => {
      mockNavigation({ pathname: '/blog' })
      // 5 items over 4 pages → pageSize = ceil(5 / 4) = 2 → ceil(5 / 2) = 3.
      const { container } = renderLayout({
        items: ITEMS.slice(0, 5),
        pagination: { currentPage: 1, totalPages: 4 },
      })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('1 / 3')
    })

    it('shrinks the denominator once a tag filter is applied', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      // pageSize = ceil(10 / 5) = 2, filtered length 4 → ceil(4 / 2) = 2.
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 5 } })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toHaveTextContent('1 / 2')
    })

    it('floors the denominator at 1 when the filtered list is empty', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'ghost' } })
      renderLayout({ pagination: { currentPage: 1, totalPages: 5 } })

      await screen.findByRole('heading', { level: 1 })
      // Math.max(1, ceil(0 / 2)) = 1, and totalPages === 1 hides the nav.
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      expect(screen.getByText('No items found.')).toBeInTheDocument()
    })
  })

  describe('pagination visibility', () => {
    it('renders the nav when the recomputed totalPages is greater than 1', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(within(contentColumn(container)).getByRole('navigation')).toBeInTheDocument()
    })

    it('omits the nav when there is only one page', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: { currentPage: 1, totalPages: 1 } })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('omits the nav when no pagination prop is given', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: undefined })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('omits the nav when filtering collapses the list to a single page', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'ai' } })
      // pageSize = ceil(10 / 2) = 5, filtered length 2 → ceil(2 / 5) = 1.
      renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      expect(renderedItemNames()).toEqual(['Item Five', 'Item Six'])
    })
  })

  describe('sidebar "All" link', () => {
    it('labels the link with common.all in English', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      await waitFor(() =>
        expect(within(sidebar(container)).getByRole('link', { name: EN.all })).toBeInTheDocument()
      )
    })

    it('labels the link with common.all in Italian', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({}, 'it')

      await waitFor(() =>
        expect(within(sidebar(container)).getByRole('link', { name: IT.all })).toBeInTheDocument()
      )
      expect(IT.all).toBe('Tutti')
    })

    it('points at the bare pathname when there is no /page/N segment', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: EN.all })
      expect(link).toHaveAttribute('href', '/blog')
    })

    it('strips a trailing /page/N segment', async () => {
      mockNavigation({ pathname: '/blog/page/3' })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: EN.all })
      expect(link).toHaveAttribute('href', '/blog')
    })

    it('drops the active tag from the href (it never preserves ?tag=)', async () => {
      mockNavigation({ pathname: '/blog/page/2', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: EN.all })
      expect(link).toHaveAttribute('href', '/blog')
    })

    it('marks itself active only when no tag is selected', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: EN.all })
      expect(link.className).toContain('border-primary-500')
    })

    it('drops the active styling when a tag is selected', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: EN.all })
      expect(link.className).toContain('border-transparent')
      expect(link.className).not.toContain('border-primary-500')
    })
  })

  describe('sidebar tag list', () => {
    it('renders one list item per tag present in the items', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(within(sidebar(container)).getAllByRole('listitem')).toHaveLength(2)
    })

    it('renders the English label followed by the tagData count', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      await waitFor(() =>
        expect(within(sidebar(container)).getByText('React (4)')).toBeInTheDocument()
      )
      expect(within(sidebar(container)).getByText('AI (2)')).toBeInTheDocument()
    })

    it('renders the Italian label under the Italian locale', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({}, 'it')

      await waitFor(() =>
        expect(within(sidebar(container)).getByText('IA (2)')).toBeInTheDocument()
      )
    })

    it('falls back to the English label when the active language is missing', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout(
        {
          items: [{ id: 'only', name: 'Item One', tags: [EN_ONLY] }],
          tagData: { 'en-only': 7 },
        },
        'it'
      )

      await waitFor(() =>
        expect(within(sidebar(container)).getByText('English only (7)')).toBeInTheDocument()
      )
    })

    it('skips tag ids in tagData that no item carries', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(within(sidebar(container)).queryByText(/ghost/i)).not.toBeInTheDocument()
      expect(within(sidebar(container)).queryByText(/\(99\)/)).not.toBeInTheDocument()
    })

    it('renders counts from tagData verbatim, never recounting the items', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ tagData: { react: 999, ai: 0 } })

      await waitFor(() =>
        expect(within(sidebar(container)).getByText('React (999)')).toBeInTheDocument()
      )
      // Four items carry `react` and two carry `ai`; the counts disagree and
      // the component does not care.
      expect(within(sidebar(container)).getByText('AI (0)')).toBeInTheDocument()
    })

    it('preserves the tagData key order', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ tagData: { ai: 2, react: 4 } })

      await waitFor(() =>
        expect(within(sidebar(container)).getByText('AI (2)')).toBeInTheDocument()
      )
      const labels = within(sidebar(container))
        .getAllByRole('listitem')
        .map((li) => li.textContent)
      expect(labels).toEqual(['AI (2)', 'React (4)'])
    })

    it('builds tag hrefs from the pathname plus ?tag=<id>', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: 'React (4)' })
      expect(link).toHaveAttribute('href', '/blog?tag=react')
    })

    it('strips /page/N from tag hrefs so filtering restarts at page 1', async () => {
      mockNavigation({ pathname: '/blog/page/3' })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: 'React (4)' })
      expect(link).toHaveAttribute('href', '/blog?tag=react')
    })

    it('turns the active tag into a toggle-off link back to the bare pathname', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: 'React (4)' })
      expect(link).toHaveAttribute('href', '/blog')
    })

    it('strips /page/N when toggling the active tag off', async () => {
      mockNavigation({ pathname: '/blog/page/2', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: 'React (4)' })
      expect(link).toHaveAttribute('href', '/blog')
    })

    it('keeps inactive tags pointing at their own filter while another is active', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: 'AI (2)' })
      expect(link).toHaveAttribute('href', '/blog?tag=ai')
    })

    it('applies the active styling to the selected tag only', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const active = await within(sidebar(container)).findByRole('link', { name: 'React (4)' })
      const inactive = within(sidebar(container)).getByRole('link', { name: 'AI (2)' })
      expect(active.className).toContain('border-primary-500')
      expect(inactive.className).toContain('border-transparent')
    })

    it('navigates to the toggle-off href when the active tag is clicked', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      const { container } = renderLayout()

      const link = await within(sidebar(container)).findByRole('link', { name: 'React (4)' })
      // The toggle is expressed purely as an href, so clicking it is a plain
      // navigation back to the unfiltered list.
      expect(link).toHaveAttribute('href', '/blog')
      expect(link.tagName).toBe('A')
    })

    it('renders an empty tag list when tagData is empty', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ tagData: {} })

      await screen.findByRole('heading', { level: 1 })
      expect(within(sidebar(container)).queryAllByRole('listitem')).toHaveLength(0)
      // The "All" link still renders.
      expect(within(sidebar(container)).getByRole('link')).toBeInTheDocument()
    })

    it('resolves tag labels from the unfiltered source list', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'ai' } })
      const { container } = renderLayout()

      // `react` is filtered out of the content but still labelled in the
      // sidebar, because the lookup walks `sourceItems`.
      await waitFor(() =>
        expect(within(sidebar(container)).getByText('React (4)')).toBeInTheDocument()
      )
    })
  })

  describe('pagination hrefs', () => {
    it('links next to /page/2 from the first page', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      const next = await screen.findByRole('link', { name: `${EN.next} →` })
      expect(next).toHaveAttribute('href', '/blog/page/2')
      expect(next).toHaveAttribute('rel', 'next')
    })

    it('collapses the previous link to the bare basePath when it would be page 1', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      renderLayout({ pagination: { currentPage: 2, totalPages: 2 } })

      const prev = await screen.findByRole('link', { name: `← ${EN.previous}` })
      expect(prev).toHaveAttribute('href', '/blog')
      expect(prev).toHaveAttribute('rel', 'prev')
    })

    it('keeps /page/N in the previous link when the target is above page 1', async () => {
      mockNavigation({ pathname: '/blog/page/3' })
      renderLayout({ pagination: { currentPage: 3, totalPages: 3 } })

      const prev = await screen.findByRole('link', { name: `← ${EN.previous}` })
      expect(prev).toHaveAttribute('href', '/blog/page/2')
    })

    it('preserves ?tag= on the next link', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react' } })
      renderLayout({ pagination: { currentPage: 1, totalPages: 5 } })

      const next = await screen.findByRole('link', { name: `${EN.next} →` })
      expect(next).toHaveAttribute('href', '/blog/page/2?tag=react')
    })

    it('preserves ?tag= on the collapsed previous link', async () => {
      mockNavigation({ pathname: '/blog/page/2', searchParams: { tag: 'react' } })
      renderLayout({ pagination: { currentPage: 2, totalPages: 5 } })

      const prev = await screen.findByRole('link', { name: `← ${EN.previous}` })
      expect(prev).toHaveAttribute('href', '/blog?tag=react')
    })

    it('drops any query parameter other than tag', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'react', sort: 'asc' } })
      renderLayout({ pagination: { currentPage: 1, totalPages: 5 } })

      const next = await screen.findByRole('link', { name: `${EN.next} →` })
      expect(next).toHaveAttribute('href', '/blog/page/2?tag=react')
    })

    it('builds hrefs from the projects base path just as well', async () => {
      mockNavigation({ pathname: '/projects/page/2' })
      renderLayout({ pagination: { currentPage: 2, totalPages: 2 } })

      const prev = await screen.findByRole('link', { name: `← ${EN.previous}` })
      expect(prev).toHaveAttribute('href', '/projects')
    })
  })

  describe('disabled pagination controls', () => {
    it('renders the previous control as an aria-disabled span on page 1', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      const nav = within(contentColumn(container)).getByRole('navigation')
      const disabled = nav.querySelector('span[aria-disabled="true"]')
      expect(disabled).toBeInTheDocument()
      expect(disabled).toHaveTextContent('← Previous')
      expect(disabled?.tagName).toBe('SPAN')
    })

    it('renders the next control as an aria-disabled span on the last page', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      const { container } = renderLayout({ pagination: { currentPage: 2, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      const nav = within(contentColumn(container)).getByRole('navigation')
      const disabled = nav.querySelector('span[aria-disabled="true"]')
      expect(disabled).toHaveTextContent('Next →')
    })

    it('offers no previous link at all on page 1', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByRole('link', { name: `← ${EN.previous}` })).not.toBeInTheDocument()
    })

    it('offers no next link at all on the last page', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      renderLayout({ pagination: { currentPage: 2, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByRole('link', { name: `${EN.next} →` })).not.toBeInTheDocument()
    })

    it('disables both controls when the page is out of range above the end', async () => {
      mockNavigation({ pathname: '/blog/page/9' })
      const { container } = renderLayout({ pagination: { currentPage: 9, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      const nav = within(contentColumn(container)).getByRole('navigation')
      // `9 > 1` so prev is a link, but `9 < 2` is false so next is disabled.
      expect(nav.querySelectorAll('span[aria-disabled="true"]')).toHaveLength(1)
      expect(within(nav).getByRole('link', { name: `← ${EN.previous}` })).toHaveAttribute(
        'href',
        '/blog/page/8'
      )
    })
  })

  /**
   * FINDING — pagination i18n asymmetry.
   *
   * `Pagination` translates the *enabled* controls with `t('common.previous')`
   * and `t('common.next')`, but the *disabled* fallbacks are hardcoded English
   * literals. Under the Italian locale a nav therefore reads
   * "← Previous … Successivo →" on page 1 and
   * "← Precedente … Next →" on the last page.
   */
  describe('pagination localisation asymmetry (current behaviour)', () => {
    it('translates the enabled next control in Italian', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ pagination: { currentPage: 1, totalPages: 2 } }, 'it')

      expect(await screen.findByRole('link', { name: `${IT.next} →` })).toBeInTheDocument()
      expect(IT.next).toBe('Successivo')
    })

    it('leaves the disabled previous control in English under the Italian locale', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } }, 'it')

      // Wait for the Italian locale to land on the *enabled* side first.
      await screen.findByRole('link', { name: `${IT.next} →` })

      const nav = within(contentColumn(container)).getByRole('navigation')
      const disabled = nav.querySelector('span[aria-disabled="true"]')
      expect(disabled).toHaveTextContent('← Previous')
      expect(disabled).not.toHaveTextContent(IT.previous)
    })

    it('translates the enabled previous control in Italian', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      renderLayout({ pagination: { currentPage: 2, totalPages: 2 } }, 'it')

      expect(await screen.findByRole('link', { name: `← ${IT.previous}` })).toBeInTheDocument()
      expect(IT.previous).toBe('Precedente')
    })

    it('leaves the disabled next control in English under the Italian locale', async () => {
      mockNavigation({ pathname: '/blog/page/2' })
      const { container } = renderLayout({ pagination: { currentPage: 2, totalPages: 2 } }, 'it')

      await screen.findByRole('link', { name: `← ${IT.previous}` })

      const nav = within(contentColumn(container)).getByRole('navigation')
      const disabled = nav.querySelector('span[aria-disabled="true"]')
      expect(disabled).toHaveTextContent('Next →')
      expect(disabled).not.toHaveTextContent(IT.next)
    })

    it('renders the same nav with matching English strings on both ends in English', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } }, 'en')

      await screen.findByRole('link', { name: `${EN.next} →` })

      const nav = within(contentColumn(container)).getByRole('navigation')
      // The asymmetry is invisible in English because the literals happen to
      // match `common.previous` / `common.next`.
      expect(nav.querySelector('span[aria-disabled="true"]')).toHaveTextContent('← Previous')
      expect(EN.previous).toBe('Previous')
      expect(EN.next).toBe('Next')
    })
  })

  /**
   * FINDING — the empty state is a hardcoded English literal
   * (`<p>No items found.</p>`) with no `t()` lookup and no locale key.
   */
  describe('empty state (current behaviour)', () => {
    it('renders the hardcoded English message when there are no items', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({ items: [] })

      expect(await screen.findByText('No items found.')).toBeInTheDocument()
    })

    it('keeps the message in English under the Italian locale', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ items: [], tagData: {} }, 'it')

      // The "All" link proves the Italian locale has been applied.
      await within(sidebar(container)).findByRole('link', { name: IT.all })
      expect(screen.getByText('No items found.')).toBeInTheDocument()
    })

    it('renders the message when a tag filter matches nothing', async () => {
      mockNavigation({ pathname: '/blog', searchParams: { tag: 'nope' } })
      renderLayout()

      expect(await screen.findByText('No items found.')).toBeInTheDocument()
    })

    it('does not render the message when items are present', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout()

      await screen.findByRole('heading', { level: 1 })
      expect(screen.queryByText('No items found.')).not.toBeInTheDocument()
    })
  })

  describe('contentLayout', () => {
    it('defaults to the vertical list spacing', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ contentLayout: undefined })

      await screen.findByRole('heading', { level: 1 })
      expect(contentColumn(container).className).toContain('space-y-6')
      expect(contentColumn(container).className).not.toContain('grid-cols-1')
    })

    it('applies the list spacing when asked explicitly', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ contentLayout: 'list' })

      await screen.findByRole('heading', { level: 1 })
      expect(contentColumn(container).className).toContain('space-y-6')
    })

    it('applies the responsive grid classes for the grid layout', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ contentLayout: 'grid' })

      await screen.findByRole('heading', { level: 1 })
      const className = contentColumn(container).className
      expect(className).toContain('grid')
      expect(className).toContain('grid-cols-1')
      expect(className).toContain('sm:grid-cols-2')
      expect(className).not.toContain('space-y-6')
    })
  })

  describe('renderItem delegation', () => {
    it('calls renderItem once per paginated item', async () => {
      mockNavigation({ pathname: '/blog' })
      const seen: string[] = []
      renderLayout({
        pagination: { currentPage: 1, totalPages: 5 },
        renderItem: (item) => {
          seen.push(item.id)
          return <p key={item.id}>{item.name}</p>
        },
      })

      await screen.findByRole('heading', { level: 1 })
      // pageSize = ceil(10 / 5) = 2.
      expect([...new Set(seen)]).toEqual(['item-1', 'item-2'])
    })

    it('renders whatever markup renderItem returns', async () => {
      mockNavigation({ pathname: '/blog' })
      renderLayout({
        items: ITEMS.slice(0, 1),
        renderItem: (item) => (
          <article key={item.id} data-testid="custom">
            {item.name.toUpperCase()}
          </article>
        ),
      })

      expect(await screen.findByTestId('custom')).toHaveTextContent('ITEM ONE')
    })

    it('places the pagination nav after the items inside the content column', async () => {
      mockNavigation({ pathname: '/blog' })
      const { container } = renderLayout({ pagination: { currentPage: 1, totalPages: 2 } })

      await screen.findByRole('heading', { level: 1 })
      const column = contentColumn(container)
      const nav = within(column).getByRole('navigation')
      expect(column.lastElementChild).toBe(nav)
    })
  })
})
