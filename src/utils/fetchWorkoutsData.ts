// src/utils/fetchWorkoutsData.ts
import dbConnect from '@/lib/dbConnect';
import WorkoutModel from '@/models/Workout';
import type { WorkoutClean } from '../../types/workout';

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  if (process.env.MOCK_DATA === 'false') {
    console.log('FETCH_WORKOUTS_DATA_DEBUG: MOCK_DATA is true, returning mock workout data.');
    return [
      {
        _id: "mock-workout-1",
        locationId: "mock-location-1",
        locationName: "",
        startTime: "05:30",
        endTime: "06:15",
        days: ["Monday", "Wednesday", "Friday"],
        types: ["Bootcamp"],
      }
    ];
  }

  await dbConnect();

  try {
    const rawWorkouts = await WorkoutModel.find({}).lean().exec();

    const workouts: WorkoutClean[] = rawWorkouts.map((workout: any) => ({
      _id: workout._id?.toString() ?? '',
      locationName: workout.locationName ?? '',
      locationId: workout.locationId?.toString() ?? '',
      startTime: workout.startTime || '',
      endTime: workout.endTime || '',
      days: Array.isArray(workout.days) ? workout.days : [],
      types: Array.isArray(workout.types) ? workout.types : [],
    })).filter(w => w._id && w.locationId);

    return workouts;
  } catch (error) {
    console.error('FETCH_WORKOUTS_DATA_ERROR:', error);
    throw new Error('Failed to retrieve workout data from the database.');
  }
}

export type { WorkoutClean };
