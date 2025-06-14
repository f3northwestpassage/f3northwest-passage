// src/utils/fetchLocaleData.ts

// Define the interface for the data you expect from your database.
// This should match the schema you designed for your 'regionConfigs' collection/table.
export interface LocaleData {
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
  if (process.env.MOCK_DATA === 'true') {
    console.log('FETCH_LOCALE_DATA_DEBUG: MOCK_DATA is true, returning mock locale data directly.');
    return {
      region_name: "Mock F3 Region",
      meta_description: "This is a mock meta description for F3 Region.",
      hero_title: "Welcome to Mock F3 Region",
      hero_subtitle: "The gloom of the morning will be mocked!",
      pax_count: 123,
      region_city: "Mockville",
      region_state: "MS",
      region_facebook: "https://facebook.com/mockf3region",
      region_map_lat: 30.123,
      region_map_lon: -90.123,
      region_map_zoom: 12,
      region_map_embed_link: "",
    };
  }

  try {
    // Construct the API endpoint URL using the environment variable.
    // NEXT_PUBLIC_BASE_URL must be defined locally (.env.local) and on Netlify.
    // This will hit your API route that pulls data from your database.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // IMPORTANT: Ensure baseUrl is defined for production builds
    if (!baseUrl) {
      // This error will crash the build if NEXT_PUBLIC_BASE_URL is not set,
      // which is intended to prevent broken deployments.
      throw new Error('NEXT_PUBLIC_BASE_URL is not defined. Please set it in your environment variables.');
    }

    const apiURL = `${baseUrl}/api/region`;

    const response = await fetch(apiURL, {
      // Using 'no-store' ensures fresh data on every request (during build and runtime).
      // If this data doesn't change frequently and you want better performance,
      // consider 'force-cache' or Next.js's 'next.revalidate' option to cache data.
      cache: 'no-store',
      // You can add revalidate here for ISR (Incremental Static Regeneration)
      // next: { revalidate: 3600 }, // Example: revalidate data every 3600 seconds (1 hour)
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch locale data from API: ${response.status} ${response.statusText}`
      );
      // Throw a specific error that can be caught by the calling component/page.
      throw new Error(`Failed to fetch region configuration data. Status: ${response.status}`);
    }

    const data: LocaleData = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchLocaleData:', error);
    // Re-throw the error to ensure it propagates up the call stack,
    // allowing the calling page or component to handle the failure.
    throw error;
  }
}
