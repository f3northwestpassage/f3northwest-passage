"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header({
  href,
  regionName,
}: {
  href: string;
  regionName?: string;
}) {
  const pages = [
    { href: "/fng", text: "NEW TO F3 [FNG]" },
    { href: "/workouts", text: "WORKOUTS [AO]" },
    { href: "/contact", text: "Contact Us" },
  ];

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultDark = storedTheme === "dark" || (!storedTheme && prefersDark);

    document.documentElement.classList.toggle("dark", defaultDark);
    setIsDark(defaultDark);
  }, []);

  const toggleDark = () => {
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setIsDark(!isDark);
  };

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

        {/* CENTER: Navigation */}
        <nav className="hidden md:flex space-x-6 uppercase font-medium">
          {pages.map((p, i) => (
            <Link
              key={i}
              href={p.href}
              title={p.text}
              className={`${href === p.href ? "text-drp" : "text-black dark:text-gray-200 hover:text-drp transition-colors"
                }`}
            >
              {p.text}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Theme toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded border border-black dark:border-gray-400"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Mobile Nav */}
      <nav className="flex md:hidden justify-center pb-4 uppercase font-medium">
        {pages.map((p, i) => (
          <Link
            key={i}
            href={p.href}
            title={p.text}
            className={`mx-3 ${href === p.href ? "text-drp" : "text-black dark:text-gray-200 hover:text-drp transition-colors"
              }`}
          >
            {p.text}
          </Link>
        ))}
      </nav>
    </header>
  );
}
