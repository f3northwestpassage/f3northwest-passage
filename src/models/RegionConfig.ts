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
    region_name: { type: String, required: false },
    meta_description: { type: String, required: false },
    hero_title: { type: String, required: false },
    hero_subtitle: { type: String, required: false },
    region_city: { type: String, required: false },
    region_state: { type: String, required: false },
    region_facebook: { type: String, required: false },
    region_instagram: { type: String, required: false },
    region_linkedin: { type: String, required: false },
    region_x_twitter: { type: String, required: false },
    region_map_lat: { type: Number, required: false },
    region_map_lon: { type: Number, required: false },
    region_map_zoom: { type: Number, required: false },
    region_map_embed_link: { type: String, required: false },
});

const RegionModel: Model<IRegionConfig> =
    mongoose.models['RegionConfig'] || mongoose.model<IRegionConfig>('RegionConfig', RegionConfigSchema);

export default RegionModel;
