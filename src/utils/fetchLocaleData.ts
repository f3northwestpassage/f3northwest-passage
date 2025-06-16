import dbConnect from '@/lib/dbConnect';
import RegionModel from '@/models/RegionConfig';
import { LocaleData } from '../../types/locale';

export async function fetchLocaleData(): Promise<LocaleData> {
  // Handle mock mode for development or testing
  if (process.env.MOCK_DATA === 'true') {
    console.log('FETCH_LOCALE_DATA_DEBUG: MOCK_DATA is true, returning mock locale data.');
    return {
      region_name: "Mock F3 Region",
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
    };
  }

  try {
    await dbConnect();

    const rawRegionData = await RegionModel.findOne({}).lean().exec();

    if (!rawRegionData) {
      console.warn("No region config found. Falling back to mock data.");
      return {
        region_name: "Mock F3 Region",
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
      };
    }

    // Normalize and fill missing fields
    const localeData: LocaleData = {
      region_name: rawRegionData.region_name || 'F3 Default Region',
      meta_description: rawRegionData.meta_description || 'Default meta description for F3 Region.',
      hero_title: rawRegionData.hero_title || 'Welcome to F3',
      hero_subtitle: rawRegionData.hero_subtitle || 'Default subtitle.',
      region_city: rawRegionData.region_city || 'Your City',
      region_state: rawRegionData.region_state || 'Your State',
      region_facebook: rawRegionData.region_facebook || '',
      region_instagram: rawRegionData.region_instagram || '',
      region_linkedin: rawRegionData.region_linkedin || '',
      region_x_twitter: rawRegionData.region_x_twitter || '',
      region_map_lat: rawRegionData.region_map_lat || 0,
      region_map_lon: rawRegionData.region_map_lon || 0,
      region_map_zoom: rawRegionData.region_map_zoom || 12,
      region_map_embed_link: rawRegionData.region_map_embed_link || '',
    };

    return localeData;
  } catch (error) {
    console.error("FETCH_LOCALE_DATA_ERROR:", error);
    throw new Error(`Failed to fetch region data from DB: ${error instanceof Error ? error.message : String(error)}`);
  }
}
