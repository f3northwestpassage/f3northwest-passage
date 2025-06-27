'use client';

import { useState, useEffect } from 'react';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
// CORRECTED: Ensure this path correctly points to your canonical types/workout.ts file
import type { LocaleData } from '../../../types/workout';

// Adjust the path to an appropriate image in your public folder or consider a placeholder
import contactHeroImg from '../../../public/f3-darkhorse-2023-11-04.jpg'; // Reusing an existing one for now

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default function ContactPage() {
    const [localeData, setLocaleData] = useState<LocaleData | null>(null);
    const [localeLoading, setLocaleLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null); // Combined error state for loading

    // Fetch locale data (which includes the Google Form URL)
    useEffect(() => {
        const getLocale = async () => {
            try {
                const data = await fetchLocaleData();
                setLocaleData(data);
            } catch (err) {
                console.error('Failed to fetch locale data for contact form:', err);
                setLoadError('Failed to load contact form configuration.');
            } finally {
                setLocaleLoading(false);
            }
        };
        getLocale();
    }, []);

    // Construct the Google Form embed URL
    // Replace '/viewform' with '/embed'
    const googleFormEmbedUrl = localeData?.region_google_form_url
        ? localeData.region_google_form_url.replace(/\/viewform$/, '/embed')
        : null;

    const overallLoading = localeLoading;
    const overallError = loadError;
    const href = "/contact"
    return (
        <>
            <Header href={href} regionName={localeData?.region_name} />
            <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                <Hero
                    title="CONTACT US"
                    subtitle="We'd love to hear from you."
                    imgUrl={contactHeroImg.src}
                    imgAlt="People shaking hands"
                />

                <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Send us a message</h2>
                    <p className="text-center text-gray-700 dark:text-gray-300 mb-8">
                        Fill out the form below and {`we'll`} get back to you as soon as possible.
                    </p>

                    {overallLoading ? (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading contact form...</div>
                    ) : overallError ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-800 dark:border-red-600 dark:text-red-100" role="alert">
                            <p className="font-bold">Form Error:</p>
                            <p className="text-sm">{overallError}</p>
                        </div>
                    ) : !googleFormEmbedUrl ? (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-100" role="alert">
                            <p className="font-bold">Form Unavailable:</p>
                            <p className="text-sm">
                                The contact form URL is not configured by the admin or is invalid.
                            </p>
                        </div>
                    ) : (
                        <iframe
                            src={googleFormEmbedUrl}
                            frameBorder="0"
                            className="w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] rounded-lg shadow-md"
                            title="Google Contact Form"
                            allowFullScreen
                        >
                            Loading Google Form...
                        </iframe>
                    )}
                </section>
            </main>
            <Footer regionName={localeData?.region_name ?? ""} regionFacebook={localeData?.region_facebook ?? ""} regionInstagram={localeData?.region_instagram ?? ""} regionLinkedin={localeData?.region_linkedin ?? ""} regionXTwitter={localeData?.region_x_twitter ?? ""} />
        </>
    );
}
