type FocusArea = {
  title: string
  description: string
}

export function FocusAreas({ areas }: { areas: FocusArea[] }) {
  if (!areas.length) return null

  return (
    <section className="mt-14">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        Focus areas
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {areas.map((area) => (
          <div
            key={area.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <h3 className="mb-2 text-lg font-medium">{area.title}</h3>
            <p className="text-sm text-gray-300">{area.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
