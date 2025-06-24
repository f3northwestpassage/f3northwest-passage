// types/workout.ts

export interface WorkoutClean {
    _id: string;
    locationId: string;
    locationName: string; // Derived/populated from Location for frontend convenience
    ao?: string;          // Derived/populated for frontend convenience (Location name)
    startTime: string;
    endTime: string;
    days: string[];
    types: string[];
    frequencyPrefix?: string; // Optional field for frequency
    comments?: string;        // Optional field for comments
}

export interface LocationClean {
    _id: string;
    name: string;
    mapLink: string;
    address?: string;
    description?: string;
    q?: string;           // Now correctly on LocationClean
    embedMapLink?: string;
    imageUrl?: string;    // AO Logo URL
    paxImageUrl?: string; // PAX Image URL
}
