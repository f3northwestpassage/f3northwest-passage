// app/api/workouts/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs'; // Still used for locale.json password retrieval
import path from 'path';

// Adjust import paths if your files are in different locations relative to this API route
import type { WorkoutClean } from '../../../../types/workout'; // Ensure this path is correct
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData';
import dbConnect from '@/lib/dbConnect'; // Import dbConnect
import WorkoutModel from '@/models/Workout'; // Import your Mongoose Workout Model

// Helper to get admin password from locale file
async function getAdminPasswordFromLocale(): Promise<string> {
  const localeFilePath = path.join(process.cwd(), 'src', 'locales', 'en.json');
  try {
    const fileContents = fs.readFileSync(localeFilePath, 'utf-8');
    const localeData = JSON.parse(fileContents);
    const adminPassword = localeData.admin_password;

    if (!adminPassword) {
      console.error('Admin password not found in src/locales/en.json or is empty.');
      throw new Error('Server configuration error: Admin password missing.');
    }
    return adminPassword;
  } catch (error) {
    console.error('Error reading or parsing src/locales/en.json for admin password:', error);
    return Promise.reject(new Error('Server configuration error: Cannot read admin password.')); // Propagate error
  }
}

// --- GET Method (Fetches all workouts) ---
export async function GET(request: NextRequest) {
  try {
    const localeAdminPassword = await getAdminPasswordFromLocale();
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');

    if (providedPassword !== localeAdminPassword) {
      return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    const workouts = await fetchWorkoutsData(); // This function already connects to MongoDB
    return NextResponse.json(workouts); // Return the workouts
  } catch (error) {
    console.error('API GET Error fetching workouts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error: Failed to fetch workouts. ${errorMessage}` }, { status: 500 });
  }
}

// --- POST Method (Adds new workout or Updates existing workout) ---
export async function POST(request: NextRequest) {
  let localeAdminPassword: string;
  try {
    localeAdminPassword = await getAdminPasswordFromLocale();
  } catch (error: any) {
    console.error('Error in POST trying to get admin password:', error);
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const providedPassword = searchParams.get('pw');

  if (providedPassword !== localeAdminPassword) {
    return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
  }

  await dbConnect(); // Ensure MongoDB connection is established

  try {
    const workoutData: WorkoutClean = await request.json();

    if (!workoutData || typeof workoutData !== 'object') {
      return NextResponse.json({ message: 'Error: Invalid data format. Expected a single workout object.' }, { status: 400 });
    }

    if (workoutData._id) {
      // If _id is present, it's an update operation
      const { _id, ...updateFields } = workoutData; // Extract _id and get rest of fields
      // Mongoose automatically converts _id string from client to ObjectId for DB query
      const updatedWorkout = await WorkoutModel.findByIdAndUpdate(
        _id,
        updateFields,
        { new: true, runValidators: true } // `new: true` returns the updated document
      ).lean().exec(); // `.lean()` applies the `toObject` transform, ensuring `_id` is a string

      if (!updatedWorkout) {
        return NextResponse.json({ message: 'Error: Workout not found for update.' }, { status: 404 });
      }
      // `updatedWorkout` is already a plain object with `_id` as a string due to `.lean()` and the schema transform.
      return NextResponse.json({ message: 'Success: Workout updated successfully.', workout: updatedWorkout }, { status: 200 });
    } else {
      // If _id is not present, it's an add operation
      const newWorkout = await WorkoutModel.create(workoutData);
      // Call `.toObject()` on the Mongoose Document; this applies the `toObject` transform from your schema,
      // ensuring `_id` is a string without manual conversion.
      return NextResponse.json({ message: 'Success: Workout added successfully.', workout: newWorkout.toObject() }, { status: 201 });
    }

  } catch (error) {
    console.error('API Error saving/updating workout:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error: Failed to save/update workout. ${errorMessage}` }, { status: 500 });
  }
}

// --- DELETE Method (Deletes a workout) ---
export async function DELETE(request: NextRequest) {
  let localeAdminPassword: string;
  try {
    localeAdminPassword = await getAdminPasswordFromLocale();
  } catch (error: any) {
    console.error('Error in DELETE trying to get admin password:', error);
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const providedPassword = searchParams.get('pw');
  const workoutId = searchParams.get('id'); // Expect workout ID in the 'id' query parameter

  if (providedPassword !== localeAdminPassword) {
    return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
  }

  if (!workoutId) {
    return NextResponse.json({ message: 'Error: Workout ID is required for deletion.' }, { status: 400 });
  }

  await dbConnect(); // Ensure MongoDB connection is established

  try {
    // Mongoose automatically converts `workoutId` string to ObjectId for DB query
    const result = await WorkoutModel.findByIdAndDelete(workoutId).exec();

    if (!result) {
      return NextResponse.json({ message: 'Error: Workout not found for deletion.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success: Workout deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error('API Error deleting workout:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error: Failed to delete workout. ${errorMessage}` }, { status: 500 });
  }
}