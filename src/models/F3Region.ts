import mongoose, { Schema, model, Model, Document } from 'mongoose';

export interface IF3Region extends Document {
    region_name?: string;
    meta_description?: string;
    hero_title?: string;
    hero_subtitle?: string;
    region_city?: string;
    region_state?: string;
    region_facebook?: string;
    region_instagram?: string;
    region_linkedin?: string;
    region_x_twitter?: string;
    region_map_lat?: number;
    region_map_lon?: number;
    region_map_zoom?: number;
    region_map_embed_link?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const F3RegionSchema = new Schema<IF3Region>({
    region_name: String,
    meta_description: String,
    hero_title: String,
    hero_subtitle: String,
    region_city: String,
    region_state: String,
    region_facebook: String,
    region_instagram: String,
    region_linkedin: String,
    region_x_twitter: String,
    region_map_lat: Number,
    region_map_lon: Number,
    region_map_zoom: Number,
    region_map_embed_link: String,
}, { timestamps: true });

// ✅ Only use full path `mongoose.models` and `mongoose.model`
const RegionModel: Model<IF3Region> =
    (mongoose.models && mongoose.models.F3Region)
        ? mongoose.models.F3Region as Model<IF3Region>
        : mongoose.model<IF3Region>('F3Region', F3RegionSchema);

export default RegionModel;
