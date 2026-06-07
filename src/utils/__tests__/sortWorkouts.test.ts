import { describe, it, expect } from 'vitest';
import { sortWorkouts } from '../sortWorkouts';

describe('sortWorkouts', () => {
  it('sorts workouts by day of week (Sunday first)', () => {
    const workouts = [
      { days: ['Friday'], startTime: '05:30' },
      { days: ['Monday'], startTime: '05:30' },
      { days: ['Sunday'], startTime: '05:30' },
    ];
    const sorted = sortWorkouts(workouts);
    expect(sorted.map((w) => w.days[0])).toEqual([
      'Sunday',
      'Monday',
      'Friday',
    ]);
  });

  it('sorts by start time within the same day', () => {
    const workouts = [
      { days: ['Monday'], startTime: '06:00' },
      { days: ['Monday'], startTime: '05:15' },
      { days: ['Monday'], startTime: '05:30' },
    ];
    const sorted = sortWorkouts(workouts);
    expect(sorted.map((w) => w.startTime)).toEqual(['05:15', '05:30', '06:00']);
  });

  it('returns empty array for empty input', () => {
    expect(sortWorkouts([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const workouts = [
      { days: ['Friday'], startTime: '05:30' },
      { days: ['Monday'], startTime: '05:30' },
    ];
    const original = [...workouts];
    sortWorkouts(workouts);
    expect(workouts).toEqual(original);
  });

  it('handles workouts with empty days array', () => {
    const workouts = [
      { days: ['Monday'], startTime: '05:30' },
      { days: [], startTime: '05:30' },
    ];
    const sorted = sortWorkouts(workouts);
    expect(sorted).toHaveLength(2);
  });
});
