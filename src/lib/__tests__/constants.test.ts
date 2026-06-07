import { describe, it, expect } from 'vitest';
import {
  DAYS_OF_WEEK,
  WORKOUT_TYPES,
  FREQUENCY_PREFIX_OPTIONS,
  WORKOUT_TYPE_COLORS,
} from '../constants';

describe('DAYS_OF_WEEK', () => {
  it('contains all 7 days', () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
  });

  it('starts with Sunday', () => {
    expect(DAYS_OF_WEEK[0]).toBe('Sunday');
  });

  it('ends with Saturday', () => {
    expect(DAYS_OF_WEEK[6]).toBe('Saturday');
  });
});

describe('WORKOUT_TYPES', () => {
  it('contains at least Bootcamp, Ruck, and Run', () => {
    expect(WORKOUT_TYPES).toContain('Bootcamp');
    expect(WORKOUT_TYPES).toContain('Ruck');
    expect(WORKOUT_TYPES).toContain('Run');
  });

  it('has no duplicates', () => {
    const unique = new Set(WORKOUT_TYPES);
    expect(unique.size).toBe(WORKOUT_TYPES.length);
  });
});

describe('FREQUENCY_PREFIX_OPTIONS', () => {
  it('contains Every', () => {
    expect(FREQUENCY_PREFIX_OPTIONS).toContain('Every');
  });

  it('contains ordinal prefixes', () => {
    expect(FREQUENCY_PREFIX_OPTIONS).toContain('1st');
    expect(FREQUENCY_PREFIX_OPTIONS).toContain('2nd');
    expect(FREQUENCY_PREFIX_OPTIONS).toContain('3rd');
  });
});

describe('WORKOUT_TYPE_COLORS', () => {
  it('has a color for Bootcamp', () => {
    expect(WORKOUT_TYPE_COLORS.Bootcamp).toBeDefined();
  });

  it('returns Tailwind class strings', () => {
    Object.values(WORKOUT_TYPE_COLORS).forEach((color) => {
      expect(color).toMatch(/^bg-/);
    });
  });
});
