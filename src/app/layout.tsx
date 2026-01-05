import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "./_components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

// Default metadata - can be overridden by page-level metadata
export const metadata: Metadata = {
  title: {
    default: "F3 Northwest Passage | Free Men's Fitness Workouts",
    template: "%s | F3 Northwest Passage",
  },
  description:
    "Join F3 Northwest Passage for free, peer-led outdoor fitness workouts for men. No membership fees. Rain or shine. All fitness levels welcome.",
  keywords: [
    "F3",
    "F3 Northwest Passage",
    "men's fitness",
    "free workouts",
    "outdoor fitness",
    "peer-led workouts",
    "fitness fellowship faith",
  ],
  authors: [{ name: "F3 Northwest Passage" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "F3 Northwest Passage",
    title: "F3 Northwest Passage | Free Men's Fitness Workouts",
    description:
      "Join F3 Northwest Passage for free, peer-led outdoor fitness workouts for men. No membership fees. Rain or shine. All fitness levels welcome.",
  },
  twitter: {
    card: "summary_large_image",
    title: "F3 Northwest Passage | Free Men's Fitness Workouts",
    description:
      "Join F3 Northwest Passage for free, peer-led outdoor fitness workouts for men. No membership fees. Rain or shine. All fitness levels welcome.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const enableAnalytics =
    typeof googleAnalyticsId === "string" && googleAnalyticsId.length > 0;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        {enableAnalytics && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-iron text-black dark:text-white font-sans text-lg text-center justify-center`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
