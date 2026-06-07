import { z } from 'zod';

export const locationSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Location name is required'),
  mapLink: z
    .string()
    .url('Map link must be a valid URL')
    .or(z.literal(''))
    .default(''),
  address: z.string().default(''),
  description: z.string().default(''),
  q: z.string().default(''),
  embedMapLink: z.string().default(''),
  imageUrl: z.string().default(''),
  paxImageUrl: z.string().default(''),
});

export const locationUpdateSchema = locationSchema.extend({
  _id: z.string().min(1, '_id is required for updates'),
});

export const workoutSchema = z.object({
  _id: z.string().optional(),
  locationId: z.string().min(1, 'Location ID is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().default(''),
  days: z.array(z.string()).min(1, 'At least one day is required'),
  types: z.array(z.string()).min(1, 'At least one workout type is required'),
  avgAttendance: z.number().optional(),
  frequencyPrefix: z.string().optional(),
  comments: z.string().optional(),
});

export const regionSchema = z.object({
  region_name: z.string().optional(),
  meta_description: z.string().optional(),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  region_logo_url: z.string().optional(),
  region_hero_img_url: z.string().optional(),
  region_city: z.string().optional(),
  region_state: z.string().optional(),
  region_facebook: z.string().optional(),
  region_instagram: z.string().optional(),
  region_linkedin: z.string().optional(),
  region_x_twitter: z.string().optional(),
  region_map_lat: z.number().optional(),
  region_map_lon: z.number().optional(),
  region_map_zoom: z.number().optional(),
  region_map_embed_link: z.string().optional(),
  region_google_form_url: z.string().optional(),
  region_fng_form_url: z.string().optional(),
});
