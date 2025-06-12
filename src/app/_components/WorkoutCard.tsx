import Link from 'next/link';

/**
 * TODO: refactor the enums & types in this component
 * to dynamically infer from JSON schema
 * to reduce redundancy and simplify maintainability
 */

export const WorkoutStyles = {
  MURPH: 'Murph',
  BEATDOWN: 'Beatdown',
  RUN: 'Run',
  TRAIL_RUN: 'Trail Run',
  RUCKING: 'Ruck',
  RUCKS_SANDBAGS: 'Rucks & Sandbags',
  WEIGHT_LIFTING: 'Weight Lifting',
  THIRD_F: '3rd F (Faith)',
};
export const WorkoutDays = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  THIRD_FRIDAY: 'Every Third Friday',
  SATURDAY: 'Saturday',
  SATURDAY_EXCEPT_LAST: 'All Saturdays Except the Last of the Month',
  SUNDAY: 'Sunday',
};
function dayToNumber(day: string) {
  // Ensure we handle cases where the day might not be directly in WorkoutDays.values()
  const daysOrder = Object.values(WorkoutDays);
  return daysOrder.indexOf(day);
}
function timeToNumber(time: string) {
  // Ensure we handle cases where the time might not be directly in WorkoutTimes.values()
  const timesOrder = Object.values(WorkoutTimes);
  return timesOrder.indexOf(time);
}
export function sortWorkouts(workouts: WorkoutCardProps[]) {
  const decimalPrecision = 100; // Used to allow time to influence sort after day
  return workouts.sort((a, b) => {
    return (
      dayToNumber(a.day) +
      timeToNumber(a.time) / decimalPrecision -
      (dayToNumber(b.day) + timeToNumber(b.time) / decimalPrecision)
    );
  });
}

// NOTE: This logic assumes 'today' and 'tomorrow' based on simple day increments.
// For robust date logic (e.g., handling specific dates, last Saturday of month, etc.),
// more complex date libraries (like date-fns) and server-side checks might be needed.
export function workoutsTomorrow(workouts: WorkoutCardProps[]) {
  const result = workouts.filter((w) => {
    const today = new Date().getDay(); // getDay() returns 0 for Sunday, 1 for Monday, etc.
    const days = {
      SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    };
    switch (today) {
      case days.SUNDAY: return w.day === WorkoutDays.MONDAY;
      case days.MONDAY: return w.day === WorkoutDays.TUESDAY;
      case days.TUESDAY: return w.day === WorkoutDays.WEDNESDAY;
      case days.WEDNESDAY: return w.day === WorkoutDays.THURSDAY;
      case days.THURSDAY: return (w.day === WorkoutDays.FRIDAY || w.day === WorkoutDays.THIRD_FRIDAY);
      case days.FRIDAY: return (w.day === WorkoutDays.SATURDAY || w.day === WorkoutDays.SATURDAY_EXCEPT_LAST);
      case days.SATURDAY: return w.day === WorkoutDays.SUNDAY;
      default: return false;
    }
  });
  // Sort the results for consistent display
  sortWorkouts(result);
  return result;
}

export function workoutsAnotherDay(workouts: WorkoutCardProps[]) {
  // Filter out workouts that are NOT happening tomorrow.
  // We need to compare full workout objects for accurate filtering.
  const tomorrowWorkouts = workoutsTomorrow(workouts);
  const result = workouts.filter(
    (w) => !tomorrowWorkouts.some(tw => tw._id === w._id) // Compare by unique ID
  );
  sortWorkouts(result);
  return result;
}

export const WorkoutTimes = {
  '0515': '5:15 AM - 6:15 AM',
  '0520': '5:20 AM - 6:15 AM',
  '0525': '5:25 AM - 6:15 AM',
  '0530': '5:30 AM - 6:15 AM',
  '0600': '6:00 AM - 7:00 AM',
  '0630': '6:30 AM - 7:30 AM', // Added a common time for consistency
};

// --- START: UPDATED WorkoutCardProps (from immersive artifact) ---
export interface WorkoutCardProps {
  _id: string; // The unique ID of the workout entry
  ao: string; // The name of the Area of Operations (from LocationClean)
  style: string; // The workout style (e.g., "Bootcamp"). Guaranteed to be string (empty if undefined).
  locationText: string; // The display text for the location (from LocationClean)
  locationHref: string; // The map link for the location (from LocationClean)
  day: string; // The day of the week (e.g., "Monday")
  time: string; // The time of the workout (e.g., "05:30")
  q: string; // The Q (leader) for the workout. Guaranteed to be string (empty if undefined).
  avgAttendance?: number; // Average attendance, as a number or undefined.
}
// --- END: UPDATED WorkoutCardProps ---


export default function WorkoutCard({
  ao,
  q,
  avgAttendance,
  style,
  locationText, // Now directly accepted
  locationHref, // Now directly accepted
  day,
  time,
  _id // Added _id as a prop if needed for keying or debugging in the component
}: WorkoutCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-xl p-6 mb-4 transform hover:scale-105 transition-all duration-300 ease-in-out">
      <h3 className="text-2xl font-extrabold mb-2 text-yellow-400">{ao}</h3>
      {q ? (
        <p className="text-gray-300 text-lg mb-3">
          Led by <span className="font-semibold text-teal-400">{q}</span>
        </p>
      ) : (
        <p className="text-gray-300 text-lg mb-3">Q: <span className="italic">Not Assigned</span></p>
      )}

      <ul className="flex flex-wrap items-center my-4">
        {avgAttendance !== undefined && avgAttendance !== null && avgAttendance > 0 ? ( // Added check for null as well
          <li className="inline-block py-1.5 px-4 bg-blue-600 text-white text-sm font-bold rounded-full mr-2 mb-2 shadow">
            Avg. Pax: {avgAttendance}
          </li>
        ) : null}
        {style && ( // Only display if style is not empty
          <li className="inline-block py-1.5 px-4 bg-green-600 text-white text-sm font-bold rounded-full mr-2 mb-2 shadow">
            {style}
          </li>
        )}
      </ul>

      <p className="font-bold text-lg pb-3 border-b border-gray-700 mb-3">
        <Link href={locationHref} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200">
          {locationText}
        </Link>
      </p>
      <p className="font-medium text-xl text-yellow-500">
        {day}: <span className="text-white">{time}</span>
      </p>
    </div>
  );
}
