# EV Charge Tracker PWA

A Progressive Web App for tracking electric vehicle charging sessions, costs, and statistics. Built with offline-first architecture for reliable data tracking anywhere.

## Features

### MVP (v1.0)

- **Vehicle Management** - Add and manage multiple EVs with full details (year, make, model, trim, battery size, range)
- **Session Logging** - Track charging sessions with date, location, kWh added, and optional notes
- **Smart Cost Tracking** - Automatic cost calculation with location-based rates and optional cost override for variable pricing
- **Location-Based Rates** - Four preset locations (Home, Work, DC Fast, Other) with customizable default rates
- **Basic Analytics** - View monthly cost totals and per-vehicle statistics
- **Data Backup** - Manual backup and restore via Google Drive
- **Offline-First** - Full functionality without internet connection using IndexedDB
- **PWA Support** - Install as a native app on mobile and desktop

## Tech Stack

- **Build Tool:** Vite 7+
- **Framework:** React 19 with TypeScript 5+
- **UI Library:** Chakra UI v3
- **Routing:** React Router v7
- **Database:** IndexedDB via Dexie.js
- **Date Handling:** date-fns
- **Charts:** Recharts
- **PWA:** vite-plugin-pwa with Workbox

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd evstats_tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Model

### Vehicle
- ID, year, make, model, trim (optional)
- Battery size (kWh), range (optional), nickname (optional)

### Location
- Four preset locations: Home, Work, DC Fast, Other
- Each with customizable default rate per kWh

### Charging Session
- Vehicle and location reference
- Date/time with timezone
- kWh added
- Rate snapshot (preserves historical accuracy)
- Optional cost override
- Optional notes

## Key Features

### Rate Snapshot Strategy
Sessions capture the location rate at the time of charging, ensuring historical cost accuracy even when rates change.

### Offline-First Architecture
All data stored locally in IndexedDB. The app works completely offline with optional cloud backup.

### Cost Override
Flexible pricing for variable-rate DC fast charging - override the calculated cost when needed.

## Future Features (Post-MVP)

- Custom locations
- Advanced charts and analytics
- CSV export
- Bi-directional sync
- Rate history tracking
- Time-of-use rates
- Efficiency tracking (miles/kWh)

## Project Structure

```
src/
  components/       # React UI components
  lib/             # Utilities and business logic
    db.ts          # Dexie database configuration
    types.ts       # TypeScript type definitions
    dates.ts       # date-fns utilities
    backup.ts      # Google Drive backup/restore
  App.tsx          # Main app with routing
  main.tsx         # Entry point
```

## Development

The app uses IndexedDB for local storage with four pre-seeded charging locations. All dates are stored as ISO 8601 strings with timezone preservation. See `docs/technical-design.md` for detailed architecture and implementation notes.

## License

MIT License - see [LICENSE](LICENSE) file for details
