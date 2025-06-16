import dbConnect from '@/lib/dbConnect';
import RegionModel, { IRegion } from '@/models/Region';
import { LocaleData } from '../../types/locale';

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
};

export async function fetchLocaleData(): Promise<LocaleData> {
  try {
    await dbConnect();

    let region = await RegionModel.findOne({}).lean<IRegion>().exec();

    if (!region) {
      console.warn('No region config found. Inserting mock region...');
      const created = await RegionModel.create(mockRegion);
      region = created.toObject(); // Convert Mongoose doc to plain object
    }

    return {
      region_name: region?.region_name ?? 'F3 Default Region',
      meta_description: region?.meta_description ?? '',
      hero_title: region?.hero_title ?? '',
      hero_subtitle: region?.hero_subtitle ?? '',
      region_city: region?.region_city ?? '',
      region_state: region?.region_state ?? '',
      region_facebook: region?.region_facebook ?? '',
      region_instagram: region?.region_instagram ?? '',
      region_linkedin: region?.region_linkedin ?? '',
      region_x_twitter: region?.region_x_twitter ?? '',
      region_map_lat: region?.region_map_lat ?? 0,
      region_map_lon: region?.region_map_lon ?? 0,
      region_map_zoom: region?.region_map_zoom ?? 12,
      region_map_embed_link: region?.region_map_embed_link ?? '',
    };
  } catch (error) {
    console.error('FETCH_LOCALE_DATA_ERROR:', error);
    throw new Error('Failed to load region configuration.');
  }
}
