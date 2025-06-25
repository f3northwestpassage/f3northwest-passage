// app/fng/page.tsx
// This page displays information for "Friendly New Guys" (FNG).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // Ensures data is always fresh, not cached at build time
import Link from 'next/link';

import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';

/** replace with a regional image */
import f3HeroImg from '../../../public/fod.png'; // Make sure this path is correct and the image exists.

import { fetchLocaleData } from '@/utils/fetchLocaleData';

export default async function Page() {
  const locales = await fetchLocaleData();

  // Provide default empty strings for locale data if it's null/undefined
  const regionName = locales?.region_name ?? "";
  const regionFacebook = locales?.region_facebook ?? "";
  const regionInstagram = locales?.region_instagram ?? "";
  const regionLinkedin = locales?.region_linkedin ?? "";
  const regionXTwitter = locales?.region_x_twitter ?? "";

  const href = '/fng'; // This seems to be the current page's link

  return (
    <>
      <Header href={href} />
      <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Hero
          title="NEW TO F3"
          subtitle="WELCOME [FNG]"
          imgUrl={f3HeroImg.src}
          imgAlt="A group of F3 men exercising outdoors" // Added a descriptive alt text
        />

        {/* Section 1: F.N.G. Information */}
        <section className="bg-gray-100 dark:bg-gray-800 py-16 px-4 leading-tight text-center">
          <h2 className="text-5xl font-extrabold text-f3-blue dark:text-f3-blue-light mb-6">
            [F.N.G.]
          </h2>
          <p className="text-gray-700 dark:text-gray-300 pt-5 max-w-4xl mx-auto">
            We appreciate you joining us and there is a lot of information to
            tell you but to avoid overwhelming you here are a few ways to keep
            in touch and know what&apos;s going on in {regionName}. If you still
            have questions just ask any of the guys and they&apos;ll help or
            point you in the right direction!
          </p>
          <p className="text-gray-700 dark:text-gray-300 pt-5 max-w-4xl mx-auto">
            So, you got past{' '}
            <Link
              href="https://f3nation.com/top-five-eh-excuses/"
              target="_blank"
              rel="noopener noreferrer" // Added for security best practices with target="_blank"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
            >
              our favorite excuses
            </Link>{' '}
            and decided to participate? Greatness.
          </p>
          <p className="text-gray-900 dark:text-white pt-5 max-w-4xl mx-auto font-bold">
            We do not show up at F3 for ourselves. We show up for the man
            standing beside each of us.
          </p>
          <p className="text-gray-700 dark:text-gray-300 pt-5 max-w-4xl mx-auto">
            &quot;Here is one undeniable truth that I know about each of us, we
            need authentic relationships with other men who are working to be
            strong fathers, husbands and leaders. Isolation will destroy a man!
            We have the opportunity to change our community and the trajectory
            of our families. Getting in the best shape of your life is just a by
            product. The work out is the magnet, the relationships and community
            with other men will keep bringing you back. Lock shields with us and
            help us accomplish F3&apos;s mission to invigorate male leadership
            in our community.&quot;
          </p>
          <p className="text-gray-700 dark:text-gray-300 pt-5 max-w-4xl mx-auto italic">
            (DREDD, F3 Founder)
          </p>
        </section>

        {/* Section 2: Tips for Your First Workout */}
        <section className="bg-gray-200 dark:bg-gray-900 py-16 px-4 leading-tight text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">
            TIPS FOR YOUR FIRST WORKOUT
          </h2>
          <ul className="w-10/12 my-0 mx-auto text-gray-700 dark:text-gray-300 space-y-5">
            <li>
              <hr className="my-5 border-gray-300 dark:border-gray-700" />
              When you are first starting, it is important to remember to MODIFY
              as needed during the beatdowns. If you want to go harder - go
              harder. If you have not exercised in a long time, slow down.
              Don&apos;t hurt yourself or even worse, get discouraged. Just show
              up, work hard and give it your best. That is all that matters. We
              are not here competing against one another. We are freaking proud
              of you for showing up at 5:30 in the morning to exercise!
            </li>
            <li>
              <hr className="my-5 border-gray-300 dark:border-gray-700" />
              Read our{' '}
              <Link
                href="https://f3nation.com/disclaimer-and-notice/"
                target="_blank"
                rel="noopener noreferrer" // Added for security best practices
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
              >
                disclaimer
              </Link>
              , then simply pick a place to post.
            </li>
            <li>
              <hr className="my-5 border-gray-300 dark:border-gray-700" />
              Visit our{' '}
              <Link
                href="/workouts"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
              >
                Workouts
              </Link>{' '}
              page to see what site works best for you.
            </li>
            <li>
              <hr className="my-5 border-gray-300 dark:border-gray-700" />
              Check out the{' '}
              <Link
                href="https://f3nation.com/lexicon/"
                target="_blank"
                rel="noopener noreferrer" // Added for security best practices
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
              >
                Lexicon
              </Link>
              . We have a nick name for everything you do. The Lexicon will give
              you a definition behind our secret language.
            </li>
            <li>
              <hr className="my-5 border-gray-300 dark:border-gray-700" />
              All you need to bring is an open mind and a positive attitude.
              Wear your regular outdoor workout clothes and, unless you have
              farmer hands, consider bringing a pair of gloves.
            </li>
            <li>
              <hr className="my-5 border-gray-300 dark:border-gray-700" />
              If you are not meeting a friend at your first post, simply show up
              and introduce yourself as an FNG. You&apos;ll be welcomed.
            </li>
            <hr className="my-5 border-gray-300 dark:border-gray-700" />
          </ul>
        </section>
      </main>
      <Footer
        regionName={regionName}
        regionFacebook={regionFacebook}
        regionInstagram={regionInstagram}
        regionLinkedin={regionLinkedin}
        regionXTwitter={regionXTwitter}
      />
    </>
  );
}
