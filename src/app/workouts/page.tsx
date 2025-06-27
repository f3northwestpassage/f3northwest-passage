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

export const dynamic = 'force-dynamic';

interface GroupedWorkoutsByLocation {
  [locationId: string]: WorkoutClean[];
}

export default async function Page() {
  const rawWorkouts: WorkoutClean[] = await fetchWorkoutsData();
  const rawLocations: LocationClean[] = await fetchLocationsData();



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
      <Header href={href} regionName={locales?.region_name} />
      <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Hero
          title="WORKOUTS"
          subtitle="FREE BEATDOWNS 6X/WEEK"
          imgUrl={f3HeroImg.src}
          imgAlt="Group of men exercising outdoors at F3 workout" // Added descriptive alt text for accessibility
        />
        {/* Section 1: Areas of Operation */}
        <section className="bg-gray-800 dark:bg-gray-950 py-12 px-4 text-white text-center">
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

        {/* Section 2: Join Us / Workout Cards */}
        <section className="bg-gray-100 dark:bg-gray-800 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 text-center">JOIN US</h2>
            <div className="space-y-6">
              {sortedLocations.length === 0 && rawWorkouts.length === 0 ? (
                <div className="text-center bg-gray-700 dark:bg-gray-700 p-8 rounded-lg shadow-lg">
                  <p className="text-2xl font-semibold text-gray-300 dark:text-gray-200">
                    No workout locations available at this time.
                  </p>
                  <p className="text-gray-400 dark:text-gray-400 mt-2">
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
                        bg-white
                        dark:bg-gray-800
                        rounded-xl
                        shadow-lg
                        dark:shadow-md
                        p-6
                        text-gray-900
                        dark:text-gray-100
                        cursor-pointer
                        hover:shadow-xl
                        dark:hover:shadow-lg
                        hover:scale-[1.01]
                        transition-all
                        duration-300
                        flex
                        flex-col
                      ">
                        {/* Header Section: Location Name (centered) and Map Button (below, centered) */}
                        <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                          {/* Location Name - This h3 will naturally take full width of its parent, so text-center works */}
                          <h3 className="text-3xl font-extrabold text-f3-blue dark:text-f3-blue-light text-center mb-2">
                            {location.name}
                          </h3>

                          {/* Map Buttons - Centered below the name, if they exist */}
                          {(location.embedMapLink || location.mapLink) && (
                            <div className="flex justify-center"> {/* Use flex justify-center on the div holding the button(s) */}
                              {location.embedMapLink ? (
                                <MapLinkButton href={location.embedMapLink} text="View Map" bare={false} />
                              ) : (
                                location.mapLink && <MapLinkButton href={location.mapLink} text="View Map" bare={false} />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Location Details Section */}
                        <div className="text-center text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                          {location.address && (
                            <p><span className="font-semibold text-gray-800 dark:text-gray-200">Address:</span> {location.address}</p>
                          )}
                          {location.q && (
                            <p><span className="font-semibold text-gray-800 dark:text-gray-200">AOQ:</span> {location.q}</p>
                          )}
                          {location.description && (
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                              {location.description}
                            </p>
                          )}
                        </div>

                        {/* Image Section (Optional - placed more prominently) */}
                        {(location.imageUrl || location.paxImageUrl) && (
                          <div className="mb-4 flex flex-wrap justify-center items-center gap-4">
                            {location.imageUrl && (
                              <div className="relative w-64 h-64 flex justify-center items-center p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 shadow-sm dark:shadow-none">
                                <Image
                                  src={location.imageUrl}
                                  alt={`${location.name} AO Logo`}
                                  width={240} // Increased for a more noticeable size
                                  height={240} // Increased for a more noticeable size
                                  className="object-contain"
                                />
                              </div>
                            )}
                            {location.paxImageUrl && (
                              <div className="relative w-64 h-64 flex justify-center items-center p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 shadow-sm dark:shadow-none">
                                <Image
                                  src={location.paxImageUrl}
                                  alt={`PAX at ${location.name}`}
                                  width={240} // Increased for a more noticeable size
                                  height={240} // Increased for a more noticeable size
                                  className="object-contain"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Workout Schedule Section */}
                        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                          <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Workout Schedule:</h4>
                          <div className={
                            workoutsAtThisLocation.length === 1
                              ? "flex justify-center"
                              : "grid grid-cols-1 sm:grid-cols-2 gap-4"
                          }>
                            {workoutsAtThisLocation.length > 0 ? (
                              workoutsAtThisLocation.map((workout) => (
                                <WorkoutCard
                                  key={workout._id!}
                                  _id={workout._id!}
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
                              <p className="text-gray-500 dark:text-gray-400 italic text-center col-span-full py-4 bg-gray-50 dark:bg-gray-700 rounded-md">
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
