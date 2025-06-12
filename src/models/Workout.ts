// src/models/Workout.ts
import mongoose, { Schema, Document, Model, models } from 'mongoose';
import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed

// Mongoose document type for Workout
// Omit 'locationId' from WorkoutClean here, as we define it explicitly below as ObjectId
interface WorkoutMongoDoc extends Omit<WorkoutClean, '_id' | 'ao' | 'locationId'>, Document {
  _id: mongoose.Types.ObjectId; // Mongoose internal ObjectId
  locationId: mongoose.Types.ObjectId; // Store as ObjectId, but retrieve as string
}

const WorkoutSchema = new Schema<WorkoutMongoDoc>({
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true }, // Reference to Location model
  // ao: { type: String, required: true }, // This line was already removed
  style: { type: String, required: false },
  day: { type: String, required: true },
  time: { type: String, required: true },
  q: { type: String, required: false },
  avgAttendance: { type: String, required: false },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString(); // Convert workout _id to string
      ret.locationId = ret.locationId.toString(); // Convert locationId to string
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString(); // Convert workout _id to string
      ret.locationId = ret.locationId.toString(); // Convert locationId to string
      delete ret.__v;
      return ret;
    },
  },
});

const WorkoutModel: Model<WorkoutMongoDoc> =
  models.Workout || mongoose.model<WorkoutMongoDoc>('Workout', WorkoutSchema);

export default WorkoutModel;
