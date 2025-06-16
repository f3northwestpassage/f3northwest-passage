import dbConnect from '@/lib/dbConnect';
import RegionModel from '@/models/F3Region';
import { LocaleData } from '../../types/locale';

type RegionLean = LocaleData & { _id?: string };

const mockRegion: LocaleData = {
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
  region_logo_url: "/f3-muletown-white.png",
  region_hero_url: "/fod.png",
};

export async function fetchLocaleData(): Promise<LocaleData> {
  try {
    await dbConnect();

    let region = await RegionModel.findOne({}).lean<RegionLean>().exec();

    if (!region) {
      console.warn('No region config found. Inserting mock region...');
      await RegionModel.create(mockRegion);
      region = await RegionModel.findOne({}).lean<RegionLean>().exec();
    }

    if (!region) {
      console.error('Fallback to mockRegion after failed insert.');
      return mockRegion;
    }

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
      region_hero_url: region.region_hero_url ?? mockRegion.region_hero_url,
    };
  } catch (error) {
    console.error('FETCH_LOCALE_DATA_ERROR:', error);
    return mockRegion;
  }
}
