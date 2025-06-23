// src/app/layout.tsx
import { Inter } from 'next/font/google';
import Script from 'next/script'; // Keep this for external scripts

import './globals.css';

// For metadata, use the built-in Metadata export
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'F3 Northwest Passage', // Use 'default' for a base title
    template: '%s | F3 Northwest Passage', // For dynamic titles, e.g., "Page Title | F3 Northwest Passage"
  },
  description: 'F3 Northwest Passage: Forge your fitness, fellowship, and faith with workouts across the region.', // More descriptive default
  icons: {
    icon: '/favicon.ico', // Sets the favicon
    // You can also add apple-touch-icon, etc.
    // apple: '/apple-icon.png',
  },
  // IMPORTANT: Reconsider these robots settings if this is a public-facing site.
  // For a production site that should be indexed, use:
  robots: {
    index: true, // Typically true for production sites
    follow: true, // Typically true for production sites
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  // If you *do* want to prevent indexing for development/staging environments:
  // Use a conditional check based on process.env.VERCEL_ENV or NODE_ENV
  // robots: process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' ? { index: false, follow: false } : { index: true, follow: true },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Good practice: use an environment variable for analytics ID and enable flag
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  // It's better to make googleAnalyticsId strictly dependent on the env var presence
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID; // Fetch directly from env

  return (
    // YOU MUST EXPLICITLY RENDER THE <html> TAG IN THE ROOT LAYOUT
    <html lang="en" className={inter.className}>
      <body className={`bg-iron text-white text-center font-sans text-lg`}>
        {/* Google Analytics - this is the correct place for it in App Router layouts */}
        {googleAnalyticsId && isProduction && ( // Only render if ID exists AND it's a production build
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive" // 'afterInteractive' is good for analytics
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
