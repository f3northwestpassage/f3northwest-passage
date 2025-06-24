// app/workouts/[name]/page.tsx
// This page displays details for a single workout location (AO).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // Ensures data is always fresh, not cached at build time

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

import Header from '../../_components/Header'; // Adjust path if necessary
import Footer from '../../_components/Footer'; // Adjust path if necessary
import WorkoutCard from '../../_components/WorkoutCard'; // Adjust path if necessary
import Button from '../../_components/Button'; // Import Button component for the back link

// Correct import for fetching locations data and its type
import { fetchLocationsData, LocationClean } from '@/utils/fetchLocationsData';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
// Correct import for fetching workouts data and its type
import { fetchWorkoutsData, WorkoutClean } from '@/utils/fetchWorkoutsData';


// Define props for the dynamic page
interface LocationPageProps {
    params: {
        name: string; // The encoded location name from the URL (e.g., "The-Boneyard")
    };
}

// --- generateStaticParams (Optional but Recommended for SEO & Performance) ---
export async function generateStaticParams() {
    // If SKIP_DB is true, generate an empty array of params.
    // This tells Next.js not to pre-render any dynamic routes for workouts at build time.
    // They will instead be rendered dynamically at request time (due to 'force-dynamic').
    if (process.env.SKIP_DB === 'true') {
        console.log("SKIP_DB is true. Skipping generateStaticParams for workouts.");
        return [];
    }

    try {
        const locations = await fetchLocationsData();
        // Filter out locations that might have an empty or invalid name to prevent issues with encodeURIComponent
        // Ensure that location.name exists and is a non-empty string.
        const validParams = locations
            .filter(location => typeof location.name === 'string' && location.name.trim() !== '')
            .map((location) => ({
                name: encodeURIComponent(location.name),
            }));
        console.log(`Generated ${validParams.length} static params for workouts.`);
        return validParams;
    } catch (error) {
        console.error("Error fetching locations for generateStaticParams in workouts/[name]/page.tsx:", error);
        // If an error occurs during build time, return an empty array
        // This ensures the build doesn't fail due to database connectivity issues at build time.
        // Routes will then be handled by `force-dynamic` at request time.
        return [];
    }
}

// --- generateMetadata (Dynamic SEO Titles & Descriptions) ---
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
    // If SKIP_DB is true, provide a generic metadata.
    if (process.env.SKIP_DB === 'true') {
        return {
            title: 'F3 Location Details (Building)',
            description: 'Location details are being built.',
        };
    }

    const decodedName = decodeURIComponent(params.name);
    let location: LocationClean | undefined;

    try {
        const locations = await fetchLocationsData();
        location = locations.find(loc => loc.name === decodedName);
    } catch (error) {
        console.error(`Error fetching location for metadata of ${decodedName}:`, error);
        // Fallback metadata if data fetch fails
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
export default async function LocationPage({ params }: LocationPageProps) {
    // Fetch locale data
    const locales = await fetchLocaleData();
    const decodedName = decodeURIComponent(params.name); // Decode the name from the URL

    let allLocations: LocationClean[] = [];
    let allWorkouts: WorkoutClean[] = [];

    try {
        // Fetch all locations and find the one that matches the decoded name
        allLocations = await fetchLocationsData();
        // Fetch all workouts
        allWorkouts = await fetchWorkoutsData();
    } catch (error) {
        console.error("Error fetching data for LocationPage:", error);
        // You might want to handle this more gracefully, e.g., show an error message
        // or redirect, but for now, we'll let notFound handle a missing location.
    }

    const location: LocationClean | undefined = allLocations.find(loc => loc.name === decodedName);

    // If the location isn't found in the data, trigger Next.js's 404 page
    if (!location) {
        notFound();
    }

    // Filter workouts to show only workouts at this specific location
    // Ensure location._id is defined before filtering workouts
    const workoutsAtThisLocation: WorkoutClean[] = location._id
        ? allWorkouts.filter((workout) => workout.locationId === location._id)
        : []; // If location._id is missing, return an empty array

    const homeHref = '/'; // Default href for the Header component's logo/home link

    // Defensive checks for locale data for the footer
    const regionName = locales?.region_name ?? "";
    const regionFacebook = locales?.region_facebook ?? "";
    const regionInstagram = locales?.region_instagram ?? "";
    const regionLinkedin = locales?.region_linkedin ?? "";
    const regionXTwitter = locales?.region_x_twitter ?? "";


    return (
        <>
            <Header href={homeHref} />
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900 mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-4">
                        {location.name}
                    </h1>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6">
                        {/* Display AO Logo if available */}
                        {location.imageUrl && (
                            <div className="relative w-full md:w-1/3 h-48 flex justify-center items-center overflow-hidden rounded-lg shadow-md">
                                <Image
                                    src={location.imageUrl}
                                    alt={`${location.name} AO Logo`}
                                    fill // Use 'fill' prop for responsive images
                                    style={{ objectFit: 'contain' }} // Use style prop for objectFit
                                    className="p-2"
                                    sizes="(max-width: 768px) 100vw, 33vw" // Add sizes for better performance with 'fill'
                                />
                            </div>
                        )}
                        {/* Display PAX image if available */}
                        {location.paxImageUrl && (
                            <div className="relative w-full md:w-1/3 h-48 flex justify-center items-center overflow-hidden rounded-lg shadow-md">
                                <Image
                                    src={location.paxImageUrl}
                                    alt={`PAX at ${location.name}`}
                                    fill // Use 'fill' prop
                                    style={{ objectFit: 'contain' }} // Use style prop
                                    className="p-2"
                                    sizes="(max-width: 768px) 100vw, 33vw" // Add sizes
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-4 text-center">
                        {/* Display Address */}
                        {location.address && <p className="text-gray-700 mb-2"><span className="font-semibold">Address:</span> {location.address}</p>}
                        {/* Display AOQ (Area of Operations Q) */}
                        {location.q && (
                            <p className="text-gray-700 mb-2">
                                <span className="font-semibold">AOQ:</span> {location.q}
                            </p>
                        )}
                        {/* Display Description */}
                        {location.description && <p className="text-gray-700 mb-4 text-md leading-relaxed">{location.description}</p>}

                        {/* Map Links */}
                        <div className="flex justify-center gap-4">
                            {location.embedMapLink && (
                                <Link
                                    href={location.embedMapLink as string} // Ensure it's treated as string
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    View Embedded Map
                                </Link>
                            )}
                            {/* Only show "Open in Google Maps" if embedMapLink is NOT present */}
                            {!location.embedMapLink && location.mapLink && (
                                <Link
                                    href={location.mapLink as string} // Ensure it's treated as string
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:text-white text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <p className='text-white'>Open in Google Maps</p>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Workout Schedule:</h2>
                        <div className="grid gap-4 d-flex justify-center">
                            {workoutsAtThisLocation.length > 0 ? (
                                workoutsAtThisLocation.map((workout) => (
                                    <WorkoutCard
                                        key={workout._id || `${location._id}-${workout.startTime}-${workout.days?.[0]}`} // Fallback key if _id is missing
                                        _id={workout._id || ''} // Ensure string, fallback to empty string
                                        locationId={location._id || ''} // Ensure string, fallback to empty string
                                        locationName={location.name || ''} // Ensure string, fallback to empty string
                                        startTime={workout.startTime || ''} // Ensure string, fallback to empty string
                                        endTime={workout.endTime || ''}   // Ensure string, fallback to empty string
                                        days={workout.days || []}         // Ensure array, fallback to empty array
                                        types={workout.types || []}       // Ensure array, fallback to empty array
                                        comments={workout.comments}
                                        frequencyPrefix={workout.frequencyPrefix}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 italic col-span-full text-center">No workouts scheduled for this location yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Add a "Back to Workouts" Button */}
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
