'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

interface Props {
  id: string
  label: string
  className?: string // optional override for different contexts
}

export default function Tag({ id, label, className }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag')

  const params = new URLSearchParams(searchParams.toString())
  if (activeTag === id) {
    params.delete('tag')
  } else {
    params.set('tag', id)
  }

  const href = params.toString() ? `${pathname}?${params}` : pathname

  return (
    <Link
      href={href}
      className={clsx(
        'rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
        activeTag === id
          ? 'bg-primary-500 border-primary-500 text-white'
          : 'border-primary-500/40 text-primary-600 dark:text-primary-400 hover:border-primary-500',
        className
      )}
    >
      {label}
    </Link>
  )
}
