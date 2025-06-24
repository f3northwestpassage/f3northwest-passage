// src/app/_components/MapLinkButton.tsx
"use client"; // This component MUST be a Client Component

import Link from 'next/link';

interface MapLinkButtonProps {
    href: string;
    text: string;
    external?: boolean; // Optional prop to indicate if it's an external link
    bare?: boolean; // IMPORTANT: This prop is used to conditionally render a <span> or <Link>
}

export default function MapLinkButton({ href, text, external = true, bare = false }: MapLinkButtonProps) {
    // Determine target and rel based on 'external' prop
    const target = external ? "_blank" : undefined;
    const rel = external ? "noopener noreferrer" : undefined;

    const buttonContent = (
        <>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {text}
        </>
    );

    const commonClasses = "inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base font-medium ml-4";

    // If 'bare' is true, render a span that acts like a button,
    // and manually handle the navigation to avoid nested <a> tags.
    if (bare) {
        return (
            <span
                className={`${commonClasses} cursor-pointer`} // Add cursor-pointer for visual cue
                onClick={(e) => {
                    e.preventDefault(); // Prevent default if any on span, though unlikely
                    e.stopPropagation(); // Stop event from bubbling up to parent Link
                    window.open(href, target); // Manually open the link
                }}
                // Add ARIA attributes for accessibility since it's acting like a button/link
                role="link"
                tabIndex={0} // Make it focusable for keyboard navigation
                onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(href, target);
                    }
                }}
            >
                {buttonContent}
            </span>
        );
    }

    // Default behavior: render a Next.js Link
    return (
        <Link
            href={href}
            target={target}
            rel={rel}
            className={commonClasses}
            onClick={(e) => e.stopPropagation()} // Still stop propagation to prevent outer link from firing
        >
            {buttonContent}
        </Link>
    );
}
