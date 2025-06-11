// DTO returned from API
export interface WorkoutClean {
    _id?: string;
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