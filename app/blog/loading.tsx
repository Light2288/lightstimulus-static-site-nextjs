export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 h-10 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 p-6 dark:border-gray-700"
          >
            <div className="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
