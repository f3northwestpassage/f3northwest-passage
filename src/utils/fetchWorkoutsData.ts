// src/utils/fetchWorkoutsData.ts
import dbConnect from '@/lib/dbConnect';
import WorkoutModel from '@/models/Workout';
import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  await dbConnect(); // Connect to MongoDB

  try {
    // .lean() returns plain JavaScript objects. However, _id and locationId are still ObjectId instances.
    // We explicitly map and convert them to strings to ensure type compatibility and correct matching.
    const rawWorkoutsFromDb = await WorkoutModel.find({}).lean().exec();

    const workouts: WorkoutClean[] = rawWorkoutsFromDb.map(raw => {
      // Safely convert _id to string. _id should always exist for a document.
      const _id = raw._id ? raw._id.toString() : '';

      // Safely convert locationId to string. This is crucial for matching with Location._id.
      // If a workout has no locationId (e.g., old data), it will be an empty string.
      const locationId = raw.locationId ? raw.locationId.toString() : '';

      return {
        _id: _id,
        locationId: locationId,
        style: raw.style,
        day: raw.day,
        time: raw.time,
        q: raw.q,
        avgAttendance: raw.avgAttendance
      };
    }).filter(workout => workout._id !== '' && workout.locationId !== ''); // Filter out any entries that ended up with empty IDs or missing locationId

    return workouts;
  } catch (error) {
    console.error('Error fetching workouts from DB:', error);
    throw new Error('Failed to retrieve workout data from the database.');
  }
}
