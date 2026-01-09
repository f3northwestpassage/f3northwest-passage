// src/app/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import Header from './_components/Header';
import Footer from './_components/Footer';
import Button from './_components/Button';
import Hero from './_components/Hero';
import CorePrinciple from './_components/CorePrinciple';
import { BackgroundBoxesDemo } from './_components/BackgroundBoxesDemo';
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight"; // adjust path if needed
import StructuredData from './_components/StructuredData';
import FAQ from './_components/FAQ';

// Assuming these utility functions handle fetching data from your API
import { fetchLocaleData } from '../utils/fetchLocaleData';
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData';

// Import images
import f3White from '../../public/f3-white.png';
import f3ShovelFlag from '../../public/f3-shovel-flag.png';
// Add a hero image for the home page if it's different from region_hero_img_url
import homeHeroDefaultImg from '../../public/f3-darkhorse-2023-11-04.jpg'; // Default hero image path

// Mark as force-dynamic to ensure data is fresh on every request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // Ensure data is not cached by Next.js

// --- generateMetadata (Server-Side) ---
export async function generateMetadata(): Promise<Metadata> {
  let localeData;
  try {
    localeData = await fetchLocaleData();
  } catch (error) {
    console.error("Error fetching locale data for metadata on home page:", error);
    // Return fallback metadata if fetch fails
    return {
      title: 'F3 Northwest Passage | Free Men\'s Workouts in Cypress, Jersey Village & Houston, TX',
      description: 'Free outdoor workouts for men in Cypress, Jersey Village, Bridgeland, and Northwest Houston, TX. Join F3 Northwest Passage for peer-led fitness, fellowship, and faith. No membership fees.',
      keywords: [
        'Cypress workouts',
        'Houston workouts',
        'Jersey Village workouts',
        'Bridgeland workouts',
        'Northwest Houston fitness',
        'Cypress fitness',
        'Jersey Village fitness',
        'Bridgeland fitness',
        'free workouts Cypress TX',
        'men\'s workouts Houston',
        'outdoor fitness Cypress',
        'free outdoor workouts',
        'men\'s fitness group Houston',
        'F3 Cypress',
        'F3 Houston',
        'F3 Jersey Village',
        'F3 Bridgeland',
      ],
    };
  }

  const city = localeData?.region_city || 'Northwest Houston';
  const state = localeData?.region_state || 'TX';
  const regionName = localeData?.region_name || 'F3 Northwest Passage';

  return {
    title: `${regionName} | Free Men's Workouts in ${city}, ${state}`,
    description: `Free outdoor workouts for men in ${city}, ${state}. Join ${regionName} for peer-led fitness, fellowship, and faith. No membership fees. All fitness levels welcome.`,
    keywords: [
      `${city} workouts`,
      'Houston workouts',
      'Cypress workouts',
      'Jersey Village workouts',
      'Bridgeland workouts',
      'Northwest Houston fitness',
      'Cypress fitness',
      'Houston fitness',
      'Jersey Village fitness',
      'Bridgeland fitness',
      'Cypress run club',
      'Houston run club',
      'Jersey Village run club',
      'Bridgeland run club',
      'Northwest Houston run club',
      'F3 Northwest',
      'F3 Northwest Passage',
      'F3 Houston',
      'F3 Cypress',
      'F3 Jersey Village',
      'F3 Bridgeland',
      'Cypress boot camp',
      'Houston boot camp',
      'Jersey Village boot camp',
      'Bridgeland boot camp',
      'Northwest Houston boot camp',
      'Cypress exercise group',
      'Houston exercise group',
      'Jersey Village exercise group',
      'Bridgeland exercise group',
      'Cypress outdoor fitness',
      'Houston outdoor fitness',
      'Jersey Village outdoor fitness',
      'Bridgeland outdoor fitness',
      `free workouts ${city}`,
      `men's workouts ${city}`,
      `outdoor fitness ${city}`,
      'free outdoor workouts',
      `men's fitness group ${city}`,
      'Cypress men\'s fitness',
      'Houston men\'s fitness',
      'Jersey Village men\'s fitness',
      'Bridgeland men\'s fitness',
      'Cypress morning workouts',
      'Houston morning workouts',
      'Jersey Village morning workouts',
      'Bridgeland morning workouts',
    ],
    openGraph: {
      title: `${regionName} | Free Men's Workouts in ${city}, ${state}`,
      description: `Free outdoor workouts for men in ${city}, ${state}. Join us for peer-led fitness, fellowship, and faith.`,
      type: 'website',
      locale: 'en_US',
      siteName: regionName,
    },
  };
}

// --- Main Page Component (Server-Side) ---
export default async function Page() {
  console.log('[HomePage Server Component] Page rendering started.'); // Added log
  let localeData = null;
  let workouts = null;
  let fetchError: string | null = null;

  // Persistence of issue: Home page still shows mock data in production.
  // This indicates server-side fetch for localeData is likely failing.
  // The most common cause remains SSL/domain configuration for the API endpoint.

  try {
    // Fetch data concurrently
    console.log('[HomePage Server Component] Attempting to fetch locale and workout data...'); // Added log
    [localeData, workouts] = await Promise.all([
      fetchLocaleData(),
      fetchWorkoutsData(),
    ]);
    console.log('[HomePage Server Component] Data fetched successfully.'); // Added log
    console.log('  Fetched localeData:', localeData ? { region_name: localeData.region_name, hero_title: localeData.hero_title, _id: localeData._id } : 'null'); // Added detailed log for localeData
    console.log('  Fetched workouts count:', workouts ? workouts.length : 'null'); // Added detailed log for workouts
  } catch (error: any) {
    console.error("Error fetching initial data for home page:", error);
    // Capture the error message for display
    fetchError = `Failed to load essential data: ${error.message || 'Unknown network error. Check server logs.'}`;
    console.log('[HomePage Server Component] fetchError set:', fetchError); // Added log for fetchError
    // If fetch fails, localeData and workouts will remain null, handled below
  }

  const href = '/';
  const commonSliceClassNames = 'py-8 px-4'; // Common padding for sections

  // Determine if content can be displayed or if an error message is needed
  const showContent = localeData && workouts && !fetchError;
  console.log('[HomePage Server Component] showContent status:', showContent); // Added log

  return (
    <>
      <StructuredData localeData={localeData || undefined} />
      <Header href={href} regionName={localeData?.region_name} />
      <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        {/* Hero Section - Uses dynamic data or fallbacks */}
        <HeroHighlight>
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              Welcome to{" "}
              <Highlight>{localeData?.region_name || "F3 Region"}</Highlight>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              {localeData?.hero_subtitle || "Fitness, Fellowship, Faith"}
            </p>
          </div>
        </HeroHighlight>

        {/* Conditional Rendering based on fetch status */}
        {fetchError ? (
          <section className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-800 dark:border-red-600 dark:text-red-100 my-8 max-w-4xl mx-auto" role="alert">
            <p className="font-bold">Error Loading Page Content:</p>
            <p className="text-sm">{fetchError}</p>

          </section>
        ) : !showContent ? (
          <section className="text-center py-8 text-gray-600 dark:text-gray-400">
            Loading essential region data...
          </section>
        ) : (
          <>
            <section className={`bg-gloom dark:bg-gray-900 text-black dark:text-gray-200 ${commonSliceClassNames}`}>
              <div className="shadow-xl">
                <h2 className="leading-none">
                  <span className="opacity-70">FREE OUTDOOR WORKOUTS IN {localeData?.region_city?.toUpperCase() || 'HOUSTON'}</span>
                  <span className="block text-5xl py-5">{localeData?.region_name ?? ''}</span>
                </h2>
                <p className="subtitle text-xl pb-10 opacity-70">
                  {localeData?.meta_description ?? 'Free outdoor fitness workouts for men in Cypress, Houston, and Northwest Houston, TX. No membership fees required.'}
                </p>
              </div>

              {localeData?.region_logo_url && (
                <Image
                  src={localeData.region_logo_url}
                  alt={`${localeData.region_name ?? 'F3 Region'} Logo`}
                  width={200}
                  height={200}
                  className="pt-8 pb-4 my-0 mx-auto"
                />
              )}
            </section>

            <section className={`bg-iron dark:text-white dark:bg-gray-800 text-black ${commonSliceClassNames}`}>
              <div>
                <h3 className="pb-6 text-2xl font-semibold">FREE MEN&apos;S FITNESS IN CYPRESS, JERSEY VILLAGE & HOUSTON</h3>
                <p className="pb-6">
                  {`${100}+ men who meet for free outdoor workouts `}in parks and
                  public spaces around {localeData?.region_city || 'Cypress, Jersey Village, Bridgeland, and Northwest Houston'}, {localeData?.region_state || 'TX'}.
                </p>
                <p className="pb-10 font-bold">
                  We hold free outdoor workouts in {localeData?.region_city || 'Cypress, Jersey Village, Bridgeland, and Houston'} each week. Weekday workouts are
                  generally 45 minutes and 60 minutes on Saturday mornings.
                </p>
              </div>
              <div>
                <h3 className="pb-6 text-2xl font-semibold">YOUR CYPRESS, JERSEY VILLAGE & HOUSTON RUN CLUB ALTERNATIVE</h3>
                <p className="pb-6">
                  More than just a run club - we&apos;re a complete fitness community. Our Cypress, Jersey Village, Bridgeland, and Houston boot camp style workouts
                  include running, strength training, and functional fitness. Part of F3 Nation, a network of 5,404 free, peer-led workouts for men in
                  450 regions with a mission to:
                </p>
                <p className="font-bold pb-6">
                  plant, grow and serve small workout groups for men, invigorating
                  male community leadership.
                </p>
              </div>
            </section>

            <section className={`bg-gloom dark:bg-gray-900 text-black dark:text-gray-200 ${commonSliceClassNames}`}>
              <Image
                src={f3White}
                alt="F3 Logo"
                width={128}
                height={128}
                className="my-0 mx-auto pb-5"
              />
              <h2 className="text-3xl font-bold">CORE PRINCIPLES</h2>
              <ul className="pt-10">
                <CorePrinciple
                  principle="Free of Charge"
                  description="Never pay to workout, ever."
                />
                <CorePrinciple
                  principle="Open to all Men"
                  description="No matter the man, you are welcome here."
                />
                <CorePrinciple
                  principle="Held Outdoors"
                  description="Rain or Shine, Hot or Cold, we are out there."
                />
                <CorePrinciple
                  principle="Peer Led"
                  description="Rotating fashion of men leading each other."
                />
                <CorePrinciple
                  principle="Ends with a COT"
                  description="Always ends with a Circle of Trust."
                />
              </ul>
            </section>

            <section className="bg-iron dark:bg-gray-800 text-white pt-20 px-4 pb-24">
              <Image
                src={f3ShovelFlag}
                alt="F3 Shovel Flag"
                width={200}
                height={200}
                className="my-0 mx-auto"
              />
              <h2 className="text-3xl font-bold pt-6">FIND A WORKOUT</h2>
              <p className="font-blackops mb-10">all you gotta do is SHOW UP</p>
              <Button href="/workouts" text="FIND A WORKOUT" />
            </section>
            <BackgroundBoxesDemo />
            <section className="bg-gloom dark:bg-gray-900 text-black dark:text-gray-200 leading-tight pt-20 px-4 pb-24">
              <h2 className="text-5xl">[F.N.G.]</h2>
              <p className="text-cmu pt-5">
                Hey Friendly New Guy... What did you <span className="italic">think</span> FNG stood for?
              </p>
              <p className="text-xl py-5">ARE YOU LOOKING TO ACCELERATE YOUR LIFE?</p>
              <p className="text-cmu text-md pb-10">
                We welcome men of all fitness levels to our workouts and have no
                requirement for membership other than showing up at the appointed
                time + place and following the workout leader (the “Q” in F3
                lexicon). If you still have questions, just ask any of the guys and
                {` they'll`} help or point you in the right direction!
              </p>
              <Button href="/fng" text="WHAT TO EXPECT" />
            </section>
            <FAQ city={localeData?.region_city} regionName={localeData?.region_name} />
          </>
        )}
      </main>

      <Footer
        regionName={localeData?.region_name ?? ''}
        regionFacebook={localeData?.region_facebook ?? ''}
        regionInstagram={localeData?.region_instagram ?? ''}
        regionLinkedin={localeData?.region_linkedin ?? ''}
        regionXTwitter={localeData?.region_x_twitter ?? ''}
      />
    </>
  );
}
