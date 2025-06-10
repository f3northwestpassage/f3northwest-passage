import mongoose, { Schema, Document, models } from 'mongoose';

// Interface for the Location subdocument
interface ILocation {
  href: string;
  text: string;
}

// Interface for the Workout document (can extend Mongoose Document)
// This should match the structure used in your application,
// e.g., from src/utils/fetchWorkoutsData.ts or a shared types file.
export interface IWorkout extends Document {
  ao: string;
  style: string;
  location: ILocation;
  day: string;
  time: string;
  q?: string; // Optional field
  avgAttendance?: string; // Optional field
}

// Schema for the Location subdocument
const LocationSchema: Schema<ILocation> = new Schema({
  href: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false }); // _id: false because it's a subdocument

// Schema for the Workout document
const WorkoutSchema: Schema<IWorkout> = new Schema({
  ao: { type: String, required: true },
  style: { type: String, required: true },
  location: { type: LocationSchema, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  q: { type: String, required: false },
  avgAttendance: { type: String, required: false },
});

// Create and export the Mongoose model
// The third argument (collection name) is optional, Mongoose will infer it (e.g., 'workouts')
// Using `models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema)`
// is a common pattern in Next.js to prevent redefining the model on hot reloads.
const WorkoutModel = models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default WorkoutModel;
