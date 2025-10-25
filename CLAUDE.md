# EV Charge Tracker PWA - Project Context

## Key Documentation
Always reference these files for project requirements and progress:
- `docs/technical-design.md` - Complete app architecture, data models, and tech stack specifications
- `docs/tasks.md` - Detailed implementation checklist with acceptance criteria (update as tasks complete)

## Tech Stack
- **Build Tool**: Vite 7+
- **Framework**: React 19 with TypeScript 5+
- **UI Library**: Chakra UI v3 (using @next tag for React 19 compatibility)
- **Routing**: React Router v7
- **Database**: IndexedDB via Dexie.js with dexie-react-hooks
- **Date Handling**: date-fns
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa with Workbox
- **Cloud Backup**: Google Drive API

## MCP Servers
This project has Chakra UI MCP server configured in `.vscode/mcp.json`:
- **chakra-ui**: Provides Chakra UI component documentation and assistance
- Start server: See `.vscode/mcp.json` for configuration (runs via `npx -y @chakra-ui/react-mcp`)
- **Note**: If you need the MCP server running, you can ask the user to start it manually

## Data Models

### Vehicle
```typescript
{
  id: string;          // UUID
  year: number;
  make: string;
  model: string;
  batterySize: number; // kWh
  trim?: string;
  nickname?: string;
  range?: number;      // miles
}
```

### Location
```typescript
{
  id: string;          // Fixed: 'home' | 'work' | 'dc' | 'other'
  name: string;
  defaultRate: number; // $ per kWh
}
```

### Session
```typescript
{
  id: string;          // UUID
  vehicleId: string;   // FK to Vehicle
  locationId: string;  // FK to Location
  date: string;        // ISO 8601 with timezone
  kwhAdded: number;
  rate: number;        // Rate snapshot (NOT a reference)
  notes?: string;
}
```

## Default Locations (Pre-seeded)
These four locations are created on first app load:
- `home`: "Home" @ $0.17/kWh
- `work`: "Work" @ $0.18/kWh
- `dc`: "DC Fast" @ $0.32/kWh
- `other`: "Other" @ $0.13/kWh

## Critical Implementation Rules

### 1. Rate Snapshot Strategy
Sessions MUST snapshot the current location rate at creation time. Never reference the location's current rate for historical sessions.

```typescript
// CORRECT: Snapshot rate at session creation
const session = {
  rate: location.defaultRate,  // Store the value
  cost: costOverride || (kwhAdded * location.defaultRate)
};

// WRONG: Reference location rate
const cost = kwhAdded * location.rate;  // This breaks historical accuracy
```

### 2. Date Handling
Store all dates as ISO 8601 strings with timezone preservation:
```typescript
const session = {
  date: new Date().toISOString()  // "2024-12-28T14:30:00-08:00"
};
```

Use date-fns for all formatting and parsing operations.

### 3. Offline-First Architecture
- IndexedDB is the primary data store
- All core features work offline
- Google Drive backup is optional and manual
- Handle online/offline state gracefully

### 4. Cost Override
Allow optional cost override in session form for variable DC fast charging pricing:
```typescript
cost: costOverride ?? (kwhAdded * rate)
```

## Project Structure
```
src/
  components/          # React UI components
    SessionForm.tsx
    SessionList.tsx
    VehicleManager.tsx
    Settings.tsx
  lib/                 # Utilities and business logic
    db.ts             # Dexie database configuration
    types.ts          # TypeScript type definitions
    dates.ts          # date-fns utility functions
    backup.ts         # Google Drive backup/restore
    calculations.ts   # Cost and analytics calculations
  App.tsx             # Main app with routing
  main.tsx            # Entry point
```

## Development Workflow
**IMPORTANT: One task at a time approach**
1. Outline the plan for the next task before starting
2. Get explicit confirmation from user to proceed
3. Complete ONLY one task at a time from `docs/tasks.md`
4. Mark acceptance criteria as complete in `docs/tasks.md`
5. Test thoroughly before marking task complete
6. Confirm task completion with user before moving to next task
7. Commit after each major task completion

## MVP Features (v1.0)
Focus on these features only:
- Vehicle management (add/edit/delete with full details)
- Session logging with rate snapshot
- Location rate configuration (edit default rates)
- Basic analytics (monthly totals, per-vehicle stats)
- Manual Google Drive backup/restore
- PWA offline functionality

## Post-MVP Features (Future)
Do NOT implement these in v1.0:
- Custom locations
- Advanced charts and analytics
- CSV export
- Bi-directional sync
- Rate history tracking
- Time-of-use rates
- Efficiency tracking (miles/kWh)
