"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header({ href }: { href: string }) {
  const pages = [
    { href: '/fng', text: 'NEW TO F3 [FNG]' },
    { href: '/workouts', text: 'WORKOUTS [AO]' },
  ];

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsDark(shouldUseDark);
  }, []);

  const toggleDark = () => {
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsDark(!isDark);
  };

  return (
    <header className="p-5 text-center bg-gloom dark:bg-gray-900 text-black dark:text-gray-200">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <Link href="/">
          <Image
            src="/f3-white.png"
            alt="F3 White"
            width={60}
            height={60}
            className="my-0"
          />
        </Link>

        {/* <button
          onClick={toggleDark}
          className="p-2 rounded border border-black dark:border-gray-400"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? '🌙 Dark' : '☀️ Light'}
        </button> */}
      </div>

      <nav className="uppercase pt-4">
        <ul className="flex justify-center space-x-6">
          {pages.map((p, i) => (
            <li key={i}>
              <Link
                href={p.href}
                title={p.text}
                className={`font-medium ${href === p.href ? 'text-drp' : 'text-black dark:text-gray-200'
                  }`}
              >
                {p.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
