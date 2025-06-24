// src/app/not-found.tsx
import Link from 'next/link'; // This is fine

export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link href="/">Return to Home Page</Link>
    </div>
  );
}
