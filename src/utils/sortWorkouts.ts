export interface WorkoutLike {
    days: string[];
    startTime: string;
}

export function sortWorkouts<T extends WorkoutLike>(workouts: T[]): T[] {
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return workouts.slice().sort((a, b) => {
        const dayAIndex = dayOrder.indexOf(a.days?.[0] || '');
        const dayBIndex = dayOrder.indexOf(b.days?.[0] || '');
        return dayAIndex !== dayBIndex
            ? dayAIndex - dayBIndex
            : (a.startTime || '').localeCompare(b.startTime || '');
    });
}
