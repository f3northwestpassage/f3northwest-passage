"use client";

import Link from 'next/link';

interface MapLinkButtonProps {
    href: string;
    text: string;
    external?: boolean; // Optional prop to indicate if it's an external link
}

export default function MapLinkButton({ href, text, external = true }: MapLinkButtonProps) {
    // Determine target and rel based on 'external' prop
    const target = external ? "_blank" : undefined;
    const rel = external ? "noopener noreferrer" : undefined;

    return (
        <Link
            href={href}
            target={target}
            rel={rel}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base font-medium ml-4"
            // The onClick is now safe here because this is a Client Component
            onClick={(e) => e.stopPropagation()}
        >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {text}
        </Link>
    );
}
