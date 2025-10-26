import type { Vehicle } from './types';

export type VehicleValidationErrors = {
  year?: string;
  make?: string;
  model?: string;
  batterySize?: string;
  trim?: string;
  nickname?: string;
  range?: string;
};

export function validateVehicle(data: Partial<Vehicle>): VehicleValidationErrors | null {
  const errors: VehicleValidationErrors = {};

  if (!data.year) {
    errors.year = 'Year is required';
  } else if (typeof data.year !== 'number') {
    errors.year = 'Year must be a number';
  } else if (data.year < 2000 || data.year > 2099) {
    errors.year = 'Year must be between 2000 and 2099';
  }

  if (!data.make) {
    errors.make = 'Make is required';
  } else if (typeof data.make !== 'string' || data.make.trim() === '') {
    errors.make = 'Make must be a non-empty string';
  }

  if (!data.model) {
    errors.model = 'Model is required';
  } else if (typeof data.model !== 'string' || data.model.trim() === '') {
    errors.model = 'Model must be a non-empty string';
  }

  if (!data.batterySize) {
    errors.batterySize = 'Battery size is required';
  } else if (typeof data.batterySize !== 'number') {
    errors.batterySize = 'Battery size must be a number';
  } else if (data.batterySize <= 0) {
    errors.batterySize = 'Battery size must be greater than 0';
  }

  if (data.range !== undefined && data.range !== null) {
    if (typeof data.range !== 'number') {
      errors.range = 'Range must be a number';
    } else if (data.range <= 0) {
      errors.range = 'Range must be greater than 0';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
