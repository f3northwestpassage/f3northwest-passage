import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Workout } from '../../../utils/fetchWorkoutsData'; // Adjust path as needed

const ADMIN_PASSWORD = 'f3northwestpassageslt'; // Same password as admin page

export async function POST(request: NextRequest) {
  // Password check from URL query parameter
  const { searchParams } = new URL(request.url);
  const providedPassword = searchParams.get('pw');

  if (providedPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
  }

  try {
    const workouts: Workout[] = await request.json();

    if (!Array.isArray(workouts)) {
      return NextResponse.json({ message: 'Error: Invalid data format. Expected an array of workouts.' }, { status: 400 });
    }

    // Define the path to data/workouts.json
    // process.cwd() gives the root of the Next.js project
    const filePath = path.join(process.cwd(), 'data', 'workouts.json');

    // Convert the JavaScript array to a JSON string
    const jsonData = JSON.stringify(workouts, null, 2); // null, 2 for pretty printing

    // Write the JSON string to the file
    fs.writeFileSync(filePath, jsonData, 'utf-8');

    return NextResponse.json({ message: 'Success: Workouts saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('API Error saving workouts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error: Failed to save workouts. ${errorMessage}` }, { status: 500 });
  }
}
