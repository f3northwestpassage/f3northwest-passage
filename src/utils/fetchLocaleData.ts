// src/utils/fetchLocaleData.ts

// Define the interface for the data you expect from your database.
// This should match the schema you designed for your 'regionConfigs' collection/table.
interface LocaleData {
  _id?: string; // MongoDB's default ID field, optional as you might not always use it
  region_name: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  pax_count: number;
  region_city: string;
  region_state: string;
  region_facebook: string; // URL as a string
  region_map_lat: number;
  region_map_lon: number;
  region_map_zoom: number;
  region_map_embed_link?: string; // Optional field for an embeddable map URL
  // Add any other fields you plan to store in your database for locale data
}

export async function fetchLocaleData(): Promise<LocaleData> {
  try {
    // Construct the API endpoint URL using the environment variable.
    // This will hit your new API route that pulls data from your database.
    const apiURL = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/region`;

    const response = await fetch(apiURL, {
      // Use 'no-store' cache control to ensure you always get the latest data from the DB.
      // If this data doesn't change frequently and you want better performance,
      // you could consider 'force-cache' or Next.js's revalidate option.
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch locale data from API:', response.status, response.statusText);
      // Throw an error to be caught by the calling component/page,
      // which can then handle displaying a fallback or error message.
      throw new Error('Failed to fetch region configuration data.');
    }

    const data: LocaleData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching locale data:', error);
    // Re-throw the error so it can be handled upstream (e.g., in `page.tsx` during SSR/SSG)
    throw error;
  }
}
