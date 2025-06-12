// src/utils/fetchWorkoutsData.ts
import dbConnect from '@/lib/dbConnect';
import WorkoutModel from '@/models/Workout';
import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  await dbConnect(); // Connect to MongoDB

  try {
    // .lean() makes the query return plain JavaScript objects instead of Mongoose Documents,
    // which also automatically applies the toObject/toJSON transforms from your schema,
    // ensuring _id and locationId are strings.
    const workouts = await WorkoutModel.find({}).lean().exec();

    // The workouts fetched from DB are already in the WorkoutClean format
    // due to the .lean() call and schema transforms, so direct cast is safer.
    return workouts as WorkoutClean[];
  } catch (error) {
    console.error('Error fetching workouts from DB:', error);
    throw new Error('Failed to retrieve workout data from the database.');
  }
}
