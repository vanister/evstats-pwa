import Dexie, { type EntityTable } from 'dexie';
import type { Vehicle, Location, Session } from './types';

const DEFAULT_LOCATIONS: Location[] = [
  { id: 'home', name: 'Home', defaultRate: 0.17 },
  { id: 'work', name: 'Work', defaultRate: 0.18 },
  { id: 'dc', name: 'DC Fast', defaultRate: 0.32 },
  { id: 'other', name: 'Other', defaultRate: 0.13 }
];

const db = new Dexie('evchargetracker') as Dexie & {
  vehicles: EntityTable<Vehicle, 'id'>;
  locations: EntityTable<Location, 'id'>;
  sessions: EntityTable<Session, 'id'>;
};

db.version(1).stores({
  vehicles: 'id',
  locations: 'id',
  sessions: 'id, date, vehicleId'
});

async function initializeDefaultLocations() {
  const count = await db.locations.count();

  if (count === 0) {
    await db.locations.bulkAdd(DEFAULT_LOCATIONS);
  }
}

db.on('ready', () => {
  return initializeDefaultLocations();
});

// Vehicle CRUD operations

export async function addVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const vehicle: Vehicle = {
    id: crypto.randomUUID(),
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

export { db };
