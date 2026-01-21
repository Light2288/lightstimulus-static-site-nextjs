import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AboutContent({ children }: Props) {
  return <section className="prose dark:prose-invert max-w-none">{children}</section>
}
