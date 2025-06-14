// src/utils/fetchLocationsData.ts

import dbConnect from '@/lib/dbConnect';
// Import ILocationLean from your Location model file
import LocationModel, { ILocationLean } from '@/models/Location';
import type { LocationClean } from '../../types/workout'; // Adjust path as needed for your LocationClean type

// Remove the problematic import:
// import { LeanDocument } from 'mongoose'; // <-- DELETE THIS LINE

/**
 * Fetches all workout locations from the database.
 * Ensures data is cleaned and formatted to LocationClean type.
 * @returns {Promise<LocationClean[]>} A promise that resolves to an array of cleaned location data.
 * @throws {Error} If there's a problem connecting to the DB or fetching data.
 */
export async function fetchLocationsData(): Promise<LocationClean[]> {
  if (process.env.MOCK_DATA === 'true') {
    console.log('FETCH_LOCATIONS_DATA_DEBUG: MOCK_DATA is true, returning mock locations data.');
    return [
      {
        _id: "mock-location-1",
        name: "Mock Location Alpha",
        mapLink: "https://maps.example.com/mockalpha",
        address: "123 Mock St, Mockville, MS",
        description: "This is a mock location for Alpha.",
        q: "MockQ Alpha",
        embedMapLink: "",
        imageUrl: "https://placehold.co/150x150/png?text=AO+Logo", // Placeholder
        paxImageUrl: "https://placehold.co/150x150/png?text=PAX+Image", // Placeholder
      },
      {
        _id: "mock-location-2",
        name: "Mock Location Bravo",
        mapLink: "https://maps.example.com/mockbravo",
        address: "456 Mock Ave, Mocktown, MS",
        description: "This is a mock location for Bravo.",
        q: "MockQ Bravo",
        embedMapLink: "",
        imageUrl: "https://placehold.co/150x150/png?text=AO+Logo", // Placeholder
        paxImageUrl: "https://placehold.co/150x150/png?text=PAX+Image", // Placeholder
      }
    ];
  }
    await dbConnect(); // Connect to MongoDB

    try {
        // Type the raw results using ILocationLean
        const rawLocationsFromDb: ILocationLean[] = await LocationModel.find({}).lean().exec();

        // Map the raw database objects to the LocationClean interface.
        // This step ensures type safety and consistent data structure for the frontend.
        const locations: LocationClean[] = rawLocationsFromDb.map((rawLoc: ILocationLean) => {
            // Convert the Mongoose ObjectId (_id) to a string, as expected by LocationClean.
            const _id = rawLoc._id ? rawLoc._id.toString() : '';

            return {
                _id: _id, // Unique identifier for the location
                name: rawLoc.name || 'Unnamed Location', // Name of the workout area/location
                mapLink: rawLoc.mapLink || '',       // URL to Google Maps or similar
                address: rawLoc.address || '',       // Physical address of the location
                description: rawLoc.description || '', // A brief description of the AO
                q: rawLoc.q || '',                   // Permanent Q (leader) for this AO
                embedMapLink: rawLoc.embedMapLink || '', // Embeddable map link (e.g., iframe src)
                imageUrl: rawLoc.imageUrl || '',     // URL for the AO's logo/image
                paxImageUrl: rawLoc.paxImageUrl || '', // URL for a PAX (member) image at the AO
            };
        }).filter(loc => loc._id !== ''); // Ensure that only locations with valid _id's are returned

        return locations;
    } catch (error) {
        console.error('Error fetching locations from DB:', error);
        // Throw an error so the calling component/page can handle it (e.g., display an error message).
        throw new Error('Failed to retrieve location data from the database.');
    }
}

// Re-export LocationClean here for convenience when importing fetchLocationsData,
// so you can use `import { fetchLocationsData, LocationClean } from '@/utils/fetchLocationsData';`
export type { LocationClean };
