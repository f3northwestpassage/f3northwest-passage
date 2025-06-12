// src/utils/convertWorkouts.ts

import type { WorkoutClean, LocationClean } from '../../types/workout'; // Adjust path as needed
import type { WorkoutCardProps } from '../app/_components/WorkoutCard'; // Adjust path as needed

/**
 * Converts an array of WorkoutClean objects to an array of WorkoutCardProps objects.
 * This handles the type conversion, specifically for `avgAttendance`,
 * and combines workout data with its associated location data.
 */
export function convertWorkoutsToCardProps(
  workouts: WorkoutClean[],
  locations: LocationClean[] // Now accepts an array of locations
): WorkoutCardProps[] {
  return workouts.map((wClean) => {
    // Find the corresponding location for this workout
    const associatedLocation = locations.find(loc => loc._id === wClean.locationId);

    // Provide default values if location or its properties are missing
    const aoName = associatedLocation?.name ?? 'Unknown AO';
    const locationDisplayText = associatedLocation?.address ?? associatedLocation?.mapLink ?? 'No Location Text'; // Prefer address, then mapLink, then default
    const locationMapLink = associatedLocation?.mapLink ?? '#'; // Fallback link

    let convertedAvgAttendance: number | undefined;

    if (wClean.avgAttendance !== undefined) {
      const parsed = parseFloat(wClean.avgAttendance);
      if (!isNaN(parsed)) {
        convertedAvgAttendance = parsed;
      }
    }

    // Return an object that explicitly matches WorkoutCardProps
    return {
      _id: wClean._id, // Keep the workout's ID
      ao: aoName, // From associated location
      style: wClean.style ?? '', // Ensure style is always a string
      locationText: locationDisplayText, // From associated location
      locationHref: locationMapLink, // From associated location
      day: wClean.day, // Should be string per WorkoutClean
      time: wClean.time, // Should be string per WorkoutClean
      q: wClean.q ?? '', // Ensure q is always a string
      avgAttendance: convertedAvgAttendance, // This is now a number or undefined
    };
  });
}
