import dbConnect from '@/lib/dbConnect';
import LocationModel from '@/models/Location';
import type { LocationClean } from '../../types/workout';

export async function fetchLocationsData(): Promise<LocationClean[]> {
  if (process.env.MOCK_DATA === 'true') {
    return [
      {
        _id: "mock-location-1",
        name: "Mock Location Alpha",
        mapLink: "https://maps.example.com/mockalpha",
        address: "123 Mock St, Mockville, MS",
        description: "This is a mock location for Alpha.",
        q: "MockQ Alpha",
        embedMapLink: "",
        imageUrl: "https://placehold.co/150x150/png?text=AO+Logo",
        paxImageUrl: "https://placehold.co/150x150/png?text=PAX+Image",
      },
    ];
  }

  await dbConnect();

  try {
    const rawLocations = await LocationModel.find({}).lean().exec();

    const cleanedLocations: LocationClean[] = rawLocations.map((loc: any) => ({
      _id: loc._id?.toString() ?? '', // Safely convert ObjectId or unknown
      name: loc.name || 'Unnamed Location',
      mapLink: loc.mapLink || '',
      address: loc.address || '',
      description: loc.description || '',
      q: loc.q || '',
      embedMapLink: loc.embedMapLink || '',
      imageUrl: loc.imageUrl || '',
      paxImageUrl: loc.paxImageUrl || '',
    }));

    return cleanedLocations;
  } catch (error) {
    console.error('FETCH_LOCATIONS_DATA_ERROR:', error);
    throw new Error('Failed to retrieve location data from the database.');
  }
}

export type { LocationClean };
