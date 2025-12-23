'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

interface Props {
  id: string
  label: string
}

export default function Tag({ id, label }: Props) {
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
        'rounded-full px-3 py-1 text-xs font-medium',
        activeTag === id
          ? 'bg-primary-500 text-white'
          : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
      )}
    >
      {label}
    </Link>
  )
}
