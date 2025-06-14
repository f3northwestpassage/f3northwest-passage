// types/locale.ts

// LocaleData should include _id as it comes from the database
export type LocaleData = {
    _id?: string; // Add this line: _id is a string (after .toString()) and optional
    region_name: string;
    meta_description: string;
    hero_title: string;
    hero_subtitle: string;
    region_city: string;
    region_state: string;
    region_facebook: string;
    region_map_lat: number;
    region_map_lon: number;
    region_map_zoom: number;
    region_map_embed_link: string;
    region_instagram: string;
    region_linkedin: string;
    region_x_twitter: string;
    // Add other properties here if your locale data expands
};

// RegionFormState should NOT include _id because it's for form input (before DB assignment)
// Using Omit<LocaleData, '_id'> is a clean way to define it based on LocaleData
export type RegionFormState = Omit<LocaleData, '_id'>;
