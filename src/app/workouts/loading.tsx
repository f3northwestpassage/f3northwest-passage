export default function WorkoutsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4">
      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
      </div>

      {/* Cards skeleton grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-gray-100 dark:bg-gray-800 p-6 space-y-4 animate-pulse"
          >
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
