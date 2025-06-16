import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegionConfig extends Document {
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

const RegionConfigSchema = new Schema<IRegionConfig>({
    region_name: { type: String },
    meta_description: { type: String },
    hero_title: { type: String },
    hero_subtitle: { type: String },
    region_city: { type: String },
    region_state: { type: String },
    region_facebook: { type: String },
    region_instagram: { type: String },
    region_linkedin: { type: String },
    region_x_twitter: { type: String },
    region_map_lat: { type: Number },
    region_map_lon: { type: Number },
    region_map_zoom: { type: Number },
    region_map_embed_link: { type: String },
});

const RegionModel: Model<IRegionConfig> =
    mongoose.models['RegionConfig'] || mongoose.model<IRegionConfig>('RegionConfig', RegionConfigSchema);

export default RegionModel;
