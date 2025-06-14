// src/models/Location.ts
import mongoose, { Schema, Document, Types } from 'mongoose'; // <-- Ensure Types is imported
import type { LocationClean } from '../../types/workout'; // Adjust path if needed

// ILocation defines the TypeScript interface for a Mongoose Document.
// It uses `Omit<LocationClean, '_id'>` to get all properties from LocationClean
// except `_id`, because `Document` already provides `_id` as an ObjectId.
export interface ILocation extends Omit<LocationClean, '_id'>, Document {
    //
}

// ILocationLean defines the TypeScript interface for a plain JavaScript object
// returned by a Mongoose .lean() query.
export interface ILocationLean extends Omit<LocationClean, '_id'> {
    // Change _id to a union type that includes the inferred FlattenMaps<unknown>
    // or simply 'any' if you want to be less strict about the intermediate type.
    // 'any' is the simplest way to tell TypeScript "I'll handle this at runtime".
    // Alternatively, you could use 'string | Types.ObjectId' and then rely on String(rawLoc._id)
    _id: Types.ObjectId | unknown; // More permissive type to match Mongoose's FlattenMaps output
    __v?: number; // Include the version key which Mongoose adds by default
}

const LocationSchema: Schema = new Schema<ILocation>({
    name: { type: String, required: true, unique: true },
    mapLink: { type: String, required: true },
    address: { type: String },
    description: { type: String },
    q: { type: String },
    embedMapLink: { type: String },
    imageUrl: { type: String },
    paxImageUrl: { type: String },
}, {
    timestamps: true,
});

// Reuse existing model if it's already defined to prevent OverwriteModelError
const LocationModel = (mongoose.models.Location ||
    mongoose.model<ILocation>('Location', LocationSchema)) as mongoose.Model<ILocation>;

export default LocationModel;
