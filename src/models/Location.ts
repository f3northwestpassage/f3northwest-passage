// src/models/Location.ts
import mongoose, { Schema, Document, Model, models } from 'mongoose';
import type { LocationClean } from '../../types/workout'; // Adjust path as needed

// Mongoose document type for Location
interface LocationMongoDoc extends Omit<LocationClean, '_id'>, Document {
    _id: mongoose.Types.ObjectId; // Mongoose internal ObjectId
}

const LocationSchema = new Schema<LocationMongoDoc>({
    name: { type: String, required: true, unique: true }, // Location name (AO)
    mapLink: { type: String, required: true }, // URL to Google Maps
    address: { type: String, required: false }, // Optional physical address
    description: { type: String, required: false }, // Optional description
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret._id = ret._id.toString(); // Convert ObjectId to string
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            ret._id = ret._id.toString();
            delete ret.__v;
            return ret;
        },
    },
});

const LocationModel: Model<LocationMongoDoc> =
    models.Location || mongoose.model<LocationMongoDoc>('Location', LocationSchema);

export default LocationModel;
