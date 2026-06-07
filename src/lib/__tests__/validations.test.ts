import { describe, it, expect } from 'vitest';
import {
  locationSchema,
  locationUpdateSchema,
  workoutSchema,
  regionSchema,
} from '../validations';

describe('locationSchema', () => {
  it('accepts valid location data', () => {
    const result = locationSchema.safeParse({
      name: 'The Boneyard',
      mapLink: 'https://maps.google.com/test',
    });
    expect(result.success).toBe(true);
  });

  it('rejects location without name', () => {
    const result = locationSchema.safeParse({
      name: '',
      mapLink: 'https://maps.google.com/test',
    });
    expect(result.success).toBe(false);
  });

  it('provides defaults for optional fields', () => {
    const result = locationSchema.safeParse({ name: 'Test AO' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe('');
      expect(result.data.description).toBe('');
    }
  });
});

describe('locationUpdateSchema', () => {
  it('requires _id for updates', () => {
    const result = locationUpdateSchema.safeParse({
      name: 'Test AO',
      mapLink: 'https://maps.google.com',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid update data with _id', () => {
    const result = locationUpdateSchema.safeParse({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test AO',
      mapLink: 'https://maps.google.com',
    });
    expect(result.success).toBe(true);
  });
});

describe('workoutSchema', () => {
  it('accepts valid workout data', () => {
    const result = workoutSchema.safeParse({
      locationId: '507f1f77bcf86cd799439011',
      startTime: '05:30',
      days: ['Monday', 'Wednesday'],
      types: ['Bootcamp'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects workout without days', () => {
    const result = workoutSchema.safeParse({
      locationId: '507f1f77bcf86cd799439011',
      startTime: '05:30',
      days: [],
      types: ['Bootcamp'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects workout without types', () => {
    const result = workoutSchema.safeParse({
      locationId: '507f1f77bcf86cd799439011',
      startTime: '05:30',
      days: ['Monday'],
      types: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional frequencyPrefix and comments', () => {
    const result = workoutSchema.safeParse({
      locationId: '507f1f77bcf86cd799439011',
      startTime: '05:30',
      days: ['Saturday'],
      types: ['Ruck'],
      frequencyPrefix: '1st and 3rd',
      comments: 'Bring rucks',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frequencyPrefix).toBe('1st and 3rd');
      expect(result.data.comments).toBe('Bring rucks');
    }
  });
});

describe('regionSchema', () => {
  it('accepts valid region data', () => {
    const result = regionSchema.safeParse({
      region_name: 'F3 Northwest Passage',
      region_city: 'Houston',
      region_state: 'TX',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = regionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid map coordinates type', () => {
    const result = regionSchema.safeParse({
      region_map_lat: 'not a number',
    });
    expect(result.success).toBe(false);
  });
});
