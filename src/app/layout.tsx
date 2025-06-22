import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import Script from 'next/script'; // Keep this for external scripts

import './globals.css';

// For metadata, use the built-in Metadata export
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'F3 Northwest Passage', // Use 'default' for a base title
    template: '%s | F3 Northwest Passage', // For dynamic titles, e.g., "Page Title | F3 Northwest Passage"
  },
  description: 'Your F3 region description here.', // Default description
  icons: {
    icon: '/favicon.ico', // Sets the favicon
    // You can also add apple-touch-icon, etc.
    // apple: '/apple-icon.png',
  },
  // IMPORTANT: Reconsider these robots settings if this is a public-facing site.
  // 'index: false' tells search engines NOT to index your site.
  // 'follow: false' tells them NOT to follow links on your site.
  // This is typically used for development sites or private content.
  // For a public site, you'd usually want:
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     noimageindex: true,
  //     'max-video-preview': -1,
  //     'max-snippet': -1,
  //   },
  // },
  robots: {
    index: false,
    follow: false,
  },
};


export default function Layout({ children }: { children: React.ReactNode }) {
  // Good practice: use an environment variable for analytics ID and enable flag
  const enableAnalytics = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'; // Only enable in production for example
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'G-H3KTP1DXZF'; // Fallback to hardcoded if env var missing

  return (
    // Next.js automatically adds <html> and <head>.
    // You only define the <body> and its contents.
    <body
      className={`${inter.className} bg-iron text-white text-center font-sans text-lg`}
    >
      {/* Google Analytics - this is the correct place for it in App Router layouts */}
      {/* {enableAnalytics && (
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
      )} */}
      {children}
    </body>
  );
}
