'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { WORKOUT_TYPE_COLORS } from '@/lib/constants';

export interface WorkoutCardProps {
  _id: string;
  locationId: string;
  locationName: string;
  startTime: string;
  endTime: string;
  days: string[];
  types: string[];
  comments?: string;
  frequencyPrefix?: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  locationName,
  startTime,
  endTime,
  days,
  types,
  comments,
  frequencyPrefix,
}) => {
  const displayDays = days.join(', ');
  const displayTime = `${startTime} – ${endTime}`;
  const displayTypes = types.length > 0 ? types.join(', ') : 'Workout';

  let tagBg = 'bg-indigo-600';
  for (const type of types) {
    if (WORKOUT_TYPE_COLORS[type]) {
      tagBg = WORKOUT_TYPE_COLORS[type];
      break;
    }
  }

  return (
    <div className="max-w-xs w-full">
      <div
        className={cn(
          'group w-full cursor-pointer overflow-hidden relative h-36 rounded-md shadow-xl mx-auto flex justify-center items-center border border-transparent dark:border-neutral-800',
          "hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-black hover:after:opacity-50",
          'transition-all duration-500'
        )}
      >
        <div className="z-50 relative text-center text-black dark:text-white px-2">
          {/* Day/Time/Frequency */}
          <p className="text-base font-semibold">
            {frequencyPrefix && (
              <span className="mr-2 text-gray-300">{frequencyPrefix}</span>
            )}
            {displayDays}: {displayTime}
          </p>
          {/* Workout Type */}
          <div className="my-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tagBg} dark:text-white shadow`}
            >
              {displayTypes}
            </span>
          </div>
          {/* Comments */}
          {comments && (
            <p className="italic text-xs opacity-80 mt-2 line-clamp-3">
              {comments}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
