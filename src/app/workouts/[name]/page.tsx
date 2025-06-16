// app/workouts/[name]/page.tsx
// This page displays details for a single workout location (AO).

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
    if (process.env.SKIP_DB === 'true') return [];

    const locations = await fetchLocationsData();
    return locations.map((location) => ({
        name: encodeURIComponent(location.name),
    }));
}

// --- generateMetadata (Dynamic SEO Titles & Descriptions) ---
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
    if (process.env.SKIP_DB === 'true') {
        return {
            title: 'F3 Location',
            description: 'Location details temporarily unavailable.',
        };
    }

    const decodedName = decodeURIComponent(params.name);
    const locations = await fetchLocationsData();
    const location = locations.find(loc => loc.name === decodedName);

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
    const decodedName = decodeURIComponent(params.name); // Decode the name from the URL

    // Fetch all locations and find the one that matches the decoded name
    const allLocations = await fetchLocationsData();
    const location: LocationClean | undefined = allLocations.find(loc => loc.name === decodedName);

    // If the location isn't found in the data, trigger Next.js's 404 page
    if (!location) {
        notFound();
    }

    // Fetch all workouts and filter them to show only workouts at this specific location
    const allWorkouts = await fetchWorkoutsData();
    const workoutsAtThisLocation: WorkoutClean[] = allWorkouts.filter(
        (workout) => workout.locationId === location._id
    );

    const homeHref = '/'; // Default href for the Header component's logo/home link

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
                                    layout="fill"
                                    objectFit="contain"
                                    className="p-2"
                                />
                            </div>
                        )}
                        {/* Display PAX image if available */}
                        {location.paxImageUrl && (
                            <div className="relative w-full md:w-1/3 h-48 flex justify-center items-center overflow-hidden rounded-lg shadow-md">
                                <Image
                                    src={location.paxImageUrl}
                                    alt={`PAX at ${location.name}`}
                                    layout="fill"
                                    objectFit="contain"
                                    className="p-2"
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
                                <Link href={location.embedMapLink} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    View Embedded Map
                                </Link>
                            )}
                            {!location.embedMapLink && location.mapLink && (
                                <Link href={location.mapLink} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Open in Google Maps
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
                                        key={workout._id}
                                        _id={workout._id}
                                        locationId={location._id}
                                        locationName={location.name}
                                        startTime={workout.startTime}
                                        endTime={workout.endTime}
                                        days={workout.days}
                                        types={workout.types}
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
            <Footer />
        </>
    );
}
