// src/app/error.tsx
'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        style={{
          padding: '10px 20px',
          margin: '20px 0',
          color: 'white',
          backgroundColor: '#0070f3',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
      <br />
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        Go back home
      </Link>
    </div>
  );
}

// Need to import Link
import Link from 'next/link';
