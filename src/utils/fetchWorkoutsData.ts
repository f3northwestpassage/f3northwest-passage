import dbConnect from '../lib/dbConnect';
import WorkoutModel, { IWorkout } from '../models/Workout'; // IWorkout is the Mongoose document interface

// Re-define or ensure the Workout type/interface for the return value if needed,
// or use IWorkout directly if it's compatible with what frontend components expect.
// For consistency, let's assume the frontend expects objects matching the IWorkout structure
// but as plain objects.

export interface WorkoutClean { // This will be the structure returned to the client
  _id?: string; // MongoDB _id, optional if you transform it or don't need it on client
  ao: string;
  style: string;
  location: {
    href: string;
    text: string;
  };
  day: string;
  time: string;
  q?: string;
  avgAttendance?: string;
}

export async function fetchWorkoutsData(): Promise<WorkoutClean[]> {
  await dbConnect(); // Ensure database connection

  try {
    // Fetch all workouts and convert Mongoose documents to plain JavaScript objects using .lean()
    // Also, explicitly select fields to match WorkoutClean, including _id as a string
    const workoutsFromDB: IWorkout[] = await WorkoutModel.find({}).exec();

    // Map to ensure the structure, especially _id conversion
    const cleanedWorkouts: WorkoutClean[] = workoutsFromDB.map(doc => ({
      _id: doc._id?.toString(), // Convert ObjectId to string
      ao: doc.ao,
      style: doc.style,
      location: { // Ensure location is plain object if it wasn't due to .lean() on subdocs
        href: doc.location.href,
        text: doc.location.text,
      },
      day: doc.day,
      time: doc.time,
      q: doc.q,
      avgAttendance: doc.avgAttendance,
    }));

    // console.log('Fetched workouts from DB:', cleanedWorkouts);
    return cleanedWorkouts;

  } catch (error) {
    console.error('Error fetching workouts from MongoDB:', error);
    return []; // Return an empty array in case of an error
  }
}
