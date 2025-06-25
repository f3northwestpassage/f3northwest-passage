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
    const dayBIndex = dayOrder.indexOf(dayB);

    if (dayAIndex !== dayBIndex) {
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
  // --- LOG: Props received by WorkoutCard (for debugging) ---
  // IMPORTANT: Check your browser's developer console for these logs
  console.log(`--- WorkoutCard ${_id} for ${locationName} Props ---`);
  console.log({
    _id, locationId, locationName, startTime, endTime, days, types, comments, frequencyPrefix,
  });
  console.log(`Comments value for this card: "${comments}" (Type: ${typeof comments})`);
  console.log('---------------------------------');
  // --- END LOG ---

  const displayDay = days.join(', ');
  const displayTime = `${startTime} - ${endTime}`;
  const displayTypes = types.length > 0 ? types.join(', ') : 'Workout';
  const isBootcamp = types.includes('Bootcamp');

  const cardBgBase = 'bg-gray-800 dark:bg-gray-900';
  const cardBorderBase = 'border-gray-700 dark:border-gray-950';

  const cardBgClass = isBootcamp ? 'bg-f3-blue-800 dark:bg-f3-blue-900' : cardBgBase;
  const cardBorderClass = isBootcamp ? 'border-f3-blue-700 dark:border-f3-blue-800' : cardBorderBase;

  // Robust check for comments: ensure it's a string and has content after trimming whitespace
  const hasComments = comments && typeof comments === 'string' && comments.trim().length > 0;

  return (
    <div
      className={`
        group
        bg-gradient-to-br
        from-gray-800 to-gray-900
        dark:from-gray-900 dark:to-gray-950
        text-white
        dark:text-gray-100
        rounded-xl
        shadow-lg
        dark:shadow-md
        p-6
        transform hover:scale-[1.02]
        hover:shadow-2xl
        dark:hover:shadow-lg
        transition-all duration-300 ease-in-out
        cursor-pointer
        h-full
        flex flex-col
        ${cardBgClass} ${cardBorderClass}
      `}
    >
      {/* SECTION 1: Day & Time */}
      <div className="mb-4 flex-shrink-0">
        <h4 className="text-xl font-extrabold text-blue-300 dark:text-blue-400 mb-2 text-center">
          {locationName}
        </h4>
        <p className="text-2xl font-extrabold text-yellow-300 dark:text-yellow-400 text-center leading-tight">
          {frequencyPrefix && <span className="mr-2 text-xl font-semibold text-gray-300 dark:text-gray-400">{frequencyPrefix}</span>}
          {displayDay}: <span className="text-white dark:text-gray-50">{displayTime}</span>
        </p>
      </div>

      {/* SECTION 2: Workout Types */}
      <div className="text-center mb-6 flex-shrink-0">
        {displayTypes && (
          <span className="inline-block py-1 px-4 bg-f3-orange text-white text-sm font-bold rounded-full tracking-wide shadow-md dark:bg-f3-orange-dark dark:text-gray-50">
            {displayTypes}
          </span>
        )}
      </div>

      {/* SECTION 3: Comments */}
      <div className="
        flex-grow
        min-h-[4rem]
        flex items-center justify-center
        text-center
        border-t border-gray-700 dark:border-gray-600 pt-3 mt-auto
        text-sm text-gray-300 dark:text-gray-400 italic leading-relaxed
      ">
        {hasComments ? ( // Using the new `hasComments` variable
          <p className="overflow-hidden px-2">
            {comments}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-500">No comments for this workout.</p>
        )}
      </div>

    </div>
  );
};

export default WorkoutCard;
