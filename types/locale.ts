// types/locale.ts

export interface LocaleData {
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
}

// Optional: If you want a type for the form state specifically
export type RegionFormState = Omit<LocaleData, 'createdAt' | 'updatedAt'>;
