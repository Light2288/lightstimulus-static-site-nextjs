export function ExploringNow({ items }: { items: string[] }) {
  if (!items.length) return null

  return (
    <section className="mt-16">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        What I’m exploring now
      </h2>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="text-sm text-gray-300">
              — {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
