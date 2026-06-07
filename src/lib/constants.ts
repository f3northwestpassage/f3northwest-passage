export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WORKOUT_TYPES = [
  'Bootcamp',
  'Ruck',
  'Run',
  'CrossFit',
  'Strength',
  'Yoga',
  'Cycling',
  'Hybrid',
  'Sandbags',
  'Discussion',
] as const;

export const FREQUENCY_PREFIX_OPTIONS = [
  'Every',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '1st and 3rd',
  '2nd and 4th',
  '1st, 3rd, and 5th',
  'Monthly',
] as const;

export const WORKOUT_TYPE_COLORS: Record<string, string> = {
  Bootcamp: 'bg-f3-orange',
  Strength: 'bg-green-600 text-white dark:text-black',
  Hybrid: 'bg-purple-600 text-white dark:text-black',
  Sandbags: 'bg-yellow-600 text-white',
  Discussion: 'bg-cyan-600 dark:text-black',
  Ruck: 'bg-amber-600 dark:text-black',
  Run: 'bg-red-600 dark:text-black',
};
