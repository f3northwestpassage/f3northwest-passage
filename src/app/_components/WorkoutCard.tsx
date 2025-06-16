'use client';
import React from 'react';
import Link from 'next/link';

// Updated WorkoutCardProps interface to include new optional fields
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
  const displayDay = days.join(', ');
  const displayTime = `${startTime} - ${endTime}`;
  const displayStyle = types.length > 0 ? types[0] : 'Workout';
  const isBootcamp = types.includes('Bootcamp');

  const cardBgClass = isBootcamp ? 'bg-f3-blue-800' : 'bg-gray-800';
  const cardBorderClass = isBootcamp ? 'border-f3-blue-700' : 'border-gray-700';

  return (
    <div
      className={`group bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-xl p-4
        transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col justify-between
        ${cardBgClass} ${cardBorderClass}`}
    >
      <div>
        <p className="text-lg font-bold text-yellow-300 mb-1 text-center">
          {frequencyPrefix && <span className="mr-1">{frequencyPrefix}</span>}
          {displayDay}: <span className="text-white">{displayTime}</span>
        </p>

        {displayStyle && (
          <div className="text-center mt-2">
            <span className="inline-block py-0.5 px-3 bg-green-600 text-white text-xs font-bold rounded-full shadow">
              {displayStyle}
            </span>
          </div>
        )}

        {comments && (
          <p className="text-sm text-gray-400 italic text-center mt-2">{comments}</p>
        )}
      </div>
    </div>
  );
};

export default WorkoutCard;
