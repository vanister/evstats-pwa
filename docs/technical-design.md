# EV Charge Tracker PWA

## Overview

A Progressive Web App (PWA) for tracking electric vehicle charging sessions, costs, and statistics. Built with offline-first architecture using IndexedDB for local storage and optional cloud backup to Google Drive.

## Tech Stack

- **Build Tool**: Vite 7+
- **Framework**: React 19 with TypeScript 5+
- **UI Library**: Chakra UI v3 (React 19 compatible)
- **Routing**: React Router v7
- **Database**: IndexedDB (via Dexie.js with React hooks)
- **Date Handling**: date-fns
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin
- **Cloud Storage**: Google Drive API (for backup)

## Data Model

### Database Schema

```typescript
type Vehicle {
	/** uuid */
  id: string;
  year: number;
	make: string;
	model: string;
  batterySize: number;  
	trim?: string;
  nickname?: string;               
  range?: number
}

type Location {
  id: string;                // home | dc | other | work
  name: string;              // Display name
  defaultRate: number;       // Current rate per kWh
}

type Session {
  id: string;                // UUID
  vehicleId: string;         // FK to Vehicle
  locationId: string;        // FK to Location
  date: string;              // ISO 8601 with timezone
  kwhAdded: number;          // Energy added
  rate: number;              // Rate snapshot at session time
  notes?: string;            // Optional notes
}
```

### IndexedDB Setup

```typescript
// Using Dexie.js
const db = new Dexie('evchargetracker');

db.version(1).stores({
  vehicles: 'id',
  locations: 'id',
  sessions: 'id, date, vehicleId'
});
```

### Default Data

```typescript
// Pre-seeded locations
const DEFAULT_LOCATIONS = [
  { id: 'home', name: 'Home', defaultRate: 0.17 },
  { id: 'work', name: 'Work', defaultRate: 0.18 },
  { id: 'dc', name: 'DC Fast', defaultRate: 0.32 },
  { id: 'other', name: 'Other', defaultRate: 0.13 }
];
```

## Features

### MVP Features (v1.0)

- ✅ **Vehicle Management**
    - Add/edit vehicles (nickname & battery size only)
    - Support multiple vehicles
    
- ✅ **Session Logging**
    - Log charging sessions with date/time
    - Select vehicle and location
    - Enter kWh added
    - Optional cost override (for variable DC pricing)
    - Rate snapshot at session time
    - Optional notes

- ✅ **Location & Rates**
    - Four preset locations (Home, Work, DC, Other)
    - Editable default rates per location
    - Rates are snapshotted in sessions for historical accuracy

- ✅ **Basic Analytics**
    - View all sessions list
    - Monthly cost totals
    - Sessions grouped by vehicle

- ✅ **Data Backup**    
    - Manual backup to Google Drive
    - Single JSON file export
    - Full restore from backup

- ✅ **PWA Features**    
    - Offline-first operation
    - Install as app
    - Works without internet connection

### Future Features (Post-MVP)

- ❌ Custom locations
- ❌ Detailed vehicle specs (make/model/year/trim)
- ❌ Advanced charts and analytics
- ❌ CSV export
- ❌ Bi-directional sync
- ❌ Rate history tracking
- ❌ Time-of-use rates
- ❌ Efficiency tracking (miles/kWh)

## Component Structure

```
src/
  components/
    SessionForm.tsx       // Add new session
    SessionList.tsx       // Display all sessions
    VehicleManager.tsx    // Add/edit vehicles
    Settings.tsx          // Edit rates & backup
    
  lib/
    db.ts                 // Dexie database setup
    types.ts              // TypeScript types
    dates.ts              // date-fns utilities
    backup.ts             // Cloud backup
    
  App.tsx                 // Main app with routing
  main.tsx                // Entry point
```

## UI Screens

### 1. Vehicles Screen

- List of vehicles with nickname or year, make, model, trim & battery size
- Add vehicle button
- Edit/Delete options
- Simple form:
	- Year
	- Make
	- Model
	- Battery Size
	- Optional:
		- Trim
		- Range
		- Nickname

### 2. Add Session Form

- Vehicle dropdown (required)
- Location dropdown (required)
- Date/time picker (defaults to now)
- kWh added input (required)
- Cost override input (optional)
- Notes textarea (optional)
- Save & Cancel buttons

### 3. Home Screen

- Recent sessions (last 30)
- Quick "Add Session" button
- Current month total cost
- Simple stats summary

### 4. Settings Screen

- **Rate Configuration**
    - Edit rate for each location
    - Shows current rate per kWh
- **Data Management**
    - Backup to Cloud Drive button
    - Restore from backup button
    - Last backup timestamp
- **About**
    - Version info
    - PWA install button

## Key Implementation Details

### Date Handling

```typescript
// Store all dates as ISO 8601 strings with timezone
const session = {
  date: new Date().toISOString(), // "2024-12-28T14:30:00-08:00"
};

// Display using date-fns
import { format, parseISO } from 'date-fns';
format(parseISO(session.date), 'PPp'); // "Dec 28, 2024 2:30 PM"
```

### Rate Snapshot Strategy

```typescript
// When creating a session, snapshot the current rate
const createSession = async (data: FormData) => {
  const location = await db.locations.get(data.locationId);
  
  const session = {
    id: crypto.randomUUID(),
    ...data,
    rate: location.defaultRate,  // Snapshot current rate
    cost: data.costOverride || (data.kwhAdded * location.defaultRate)
  };
  
  await db.sessions.add(session);
};
```

### Backup Format

```typescript
type BackupFile {
  version: 1;
  exportDate: string;
  data: {
    vehicles: Vehicle[];
    locations: Location[];
    sessions: Session[];
  };
}

// Single file: ev-tracker-backup.json
// Stored in app folder in Cloud Drive
```

## Development Setup

```bash
# Create project with Vite 7+ and React 19
npm create vite@latest ev-charge-tracker -- --template react-ts
cd ev-charge-tracker

# Upgrade to React 19
npm install react@latest react-dom@latest

# Install UI framework (Chakra UI v3 for React 19 support)
npm install @chakra-ui/react@next @emotion/react @emotion/styled framer-motion

# Install routing
npm install react-router@latest react-router-dom@latest

# Install database and utilities
npm install dexie@latest dexie-react-hooks@latest
npm install date-fns@latest recharts@latest

# Install dev dependencies
npm install -D vite-plugin-pwa@latest @types/node@latest
```

**Important:** Use `@next` tag for Chakra UI to ensure React 19 compatibility (v3). All packages should be latest versions compatible with React 19.

## PWA Configuration

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EV Charge Tracker',
        short_name: 'EV Tracker',
        theme_color: '#38A169',
        display: 'standalone',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
};
```

## Migration Path to SQL

The table-like structure allows easy migration to PostgreSQL in the future:

```sql
-- Direct mapping from IndexedDB to SQL
CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  nickname VARCHAR(100),
  battery_size DECIMAL(5,2),
  created_at TIMESTAMP
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  location_id VARCHAR(20),
  date TIMESTAMP,
  kwh_added DECIMAL(6,3),
  rate DECIMAL(5,3),
  cost DECIMAL(8,2),
  notes TEXT
);
```

## Success Metrics

- User can track charging sessions offline
- Calculate monthly charging costs
- Data persists between app sessions
- Can backup/restore data via Cloud Drives
- Installs as PWA on mobile/desktop

## Next Steps After MVP

1. Gather user feedback on most needed features
2. Add basic charts (cost over time, kWh by location)
3. Implement CSV export
4. Add custom locations
5. Consider bi-directional sync based on usage patterns
