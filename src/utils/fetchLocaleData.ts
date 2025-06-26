// src/utils/fetchLocaleData.ts

import type { LocaleData } from '../../types/workout'; // Adjust path if necessary

const mockRegion: LocaleData = {
  region_name: "Mock F3 Region (Fallback)",
  meta_description: "This is a mock meta description for F3 Region.",
  hero_title: "Welcome to Mock F3 Region",
  hero_subtitle: "The gloom of the morning will be mocked!",
  region_city: "Mockville",
  region_state: "MS",
  region_facebook: "https://facebook.com/mockf3region",
  region_instagram: "",
  region_linkedin: "",
  region_x_twitter: "",
  region_map_lat: 30.123, // Changed to number for consistency with type definition
  region_map_lon: -90.123, // Changed to number for consistency with type definition
  region_map_zoom: 12,
  region_map_embed_link: "",
  region_logo_url: "/f3-muletown-white.png",
  region_hero_img_url: "/fod.png",
  region_google_form_url: "", // Default to empty string for the mock
  region_fng_form_url: "", // Default to empty string for the mock
};

export async function fetchLocaleData(): Promise<LocaleData> {
  let apiUrl: string;

  // Determine if running on client (browser) or server (Node.js)
  if (typeof window !== 'undefined') {
    // Client-side: Use a relative path to leverage next.config.js rewrites
    apiUrl = '/api/region';
    console.log(`[fetchLocaleData] Client-side fetch: ${apiUrl} (will use rewrites)`);
  } else {
    // Server-side: Use an absolute URL for direct Node.js fetch
    // NEXT_PUBLIC_BASE_URL should be set in your .env.local and production env
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    apiUrl = `${baseUrl}/api/region`;
    console.log(`[fetchLocaleData] Server-side fetch: ${apiUrl} (absolute path)`);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store', // Ensures a fresh request is made every time
    });

    if (!response.ok) {
      console.error(`[fetchLocaleData] API fetch error: Status ${response.status} - ${response.statusText} for ${apiUrl}`);
      // Fallback to mock data if the API call fails
      return mockRegion;
    }

    const data: LocaleData = await response.json();

    // Ensure all properties exist, using mockRegion as fallback for any missing ones from DB.
    return {
      _id: data._id, // Keep _id if available
      region_name: data.region_name ?? mockRegion.region_name,
      meta_description: data.meta_description ?? mockRegion.meta_description,
      hero_title: data.hero_title ?? mockRegion.hero_title,
      hero_subtitle: data.hero_subtitle ?? mockRegion.hero_subtitle,
      region_city: data.region_city ?? mockRegion.region_city,
      region_state: data.region_state ?? mockRegion.region_state,
      region_facebook: data.region_facebook ?? mockRegion.region_facebook,
      region_instagram: data.region_instagram ?? mockRegion.region_instagram,
      region_linkedin: data.region_linkedin ?? mockRegion.region_linkedin,
      region_x_twitter: data.region_x_twitter ?? mockRegion.region_x_twitter,
      // Convert map_lat/lon to numbers if they come as strings, ensure fallback is number
      region_map_lat: (typeof data.region_map_lat === 'string' ? parseFloat(data.region_map_lat) : data.region_map_lat) ?? mockRegion.region_map_lat,
      region_map_lon: (typeof data.region_map_lon === 'string' ? parseFloat(data.region_map_lon) : data.region_map_lon) ?? mockRegion.region_map_lon,
      region_map_zoom: data.region_map_zoom ?? mockRegion.region_map_zoom,
      region_map_embed_link: data.region_map_embed_link ?? mockRegion.region_map_embed_link,
      region_logo_url: data.region_logo_url ?? mockRegion.region_logo_url,
      region_hero_img_url: data.region_hero_img_url ?? mockRegion.region_hero_img_url,
      region_google_form_url: data.region_google_form_url ?? mockRegion.region_google_form_url,
      region_fng_form_url: data.region_fng_form_url ?? mockRegion.region_fng_form_url,
    };
  } catch (error) {
    console.error(`[fetchLocaleData] FETCH_LOCALE_DATA_ERROR for ${apiUrl} (returning mock):`, error);
    // Return mockRegion if there's any network or parsing error during the fetch
    return mockRegion;
  }
}
