// src/models/Workout.ts
import mongoose, { Schema, Document, Model, models } from 'mongoose';
import type { WorkoutClean } from '../../types/workout'; // Adjust path as needed

// Define the Mongoose document interface
// We OMIT '_id' and 'locationId' from WorkoutClean because we want to define them
// with Mongoose's specific ObjectId type for the database model.
interface WorkoutMongoDoc extends Omit<WorkoutClean, '_id' | 'locationId'>, Document {
  _id: mongoose.Types.ObjectId; // Mongoose internal ObjectId
  locationId: mongoose.Types.ObjectId; // Store as ObjectId in DB
}

const WorkoutSchema = new Schema<WorkoutMongoDoc>({
  // Mongoose will automatically handle the creation of `_id`
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location', // This creates a reference to your 'Location' model
    required: true,
  },

  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  days: [{ type: String, required: true }],
  types: [{ type: String, required: true }],

  comments: { type: String, required: false },
  frequencyPrefix: { type: String, required: false },

}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // Convert ObjectIds to strings for frontend consumption
      ret._id = ret._id.toString();
      ret.locationId = ret.locationId.toString();

      // Ensure that 'ao' (or other virtuals/populated fields) are handled
      // if you have them in your Workout schema or will populate them.

      delete ret.__v; // Remove the Mongoose version key
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      // Convert ObjectIds to strings for frontend consumption
      ret._id = ret._id.toString();
      ret.locationId = ret.locationId.toString();

      delete ret.__v; // Remove the Mongoose version key
      return ret;
    },
  },
});

// Create and export the Mongoose model
const WorkoutModel: Model<WorkoutMongoDoc> =
  models.Workout || mongoose.model<WorkoutMongoDoc>('Workout', WorkoutSchema);

export default WorkoutModel;
