export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  batterySize: number;
  trim?: string;
  nickname?: string;
  range?: number;
}

export interface Location {
  id: string;
  name: string;
  defaultRate: number;
}

export interface Session {
  id: string;
  vehicleId: string;
  locationId: string;
  date: string;
  kwhAdded: number;
  rate: number;
  notes?: string;
}

export interface BackupFile {
  version: number;
  exportDate: string;
  data: {
    vehicles: Vehicle[];
    locations: Location[];
    sessions: Session[];
  };
}

export type LocationId = 'home' | 'work' | 'dc' | 'other';
