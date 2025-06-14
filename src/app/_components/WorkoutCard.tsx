// src/app/_components/WorkoutCard.tsx
import React from 'react';
// Image import is no longer needed here as logo is removed from card
// import Image from 'next/image'; // This line can remain commented or be removed
import Link from 'next/link';

// Updated WorkoutCardProps interface - logoUrl removed again
export interface WorkoutCardProps {
  _id: string;
  locationId: string;
  locationName: string;
  startTime: string;
  endTime: string;
  days: string[];
  types: string[];
  // logoUrl has been removed
}

export const sortWorkouts = (workouts: any[]) => {
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  workouts.sort((a, b) => {
    const dayAIndex = dayOrder.indexOf(a.days[0]);
    const dayBIndex = dayOrder.indexOf(b.days[0]);

    if (dayAIndex !== dayBIndex) {
      return dayAIndex - dayBIndex;
    }

    return a.startTime.localeCompare(b.startTime);
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
  // logoUrl is no longer destructured here
}) => {
  const displayDay = days.join(', ');
  const displayTime = `${startTime} - ${endTime}`;
  const displayStyle = types.length > 0 ? types[0] : 'Beatdown';

  const isBootcamp = types.includes('Bootcamp');
  const cardBgClass = isBootcamp ? 'bg-f3-blue-800' : 'bg-gray-800';
  const cardBorderClass = isBootcamp ? 'border-f3-blue-700' : 'border-gray-700';

  const locationDetailHref = `/locations/${locationId}`;

  return (

    <div className={`group bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-xl p-4
        transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col justify-between
        ${cardBgClass} ${cardBorderClass}`}>
      <div>
        {/* Logo display section removed from card */}

        {/* <h3 className="text-xl font-bold text-yellow-300 mb-1 text-center">
          {locationName}
        </h3> */}

        <p className="text-lg font-bold text-yellow-300 mb-1 text-center">
          {displayDay}: <span className="text-white">{displayTime}</span>
        </p>

        {displayStyle && (
          <div className="text-center mt-2">
            <span className="inline-block py-0.5 px-3 bg-green-600 text-white text-xs font-bold rounded-full shadow">
              {displayStyle}
            </span>
          </div>
        )}
      </div>
    </div>

  );
};

export default WorkoutCard;
