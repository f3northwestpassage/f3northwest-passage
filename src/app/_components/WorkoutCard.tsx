'use client';
import React from 'react';
import Link from 'next/link'; // Keep Link if used in a parent or if this component were to link itself

// Updated WorkoutCardProps interface to include new optional fields
export interface WorkoutCardProps {
  _id: string;
  locationId: string;
  locationName: string;
  startTime: string; // Ensure this is always a string when passed from parent
  endTime: string;   // Ensure this is always a string when passed from parent
  days: string[];    // Ensure this is always an array of strings
  types: string[];   // Ensure this is always an array of strings
  comments?: string;
  frequencyPrefix?: string;
}

// Sorting helper with improved type safety
export const sortWorkouts = <T extends { days: string[]; startTime: string }>(workouts: T[]): T[] => {
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (!Array.isArray(workouts)) {
    console.warn('sortWorkouts: received non-array input');
    return [];
  }

  return workouts.slice().sort((a, b) => {
    // Defensive check: ensure days array exists and has at least one element
    const dayA = (a.days && a.days.length > 0) ? a.days[0] : '';
    const dayB = (b.days && b.days.length > 0) ? b.days[0] : '';

    const dayAIndex = dayOrder.indexOf(dayA);
    const dayBIndex = dayOrder.indexOf(dayB);

    if (dayAIndex !== dayBIndex) {
      return dayAIndex - dayBIndex;
    }

    // Defensive check: ensure startTime exists before localeCompare
    return (a.startTime || '').localeCompare(b.startTime || '');
  });
};

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  _id,
  locationId,
  locationName,
  startTime,
  endTime,
  days,
  types,
  comments,
  frequencyPrefix,
}) => {
  // Provide default empty array if `days` or `types` could somehow be null/undefined when passed
  const safeDays = days || [];
  const safeTypes = types || [];

  const displayDay = safeDays.join(', ');
  // Ensure startTime and endTime are treated as strings for display
  const displayTime = `${startTime || ''} - ${endTime || ''}`;
  const displayStyle = safeTypes.length > 0 ? safeTypes[0] : 'Workout';
  const isBootcamp = safeTypes.includes('Bootcamp');

  const cardBgClass = isBootcamp ? 'bg-f3-blue-800' : 'bg-gray-800';
  const cardBorderClass = isBootcamp ? 'border-f3-blue-700' : 'border-gray-700';

  return (
    <div
      className={`group bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-xl p-4
        transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col justify-between
        ${cardBgClass} ${cardBorderClass}`}
    >
      <div>
        {/* Added defensive checks for startTime/endTime just in case they're empty */}
        <p className="text-lg font-bold text-yellow-300 mb-1 text-center">
          {frequencyPrefix && <span className="mr-1">{frequencyPrefix}</span>}
          {displayDay}: <span className="text-white">{displayTime}</span>
        </p>

        {/* Display Style only if it's not the default 'Workout' or if types has items */}
        {safeTypes.length > 0 && displayStyle !== 'Workout' && (
          <div className="text-center mt-2">
            <span className="inline-block py-0.5 px-3 bg-green-600 text-white text-xs font-bold rounded-full shadow">
              {displayStyle}
            </span>
          </div>
        )}
        {/* If 'Workout' is a valid type and you want to show it, you'd adjust the condition above.
            Or simply: {safeTypes.length > 0 && ...} */}

        {comments && (
          <p className="text-sm text-gray-400 italic text-center mt-2">{comments}</p>
        )}
      </div>
      {/* You might want a Link here to the individual workout page, e.g., using locationName or _id */}
      {/* For example, if you want the whole card to be clickable to its location page: */}
      {/* <Link href={`/workouts/${encodeURIComponent(locationName)}`} className="absolute inset-0 z-10" aria-label={`View details for ${locationName}`}></Link> */}
    </div>
  );
};

export default WorkoutCard;
