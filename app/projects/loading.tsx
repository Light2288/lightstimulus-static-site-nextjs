export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 h-10 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
            <div className="p-5">
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
