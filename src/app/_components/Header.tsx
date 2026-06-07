'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Header({
  href,
  regionName,
}: {
  href: string;
  regionName?: string;
}) {
  const pages = [
    { href: '/fng', text: 'NEW TO F3 [FNG]' },
    { href: '/workouts', text: 'WORKOUTS [AO]' },
    { href: '/contact', text: 'Contact Us' },
  ];

  const { isDark, toggleDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-gloom dark:bg-gray-900 text-black dark:text-gray-200 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-4">
        {/* LEFT: Logo + Region Name */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/f3-white.png"
              alt="F3 Logo"
              width={48}
              height={48}
              className="rounded"
            />
            {regionName && (
              <span className="text-lg font-bold tracking-tight dark:text-gray-100 text-black">
                {regionName}
              </span>
            )}
          </Link>
        </div>

        {/* CENTER: Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex space-x-6 uppercase font-medium"
        >
          {pages.map((p, i) => (
            <Link
              key={i}
              href={p.href}
              title={p.text}
              className={`${
                href === p.href
                  ? 'text-drp'
                  : 'text-black dark:text-gray-200 hover:text-drp transition-colors'
              }`}
            >
              {p.text}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Theme toggle + Hamburger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded border border-black dark:border-gray-400"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0112.001 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.126 2.562-7.652 6.179-9.084a.75.75 0 01.963.949 8.25 8.25 0 0011.408 11.408.75.75 0 01.95.479z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M17.72 17.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M17.72 6.28l1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
            )}
          </button>

          {/* Hamburger button - mobile only */}
          <button
            className="md:hidden p-2 rounded border border-black dark:border-gray-400"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav — slide-down */}
      <nav
        aria-label="Mobile navigation"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center pb-4 uppercase font-medium space-y-3">
          {pages.map((p, i) => (
            <Link
              key={i}
              href={p.href}
              title={p.text}
              onClick={() => setMobileOpen(false)}
              className={`${
                href === p.href
                  ? 'text-drp'
                  : 'text-black dark:text-gray-200 hover:text-drp transition-colors'
              }`}
            >
              {p.text}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
