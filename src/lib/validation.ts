import type { Vehicle, Session } from './types';

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

export type SessionValidationErrors = {
  vehicleId?: string;
  locationId?: string;
  date?: string;
  kwhAdded?: string;
  costOverride?: string;
};

export function validateSession(
  data: Partial<Omit<Session, 'id' | 'rate'>> & { costOverride?: number }
): SessionValidationErrors | null {
  const errors: SessionValidationErrors = {};

  if (!data.vehicleId) {
    errors.vehicleId = 'Vehicle is required';
  } else if (typeof data.vehicleId !== 'string' || data.vehicleId.trim() === '') {
    errors.vehicleId = 'Vehicle must be selected';
  }

  if (!data.locationId) {
    errors.locationId = 'Location is required';
  } else if (typeof data.locationId !== 'string' || data.locationId.trim() === '') {
    errors.locationId = 'Location must be selected';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  } else if (typeof data.date !== 'string' || data.date.trim() === '') {
    errors.date = 'Date must be provided';
  }

  if (data.kwhAdded === undefined || data.kwhAdded === null) {
    errors.kwhAdded = 'kWh added is required';
  } else if (typeof data.kwhAdded !== 'number') {
    errors.kwhAdded = 'kWh added must be a number';
  } else if (data.kwhAdded <= 0) {
    errors.kwhAdded = 'kWh added must be greater than 0';
  }

  if (data.costOverride !== undefined && data.costOverride !== null) {
    if (typeof data.costOverride !== 'number') {
      errors.costOverride = 'Cost override must be a number';
    } else if (data.costOverride < 0) {
      errors.costOverride = 'Cost override cannot be negative';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export type LocationRateValidationErrors = {
  defaultRate?: string;
};

export function validateLocationRate(rate: number): LocationRateValidationErrors | null {
  const errors: LocationRateValidationErrors = {};

  if (rate === undefined || rate === null) {
    errors.defaultRate = 'Rate is required';
  } else if (typeof rate !== 'number') {
    errors.defaultRate = 'Rate must be a number';
  } else if (rate <= 0) {
    errors.defaultRate = 'Rate must be greater than 0';
  } else if (rate > 10) {
    errors.defaultRate = 'Rate must be less than $10/kWh';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
