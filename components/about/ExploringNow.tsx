'use client'

import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

type ExploringNow = {
  id: string
  en: string
  it: string
}

export function ExploringNow({ items }: { items: ExploringNow[] }) {
  const { lang, t } = useLanguage()

  if (!items.length) return null

  return (
    <section className="flex h-full flex-col">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-lg font-semibold text-transparent">
        {t('about.exploring.title')}
      </h2>

      <motion.div
        key={lang}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="glass-bg flex-1 rounded-xl border border-white/20 p-6 shadow-md backdrop-blur dark:border-white/10"
      >
        <ul className="space-y-3">
          {items.map((item) => (
            <motion.li
              key={item.id}
              variants={{
                hidden: { opacity: 0, x: -6 },
                visible: { opacity: 1, x: 0 },
              }}
              className="text-text-secondary text-sm dark:text-gray-300"
            >
              — {item[lang]}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
