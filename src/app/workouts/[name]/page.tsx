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
import type { LocationClean } from '@/utils/fetchLocationsData'; // Import LocationClean type from where it's defined
import { fetchLocaleData } from '@/utils/fetchLocaleData'; // Import fetchLocaleData
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData'; // Import fetchWorkoutsData function
import type { WorkoutClean } from '@/utils/fetchWorkoutsData'; // Import WorkoutClean type from where it's defined


// Define props for the dynamic page component
interface LocationPageProps {
    params: {
        name: string; // The encoded location name from the URL (e.g., "The-Boneyard")
    };
    // searchParams?: { [key: string]: string | string[] | undefined }; // Uncomment if you use search params
}

// --- generateStaticParams (Optional but Recommended for SEO & Performance) ---
// This function tells Next.js which dynamic routes to pre-render at build time.
export async function generateStaticParams() {
    // If SKIP_DB is true (e.g., for local development without DB access),
    // skip pre-rendering and rely solely on force-dynamic at request time.
    if (process.env.SKIP_DB === 'true') {
        console.log("SKIP_DB is true. Skipping generateStaticParams for workouts.");
        return [];
    }

    try {
        const locations = await fetchLocationsData();
        // Filter out locations with invalid names to prevent issues with encodeURIComponent
        const validParams = locations
            .filter(location => typeof location.name === 'string' && location.name.trim() !== '')
            .map((location) => ({
                name: encodeURIComponent(location.name), // Encode for URL safety
            }));
        console.log(`Generated ${validParams.length} static params for workouts.`);
        return validParams;
    } catch (error) {
        console.error("Error fetching locations for generateStaticParams in workouts/[name]/page.tsx:", error);
        // Return an empty array if data fetching fails at build time,
        // allowing Next.js to gracefully handle these routes at request time.
        return [];
    }
}

// --- generateMetadata (Dynamic SEO Titles & Descriptions) ---
// Generates SEO metadata (title, description) for each location page.
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
    // If SKIP_DB is true, provide generic metadata.
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
        // Fallback metadata if data fetch fails
        return {
            title: `F3 Location: ${decodedName}`,
            description: `Details for F3 location ${decodedName}.`,
        };
    }

    if (!location) {
        // If location not found, provide a distinct metadata
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
    const decodedName = decodeURIComponent(params.name); // Decode the URL name

    let allLocations: LocationClean[] = [];
    let allWorkouts: WorkoutClean[] = [];
    let locales = null; // Initialize locales to null or a default empty object

    try {
        // Fetch all necessary data concurrently for efficiency
        [allLocations, allWorkouts, locales] = await Promise.all([
            fetchLocationsData(),
            fetchWorkoutsData(),
            fetchLocaleData(),
        ]);
    } catch (error) {
        console.error("Error fetching data for LocationPage:", error);
        // If critical data cannot be fetched, consider showing an error message or triggering notFound.
        // For now, `location` being undefined will trigger notFound.
    }

    // Find the specific location based on the decoded name
    const location: LocationClean | undefined = allLocations.find(loc => loc.name === decodedName);

    // If the location isn't found in the data, trigger Next.js's 404 page
    if (!location) {
        notFound();
    }

    // Filter workouts to show only workouts at this specific location
    // Ensure location._id is defined as it's critical for filtering workouts
    const workoutsAtThisLocation: WorkoutClean[] = location._id
        ? allWorkouts.filter((workout) => workout.locationId === location._id)
        : []; // If location._id is missing, return an empty array

    const homeHref = '/'; // Default href for the Header component's logo/home link

    // Defensive checks for locale data (for the Footer component)
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
                                    className="p-2" // Add padding to the image itself, if needed
                                    sizes="(max-width: 768px) 100vw, 33vw" // Optimize image loading
                                />
                            </div>
                        )}
                        {/* Display PAX image if available */}
                        {location.paxImageUrl && (
                            <div className="relative w-full md:w-1/3 h-48 flex justify-center items-center overflow-hidden rounded-lg shadow-md">
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
                                    href={location.embedMapLink} // No need for 'as string' if type is already string or undefined handled by '&&'
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
                                    href={location.mapLink} // No need for 'as string'
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Open in Google Maps
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Workout Schedule:</h2>
                        <div className="grid gap-4 d-flex justify-center"> {/* d-flex is not a Tailwind class; consider grid or flex utilities */}
                            {workoutsAtThisLocation.length > 0 ? (
                                // Use a responsive grid for WorkoutCard components
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                    {workoutsAtThisLocation.map((workout) => (
                                        <WorkoutCard
                                            key={workout._id || `${location._id}-${workout.startTime}-${workout.days?.[0]}`} // Fallback key
                                            _id={workout._id || ''}
                                            locationId={location._id || ''}
                                            locationName={location.name || ''}
                                            startTime={workout.startTime || ''}
                                            endTime={workout.endTime || ''}
                                            days={workout.days || []}
                                            types={workout.types || []}
                                            comments={workout.comments} // comments can be undefined
                                            frequencyPrefix={workout.frequencyPrefix} // frequencyPrefix can be undefined
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-center col-span-full py-4 bg-gray-50 rounded-md">No workouts scheduled for this location yet.</p>
                            )}
                        </div>
                    </div>

                    {/* "Back to Workouts" Button */}
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
