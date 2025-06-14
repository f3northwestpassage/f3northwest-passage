// src/app/workouts/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';
import Button from '../_components/Button';
import WorkoutCard, { sortWorkouts } from '../_components/WorkoutCard';
import type { WorkoutClean, LocationClean } from '../../../types/workout';
import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
import MapLinkButton from '../_components/MapLinkButton'; // <-- Import the new component

import f3HeroImg from '../../../public/f3-darkhorse-2023-11-04.jpg';

interface GroupedWorkoutsByLocation {
  [locationId: string]: WorkoutClean[];
}

export default async function Page() {
  const rawWorkouts: WorkoutClean[] = await fetchWorkoutsData();

  let rawLocations: LocationClean[] = [];
  try {
    const locationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/locations`, {
      cache: 'no-store'
    });
    if (!locationsResponse.ok) {
      console.error('Workouts Page: Failed to fetch locations:', locationsResponse.status, locationsResponse.statusText);
      rawLocations = [];
    } else {
      rawLocations = await locationsResponse.json();
      if (!Array.isArray(rawLocations)) {
        console.error('Workouts Page: Fetched locations data is not an array! Received:', rawLocations);
        rawLocations = [];
      }
    }
  } catch (error) {
    console.error('Workouts Page: Error fetching locations:', error);
    rawLocations = [];
  }

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
    sortWorkouts(groupedWorkouts[locationId]);
  }

  const sortedLocations = [...rawLocations].sort((a, b) => a.name.localeCompare(b.name));

  const locales = await fetchLocaleData();
  const href = '/workouts';
  const mapDetails = {
    lat: locales.region_map_lat,
    lon: locales.region_map_lon,
    zoom: locales.region_map_zoom,
  };
  const mapUrl = `https://map.f3nation.com/?lat=${mapDetails.lat}&lon=-${mapDetails.lon}&zoom=${mapDetails.zoom}`;
  const embedMapUrl = locales.region_map_embed_link;

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

                  return (
                    <Link href={`/workouts/${encodeURIComponent(location.name)}`} key={location._id} passHref>
                      <div className="bg-white rounded-lg shadow-xl p-4 text-gray-900 cursor-pointer hover:shadow-2xl transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-3xl font-extrabold text-gray-800 text-center">
                            {location.name}
                          </h3>
                          {location.embedMapLink && (
                            <MapLinkButton href={location.embedMapLink} text="Map" />
                          )}
                          {!location.embedMapLink && location.mapLink && (
                            <MapLinkButton href={location.mapLink} text="Map" />
                          )}
                        </div>

                        {location.address && <p className="text-gray-700 mb-1"><span className="font-semibold">Address:</span> {location.address}</p>}
                        {
                          location.q && (
                            <p className="text-gray-700 mb-1">
                              <span className="font-semibold">AOQ:</span> {location.q}
                            </p>
                          )
                        }
                        {location.description && <p className="text-gray-700 mb-3 text-sm leading-relaxed">{location.description}</p>}

                        {
                          location.imageUrl && (
                            <div className="mb-3 relative w-full h-32 flex justify-center items-center">
                              <Image
                                src={location.imageUrl}
                                alt={`${location.name} AO Logo`}
                                width={150}
                                height={150}
                                className="rounded-lg shadow-md object-contain"
                              />
                            </div>
                          )
                        }
                        {
                          location.paxImageUrl && (
                            <div className="mb-3 relative w-full h-32 flex justify-center items-center">
                              <Image
                                src={location.paxImageUrl}
                                alt={`PAX at ${location.name}`}
                                width={150}
                                height={150}
                                className="rounded-lg shadow-md object-contain"
                              />
                            </div>
                          )
                        }

                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <h4 className="text-2xl font-bold text-gray-800 mb-3 text-center">Workout Schedule:</h4>
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
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main >
      <Footer />
    </>
  );
}
