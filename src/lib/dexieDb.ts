import Dexie, { type EntityTable } from 'dexie';
import type { Vehicle, Location, Session } from './types';

export const DEFAULT_LOCATIONS: Location[] = [
  { id: 'home', name: 'Home', defaultRate: 0.17 },
  { id: 'work', name: 'Work', defaultRate: 0.18 },
  { id: 'dc', name: 'DC Fast', defaultRate: 0.32 },
  { id: 'other', name: 'Other', defaultRate: 0.13 },
];

export type DbInstance = Dexie & {
  vehicles: EntityTable<Vehicle, 'id'>;
  locations: EntityTable<Location, 'id'>;
  sessions: EntityTable<Session, 'id'>;
};

export function createDexieDb(): DbInstance {
  const database = new Dexie('evchargetracker') as DbInstance;

  database.version(1).stores({
    vehicles: 'id',
    locations: 'id',
    sessions: 'id, date, vehicleId',
  });

  database.on('ready', async () => {
    const count = await database.locations.count();
    if (count === 0) {
      await database.locations.bulkAdd(DEFAULT_LOCATIONS);
    }
  });

  return database;
}
