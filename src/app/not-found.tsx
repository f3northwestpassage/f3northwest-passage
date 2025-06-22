// src/app/not-found.tsx
'use client'; // Required for not-found page, even if minimal

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        Go back home
      </Link>
    </div>
  );
}
