import { ReactNode } from 'react'
import clsx from 'clsx'

interface Props {
  children: ReactNode
  gradient?: boolean
}

export default function PageTitle({ children, gradient = false }: Props) {
  return (
    <h1
      className={clsx(
        'text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14',
        !gradient && 'text-gray-900 dark:text-gray-100'
      )}
    >
      {gradient ? (
        <span className="inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-transparent">
          {children}
        </span>
      ) : (
        children
      )}
    </h1>
  )
}
