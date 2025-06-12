import mongoose, { Schema, Document, Model, models } from 'mongoose';

// Schema fields used in MongoDB - This remains mostly the same
interface WorkoutFields {
  ao: string;
  style: string;
  location: {
    href: string;
    text: string;
  };
  day: string;
  time: string;
  q?: string; // Optional
  avgAttendance?: string; // Optional
}

// Mongoose document type
// We extend WorkoutFields and Mongoose's Document.
// Crucially, we explicitly define _id as string here, because our transform will ensure it.
// This helps TypeScript understand the shape of the document after serialization.
interface WorkoutMongoDoc extends WorkoutFields, Document {
  _id: string; // Override Document's _id to be string for clarity and type safety
}

// Define the schema using WorkoutMongoDoc
const WorkoutSchema = new Schema<WorkoutMongoDoc>({
  ao: { type: String, required: true },
  style: { type: String, required: true }, // Based on your provided schema
  location: {
    href: { type: String },
    text: { type: String },
  },
  day: { type: String, required: true },
  time: { type: String, required: true },
  q: { type: String }, // Optional, no required: true
  avgAttendance: { type: String }, // Optional, no required: true
}, {
  timestamps: true, // Optional: Adds createdAt and updatedAt fields
  // --- ADDED TOJSON AND TOOBJECT OPTIONS ---
  toJSON: {
    virtuals: true, // If you use virtuals
    transform: (doc, ret) => {
      // Convert _id to string when document is converted to JSON
      ret._id = ret._id.toString();
      // Remove __v (version key) if you don't want it in the output
      delete ret.__v;
      return ret;
    },
  },
  toObject: { // Used by .toObject() method and .lean() queries
    virtuals: true,
    transform: (doc, ret) => {
      // Convert _id to string when document is converted to a plain object
      ret._id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  },
});

// Model
const WorkoutModel: Model<WorkoutMongoDoc> =
  models.Workout || mongoose.model<WorkoutMongoDoc>('Workout', WorkoutSchema);

// ✅ Export only what's needed for outside files
export default WorkoutModel;
export type { WorkoutFields }; // Use this for DTOs or lean() types