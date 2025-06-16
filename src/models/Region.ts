import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegion extends Document {
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
}

const RegionSchema = new Schema<IRegion>({
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

// IMPORTANT: specify the exact collection name as 'region' if your MongoDB uses that
const RegionModel: Model<IRegion> =
    mongoose.models.Region || mongoose.model<IRegion>('Region', RegionSchema, 'region');

export default RegionModel;
