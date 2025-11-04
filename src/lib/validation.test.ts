import { describe, it, expect } from 'vitest';
import { validateVehicle } from './validation';

describe('validation utility', () => {
  describe('validateVehicle', () => {
    it('returns null for valid vehicle data', () => {
      const validVehicle = {
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75,
      };

      const errors = validateVehicle(validVehicle);

      expect(errors).toBeNull();
    });

    // TODO: Add validation error tests
    it.todo('returns error when year is missing');
    it.todo('returns error when year is too old');
    it.todo('returns error when year is in future');
    it.todo('returns error when make is missing');
    it.todo('returns error when model is missing');
    it.todo('returns error when battery size is missing');
    it.todo('returns error when battery size is negative');
    it.todo('returns error when battery size is zero');
    it.todo('allows optional fields to be empty');
    it.todo('validates range is positive when provided');
  });
});
