// app/workouts/[name]/page.tsx
// This page displays details for a single workout location (AO).

// Next.js specific imports for App Router behavior
export const dynamic = 'force-dynamic'; // Ensures this page is rendered at request time
export const fetchCache = 'force-no-store'; // Ensures data is always fresh, not cached

import { notFound } from 'next/navigation'; // For displaying 404 page if location not found
import Image from 'next/image'; // For optimized images
import Link from 'next/link';   // For client-side navigation
import type { Metadata } from 'next'; // For dynamic SEO metadata

// Component Imports (adjust paths if your _components are elsewhere)
import Header from '../../_components/Header';
import Footer from '../../_components/Footer';
import WorkoutCard from '../../_components/WorkoutCard';
import Button from '../../_components/Button'; // Assuming this is a generic button component

// Data Fetching Utility Imports (ensure these paths are correct)
import { fetchLocationsData } from '@/utils/fetchLocationsData'; // Import fetch function
// import type { LocationClean } from '@/utils/fetchLocationsData'; // Import LocationClean type from where it's defined
import { fetchLocaleData } from '@/utils/fetchLocaleData'; // Import fetchLocaleData
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData'; // Import fetchWorkoutsData function
import type { WorkoutClean, LocationClean, LocaleData } from '../../../../types/workout';// Import WorkoutClean type from where it's defined


// --- COMMENT OUT OR DELETE THIS INTERFACE DEFINITION ---
// interface LocationPageProps {
//     params: {
//         name: string; // The encoded location name from the URL (e.g., "The-Boneyard")
//     };
//     // searchParams?: { [key: string]: string | string[] | undefined }; // Uncomment if you use search params
// }

// --- generateStaticParams (Optional but Recommended for SEO & Performance) ---
export async function generateStaticParams() {
    if (process.env.SKIP_DB === 'true') {
        console.log("SKIP_DB is true. Skipping generateStaticParams for workouts.");
        return [];
    }
    try {
        const locations = await fetchLocationsData();
        const validParams = locations
            .filter(location => typeof location.name === 'string' && location.name.trim() !== '')
            .map((location) => ({
                name: encodeURIComponent(location.name),
            }));
        console.log(`Generated ${validParams.length} static params for workouts.`);
        return validParams;
    } catch (error) {
        console.error("Error fetching locations for generateStaticParams in workouts/[name]/page.tsx:", error);
        return [];
    }
}

// --- generateMetadata (Dynamic SEO Titles & Descriptions) ---
// *** CHANGE THIS LINE ***
export async function generateMetadata({ params }: { params: { name: string; } }): Promise<Metadata> {
    if (process.env.SKIP_DB === 'true') {
        return {
            title: 'F3 Location Details',
            description: 'F3 workout location details.',
        };
    }
    const decodedName = decodeURIComponent(params.name);
    let location: LocationClean | undefined;
    try {
        const locations = await fetchLocationsData();
        location = locations.find(loc => loc.name === decodedName);
    } catch (error) {
        console.error(`Error fetching location for metadata of ${decodedName}:`, error);
        return {
            title: `F3 Location: ${decodedName}`,
            description: `Details for F3 location ${decodedName}.`,
        };
    }
    if (!location) {
        return {
            title: 'Workout Location Not Found',
            description: 'The requested F3 workout location could not be found.',
        };
    }
    return {
        title: `${location.name} - F3 Workouts`,
        description: location.description || `Workout details for F3 ${location.name}. Join us at ${location.address}.`,
    };
}

// --- Main Location Page Component ---
// *** CHANGE THIS LINE ***
export default async function LocationPage({ params }: { params: { name: string; } }) {
    const decodedName = decodeURIComponent(params.name);
    let allLocations: LocationClean[] = [];
    let allWorkouts: WorkoutClean[] = [];
    let locales = null;
    try {
        [allLocations, allWorkouts, locales] = await Promise.all([
            fetchLocationsData(),
            fetchWorkoutsData(),
            fetchLocaleData(),
        ]);
    } catch (error) {
        console.error("Error fetching data for LocationPage:", error);
    }
    const location: LocationClean | undefined = allLocations.find(loc => loc.name === decodedName);
    if (!location) {
        notFound();
    }
    const workoutsAtThisLocation: WorkoutClean[] = location._id
        ? allWorkouts.filter((workout) => workout.locationId === location._id)
        : [];
    const homeHref = '/';
    const regionName = locales?.region_name ?? "";
    const regionFacebook = locales?.region_facebook ?? "";
    const regionInstagram = locales?.region_instagram ?? "";
    const regionLinkedin = locales?.region_linkedin ?? "";
    const regionXTwitter = locales?.region_x_twitter ?? "";

    return (
        <>
            <Header href={homeHref} />
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 text-gray-900 dark:text-gray-100 mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 text-center mb-4">
                        {location.name}
                    </h1>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6">
                        {location.imageUrl && (
                            <div className="relative w-full md:w-1/3 h-48 flex justify-center items-center overflow-hidden rounded-lg shadow-md dark:shadow-lg">
                                <Image
                                    src={location.imageUrl}
                                    alt={`${location.name} AO Logo`}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="p-2"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                        )}
                        {location.paxImageUrl && (
                            <div className="relative w-full md:w-1/3 h-48 flex justify-center items-center overflow-hidden rounded-lg shadow-md dark:shadow-lg">
                                <Image
                                    src={location.paxImageUrl}
                                    alt={`PAX at ${location.name}`}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="p-2"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                        )}
                    </div>
                    <div className="mb-4 text-center">
                        {location.address && <p className="text-gray-700 dark:text-gray-300 mb-2"><span className="font-semibold text-gray-800 dark:text-gray-200">Address:</span> {location.address}</p>}
                        {location.q && (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">AOQ:</span> {location.q}
                            </p>
                        )}
                        {location.description && <p className="text-gray-700 dark:text-gray-300 mb-4 text-md leading-relaxed">{location.description}</p>}
                        <div className="flex justify-center gap-4">
                            {location.embedMapLink && (
                                <Link
                                    href={location.embedMapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    View Embedded Map
                                </Link>
                            )}
                            {!location.embedMapLink && location.mapLink && (
                                <Link
                                    href={location.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <p className='text-white'>Open in Google Maps</p>
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">Workout Schedule:</h2>
                        {workoutsAtThisLocation.length > 0 ? (
                            <div className={
                                workoutsAtThisLocation.length === 1
                                    ? "flex justify-center" // Center the single card
                                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // Use grid for multiple cards
                            }>
                                {workoutsAtThisLocation.map((workout) => (
                                    <WorkoutCard
                                        key={workout._id || `${location._id}-${workout.startTime}-${workout.days?.[0]}`}
                                        _id={workout._id || ''}
                                        locationId={location._id || ''}
                                        locationName={location.name || ''}
                                        startTime={workout.startTime || ''}
                                        endTime={workout.endTime || ''}
                                        days={workout.days || []}
                                        types={workout.types || []}
                                        comments={workout.comments}
                                        frequencyPrefix={workout.frequencyPrefix}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic text-center col-span-full py-4 bg-gray-50 dark:bg-gray-700 rounded-md">No workouts scheduled for this location yet.</p>
                        )}
                    </div>
                    <div className="mt-8 text-center">
                        <Button href="/workouts" text="BACK TO ALL WORKOUTS" />
                    </div>
                </div>
            </main >
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
