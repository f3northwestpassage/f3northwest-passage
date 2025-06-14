// models/Region.ts
import mongoose, { Schema, Document } from 'mongoose';
import type { LocaleData } from '../../types/locale'; // Assuming this path is correct

// Define an interface for the actual data properties that will be stored in MongoDB,
// EXCLUDING the _id and Mongoose-specific fields like timestamps,
// because `Document` will provide _id and `timestamps: true` handles createdAt/updatedAt.
// We can use Omit<LocaleData, '_id'> to get all fields from LocaleData except _id.
interface IRegion extends Omit<LocaleData, '_id'>, Document {
    // Mongoose's `Document` already provides the `_id` field (as ObjectId).
    // No need to redeclare it here or in LocaleData for the Mongoose interface.
    // LocaleData will still have _id? for client-side representation.
}

const RegionSchema: Schema = new Schema<IRegion>({
    region_name: { type: String, default: '' },
    meta_description: { type: String, default: '' },
    hero_title: { type: String, default: '' },
    hero_subtitle: { type: String, default: '' },
    region_city: { type: String, default: '' },
    region_state: { type: String, default: '' },
    region_facebook: { type: String, default: '' },
    region_map_lat: { type: Number, default: 0 },
    region_map_lon: { type: Number, default: 0 },
    region_map_zoom: { type: Number, default: 12 },
    region_map_embed_link: { type: String, default: '' },
    region_instagram: { type: String, default: '' },
    region_linkedin: { type: String, default: '' },
    region_x_twitter: { type: String, default: '' },
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically by Mongoose
});

const RegionModel = (mongoose.models.Region ||
    mongoose.model<IRegion>('Region', RegionSchema)) as mongoose.Model<IRegion>;

export default RegionModel;
