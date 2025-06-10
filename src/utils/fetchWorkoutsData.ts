
import workoutsData from '../../data/workouts.json';

export interface Workout { // Added export

  ao: string;
  style: string;
  location: {
    href: string;
    text: string;
  };
  day: string;
  time: string;
}


export function fetchWorkoutsData(): Workout[] {
  return workoutsData as Workout[];

}