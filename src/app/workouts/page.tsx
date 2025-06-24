// src/app/workouts/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';
import Button from '../_components/Button';
import WorkoutCard from '../_components/WorkoutCard'; // Your WorkoutCard component
import { sortWorkouts } from '@/utils/sortWorkouts';
import type { WorkoutClean, LocationClean } from '../../../types/workout';
import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import { fetchLocationsData } from '../../utils/fetchLocationsData';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
import MapLinkButton from '../_components/MapLinkButton';

import f3HeroImg from '../../../public/f3-darkhorse-2023-11-04.jpg';

interface GroupedWorkoutsByLocation {
  [locationId: string]: WorkoutClean[];
}

export default async function Page() {
  const rawWorkouts: WorkoutClean[] = await fetchWorkoutsData();
  const rawLocations: LocationClean[] = await fetchLocationsData();

  // --- LOG 1: Raw Fetched Data ---
  console.log('--- workouts/page.tsx Logs ---');
  console.log('Raw Workouts Fetched:', rawWorkouts.length, rawWorkouts);
  console.log('Raw Locations Fetched:', rawLocations.length, rawLocations);
  console.log('------------------------------');

  const groupedWorkouts: GroupedWorkoutsByLocation = {};
  rawWorkouts.forEach(workout => {
    if (workout.locationId) {
      if (!groupedWorkouts[workout.locationId]) {
        groupedWorkouts[workout.locationId] = [];
      }
      groupedWorkouts[workout.locationId].push(workout);
    }
  });

  for (const locationId in groupedWorkouts) {
    groupedWorkouts[locationId] = sortWorkouts(groupedWorkouts[locationId]);
  }

  const sortedLocations = [...rawLocations].sort((a, b) => a.name.localeCompare(b.name));

  const locales = await fetchLocaleData();
  const href = '/workouts';
  const mapDetails = {
    lat: locales?.region_map_lat,
    lon: locales?.region_map_lon,
    zoom: locales?.region_map_zoom,
  };
  const mapUrl = `https://map.f3nation.com/?lat=${mapDetails.lat}&lon=${mapDetails.lon}&zoom=${mapDetails.zoom}`;
  const embedMapUrl = locales?.region_map_embed_link;

  return (
    <>
      <Header href={href} />
      <main>
        <Hero
          title="WORKOUTS"
          subtitle="FREE BEATDOWNS 6X/WEEK"
          imgUrl={f3HeroImg.src}
        />
        <section className="bg-iron leading-tight py-12 px-4 text-white text-center">
          <h2 className="text-4xl font-extrabold mb-4">AREAS OF OPERATION</h2>
          <p className="text-lg opacity-90 mb-3 max-w-2xl mx-auto">
            F3 workouts are held in any weather conditions, free of charge and
            open to men of all ages.
          </p>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Find a workout location [AO] below.
          </p>
          {embedMapUrl ? (
            <iframe
              src={embedMapUrl}
              className="w-full rounded-lg shadow-xl mb-10"
              style={{ height: 500 }}
              title="F3 Workouts Map"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <iframe
              src={mapUrl}
              className="w-full rounded-lg shadow-xl mb-10"
              style={{ height: 500 }}
              title="F3 Workouts Map"
              loading="lazy"
            />
          )}

          <Button href={mapUrl} text="VIEW FULL SCREEN" target="_blank" />
        </section>

        <section className="bg-gloom leading-tight py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-white mb-10 text-center">JOIN US</h2>
            <div className="space-y-6">
              {sortedLocations.length === 0 && rawWorkouts.length === 0 ? (
                <div className="text-center bg-gray-700 p-8 rounded-lg shadow-lg">
                  <p className="text-2xl font-semibold text-gray-300">
                    No workout locations available at this time.
                  </p>
                  <p className="text-gray-400 mt-2">
                    Please check back later or contact us for more information.
                  </p>
                </div>
              ) : (
                sortedLocations.map((location) => {
                  const workoutsAtThisLocation: WorkoutClean[] = groupedWorkouts[location._id] || [];

                  // --- LOG 2: Workouts for Each Location ---
                  console.log(`--- Location: ${location.name} (${location._id}) ---`);
                  console.log(`  Found ${workoutsAtThisLocation.length} workouts.`);
                  if (workoutsAtThisLocation.length > 0) {
                    workoutsAtThisLocation.forEach(w => {
                      console.log(`    Workout ID: ${w._id}, Time: ${w.startTime}-${w.endTime}, Days: ${w.days}, Types: ${w.types}, Comments: "${w.comments}", Prefix: "${w.frequencyPrefix}"`);
                    });
                  } else {
                    console.log('    No workouts found for this location.');
                  }
                  console.log('------------------------------');
                  // --- END LOG 2 ---

                  return (
                    <Link href={`/workouts/${encodeURIComponent(location.name)}`} key={location._id} passHref>
                      {/* Outer Card Container */}
                      <div className="
                      bg-white           /* White background for the card */
                      rounded-xl         /* More rounded corners for a modern feel */
                      shadow-lg          /* Subtle shadow for depth */
                      p-6                /* Increased padding for more breathing room */
                      text-gray-900      /* Default text color */
                      cursor-pointer     /* Indicates it's clickable */
                      hover:shadow-xl    /* Enhanced shadow on hover for interaction */
                      hover:scale-[1.01] /* Slightly scale up on hover for a subtle effect */
                      transition-all     /* Smooth transition for hover effects */
                      duration-300
                      flex               /* Use flexbox for overall card content layout */
                      flex-col           /* Arrange content in a column */
                    ">
                        {/* Header Section: Location Name and Map Button */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200"> {/* Added border-b for separation */}
                          {/* Location Name - Centered */}
                          <h3 className="flex-grow text-3xl font-extrabold text-f3-blue text-center mr-4"> {/* Use a brand color if available, add margin-right to h3 */}
                            {location.name}
                          </h3>

                          {/* Map Buttons - Pushed to the right */}
                          {(location.embedMapLink || location.mapLink) && (
                            <div className="flex-shrink-0">
                              {location.embedMapLink ? (
                                <MapLinkButton href={location.embedMapLink} text="View Map" bare={false} />
                              ) : (
                                location.mapLink && <MapLinkButton href={location.mapLink} text="View Map" bare={false} />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Location Details Section */}
                        <div className="text-center text-gray-700 mb-4 space-y-2"> {/* Left align text, add space between paragraphs */}
                          {location.address && (
                            <p><span className="font-semibold text-gray-800">Address:</span> {location.address}</p>
                          )}
                          {location.q && (
                            <p><span className="font-semibold text-gray-800">AOQ:</span> {location.q}</p>
                          )}
                          {location.description && (
                            <p className="text-sm leading-relaxed text-gray-600 border-t border-gray-100 pt-2 mt-2">
                              {location.description}
                            </p>
                          )}
                        </div>

                        {/* Image Section (Optional - placed more prominently) */}
                        {(location.imageUrl || location.paxImageUrl) && (
                          <div className="mb-4 flex flex-wrap justify-center items-center gap-4"> {/* Use flex-wrap for multiple images */}
                            {location.imageUrl && (
                              <div className="relative w-36 h-36 flex justify-center items-center p-2 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
                                <Image
                                  src={location.imageUrl}
                                  alt={`${location.name} AO Logo`}
                                  width={120}
                                  height={120}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            {location.paxImageUrl && (
                              <div className="relative w-36 h-36 flex justify-center items-center p-2 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
                                <Image
                                  src={location.paxImageUrl}
                                  alt={`PAX at ${location.name}`}
                                  width={120}
                                  height={120}
                                  className="object-contain"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Workout Schedule Section */}
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <h4 className="text-2xl font-bold text-gray-800 mb-4 text-center">Workout Schedule:</h4> {/* Increased mb */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Responsive grid for WorkoutCards */}
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
                                  comments={workout.comments}
                                  frequencyPrefix={workout.frequencyPrefix}
                                />
                              ))
                            ) : (
                              <p className="text-gray-500 italic text-center col-span-full py-4 bg-gray-50 rounded-md">
                                No workouts scheduled for this location yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main >
      <Footer regionName={locales.region_name ?? ""} regionFacebook={locales.region_facebook ?? ""} regionInstagram={locales.region_instagram ?? ""} regionLinkedin={locales.region_linkedin ?? ""} regionXTwitter={locales.region_x_twitter ?? ""} />
    </>
  );
}
