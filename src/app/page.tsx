// app/page.tsx (Now a Server Component)
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // Or 'no-store' or 'no-cache' for dynamic content

import type { Metadata } from 'next'; // Keep Metadata import
import Image from 'next/image';
import Link from 'next/link';

import Header from './_components/Header';
import Footer from './_components/Footer';
import Button from './_components/Button';
import Hero from './_components/Hero';

import { fetchLocaleData } from '../utils/fetchLocaleData';
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData';

import f3White from '../../public/f3-white.png';
import f3ShovelFlag from '../../public/f3-shovel-flag.png'; // Make sure you have this image
import CorePrinciple from './_components/CorePrinciple';

export async function generateMetadata(): Promise<Metadata> {
  const localeData = await fetchLocaleData(); // Fetch here for metadata
  return {
    title: localeData?.region_name || "F3 Northwest Passage",
    description: localeData?.meta_description || "Discover F3 workouts in your region.",
  };
}

export default async function Page() { // Make it async
  const localeData = await fetchLocaleData(); // Fetch directly on the server
  const workouts = await fetchWorkoutsData(); // Fetch directly on the server

  // Provide robust fallbacks for all data that might be null
  const currentLocaleData = localeData || {}; // Ensure it's an object, even if empty

  const href = '/';
  const commonSliceClassNames = 'py-8 px-4';

  return (
    <>
      <Header href={href} />
      <main>
        <Hero
          title={currentLocaleData.hero_title || ""}
          subtitle={currentLocaleData.hero_subtitle || ""}
          // IMPORTANT: Provide a local fallback image path if region_hero_img_url can be empty/null
          imgUrl={currentLocaleData.region_hero_img_url || f3ShovelFlag.src} // Use .src for static imports
        />
        <section className={`bg-gloom ${commonSliceClassNames}`}>
          <div className="shadow-xl">
            <h2 className="leading-none">
              <span className="opacity-70">THIS IS</span>
              <span className="block text-5xl py-5">{currentLocaleData.region_name || "Your Region"}</span>
            </h2>
            <p className="subtitle text-xl pb-10 opacity-70">
              {currentLocaleData.meta_description || "A F3 region focused on fitness, fellowship, and faith."}
            </p>
          </div>
          <Image
            src={currentLocaleData.region_logo_url || f3White.src} // Local image fallback
            alt={`${currentLocaleData.region_name || "F3"} Logo`}
            width={200}
            height={200}
            className="pt-8 pb-4 my-0 mx-auto"
          />
        </section>
        <section className={`bg-iron leading-tight ${commonSliceClassNames}`}>
          <div>
            <h3 className="pb-6">WE ARE</h3>
            <p className="pb-6">
              {`${100}+ guys that meet up in small groups `}to workout in parks and
              public spaces around {currentLocaleData.region_city || "our city"}, {currentLocaleData.region_state || "our state"}.
            </p>
            <p className="pb-10 font-bold">
              We hold free workouts in {currentLocaleData.region_city || "our city"} each week. Weekday workouts are
              generally 45 MIN & 60 MIN on Saturday.
            </p>
          </div>
          <div>
            <h3 className="pb-6">A PART OF</h3>
            <p className="pb-6">
              F3 Nation, a network of  5,404 free, peer-led workouts for men in
              450 regions with a mission to:
            </p>
            <p className="font-bold pb-6">
              plant, grow and serve small workout groups for men invigorating
              male community leadership.
            </p>
          </div>
        </section>
        <section className={`bg-gloom ${commonSliceClassNames}`}>
          <Image
            src={f3White}
            alt="F3 White"
            width={128}
            height={128}
            className="my-0 mx-auto pb-5"
          />
          <h2>CORE PRINCIPLES</h2>
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
        <section className={`bg-iron pt-20 px-4 pb-24`}>
          <Image
            src={f3ShovelFlag}
            alt="F3 Shovel Flag"
            width={200}
            height={200}
            className="my-0 mx-auto"
          />
          <h2>FIND A WORKOUT</h2>
          <p className="font-blackops mb-10">all you gotta do is SHOW UP</p>
          <Button href="/workouts" text="FIND A WORKOUT" />
        </section>
        <section className={`bg-gloom leading-tight pt-20 px-4 pb-24`}>
          <h2 className="text-5xl">[F.N.G.]</h2>
          <p className="text-cmu pt-5">
            Hey Friendly New Guy... What did you{' '}
            <span className="italic">think</span> FNG stood for?
          </p>
          <p className="text-xl py-5">
            ARE YOU LOOKING TO ACCELERATE YOUR LIFE?
          </p>
          <p className="text-cmu text-md pb-10">
            We welcome men of all fitness levels to our workouts and have no
            requirement for membership other than showing up at the appointed
            time + place and following the workout leader [the “Q” in F³
            lexicon]. If you still have questions just ask any of the guys and
            they&apos;ll help or point you in the right direction!
          </p>
          <Button href="/fng" text="WHAT TO EXPECT" />
        </section>
      </main>
      <Footer
        regionName={currentLocaleData.region_name ?? ""}
        regionFacebook={currentLocaleData.region_facebook ?? ""}
        regionInstagram={currentLocaleData.region_instagram ?? ""}
        regionLinkedin={currentLocaleData.region_linkedin ?? ""}
        regionXTwitter={currentLocaleData.region_x_twitter ?? ""}
      />
    </>
  );
}
