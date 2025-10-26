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

export { db };
