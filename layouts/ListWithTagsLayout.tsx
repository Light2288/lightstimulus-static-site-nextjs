'use client'

import { ReactNode, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import Link from '@/components/Link'
import { useLanguage } from '@/contexts/LanguageContext'
import type { LocalizedTag } from '@/types/localizedTag'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

interface Props<T> {
  items: T[] // page-scoped items (SSR)
  allItems?: T[] // full list (for filtering)
  tagData: Record<string, number>

  getItemTags: (item: T) => LocalizedTag[] | undefined
  renderItem: (item: T) => ReactNode

  title: string
  description?: string
  pagination?: PaginationProps
  contentLayout?: 'list' | 'grid'
}

function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname.replace(/\/page\/\d+$/, '')
  const { t } = useLanguage()

  const prevPage = currentPage > 1
  const nextPage = currentPage < totalPages

  const searchParams = useSearchParams()
  const tag = searchParams.get('tag')
  const tagQuery = tag ? `?tag=${tag}` : ''

  return (
    <nav className="mt-12 flex justify-between">
      {prevPage ? (
        <Link
          href={
            currentPage - 1 === 1
              ? `${basePath}${tagQuery}`
              : `${basePath}/page/${currentPage - 1}${tagQuery}`
          }
          rel="prev"
        >
          {`← ${t('common.previous')}`}
        </Link>
      ) : (
        <span className="cursor-not-allowed opacity-60" aria-disabled="true">
          ← Previous
        </span>
      )}

      <span className="text-sm opacity-70">
        {currentPage} / {totalPages}
      </span>

      {nextPage ? (
        <Link href={`${basePath}/page/${currentPage + 1}${tagQuery}`} rel="next">
          {`${t('common.next')} →`}
        </Link>
      ) : (
        <span className="cursor-not-allowed opacity-60" aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  )
}

export default function ListWithTagsLayout<T>({
  items,
  allItems,
  tagData,
  getItemTags,
  renderItem,
  title,
  description,
  pagination,
  contentLayout = 'list',
}: Props<T>) {
  const { t, lang } = useLanguage()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTag = searchParams.get('tag')
  const pageParam = pathname.match(/\/page\/(\d+)$/)
  const currentPage = pageParam ? Number(pageParam[1]) : 1

  const sourceItems = allItems ?? items
  const pageSize = pagination ? Math.ceil(sourceItems.length / pagination.totalPages) : null

  // 1️⃣ Apply filtering
  const filteredItems = useMemo(() => {
    if (!activeTag) return sourceItems
    return sourceItems.filter((item) => getItemTags(item)?.some((tag) => tag.id === activeTag))
  }, [activeTag, sourceItems, getItemTags])

  // 2️⃣ Apply pagination (also when filtered)
  const paginatedItems = useMemo(() => {
    if (!pagination || !pageSize) return filteredItems

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize

    return filteredItems.slice(start, end)
  }, [filteredItems, pagination, pageSize, currentPage])

  const totalPages =
    pagination && pageSize ? Math.max(1, Math.ceil(filteredItems.length / pageSize)) : 1

  const showPagination = pagination && totalPages > 1

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-4 text-4xl font-bold">{title}</h1>

      {description && <p className="text-text-secondary mb-12 max-w-2xl">{description}</p>}

      <div className="flex items-start gap-12">
        {/* Sidebar */}
        <aside className="hidden w-[260px] lg:block">
          <div className="glass-bg rounded-xl p-6">
            <Link
              href={pathname.replace(/\/page\/\d+$/, '')}
              className={clsx(
                'block border-l-2 pl-3 font-bold uppercase transition-colors',
                !activeTag
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-text-secondary hover:text-primary-500 dark:hover:text-primary-400 border-transparent'
              )}
            >
              {t('common.all')}
            </Link>

            <ul className="mt-4 space-y-2">
              {Object.entries(tagData).map(([tagId, count]) => {
                const tag =
                  sourceItems
                    .flatMap((item) => getItemTags(item) ?? [])
                    .find((t) => t.id === tagId) ?? null

                if (!tag) return null

                const isActive = tagId === activeTag
                const href = isActive
                  ? pathname.replace(/\/page\/\d+$/, '')
                  : `${pathname.replace(/\/page\/\d+$/, '')}?tag=${tagId}`

                return (
                  <li key={tagId}>
                    <Link
                      href={href}
                      className={clsx(
                        'block border-l-2 pl-3 transition-colors',
                        isActive
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
                          : 'text-text-secondary hover:text-primary-500 dark:hover:text-primary-400 border-transparent'
                      )}
                    >
                      {tag.label[lang] ?? tag.label.en} ({count})
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div
          className={clsx(
            'flex-1',
            contentLayout === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2' : 'space-y-6'
          )}
        >
          {!paginatedItems.length && <p>No items found.</p>}
          {paginatedItems.map(renderItem)}

          {showPagination && <Pagination currentPage={currentPage} totalPages={totalPages} />}
        </div>
      </div>
    </section>
  )
}
