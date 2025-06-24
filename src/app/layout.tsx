'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  const enableAnalytics = false;

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') setDarkMode(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="robots" content="noindex,nofollow" />
        {enableAnalytics && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-H3KTP1DXZF"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-H3KTP1DXZF');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.className}  bg-white dark:bg-iron text-black dark:text-white font-sans text-lg text-center justify-center`}>
        {children}
      </body>
    </html>
  );
}
