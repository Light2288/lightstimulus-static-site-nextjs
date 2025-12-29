'use client'

import { ReactNode } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface LangProps {
  value: string
  children: ReactNode
}

export default function Lang({ value, children }: LangProps) {
  const { lang } = useLanguage()
  if (lang !== value) return null
  return <>{children}</>
}
