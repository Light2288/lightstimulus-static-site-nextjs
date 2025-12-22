'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { slug } from 'github-slugger'
import clsx from 'clsx'

interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tagSlug = slug(text)
  const activeTag = searchParams.get('tag')

  const isActive = activeTag === tagSlug

  const params = new URLSearchParams(searchParams.toString())

  if (isActive) {
    params.delete('tag')
  } else {
    params.set('tag', tagSlug)
  }

  const href = params.toString() ? `${pathname}?${params.toString()}` : pathname

  return (
    <Link
      href={href}
      className={clsx(
        'mr-3 text-sm font-medium uppercase transition-colors',
        isActive
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
      )}
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
