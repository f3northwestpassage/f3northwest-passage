import dbConnect from '../lib/dbConnect';
import WorkoutModel from '../models/Workout';
import type { WorkoutClean } from '../../types/workout';

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  await dbConnect();

  try {
    const workoutsFromDB = await WorkoutModel.find().lean().exec();

    return workoutsFromDB.map(workout => ({
      ...workout,
      _id: (workout as any)._id?.toString(),
    }));
  } catch (error) {
    console.error('Error fetching workouts from MongoDB:', error);
    return [];
  }
}