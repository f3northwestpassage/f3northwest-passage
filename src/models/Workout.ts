import mongoose, { Schema, Document, Model, models } from 'mongoose';

// Schema fields used in MongoDB
interface WorkoutFields {
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

// Mongoose document type (not exported to avoid naming conflicts)
interface WorkoutMongoDoc extends WorkoutFields, Document { }

// Define the schema using WorkoutMongoDoc
const WorkoutSchema = new Schema<WorkoutMongoDoc>({
  ao: { type: String, required: true },
  style: { type: String, required: true },
  location: {
    href: { type: String, required: true },
    text: { type: String, required: true },
  },
  day: { type: String, required: true },
  time: { type: String, required: true },
  q: { type: String },
  avgAttendance: { type: String },
});

// Model
const WorkoutModel: Model<WorkoutMongoDoc> =
  models.Workout || mongoose.model<WorkoutMongoDoc>('Workout', WorkoutSchema);

// ✅ Export only what's needed for outside files
export default WorkoutModel;
export type { WorkoutFields }; // Use this for DTOs or lean() types