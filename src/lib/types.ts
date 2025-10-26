export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  batterySize: number;
  trim?: string;
  nickname?: string;
  range?: number;
};

export type Location = {
  id: string;
  name: string;
  defaultRate: number;
};

export type Session = {
  id: string;
  vehicleId: string;
  locationId: string;
  date: string;
  kwhAdded: number;
  rate: number;
  notes?: string;
};

export type BackupFile = {
  version: number;
  exportDate: string;
  data: {
    vehicles: Vehicle[];
    locations: Location[];
    sessions: Session[];
  };
};

export type Locations = 'home' | 'work' | 'dc' | 'other';
