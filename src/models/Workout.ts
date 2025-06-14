// src/models/Workout.ts
import mongoose, { Schema, Document, Model, models } from 'mongoose';
import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed

// Mongoose document type for Workout
// Omit '_id', 'locationId', and 'ao' from WorkoutClean here, as we define them explicitly below for Mongoose.
// Also, OMIT 'q' and 'avgAttendance' from WorkoutClean in the interface as they were removed there.
// If 'q' and 'avgAttendance' are truly *only* on the Workout *model* (and not part of WorkoutClean's expected shape),
// then we add them back here explicitly.
interface WorkoutMongoDoc extends Omit<WorkoutClean, '_id' | 'ao' | 'locationId' | 'startTime' | 'endTime' | 'days' | 'types'>, Document {
  _id: mongoose.Types.ObjectId; // Mongoose internal ObjectId
  locationId: mongoose.Types.ObjectId; // Store as ObjectId, but retrieve as string

  // New fields matching WorkoutClean
  startTime: string;    // Stored as string (e.g., "05:30")
  endTime: string;      // Stored as string (e.g., "06:30")
  days: string[];       // Stored as array of strings (e.g., ['Monday', 'Wednesday'])
  types: string[];      // Stored as array of strings (e.g., ['Bootcamp', 'Ruck'])

  // Re-introducing 'q' and 'avgAttendance' if they are only for the backend model's internal use
  // or derived/calculated properties, and not directly from the frontend's WorkoutClean data.
  // Based on current understanding, 'q' is now on LocationClean, so we are REMOVING it from WorkoutMongoDoc.
  // If you meant for avgAttendance to be a backend-calculated/stored field only, keep it.
  avgAttendance?: number; // Keep avgAttendance as number, if still desired on the backend
}

const WorkoutSchema = new Schema<WorkoutMongoDoc>({
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true }, // Reference to Location model

  // Updated fields to match WorkoutClean
  startTime: { type: String, required: true }, // Changed from 'time'
  endTime: { type: String, required: true },   // New field for end time
  days: [{ type: String, required: true }],    // Changed from 'day' to 'days' (array of strings)
  types: [{ type: String, required: true }],   // Changed from 'style' to 'types' (array of strings)

  // Removed 'q' field as it's now part of LocationClean
  avgAttendance: { type: Number, required: false }, // Retained as number, if still desired for backend storage
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString(); // Convert workout _id to string
      ret.locationId = ret.locationId.toString(); // Convert locationId to string
      // Frontend expects 'ao' to be derived/populated, not directly stored,
      // so it's not explicitly deleted here.
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString(); // Convert workout _id to string
      ret.locationId = ret.locationId.toString(); // Convert locationId to string
      // As above for 'ao'
      delete ret.__v;
      return ret;
    },
  },
});

const WorkoutModel: Model<WorkoutMongoDoc> =
  models.Workout || mongoose.model<WorkoutMongoDoc>('Workout', WorkoutSchema);

export default WorkoutModel;
