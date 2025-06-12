// types/workout.ts (UPDATE THIS FILE)

// Define the Location interface
export interface LocationClean {
    _id: string;
    name: string; // This will be the AO name (e.g., "The Pit")
    mapLink: string; // URL to Google Maps or similar (corresponds to old location.href)
    address?: string; // Optional physical address for more detail
    description?: string; // Optional description of the location
}

// Update the Workout interface to reference a Location by its ID
export interface WorkoutClean {
    _id: string;
    locationId: string; // References LocationClean._id
    style?: string; // e.g., Bootcamp, Ruck, Running
    day: string; // e.g., "Monday", "Wednesday"
    time: string; // e.g., "05:30", "06:00"
    q?: string; // The Q (leader)
    avgAttendance?: string; // Average attendance as a string
}