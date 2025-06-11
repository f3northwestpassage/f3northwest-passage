// Assuming this is your types/workout.ts file
export interface WorkoutClean {
    _id?: string; // Optional because .lean() might not always return it as a string
    ao: string;
    style: string;
    location: {
        href: string;
        text: string;
    };
    day: string;
    time: string;
    q?: string;
    avgAttendance?: string;
}