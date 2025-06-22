// app/_components/Hero.tsx
// This component can remain a 'use client' component if you intend to add client-side interactivity
// like parallax effects or animations later. However, for a static hero image, it could also
// function as a Server Component if all its children are also Server Components or handled correctly.
// For now, let's keep 'use client' as it's often a safe default for components with styling logic.
"use client";

import { twMerge } from 'tailwind-merge';
import Image from 'next/image'; // Import the Next.js Image component

interface HeroProps {
  leadIn?: string;
  title: string;
  subtitle: string;
  /** img.src */
  imgUrl: string; // This should be the path to your image
  imgAlt?: string; // Add an alt text prop for accessibility
}

export default function Hero({ leadIn, title, subtitle, imgUrl, imgAlt = "" }: HeroProps) {
  return (
    // We'll adjust the height directly on the section or allow the Image component to handle it
    <section className="relative py-52 px-4 flex items-center justify-center text-center overflow-hidden h-[500px]"> {/* Added h-[500px] for explicit height */}
      {/*
          Use Next.js Image component for optimized images.
          It handles responsive images, lazy loading, and prevents layout shifts.
          'fill' makes the image fill its parent, so the parent needs to be relatively positioned
          and have a defined height.
        */}
      {imgUrl && ( // Conditionally render the Image only if imgUrl is provided
        <Image
          src={imgUrl}
          alt={imgAlt || `${title} Hero Image`} // Use provided alt text or a generated one
          fill // Makes the image fill the parent element
          style={{ objectFit: 'cover' }} // CSS object-fit property
          quality={80} // Adjust image quality (default is 75)
          priority // Preload this image as it's likely above the fold (LCP candidate)
          sizes="100vw" // This is important for 'fill' to define image size at different viewports
          className="absolute inset-0 grayscale opacity-60 -z-50" // Apply styles directly to Image
        />
      )}

      {/* Content overlay */}
      <div className="relative z-10 w-full leading-none text-white bg-black bg-opacity-50 p-4 rounded-lg">
        {!!leadIn && <p className="uppercase subtitle">{leadIn}</p>}
        <h1 className={twMerge('text-4xl', !!leadIn ? 'py-5' : 'pb-10')}>
          {title}
        </h1>
        <p className="uppercase subtitle">{subtitle}</p>
      </div>
    </section>
  );
}
