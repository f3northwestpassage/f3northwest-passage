// src/app/workouts/page.tsx

import Link from 'next/link';

import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';
import Button from '../_components/Button';
// Import WorkoutCard directly as default, and sortWorkouts as a named export
import WorkoutCard, { sortWorkouts } from '../_components/WorkoutCard';

/** replace with a regional image */
import f3HeroImg from '../../../public/f3-darkhorse-2023-11-04.jpg';

import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
// Ensure WorkoutClean and LocationClean are imported
import type { WorkoutClean, LocationClean } from '../../../types/workout';
// IMPORT THE NEW CONVERSION UTILITY
import { convertWorkoutsToCardProps } from '../../utils/convertWorkouts';


export default async function Page() {
  // 1. Fetch raw data. This returns WorkoutClean[].
  const rawWorkouts: WorkoutClean[] = await fetchWorkoutsData();

  // --- MODIFIED: Fetch locations data without a password ---
  let rawLocations: LocationClean[] = [];
  try {
    // Since /api/locations GET method is now public, remove the password parameter
    const locationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/locations`);
    if (!locationsResponse.ok) {
      console.error('Failed to fetch locations for workout page:', locationsResponse.status, locationsResponse.statusText);
      rawLocations = []; // Fallback to an empty array
    } else {
      rawLocations = await locationsResponse.json();
      if (!Array.isArray(rawLocations)) {
        console.error('Workouts Page: Fetched locations data is not an array! Received:', rawLocations);
        rawLocations = [];
      }
    }
    // --- DEBUGGING LOG ---
    console.log('Workouts Page: Fetched Raw Locations:', rawLocations);
    // --- END DEBUGGING LOG ---
  } catch (error) {
    console.error('Workouts Page: Error fetching locations:', error);
    rawLocations = [];
  }
  // --- END MODIFIED ---


  // 2. CONVERT THE RAW DATA TO WorkoutCardProps[] BEFORE PASSING TO sortWorkouts.
  // The convertWorkoutsToCardProps function handles the avgAttendance type conversion
  // AND combines workout data with location data.
  const workoutsForDisplay = convertWorkoutsToCardProps(rawWorkouts, rawLocations);

  // --- DEBUGGING LOG ---
  console.log('Workouts Page: Workouts for Display (after conversion):', workoutsForDisplay);
  // --- END DEBUGGING LOG ---

  // 3. Now, sort the array which is already in the correct WorkoutCardProps[] format.
  // sortWorkouts expects WorkoutCardProps[] and returns WorkoutCardProps[].
  const sortedWorkouts = sortWorkouts(workoutsForDisplay);

  const locales = await fetchLocaleData();
  const href = '/workouts';
  const mapDetails = {
    lat: locales.region_map_lat,
    lon: locales.region_map_lon,
    zoom: locales.region_map_zoom,
  };
  const mapUrl = `https://map.f3nation.com/?lat=${mapDetails.lat}&lon=${mapDetails.lon}&zoom=${mapDetails.zoom}`;

  return (
    <>
      <Header href={href} />
      <main>
        <Hero
          title="WORKOUTS"
          subtitle="FREE BEATDOWNS 6X/WEEK"
          imgUrl={f3HeroImg.src}
        />
        <section className={`bg-iron leading-tight py-16 px-4`}>
          <h2>AREAS OF OPERATION</h2>
          <p className="text-cmu pt-5">
            F3 workouts are held in any weather conditions, free of charge and
            open to men of all ages.
          </p>
          <p className="text-cmu pt-5 pb-10">
            Find a workout location [AO] below.
          </p>
          <iframe
            src={mapUrl}
            className="w-full pb-10"
            style={{ height: 500 }}
            title="F3 Workouts Map"
            loading="lazy"
          />
          <Button href={mapUrl} text="VIEW FULL SCREEN" target="_blank" />
        </section>
        <section className={`bg-gloom leading-tight py-16 px-4`}>
          <h2 className="py-5">JOIN US</h2>
          <ul>
            {/* Pass the correctly typed and sorted array to map */}
            {sortedWorkouts.map((w, i) => (
              <li key={w._id || i} className={i > 0 ? 'pt-5' : ''}>
                <WorkoutCard
                  _id={w._id}
                  ao={w.ao}
                  q={w.q}
                  avgAttendance={w.avgAttendance}
                  style={w.style}
                  locationText={w.locationText}
                  locationHref={w.locationHref}
                  day={w.day}
                  time={w.time}
                />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
