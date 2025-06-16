// types/workout.ts 

export interface WorkoutClean {
    _id: string;
    locationId: string;
    locationName: string;
    ao?: string;
    startTime: string;
    endTime: string;
    days: string[];
    types: string[];
    frequencyPrefix?: string;
    comments?: string;



}

export interface LocationClean {
    _id: string;
    name: string;
    mapLink: string;
    address?: string;
    description?: string;
    q?: string;
    embedMapLink?: string;
    imageUrl?: string; // This is the AO Logo URL
    paxImageUrl?: string; // This is the PAX Image URL
}
