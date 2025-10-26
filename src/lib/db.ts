import Dexie, { type EntityTable } from 'dexie';
import type { Vehicle, Location, Session } from './types';

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

export { db };
