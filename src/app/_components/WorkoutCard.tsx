// src/app/_components/WorkoutCard.tsx
'use client';
import React from 'react';
import Link from 'next/link';

// Updated WorkoutCardProps interface
export interface WorkoutCardProps {
  _id: string;
  locationId: string;
  locationName: string;
  startTime: string;
  endTime: string;
  days: string[];
  types: string[];
  comments?: string; // This prop can be undefined or a string
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
    const dayA = a.days?.[0] || '';
    const dayB = b.days?.[0] || '';
    const dayAIndex = dayOrder.indexOf(dayA);
    const dayBIndex = b.days?.[0] ? dayOrder.indexOf(dayB) : -1;

    if (dayAIndex !== dayBIndex) {
      if (dayAIndex === -1) return 1;
      if (dayBIndex === -1) return -1;
      return dayAIndex - dayBIndex;
    }

    return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
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
  const displayDay = days.join(', ');
  const displayTime = `${startTime} - ${endTime}`;
  const displayTypes = types.length > 0 ? types.join(', ') : 'Workout';

  // Booleans for different workout types
  const isBootcamp = types.includes('Bootcamp');
  const isStrength = types.includes('Strength');
  const isHybrid = types.includes('Hybrid');
  const isRuck = types.includes('Ruck');
  const isRun = types.includes('Run');
  const isSandbag = types.includes('Sandbag'); // NEW
  const isDiscussion = types.includes('Discussion'); // NEW

  // Define base classes for the card background (always consistent now)
  const cardBgClass = 'bg-gray-800 dark:bg-gray-900'; // Always consistent dark background
  const cardBorderClass = 'border-gray-700 dark:border-gray-950'; // Always consistent border

  // Determine the tag background color based on workout types
  // Prioritize specific types. If multiple types are present, the order here determines precedence.
  let tagBgClass = 'bg-indigo-600 dark:bg-indigo-700'; // Default tag color
  const tagTextColor = 'text-white'; // Default tag text color (consistent)

  if (isBootcamp) {
    tagBgClass = 'bg-f3-orange dark:bg-f3-orange-dark'; // Orange for Bootcamp tag
  } else if (isStrength) {
    tagBgClass = 'bg-green-600 dark:bg-green-700'; // Green for Strength tag
  } else if (isHybrid) {
    tagBgClass = 'bg-purple-600 dark:bg-purple-700'; // Purple for Hybrid tag
  } else if (isSandbag) { // NEW: Sandbag color
    tagBgClass = 'bg-yellow-600 dark:bg-yellow-700';
  } else if (isDiscussion) { // NEW: Discussion color
    tagBgClass = 'bg-cyan-600 dark:bg-cyan-700';
  } else if (isRuck) {
    tagBgClass = 'bg-amber-600 dark:bg-amber-700'; // Amber for Ruck tag
  } else if (isRun) {
    tagBgClass = 'bg-red-600 dark:bg-red-700'; // Red for Run tag
  }
  // You can adjust the order of these 'if' statements to define priority if a workout has multiple types.

  // Robust checks for optional fields
  const hasComments = comments && typeof comments === 'string' && comments.trim().length > 0;
  const hasLocationName = locationName && locationName.trim().length > 0;
  const hasFrequencyPrefix = frequencyPrefix && frequencyPrefix.trim().length > 0;

  return (
    <div
      className={`
        group
        ${cardBgClass} ${cardBorderClass}
        rounded-xl
        shadow-lg dark:shadow-md
        p-6
        transform hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-lg
        transition-all duration-300 ease-in-out
        cursor-pointer
        h-full
        flex flex-col
        w-full max-w-sm mx-auto
        border-2
      `}
    >
      {/* SECTION 1: Location Name */}
      <div className="flex-shrink-0 mb-4 pb-2 border-b border-gray-700 dark:border-gray-600">
        <h4 className="text-xl font-extrabold text-blue-300 dark:text-blue-400 text-center min-h-[1.75rem] flex items-center justify-center">
          {hasLocationName ? (
            locationName
          ) : (
            <span className="invisible">Location Name Placeholder</span>
          )}
        </h4>
      </div>

      {/* SECTION 2: Day & Time + Frequency Prefix */}
      <div className="flex-shrink-0 mb-4">
        <p className="text-2xl font-extrabold text-yellow-300 dark:text-yellow-400 text-center leading-tight min-h-[2.5rem] flex flex-col justify-center">
          {hasFrequencyPrefix ? (
            <span className="text-base font-semibold text-gray-300 dark:text-gray-400 mb-1">{frequencyPrefix}</span>
          ) : (
            <span className="invisible text-base font-semibold">Prefix Placeholder</span>
          )}
          {displayDay}: <span className="text-white dark:text-gray-50">{displayTime}</span>
        </p>
      </div>

      {/* SECTION 3: Workout Types - Now with dynamic tag color */}
      <div className="text-center mb-6 flex-shrink-0">
        <span className={`inline-block py-1 px-4 ${tagBgClass} ${tagTextColor} text-sm font-bold rounded-full tracking-wide shadow-md`}>
          {displayTypes}
        </span>
      </div>

      {/* SECTION 4: Comments */}
      <div className={`
        flex-grow
        min-h-[4rem]
        flex items-center justify-center
        text-center
        border-t border-gray-700 dark:border-gray-600 pt-3 mt-auto
        text-sm italic leading-relaxed px-2
        text-gray-300 dark:text-gray-400
      `}>
        {hasComments ? (
          <p className="line-clamp-3">
            {comments}
          </p>
        ) : (
          <p className="invisible">No comments for this workout.</p>
        )}
      </div>
    </div>
  );
};

export default WorkoutCard;
