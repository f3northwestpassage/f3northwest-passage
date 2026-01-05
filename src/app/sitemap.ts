import { MetadataRoute } from 'next';
import { fetchWorkoutsData } from '@/utils/fetchWorkoutsData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://f3northwestpassage.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/workouts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fng`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/convergence`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic workout routes
  let workoutRoutes: MetadataRoute.Sitemap = [];
  try {
    const workouts = await fetchWorkoutsData();
    if (workouts && Array.isArray(workouts)) {
      workoutRoutes = workouts.map((workout: any) => ({
        url: `${baseUrl}/workouts/${encodeURIComponent(workout.workout_name || workout.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching workouts for sitemap:', error);
  }

  return [...staticRoutes, ...workoutRoutes];
}
