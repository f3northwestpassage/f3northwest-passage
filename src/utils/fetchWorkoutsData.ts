// src/utils/fetchWorkoutsData.ts
import dbConnect from '@/lib/dbConnect';
import WorkoutModel from '@/models/Workout';
import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  await dbConnect(); // Connect to MongoDB

  try {
    // .lean() returns plain JavaScript objects.
    // We explicitly map and convert ObjectId instances to strings for type compatibility.
    const rawWorkoutsFromDb = await WorkoutModel.find({}).lean().exec();

    const workouts: WorkoutClean[] = rawWorkoutsFromDb.map(raw => {
      // Safely convert _id to string. _id should always exist for a document.
      const _id = raw._id ? raw._id.toString() : '';

      // Safely convert locationId to string. This is crucial for matching with Location._id.
      // If a workout has no locationId (e.g., old/malformed data), it will be an empty string.
      const locationId = raw.locationId ? raw.locationId.toString() : '';

      return {
        _id: _id,
        locationId: locationId,
        // Map to the new WorkoutClean structure:
        startTime: raw.startTime || '', // Ensure startTime exists or default
        endTime: raw.endTime || '',     // Ensure endTime exists or default
        days: Array.isArray(raw.days) ? raw.days : [], // Ensure days is an array
        types: Array.isArray(raw.types) ? raw.types : [], // Ensure types is an array

        // ao, q are not stored on the WorkoutModel itself, as per WorkoutClean definition
        // avgAttendance is removed from WorkoutClean
      };
    }).filter(workout => workout._id !== '' && workout.locationId !== ''); // Filter out any entries that ended up with empty IDs or missing locationId

    return workouts;
  } catch (error) {
    console.error('Error fetching workouts from DB:', error);
    throw new Error('Failed to retrieve workout data from the database.');
  }
}

// ADD THIS LINE to re-export WorkoutClean
export type { WorkoutClean };
