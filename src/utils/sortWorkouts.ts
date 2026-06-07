import { DAYS_OF_WEEK } from '@/lib/constants';

export interface WorkoutLike {
  days: string[];
  startTime: string;
}

export function sortWorkouts<T extends WorkoutLike>(workouts: T[]): T[] {
  return workouts.slice().sort((a, b) => {
    const dayAIndex = DAYS_OF_WEEK.indexOf(
      (a.days?.[0] as (typeof DAYS_OF_WEEK)[number]) || ''
    );
    const dayBIndex = DAYS_OF_WEEK.indexOf(
      (b.days?.[0] as (typeof DAYS_OF_WEEK)[number]) || ''
    );
    return dayAIndex !== dayBIndex
      ? dayAIndex - dayBIndex
      : (a.startTime || '').localeCompare(b.startTime || '');
  });
}
