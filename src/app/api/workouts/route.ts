// app/api/workouts/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData';
import dbConnect from '@/lib/dbConnect';
import WorkoutModel from '@/models/Workout';
import type { WorkoutClean } from '../../../../types/workout'; // Ensure this type includes 'comments' and 'frequencyPrefix'
import { getAdminPasswordFromEnv } from '@/utils/getAdminPassword';

// --- GET Method (Fetches all workouts, password protected) ---
export async function GET(request: NextRequest) {
  try {
    const adminPassword = await getAdminPasswordFromEnv();
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');

    if (providedPassword !== adminPassword) {
      return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    const workouts = await fetchWorkoutsData();
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('API GET Error fetching workouts:', error);
    return NextResponse.json({ message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

// --- POST Method (Add or update a workout) ---
export async function POST(request: NextRequest) {
  try {
    const adminPassword = await getAdminPasswordFromEnv();
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');

    if (providedPassword !== adminPassword) {
      return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    await dbConnect();
    // workoutData will now correctly include 'comments' and 'frequencyPrefix' if sent by the client
    const workoutData: WorkoutClean = await request.json();

    if (!workoutData || typeof workoutData !== 'object') {
      return NextResponse.json({ message: 'Error: Invalid workout data format.' }, { status: 400 });
    }

    if (workoutData._id) {
      // If _id exists, it's an update operation. Mongoose will update recognized fields.
      const { _id, ...updateFields } = workoutData;
      const updatedWorkout = await WorkoutModel.findByIdAndUpdate(_id, updateFields, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
      }).lean().exec(); // .lean() for plain JS object, .exec() to ensure it's a promise

      if (!updatedWorkout) {
        return NextResponse.json({ message: 'Error: Workout not found for update.' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Success: Workout updated successfully.', workout: updatedWorkout });
    } else {
      // If no _id, it's a new workout. Mongoose will create a new document.
      const newWorkout = await WorkoutModel.create(workoutData);
      return NextResponse.json({ message: 'Success: Workout added successfully.', workout: newWorkout.toObject() }, { status: 201 });
    }
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

// --- DELETE Method (Delete workout by ID) ---
export async function DELETE(request: NextRequest) {
  try {
    const adminPassword = await getAdminPasswordFromEnv();
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');
    const workoutId = searchParams.get('id');

    if (providedPassword !== adminPassword) {
      return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    if (!workoutId) {
      return NextResponse.json({ message: 'Error: Workout ID is required.' }, { status: 400 });
    }

    await dbConnect();
    const result = await WorkoutModel.findByIdAndDelete(workoutId).exec();

    if (!result) {
      return NextResponse.json({ message: 'Error: Workout not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success: Workout deleted successfully.' });
  } catch (error) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}
