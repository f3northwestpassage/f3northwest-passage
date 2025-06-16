// src/models/RegionConfig.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for a RegionConfig Document in Mongoose.
export interface IRegionConfig extends Document {
    region_name: string;
    meta_description: string;
    hero_title: string;
    hero_subtitle: string;
    pax_count: number;
    region_city: string;
    region_state: string;
    region_facebook: string;
    region_instagram?: string;
    region_linkedin?: string;
    region_x_twitter?: string;
    region_map_lat: number;
    region_map_lon: number;
    region_map_zoom: number;
    region_map_embed_link?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Create the Mongoose schema using the interface
const RegionConfigSchema = new Schema<IRegionConfig>(
    {
        region_name: { type: String, required: true, trim: true },
        meta_description: { type: String, required: true, trim: true },
        hero_title: { type: String, required: true, trim: true },
        hero_subtitle: { type: String, required: true, trim: true },
        pax_count: { type: Number, required: true, min: 0 },
        region_city: { type: String, required: true, trim: true },
        region_state: { type: String, required: true, trim: true },
        region_facebook: { type: String, required: true, trim: true },
        region_instagram: { type: String, trim: true, default: '' },
        region_linkedin: { type: String, trim: true, default: '' },
        region_x_twitter: { type: String, trim: true, default: '' },
        region_map_lat: { type: Number, required: true },
        region_map_lon: { type: Number, required: true },
        region_map_zoom: { type: Number, required: true, min: 0, max: 20 },
        region_map_embed_link: { type: String, trim: true, default: '' },
    },
    {
        timestamps: true,
    }
);

// Export the Mongoose model
const RegionConfig: Model<IRegionConfig> =
    mongoose.models.RegionConfig || mongoose.model<IRegionConfig>('RegionConfig', RegionConfigSchema);

export default RegionConfig;
