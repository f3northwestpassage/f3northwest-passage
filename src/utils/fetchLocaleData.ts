// @/utils/fetchLocaleData.ts
import dbConnect from '@/lib/dbConnect';
import RegionModel from '@/models/F3Region';
import { LocaleData } from '../../types/locale'; // Ensure this path is correct and LocaleData matches the schema

type RegionLean = LocaleData & { _id?: string };

const mockRegion: LocaleData = {
  region_name: "Mock F3 Region (Fallback)", // IMPORTANT: Changed this to make it distinct
  meta_description: "This is a mock meta description for F3 Region.",
  hero_title: "Welcome to Mock F3 Region",
  hero_subtitle: "The gloom of the morning will be mocked!",
  region_city: "Mockville",
  region_state: "MS",
  region_facebook: "https://facebook.com/mockf3region",
  region_instagram: "",
  region_linkedin: "",
  region_x_twitter: "",
  region_map_lat: 30.123,
  region_map_lon: -90.123,
  region_map_zoom: 12,
  region_map_embed_link: "",
  region_logo_url: "/f3-muletown-white.png",
  region_hero_img_url: "/fod.png",
};

export async function fetchLocaleData(): Promise<LocaleData> {
  try {
    await dbConnect(); // Connect to MongoDB

    let region = await RegionModel.findOne({}).lean<RegionLean>().exec();

    if (!region) {
      console.warn('No region config found in DB. Inserting mock region...');
      try {
        await RegionModel.create(mockRegion);
        region = await RegionModel.findOne({}).lean<RegionLean>().exec(); // Try fetching again after insert
        if (!region) {
          console.error('Failed to fetch mock region after insertion. Returning hardcoded mock.');
          return mockRegion; // Fallback if re-fetch also fails
        }
      } catch (insertError) {
        console.error('Error inserting mock region:', insertError);
        return mockRegion; // Return mock if insert itself fails
      }
    }

    // Ensure all properties exist, using mockRegion as fallback for any missing ones
    return {
      region_name: region.region_name ?? mockRegion.region_name,
      meta_description: region.meta_description ?? mockRegion.meta_description,
      hero_title: region.hero_title ?? mockRegion.hero_title,
      hero_subtitle: region.hero_subtitle ?? mockRegion.hero_subtitle,
      region_city: region.region_city ?? mockRegion.region_city,
      region_state: region.region_state ?? mockRegion.region_state,
      region_facebook: region.region_facebook ?? mockRegion.region_facebook,
      region_instagram: region.region_instagram ?? mockRegion.region_instagram,
      region_linkedin: region.region_linkedin ?? mockRegion.region_linkedin,
      region_x_twitter: region.region_x_twitter ?? mockRegion.region_x_twitter,
      region_map_lat: region.region_map_lat ?? mockRegion.region_map_lat,
      region_map_lon: region.region_map_lon ?? mockRegion.region_map_lon,
      region_map_zoom: region.region_map_zoom ?? mockRegion.region_map_zoom,
      region_map_embed_link: region.region_map_embed_link ?? mockRegion.region_map_embed_link,
      region_logo_url: region.region_logo_url ?? mockRegion.region_logo_url,
      region_hero_img_url: region.region_hero_img_url ?? mockRegion.region_hero_img_url,
    };
  } catch (error) {
    console.error('FETCH_LOCALE_DATA_ERROR (catch block):', error);
    return mockRegion; // Always return mockRegion on any error
  }
}
