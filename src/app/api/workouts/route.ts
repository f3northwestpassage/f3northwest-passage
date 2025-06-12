import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { WorkoutClean } from '../../../../types/workout';
import { fetchWorkoutsData } from '../../../utils/fetchWorkoutsData';

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
    throw new Error('Server configuration error: Cannot read admin password.');
  }
}

// --- GET METHOD (unchanged) ---
export async function GET(request: NextRequest) {
  try {
    const localeAdminPassword = await getAdminPasswordFromLocale();
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');

    if (providedPassword !== localeAdminPassword) {
      return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    const workouts = await fetchWorkoutsData();
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('API GET Error fetching workouts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error: Failed to fetch workouts. ${errorMessage}` }, { status: 500 });
  }
}


// --- CORRECTED POST METHOD ---
export async function POST(request: NextRequest) {
  let localeAdminPassword: string; // Explicitly type to 'string'
  try {
    localeAdminPassword = await getAdminPasswordFromLocale();
  } catch (error: any) {
    console.error('Error in POST trying to get admin password:', error);
    // Corrected line: added closing parenthesis after 500
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const providedPassword = searchParams.get('pw');

  if (providedPassword !== localeAdminPassword) {
    return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
  }

  try {
    const workouts: WorkoutClean[] = await request.json();

    if (!Array.isArray(workouts)) {
      return NextResponse.json({ message: 'Error: Invalid data format. Expected an array of workouts.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'workouts.json');
    const jsonData = JSON.stringify(workouts, null, 2);

    fs.writeFileSync(filePath, jsonData, 'utf-8');

    return NextResponse.json({ message: 'Success: Workouts saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('API Error saving workouts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error: Failed to save workouts. ${errorMessage}` }, { status: 500 });
  }
}