// src/utils/fetchLocaleData.ts

interface LocaleData {
  _id?: string;
  region_name: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  pax_count?: number;
  region_city: string;
  region_state: string;
  region_facebook: string;
  region_map_lat: number;
  region_map_lon: number;
  region_map_zoom: number;
  region_map_embed_link?: string;
  region_instagram?: string;
  region_linkedin?: string;
  region_x_twitter?: string;
}

export async function fetchLocaleData(): Promise<LocaleData> {
  try {
    let apiURL: string;
    // Check if we are in a Vercel/Netlify build environment or development
    // During build/SSR, Next.js can resolve relative paths.
    // In local development, fetch requires a full URL.
    if (process.env.NODE_ENV === 'development') {
      // In development, explicitly use localhost
      // Ensure your local dev server runs on 3000, or adjust this port
      apiURL = `http://localhost:3000/api/region`;
    } else {
      // In production/build environment, use relative path if possible for internal APIs,
      // or rely on NEXT_PUBLIC_BASE_URL if it's an external API or needed for clarity.
      // For internal API routes, a relative path is generally preferred for SSR/SSG.
      // If deployed environment's hostname is needed, Netlify provides process.env.URL or process.env.DEPLOY_URL
      // But for YOUR OWN API routes, relative is often best practice during build.
      apiURL = `/api/region'`;
    }

    const response = await fetch(apiURL, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch locale data from API:', response.status, response.statusText);
      throw new Error('Failed to fetch region configuration data.');
    }

    const data: LocaleData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching locale data:', error);
    throw error;
  }
}
