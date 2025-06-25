// src/utils/fetchLocaleData.ts

// IMPORTANT: This utility function will now fetch data via your API route,
// which is the correct pattern for client-side components to get server data.
import { LocaleData } from '../../types/locale'; // Ensure this path is correct

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
  region_map_lat: "30.123", // Matches LocaleData type as string
  region_map_lon: "-90.123", // Matches LocaleData type as string
  region_map_zoom: 12,
  region_map_embed_link: "",
  region_logo_url: "/f3-muletown-white.png",
  region_hero_img_url: "/fod.png",
  region_google_form_url: "",
  region_fng_form_url: "",
};

export async function fetchLocaleData(): Promise<LocaleData> {
  // Determine the base URL for API calls.
  // In development, this is typically localhost. In production, Netlify will provide the domain.
  // NEXT_PUBLIC_SITE_URL should be set in .env.local and Netlify environment variables.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/region`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      // Force no caching at the fetch level. This is redundant if the calling
      // component (like contact/page.tsx) uses `export const dynamic = 'force-dynamic'`,
      // but it's good practice for this data fetching utility.
      cache: 'no-store', // Ensures a fresh request is made every time
    });

    if (!response.ok) {
      console.error(`Error fetching locale data from API: ${response.status} ${response.statusText}`);
      // Fallback to mock data if the API call fails
      return mockRegion;
    }

    const data: LocaleData = await response.json();

    // Ensure all properties exist, using mockRegion as fallback for any missing ones from DB.
    // This is important because the API might return a partial document if fields are new.
    return {
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
      region_map_lat: data.region_map_lat ?? mockRegion.region_map_lat,
      region_map_lon: data.region_map_lon ?? mockRegion.region_map_lon,
      region_map_zoom: data.region_map_zoom ?? mockRegion.region_map_zoom,
      region_map_embed_link: data.region_map_embed_link ?? mockRegion.region_map_embed_link,
      region_logo_url: data.region_logo_url ?? mockRegion.region_logo_url,
      region_hero_img_url: data.region_hero_img_url ?? mockRegion.region_hero_img_url,
      region_google_form_url: data.region_google_form_url ?? mockRegion.region_google_form_url,
      region_fng_form_url: data.region_fng_form_url ?? mockRegion.region_fng_form_url
    };
  } catch (error) {
    console.error('FETCH_LOCALE_DATA_ERROR (HTTP fetch error - returning mock):', error);
    // Return mockRegion if there's any network or parsing error during the fetch
    return mockRegion;
  }
}
