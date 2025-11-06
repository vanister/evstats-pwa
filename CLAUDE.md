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
- **State Management**: Immer for complex/large state objects (via `useImmerState` hook)
- **Date Handling**: date-fns
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa with Workbox
- **Cloud Backup**: Google Drive API

## File Naming Conventions
- **Components**: TitleCase with `.tsx` extension (e.g., `VehicleForm.tsx`, `SessionList.tsx`)
  - **Exception**: `main.tsx` uses camelCase as the application entry point
- **Hooks**: Separate folder `src/hooks/` with each hook in its own file (e.g., `useImmerState.ts`)
- **Helpers/Utils/Other files**: camelCase with `.ts` extension (e.g., `validation.ts`, `dates.ts`, `db.ts`)

## Folder Organization
- **Screen-specific components**: Grouped in `src/screens/{feature}/` (e.g., `src/screens/vehicles/VehicleForm.tsx`)
- **Shared/reusable components**: In `src/components/` or feature-specific subfolders
- **Principle**: Organize by feature/screen for better scalability and maintainability

## State Management Guidelines
- **Simple state**: Use standard `useState` for primitives (strings, numbers, booleans)
- **Complex state objects**: Use `useImmerState` hook for objects with nested properties or frequent updates
- **Examples of when to use Immer**:
  - Form data objects with multiple fields
  - Validation error objects
  - Complex UI state with nested properties
- **Benefits**: Allows mutable-style updates while maintaining immutability under the hood

## API References
- **Dexie.js**: https://dexie.org/docs/API-Reference - IndexedDB wrapper API documentation

## MCP Servers
This project has Chakra UI MCP server configured in `.vscode/mcp.json`:
- **Claude Code** Check to see if you have the same Chakra UI MCP server installed.
- **chakra-ui**: Provides Chakra UI component documentation and assistance
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
  screens/             # Screen-specific components grouped by feature
    vehicles/
      VehicleForm.tsx
      VehicleList.tsx
      VehicleManager.tsx
  components/          # Shared/reusable UI components
    ui/
      ThemeProvider.tsx
  hooks/               # Custom React hooks
    useImmerState.ts
  lib/                 # Utilities and business logic
    db.ts             # Dexie database configuration
    types.ts          # TypeScript type definitions
    dates.ts          # date-fns utility functions
    validation.ts     # Form validation helpers
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
4. **ALWAYS update `docs/tasks.md`** - Mark ALL acceptance criteria checkboxes as complete `[x]` when task is finished
5. Test thoroughly before marking task complete
6. Confirm task completion with user before moving to next task
7. Commit after each major task completion (including the updated `docs/tasks.md`)
8. Format code to 80 chars per the .pretterrc file settings 

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