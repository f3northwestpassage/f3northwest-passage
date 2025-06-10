import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Workout } from '../../../utils/fetchWorkoutsData'; // Adjust path as needed

// const ADMIN_PASSWORD = 'f3northwestpassageslt'; // REMOVE THIS LINE

export async function POST(request: NextRequest) {
  let localeAdminPassword;
  try {
    const localeFilePath = path.join(process.cwd(), 'src', 'locales', 'en.json');
    const fileContents = fs.readFileSync(localeFilePath, 'utf-8');
    const localeData = JSON.parse(fileContents);
    localeAdminPassword = localeData.admin_password;

    if (!localeAdminPassword) {
      console.error('Admin password not found in src/locales/en.json or is empty.');
      return NextResponse.json({ message: 'Error: Server configuration error (admin password missing).' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error reading or parsing src/locales/en.json for admin password:', error);
    return NextResponse.json({ message: 'Error: Server configuration error (cannot read admin password).' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const providedPassword = searchParams.get('pw');

  if (providedPassword !== localeAdminPassword) { // COMPARE WITH PASSWORD FROM JSON
    return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
  }

  // ... (rest of the try-catch block for saving workouts remains the same)
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
