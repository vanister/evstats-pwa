import type { Vehicle } from './types';
import type { DbInstance } from './dexieDb';
import { createDexieDb } from './dexieDb';

let db: DbInstance = createDexieDb();

export function setDb(newDb: DbInstance): void {
  db = newDb;
}

export function getDb(): DbInstance {
  return db;
}

// Vehicle CRUD operations

export async function addVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const vehicle: Vehicle = {
    id: crypto.randomUUID(),
    ...data,
  };

  await db.vehicles.add(vehicle);

  return vehicle;
}

export async function updateVehicle(
  id: string,
  updates: Partial<Omit<Vehicle, 'id'>>,
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
