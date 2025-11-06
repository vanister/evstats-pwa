import type { Vehicle, Location, Locations, Session } from './types';
import type { DbInstance } from './dexieDb';
import { getCurrentTimestamp } from './dates';
import { generateId } from './crypto';
import { validateLocationRate } from './validation';

let db: DbInstance;

export function initDb(dbInstance: DbInstance): void {
  db = dbInstance;
}

// Vehicle CRUD operations

export async function addVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const vehicle: Vehicle = {
    id: generateId(),
    ...data
  };

  await db.vehicles.add(vehicle);

  return vehicle;
}

export async function updateVehicle(
  id: string,
  updates: Partial<Omit<Vehicle, 'id'>>
): Promise<Vehicle> {
  const existing = await db.vehicles.get(id);

  if (!existing) {
    throw new Error(`Vehicle with id ${id} not found`);
  }

  const updated = { ...existing, ...updates };
  await db.vehicles.put(updated);

  return updated;
}

export async function getVehicles(): Promise<Vehicle[]> {
  return db.vehicles.toArray();
}

export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  return db.vehicles.get(id);
}

export async function deleteVehicle(id: string): Promise<void> {
  await db.transaction('rw', db.vehicles, db.sessions, async () => {
    const vehicle = await db.vehicles.get(id);

    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }

    await db.sessions.where('vehicleId').equals(id).delete();
    await db.vehicles.delete(id);
  });
}

// Location operations

export async function getLocations(): Promise<Location[]> {
  return db.locations.toArray();
}

export async function getLocation(id: Locations): Promise<Location | undefined> {
  return db.locations.get(id);
}

export async function updateLocationRate(id: Locations, newRate: number): Promise<Location> {
  const validationErrors = validateLocationRate(newRate);

  if (validationErrors) {
    throw new Error(validationErrors.defaultRate || 'Invalid rate');
  }

  const existing = await db.locations.get(id);

  if (!existing) {
    throw new Error(`Location with id ${id} not found`);
  }

  const updated = { ...existing, defaultRate: newRate };
  await db.locations.put(updated);

  return updated;
}

// Rate snapshot utilities

export async function getLocationRate(locationId: Locations): Promise<number> {
  const location = await db.locations.get(locationId);

  if (!location) {
    throw new Error(`Location with id ${locationId} not found`);
  }

  return location.defaultRate;
}

export function calculateSessionCost(
  kwhAdded: number,
  rate: number,
  costOverride?: number
): number {
  if (costOverride != null) {
    return costOverride;
  }

  return kwhAdded * rate;
}

// Session CRUD operations

export async function addSession(
  data: Omit<Session, 'id' | 'rate'> & { costOverride?: number }
): Promise<Session> {
  const rate = await getLocationRate(data.locationId);

  const session: Session = {
    id: generateId(),
    vehicleId: data.vehicleId,
    locationId: data.locationId,
    date: data.date || getCurrentTimestamp(),
    kwhAdded: data.kwhAdded,
    rate,
    notes: data.notes
  };

  await db.sessions.add(session);

  return session;
}

export async function updateSession(
  id: string,
  updates: Partial<Omit<Session, 'id'>>
): Promise<Session> {
  const existing = await db.sessions.get(id);

  if (!existing) {
    throw new Error(`Session with id ${id} not found`);
  }

  const updated = { ...existing, ...updates };
  await db.sessions.put(updated);

  return updated;
}

export async function deleteSession(id: string): Promise<void> {
  const session = await db.sessions.get(id);

  if (!session) {
    throw new Error(`Session with id ${id} not found`);
  }

  await db.sessions.delete(id);
}

export async function getSessions(): Promise<Session[]> {
  return db.sessions.orderBy('date').reverse().toArray();
}

export async function getSessionsByVehicle(vehicleId: string): Promise<Session[]> {
  return db.sessions.where('vehicleId').equals(vehicleId).reverse().sortBy('date');
}

export async function getSessionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Session[]> {
  return db.sessions.where('date').between(startDate, endDate, true, true).reverse().sortBy('date');
}
