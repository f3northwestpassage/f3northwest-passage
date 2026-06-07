export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
        Loading...
      </p>
    </div>
  );
}
