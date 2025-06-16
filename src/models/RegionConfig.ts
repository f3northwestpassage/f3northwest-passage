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
    region_facebook: string; // Stored as a URL string
    region_instagram?: string; // NEW: Optional Instagram URL
    region_linkedin?: string;  // NEW: Optional LinkedIn URL
    region_x_twitter?: string; // NEW: Optional X (Twitter) URL
    region_map_lat: number;
    region_map_lon: number;
    region_map_zoom: number;
    region_map_embed_link?: string; // Optional field for an embeddable map URL
    createdAt?: Date; // Mongoose timestamps
    updatedAt?: Date; // Mongoose timestamps
}

// Define the Mongoose Schema for the RegionConfig
const RegionConfigSchema: Schema<IRegionConfig> = new Schema({
    region_name: { type: String, required: true, trim: true },
    meta_description: { type: String, required: true, trim: true },
    hero_title: { type: String, required: true, trim: true },
    hero_subtitle: { type: String, required: true, trim: true },
    pax_count: { type: Number, required: true, min: 0 }, // Ensure non-negative
    region_city: { type: String, required: true, trim: true },
    region_state: { type: String, required: true, trim: true },
    region_facebook: { type: String, required: true, trim: true }, // Stored as string
    region_instagram: { type: String, trim: true, default: '' }, // NEW: Instagram field with default
    region_linkedin: { type: String, trim: true, default: '' },  // NEW: LinkedIn field with default
    region_x_twitter: { type: String, trim: true, default: '' }, // NEW: X (Twitter) field with default
    region_map_lat: { type: Number, required: true },
    region_map_lon: { type: Number, required: true },
    region_map_zoom: { type: Number, required: true, min: 0, max: 20 }, // Typical map zoom range
    region_map_embed_link: { type: String, trim: true }, // Optional
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export the Mongoose Model.
// This checks if the model already exists to prevent redefinition issues
// that can occur in Next.js development mode due to hot reloading.
const RegionConfig = (mongoose.models.RegionConfig as Model<IRegionConfig>) || mongoose.model<IRegionConfig>('RegionConfig', RegionConfigSchema);

export default RegionConfig;
