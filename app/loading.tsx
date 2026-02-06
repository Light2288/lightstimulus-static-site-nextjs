export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="border-primary-500 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
