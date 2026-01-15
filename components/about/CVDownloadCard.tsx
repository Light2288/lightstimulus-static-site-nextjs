type CV = {
  url: string
  label?: string
}

export function CVDownloadCard({ cv }: { cv?: CV }) {
  if (!cv?.url) return null

  const basePath = process.env.BASE_PATH || ''

  return (
    <section className="mt-16">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        Curriculum Vitae
      </h2>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="mt-1 text-sm text-gray-300">
          A concise overview of my experience, skills, and selected projects.
        </p>

        <a
          href={`${basePath}${cv.url}`}
          download
          className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-2 text-sm font-medium transition hover:bg-white/20"
        >
          {cv.label ?? 'Download CV'}
        </a>
      </div>
    </section>
  )
}
