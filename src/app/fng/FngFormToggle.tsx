'use client';

import { useState, useEffect } from 'react';

export default function FngFormToggle({
  embedUrl,
}: {
  embedUrl: string | null;
}) {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('showFngForm');
    if (saved === 'true') setShowForm(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('showFngForm', String(showForm));
  }, [showForm]);

  return (
    <>
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-white text-base font-medium rounded-md bg-blue-900 bg-f3-blue hover:bg-blue-700 dark:bg-f3-blue-light dark:hover:bg-blue-800 transition-colors shadow-lg"
      >
        {showForm ? 'Hide FNG Form' : 'Fill out FNG Form'}
      </button>

      {showForm && (
        <div className="mt-8 max-w-2xl mx-auto">
          {!embedUrl ? (
            <div
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-100"
              role="alert"
            >
              <p className="font-bold">Form Unavailable:</p>
              <p className="text-sm">
                The FNG form URL is not configured by the admin or is invalid.
              </p>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              frameBorder="0"
              className="w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] rounded-lg shadow-md"
              title="FNG Google Form"
              allowFullScreen
            >
              Loading FNG Google Form...
            </iframe>
          )}
        </div>
      )}
    </>
  );
}
