'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Something went wrong!
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-3 text-white transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
