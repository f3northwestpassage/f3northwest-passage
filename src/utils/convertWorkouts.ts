// src/utils/convertWorkouts.ts

import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed
import type { WorkoutCardProps } from '../app/_components/WorkoutCard'; // Adjust path as needed

/**
 * Converts an array of WorkoutClean objects to an array of WorkoutCardProps objects.
 * This handles the type conversion, specifically for `avgAttendance`.
 */
export function convertWorkoutsToCardProps(
  workouts: WorkoutClean[]
): WorkoutCardProps[] {
  return workouts.map((wClean) => {
    let convertedAvgAttendance: number | undefined;

    if (wClean.avgAttendance !== undefined) {
      const parsed = parseFloat(wClean.avgAttendance);
      if (!isNaN(parsed)) {
        convertedAvgAttendance = parsed;
      }
    }

    // Return an object that explicitly matches WorkoutCardProps
    return {
      ao: wClean.ao,
      style: wClean.style,
      location: wClean.location,
      day: wClean.day,
      time: wClean.time,
      q: wClean.q,
      avgAttendance: convertedAvgAttendance, // This is now a number or undefined
      // If WorkoutCardProps requires _id, you'd add it here, e.g.:
      // _id: wClean._id,
    };
  });
}