'use client'; // This page is a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script'; // Import Script for Google Analytics

import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';

/** replace with a regional image */
import f3HeroImg from '../../../public/fod.png'; // Make sure this path is correct and the image exists.

import { fetchLocaleData } from '@/utils/fetchLocaleData';
// CORRECTED: Ensure this path correctly points to your canonical types/workout.ts file
import type { LocaleData } from '../../../types/workout'; // <-- THIS LINE IS CORRECTED

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // Ensures data is always fresh, not cached at build time

export default function Page() {
  const [localeData, setLocaleData] = useState<LocaleData | null>(null);
  const [localeLoading, setLocaleLoading] = useState(true);
  const [localeError, setLocaleError] = useState<string | null>(null);

  // Initialize showFngForm from localStorage
  const [showFngForm, setShowFngForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('showFngForm');
      return savedState === 'true'; // Convert 'true' string back to boolean
    }
    return false; // Default to false if not in browser environment
  });

  const [fngFormEmbedUrl, setFngFormEmbedUrl] = useState<string | null>(null);
  const [fngFormError, setFngFormError] = useState<string | null>(null);

  // Get Google Analytics ID from environment variables
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const enableAnalytics = typeof googleAnalyticsId === 'string' && googleAnalyticsId.length > 0;

  // Fetch locale data
  useEffect(() => {
    const getLocale = async () => {
      try {
        const data = await fetchLocaleData();
        setLocaleData(data);
        // Assuming region_fng_form_url is available in LocaleData
        if (data?.region_fng_form_url) {
          setFngFormEmbedUrl(data.region_fng_form_url.replace(/\/viewform$/, '/embed'));
        } else {
          setFngFormError("FNG Form URL is not configured in locale data.");
        }
      } catch (err) {
        console.error('Failed to fetch locale data for FNG page:', err);
        setLocaleError('Failed to load page content.');
      } finally {
        setLocaleLoading(false);
      }
    };
    getLocale();
  }, []); // Empty dependency array means this runs once on mount

  // Persist showFngForm state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showFngForm', String(showFngForm));
    }
  }, [showFngForm]);


  const handleToggleFngForm = () => {
    setShowFngForm(prev => !prev);
    // When showing, ensure no previous errors are displayed initially
    if (!showFngForm && !fngFormEmbedUrl) {
      setFngFormError(localeData?.region_fng_form_url ? null : "FNG Form URL is not configured.");
    }
  };

  const href = '/fng'; // This seems to be the current page's link

  const overallLoading = localeLoading;
  const overallError = localeError;

  return (
    <>
      <Header href={href} regionName={localeData?.region_name} />
      {enableAnalytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      <main className="bg-white dark:bg-black dark:bg-gray-950 text-gray-900 dark:text-gray-100">
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
            in touch and know what&apos;s going on in {localeData?.region_name ?? "your region"}. If you still
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

        {/* Section 2: FNG Form Button */}
        <section className="bg-gray-200 dark:bg-gray-900 py-16 px-4 leading-tight text-center">
          <button
            onClick={handleToggleFngForm}
            disabled={overallLoading || !localeData} // Disable if locale data is still loading
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-white text-base font-medium rounded-md text-white bg-blue-900 bg-f3-blue hover:bg-blue-700 dark:bg-f3-blue-light dark:hover:bg-blue-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showFngForm ? 'Hide FNG Form' : '👉 Fill out FNG Form 👈'}
          </button>

          {showFngForm && (
            <div className="mt-8 max-w-2xl mx-auto">
              {overallLoading ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading FNG form...</div>
              ) : fngFormError ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-800 dark:border-red-600 dark:text-red-100" role="alert">
                  <p className="font-bold">Form Error:</p>
                  <p className="text-sm">{fngFormError}</p>
                </div>
              ) : !fngFormEmbedUrl ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-100" role="alert">
                  <p className="font-bold">Form Unavailable:</p>
                  <p className="text-sm">The FNG form URL is not configured by the admin or is invalid.</p>
                </div>
              ) : (
                <iframe
                  src={fngFormEmbedUrl}
                  frameBorder="0"
                  className="w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] rounded-lg shadow-md"
                  title="FNG Google Form"
                  allowFullScreen
                >
                  Loading FNG Google Form...
                </iframe>
              )}
            </div>
          )}
        </section>

        {/* Section 3: Tips for Your First Workout */}
        <section className="bg-gray-200 dark:bg-gray-900 py-16 px-4 leading-tight text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">
            TIPS FOR YOUR FIRST WORKOUT
          </h2>
          <ul className="w-10/10 my-0 mx-auto text-gray-700 dark:text-gray-300 space-y-5">
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
        regionName={localeData?.region_name ?? ""}
        regionFacebook={localeData?.region_facebook ?? ""}
        regionInstagram={localeData?.region_instagram ?? ""}
        regionLinkedin={localeData?.region_linkedin ?? ""}
        regionXTwitter={localeData?.region_x_twitter ?? ""}
      />
    </>
  );
}
