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
    region_map_lat?: string;
    region_map_lon?: string;
    region_map_zoom?: number;
    region_map_embed_link?: string;
    region_logo_url?: string;
    region_hero_img_url?: string;
    region_google_form_url?: string,
    region_fng_form_url?: string,
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
    region_map_lat: String,
    region_map_lon: String,
    region_map_zoom: Number,
    region_map_embed_link: String,
    region_logo_url: String,
    region_hero_img_url: String,
    region_google_form_url: String,
    region_fng_form_url: String,
}, { timestamps: true });

const RegionModel: Model<IF3Region> =
    (mongoose.models && mongoose.models.F3Region)
        ? mongoose.models.F3Region as Model<IF3Region>
        : mongoose.model<IF3Region>('F3Region', F3RegionSchema);

export default RegionModel;
