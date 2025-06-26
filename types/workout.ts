// types/workout.ts

export type LocationClean = {
    _id: string;
    name: string;
    mapLink: string;
    address: string;
    description: string;
    q: string;
    embedMapLink: string;
    imageUrl: string;
    paxImageUrl: string;
};

export type WorkoutClean = {
    _id?: string; // Optional for new workouts
    locationId: string; // ID of the associated location
    ao?: string; // Populated from Location.name on fetch, not directly stored
    startTime: string;
    endTime: string;
    days: string[];
    types: string[];
    avgAttendance?: number;
    frequencyPrefix?: string; // e.g., "Every", "1st Saturday", "2nd and 4th Tuesday"
    comments?: string; // e.g., "Bring coupons", "Child friendly"
};

export type RegionFormState = {
    region_name?: string; // Made optional
    meta_description?: string; // Made optional
    hero_title?: string; // Made optional
    hero_subtitle?: string; // Made optional
    region_logo_url?: string;
    region_hero_img_url?: string;
    region_city?: string; // Made optional
    region_state?: string; // Made optional
    region_facebook?: string; // Made optional
    region_map_lat?: number; // Made optional
    region_map_lon?: number; // Made optional
    region_map_zoom?: number; // Made optional
    region_map_embed_link?: string; // Made optional
    region_google_form_url?: string;
    region_fng_form_url?: string;
    region_instagram?: string;
    region_linkedin?: string;
    region_x_twitter?: string;
};

export type LocaleData = {
    _id?: string;
    region_name?: string;
    meta_description?: string;
    hero_title?: string;
    hero_subtitle?: string;
    region_logo_url?: string;
    region_hero_img_url?: string;
    region_city?: string;
    region_state?: string;
    region_facebook?: string;
    region_map_lat?: number;
    region_map_lon?: number;
    region_map_zoom?: number;
    region_map_embed_link?: string;
    region_google_form_url?: string;
    region_fng_form_url?: string;
    region_instagram?: string;
    region_linkedin?: string;
    region_x_twitter?: string;
};
