// src/utils/fetchWorkoutsData.ts
import dbConnect from '@/lib/dbConnect';
import WorkoutModel from '@/models/Workout';
import type { WorkoutClean, LocationClean, LocaleData } from '../../types/workout'; // Adjust path as needed

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  // IMPORTANT: Ensure MOCK_DATA environment variable is properly set (e.g., in .env.local)
  // For production, you'd typically remove or set MOCK_DATA to 'false'
  if (process.env.MOCK_DATA === 'true') { // Check for 'true' string
    console.log('FETCH_WORKOUTS_DATA_DEBUG: MOCK_DATA is true, returning mock workout data.');
    return [
      {
        _id: "mock-workout-1",
        locationId: "mock-location-1",
        startTime: "05:30",
        endTime: "06:15",
        days: ["Monday", "Wednesday", "Friday"],
        types: ["Bootcamp"],
        comments: '',
        ao: 'Mock AO', // Explicitly include 'ao' if it's meant to be populated here
      }
    ];
  }

  try {
    await dbConnect(); // Connect to MongoDB

    const rawWorkouts = await WorkoutModel.find({}).lean().exec();

    // Map raw workout data from DB to WorkoutClean type
    const workouts: WorkoutClean[] = rawWorkouts.map((workout: any) => ({
      _id: workout._id?.toString() ?? '',
      locationId: workout.locationId?.toString() ?? '',
      startTime: workout.startTime || '',
      endTime: workout.endTime || '',
      days: Array.isArray(workout.days) ? workout.days : [],
      types: Array.isArray(workout.types) ? workout.types : [],
      comments: workout.comments ?? '',
      frequencyPrefix: workout.frequencyPrefix ?? '', // Ensure new fields are mapped
      ao: workout.ao ?? '', // Map 'ao' if it exists in the DB document
    })).filter(w => w._id && w.locationId); // Filter out any workouts missing essential IDs

    return workouts;
  } catch (error) {
    console.error('FETCH_WORKOUTS_DATA_ERROR: Failed to retrieve workout data from the database.', error);
    // Return an empty array or re-throw a more user-friendly error depending on desired behavior
    throw new Error('Failed to retrieve workout data from the database. Please check server logs.');
  }
}
