// src/app/your-page/page.tsx (or similar path)

import Link from 'next/link';

import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';
import Button from '../_components/Button';
// Import WorkoutCard directly as default, and sortWorkouts as a named export
// You also need WorkoutCardProps here to define the type for the mapped item
import WorkoutCard, { sortWorkouts, WorkoutCardProps } from '../_components/WorkoutCard';

/** replace with a regional image */
import f3HeroImg from '../../../public/f3-darkhorse-2023-11-04.jpg';

import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
// Ensure WorkoutClean is imported here if you need to explicitly type 'workouts'
import type { WorkoutClean } from '../../../types/workout';


export default async function Page() {
  const workouts: WorkoutClean[] = await fetchWorkoutsData(); // Explicitly type 'workouts'
  const locales = await fetchLocaleData();
  const href = '/workouts';
  const mapDetails = {
    lat: locales.region_map_lat,
    lon: locales.region_map_lon,
    zoom: locales.region_map_zoom,
  };
  const mapUrl = `https://map.f3nation.com/?lat=${mapDetails.lat}&lon=${mapDetails.lon}&zoom=${mapDetails.zoom}`;
  const today = new Date().getDay();
  const saturday = 6;
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
            {/* THIS IS THE KEY CHANGE: Explicitly map AFTER sorting,
                performing the type conversion directly here */}
            {sortWorkouts(workouts).map((wClean: WorkoutClean, i) => {
              // Convert avgAttendance from string | undefined to number | undefined
              let convertedAvgAttendance: number | undefined;
              if (wClean.avgAttendance !== undefined) {
                const parsed = parseFloat(wClean.avgAttendance);
                if (!isNaN(parsed)) {
                  convertedAvgAttendance = parsed;
                }
              }

              // Create an object that explicitly matches WorkoutCardProps
              const workoutCardProps: WorkoutCardProps = {
                ao: wClean.ao,
                q: wClean.q,
                avgAttendance: convertedAvgAttendance, // This is now a number or undefined
                style: wClean.style,
                location: wClean.location,
                day: wClean.day,
                time: wClean.time,
              };

              return (
                <li key={i} className={i > 0 ? 'pt-5' : ''}>
                  <WorkoutCard
                    {...workoutCardProps} // Spread the correctly typed props
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}