// src/utils/convertWorkouts.ts

import type { WorkoutClean, LocationClean } from '../../types/workout'; // Adjust path as needed
import type { WorkoutCardProps } from '../app/_components/WorkoutCard'; // Adjust path as needed

/**
 * Converts an array of WorkoutClean objects to an array of WorkoutCardProps objects.
 * This function now looks up the locationName for each workout using the provided
 * locations array, and no longer includes imageUrl as it's not needed by WorkoutCard.
 *
 * The detailed formatting for 'day', 'time', and 'style' is handled within
 * the WorkoutCard component itself.
 */
export function convertWorkoutsToCardProps(
  workouts: WorkoutClean[],
  locations: LocationClean[]
): WorkoutCardProps[] {
  // Create a map for quick lookup of location details by locationId
  // We need locationName, not imageUrl anymore for WorkoutCardProps
  const locationMap = new Map<string, LocationClean>();
  locations.forEach(loc => {
    locationMap.set(loc._id, loc);
  });

  return workouts.map((wClean) => {
    const location = locationMap.get(wClean.locationId);
    // Provide a fallback name if location somehow isn't found (though it should be)
    const locationName = location ? location.name : 'Unknown Location';

    return {
      _id: wClean._id!, // Non-null assertion: asserting _id will be a string
      locationId: wClean.locationId, // Ensure locationId is passed
      locationName: locationName,    // Look up and pass the location name
      startTime: wClean.startTime,
      endTime: wClean.endTime,
      days: wClean.days,
      types: wClean.types,
      comments: wClean.comments, // Ensure comments are passed if part of props
      frequencyPrefix: wClean.frequencyPrefix, // Ensure frequencyPrefix is passed if part of props
      // imageUrl is explicitly removed as it's not part of WorkoutCardProps anymore
    };
  });
}
