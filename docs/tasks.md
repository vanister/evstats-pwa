# EV Charge Tracker PWA - Implementation Tasks

This checklist provides detailed, self-contained tasks organized by feature domain. Each task includes context, implementation approach, affected files, dependencies, and acceptance criteria.

---

## 1. Project Setup & Foundation

### 1.1 Initialize Vite Project with Dependencies
**Objective:** Set up the base project structure with all required dependencies using latest versions.

**Approach:**
- Create new Vite 7+ project using React 19 + TypeScript template: `npm create vite@latest ev-charge-tracker -- --template react-ts`
- Install React 19: `npm install react@latest react-dom@latest`
- Install Chakra UI v3 (React 19 compatible): `npm install @chakra-ui/react@next @emotion/react @emotion/styled framer-motion`
- Install data layer: `npm install dexie@latest dexie-react-hooks@latest`
- Install utilities: `npm install date-fns@latest recharts@latest`
- Install PWA: `npm install -D vite-plugin-pwa@latest`
- Install dev dependencies: `npm install -D @types/node@latest`
- Install React Router v7 (React 19 compatible): `npm install react-router@latest react-router-dom@latest`

**Version Requirements:**
- Vite: 7.x (latest)
- React: 19.x (latest)
- Chakra UI: 3.x (@next for React 19 support)
- TypeScript: 5.x (comes with Vite template)
- All other packages: latest stable versions compatible with React 19

**Important Notes:**
- Use `@next` tag for Chakra UI to get React 19 compatible version (v3)
- Ensure all peer dependencies are satisfied for React 19
- Check that recharts has React 19 support or use compatible alternative
- Verify dexie-react-hooks works with React 19

**Files:**
- `package.json` - dependency declarations
- `.gitignore` - exclude node_modules, dist, etc.

**Dependencies:** None (first task)

**Acceptance Criteria:**
- [x] Vite 7+ installed and configured
- [x] React 19 and React DOM 19 installed
- [x] Chakra UI v3 (React 19 compatible) installed
- [x] All dependencies compatible with React 19
- [x] Project builds successfully with `npm run dev`
- [x] No peer dependency warnings for React version
- [x] TypeScript compilation works
- [x] Hot reload functions properly

---

### 1.2 Configure Directory Structure
**Objective:** Create organized folder structure following the technical design.

**Approach:**
- Create `src/components/` for React components
- Create `src/lib/` for utilities and database logic
- Organize by separation of concerns (UI vs logic)
- Prepare for future scalability

**Files to Create:**
- `src/components/` directory
- `src/lib/` directory

**Dependencies:** 1.1

**Acceptance Criteria:**
- [x] Directory structure matches technical design
- [x] Folders exist and are accessible
- [x] Clear separation between components and library code

---

### 1.3 Configure Vite for PWA
**Objective:** Set up PWA capabilities with proper manifest and service worker configuration.

**Approach:**
- Import VitePWA plugin in vite.config.ts
- Configure manifest with app name, colors, icons, display mode
- Set up Workbox for caching static assets
- Enable auto-update registration type
- Configure glob patterns for asset caching

**Files:**
- `vite.config.ts` - PWA plugin configuration
- `public/` - app icons and manifest assets

**Dependencies:** 1.1

**Acceptance Criteria:**
- [x] PWA plugin configured in Vite
- [x] Manifest includes all required fields (name, short_name, theme_color, display)
- [x] Service worker registered successfully
- [x] Static assets cached for offline use

---

### 1.4 Set Up TypeScript Configuration
**Objective:** Configure TypeScript for strict type safety and proper module resolution.

**Approach:**
- Enable strict mode for better type safety
- Configure path aliases if needed
- Set up proper DOM and ES library references
- Enable JSX for React

**Files:**
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - Node-specific config

**Dependencies:** 1.1

**Acceptance Criteria:**
- [x] Strict mode enabled
- [x] No TypeScript errors on empty project
- [x] Imports resolve correctly
- [x] React JSX syntax supported

---

### 1.5 Set Up Testing Infrastructure
**Objective:** Configure Vitest and React Testing Library for component and unit testing.

**Approach:**
- Install Vitest as test runner (compatible with Vite)
- Install React Testing Library (@testing-library/react, @testing-library/jest-dom, @testing-library/user-event)
- Install jsdom for DOM simulation in tests
- Configure Vitest in vite.config.ts with globals and jsdom environment
- Create test setup file with cleanup and jest-dom imports
- Create custom test utilities with ThemeProvider wrapper
- Add test scripts to package.json (test, test:ui, test:coverage, test:once)
- Create test/ directory for test infrastructure
- Add coverage directory to .gitignore
- Add TypeScript references for Vitest and jest-dom
- Create initial test files alongside components and utilities

**Files:**
- `package.json` - add testing dependencies and scripts
- `vite.config.ts` - Vitest configuration
- `src/vite-env.d.ts` - TypeScript references for test globals
- `.gitignore` - exclude coverage directory
- `test/setup.ts` - test environment setup with cleanup
- `test/testUtils.tsx` - custom render with ThemeProvider
- `test/README.md` - testing guide and best practices
- `src/lib/dates.test.ts` - initial tests for date utilities
- `src/lib/validation.test.ts` - initial tests for validation utilities
- `src/screens/vehicles/VehicleForm.test.tsx` - initial component tests
- `src/screens/vehicles/VehicleList.test.tsx` - initial component tests

**Dependencies:** 1.1 (Dependencies installed), 3.2 (ChakraProvider for test wrapper)

**Acceptance Criteria:**
- [x] Vitest installed and configured
- [x] React Testing Library dependencies installed
- [x] jsdom environment configured
- [x] Test setup file with afterEach cleanup
- [x] Custom render utility wraps with ThemeProvider
- [x] Test scripts available (test, test:ui, test:coverage, test:once)
- [x] TypeScript recognizes Vitest globals and jest-dom matchers
- [x] Coverage directory excluded from git
- [x] Test infrastructure documented in test/README.md
- [x] Initial test files created for existing utilities and components
- [x] Tests can be run with npm test

---

## 2. Database & Data Layer

### 2.1 Define TypeScript Types
**Objective:** Create all data models and types for the application.

**Approach:**
- Define Vehicle type with all fields (id, year, make, model, batterySize, trim, nickname, range)
- Define Location type (id, name, defaultRate)
- Define Session type (id, vehicleId, locationId, date, kwhAdded, rate, notes)
- Define BackupFile type for export/import
- Use string for IDs (UUIDs)
- Make optional fields properly typed

**Files to Create:**
- `src/lib/types.ts` - all TypeScript interfaces and types

**Dependencies:** 1.2

**Acceptance Criteria:**
- [x] All types match technical design schema
- [x] Optional fields marked with `?`
- [x] Types exported for use across app
- [x] No TypeScript errors

---

### 2.2 Set Up Dexie Database
**Objective:** Configure IndexedDB using Dexie with proper schema and indexes.

**Approach:**
- Create Dexie database instance named 'evchargetracker'
- Define version 1 schema with three tables
- Set up vehicles table with 'id' index
- Set up locations table with 'id' index
- Set up sessions table with compound indexes ('id, date, vehicleId')
- Export typed database instance

**Files to Create:**
- `src/lib/db.ts` - Dexie database configuration

**Dependencies:** 2.1

**Acceptance Criteria:**
- [x] Database instance created and exported
- [x] All three tables defined with correct indexes
- [x] Tables properly typed using TypeScript types from 2.1
- [x] Database opens successfully in browser

---

### 2.3 Seed Default Locations
**Objective:** Initialize database with four preset locations on first run.

**Approach:**
- Create DEFAULT_LOCATIONS constant with home, work, dc, other
- Implement initialization function to check if locations exist
- Seed locations only if table is empty
- Set appropriate default rates per location (home: 0.17, work: 0.18, dc: 0.32, other: 0.13)

**Files:**
- `src/lib/db.ts` - add seeding logic

**Dependencies:** 2.2

**Acceptance Criteria:**
- [x] Four default locations created on first app load
- [x] Locations not duplicated on subsequent loads
- [x] Default rates match technical specification
- [x] Location IDs are fixed strings (not UUIDs)

---

### 2.4 Create Date Utility Functions
**Objective:** Build reusable date formatting and parsing utilities using date-fns.

**Approach:**
- Create function to get current ISO 8601 timestamp with timezone
- Create function to format ISO strings for display (various formats)
- Create function to parse date inputs
- Ensure timezone preservation throughout
- Use date-fns for all date operations

**Files to Create:**
- `src/lib/dates.ts` - date utility functions

**Dependencies:** 2.1

**Acceptance Criteria:**
- [x] Dates stored as ISO 8601 strings with timezone
- [x] Display formatting consistent across app
- [x] Timezone information preserved
- [x] Utilities handle edge cases (invalid dates, etc.)

---

## 3. Vehicle Management

### 3.1 Create Vehicle Database Operations
**Objective:** Implement CRUD operations for vehicle management.

**Approach:**
- Create validation helpers in separate file for form validation
- Create addVehicle function (generates UUID)
- Create updateVehicle function (preserves ID, updates fields)
- Create deleteVehicle function (cascade deletes vehicle and sessions)
- Create getVehicles function (returns all vehicles)
- Create getVehicle function (returns single vehicle by ID)
- Handle errors gracefully

**Files:**
- `src/lib/validation.ts` - validation helpers for forms (field-specific error objects)
- `src/lib/db.ts` - add vehicle operations

**Dependencies:** 2.2

**Acceptance Criteria:**
- [x] All CRUD operations work correctly
- [x] UUIDs generated using crypto.randomUUID()
- [x] Data validation helpers available for forms
- [x] Error handling implemented

---

### 3.2 Set Up Chakra UI Theme
**Objective:** Configure Chakra UI provider with custom theme for the app.

**Approach:**
- Wrap app with ChakraProvider
- Define custom theme with EV-appropriate colors
- Set primary theme color to green (#38A169 per PWA config)
- Configure responsive breakpoints
- Set default font sizes and spacing
- Define component style overrides if needed

**Files:**
- `src/App.tsx` - add ChakraProvider
- `src/theme.ts` - custom theme configuration (if needed)

**Dependencies:** 1.1 (Chakra UI installed)

**Acceptance Criteria:**
- [x] ChakraProvider wraps application
- [x] Custom theme colors applied
- [x] Theme consistent with PWA manifest colors
- [x] Responsive breakpoints configured
- [x] All components use theme values

---

### 3.3 Build Vehicle Form Component
**Objective:** Create form for adding and editing vehicles with all required fields.

**Approach:**
- Use Chakra UI form components
- Include fields: year (number), make (text), model (text), battery size (number)
- Include optional fields: trim, range, nickname
- Implement form validation (required fields, number ranges)
- Support both add and edit modes
- Clear form after successful submission

**Files to Create:**
- `src/components/VehicleForm.tsx` - vehicle form component

**Dependencies:** 3.1 (Vehicle operations), 3.2 (Chakra UI setup)

**Acceptance Criteria:**
- [x] Form includes all required and optional fields
- [x] Validation prevents invalid submissions
- [x] Works in both add and edit modes
- [x] Form clears/resets after submission
- [x] User feedback for success/errors

---

### 3.4 Build Vehicle List Component
**Objective:** Display all vehicles with edit and delete actions.

**Approach:**
- Fetch all vehicles from database on mount
- Display in card or list format showing key details
- Show year, make, model, trim or nickname if available
- Include battery size in display
- Provide edit button (opens form in edit mode)
- Provide delete button with confirmation
- Handle empty state when no vehicles exist

**Files to Create:**
- `src/components/VehicleList.tsx` - vehicle list component

**Dependencies:** 3.1

**Acceptance Criteria:**
- [x] All vehicles displayed with relevant information
- [x] Edit action opens form with pre-filled data
- [x] Delete action shows confirmation before removing
- [x] Empty state shown when no vehicles
- [x] List updates after add/edit/delete

---

### 3.5 Build Vehicles Screen
**Objective:** Create the main Vehicles screen combining form and list into a complete vehicle management interface.

**Approach:**
- Create VehicleManager component as the main Vehicles screen
- Include VehicleList component
- Include "Add Vehicle" button that shows VehicleForm
- Handle state management for showing/hiding form
- Coordinate form submission and list refresh
- Implement proper layout with Chakra UI

**Note:** This builds the Vehicles screen component. Routing/navigation will be connected later in Task 8.2.

**Files to Create:**
- `src/components/VehicleManager.tsx` - main Vehicles screen component

**Dependencies:** 3.3 (VehicleForm), 3.4 (VehicleList)

**Acceptance Criteria:**
- [x] Add button reveals form
- [x] Form and list work together seamlessly
- [x] List refreshes after form submission
- [x] Clean, intuitive UI layout
- [x] Mobile-responsive design

---

## 4. Session Management

### 4.1 Implement Rate Snapshot Logic
**Objective:** Create function to capture current location rate when creating sessions.

**Approach:**
- Implement getLocationRate function that fetches current rate
- Create snapshot mechanism in session creation
- Store rate in session record for historical accuracy
- Allow optional cost override (for variable DC fast charging)
- Calculate cost as kwhAdded * rate (or use override)

**Files:**
- `src/lib/db.ts` - add rate snapshot utilities

**Dependencies:** 2.2, 2.3

**Acceptance Criteria:**
- [ ] Rate captured from location at session creation time
- [ ] Rate stored in session (not referenced)
- [ ] Cost override optional and takes precedence
- [ ] Cost calculation accurate

---

### 4.2 Create Session Database Operations
**Objective:** Implement CRUD operations for charging sessions.

**Approach:**
- Create addSession function (generates UUID, snapshots rate, calculates cost)
- Create updateSession function
- Create deleteSession function
- Create getSessions function (with optional filtering)
- Create getSessionsByVehicle function
- Create getSessionsByDateRange function
- Implement proper date handling

**Files:**
- `src/lib/db.ts` - add session operations

**Dependencies:** 2.2, 4.1

**Acceptance Criteria:**
- [ ] All CRUD operations functional
- [ ] Rate snapshot applied on creation
- [ ] Sessions can be filtered by vehicle and date
- [ ] Proper error handling

---

### 4.3 Build Session Form Component
**Objective:** Create comprehensive form for logging charging sessions.

**Approach:**
- Vehicle dropdown (required) - populated from database
- Location dropdown (required) - show all four locations
- Date/time picker (defaults to now)
- kWh added number input (required, positive numbers only)
- Cost override input (optional, for variable pricing)
- Notes textarea (optional)
- Save and Cancel buttons
- Form validation for required fields
- Clear form after submission

**Files to Create:**
- `src/components/SessionForm.tsx` - session logging form

**Dependencies:** 4.2, 3.1 (needs vehicles)

**Acceptance Criteria:**
- [ ] All fields present and functional
- [ ] Vehicle and location dropdowns populated from database
- [ ] Date picker defaults to current time
- [ ] Required field validation works
- [ ] Cost override optional but validated if provided
- [ ] Form submission creates session correctly

---

### 4.4 Build Session List Component
**Objective:** Display all charging sessions with details and filtering.

**Approach:**
- Fetch sessions from database (initially show recent 30)
- Display in chronological order (newest first)
- Show: date/time, vehicle name, location, kWh added, cost
- Include notes if present
- Support filtering by vehicle, location, date range
- Implement sorting options
- Show calculated totals for filtered view
- Handle empty state

**Files to Create:**
- `src/components/SessionList.tsx` - session display component

**Dependencies:** 4.2

**Acceptance Criteria:**
- [ ] Sessions displayed with all relevant details
- [ ] Sorted by date (newest first)
- [ ] Filtering works for vehicle, location, date
- [ ] Empty state shown when no sessions
- [ ] Cost displayed correctly using snapshotted rate

---

### 4.5 Create Session Cost Calculations
**Objective:** Build utility functions for calculating session costs and totals.

**Approach:**
- Create function to calculate single session cost (kwhAdded * rate or override)
- Create function to sum total cost for session array
- Create function to calculate monthly totals
- Create function to group costs by vehicle
- Create function to group costs by location
- Handle edge cases (no sessions, missing data)

**Files to Create:**
- `src/lib/calculations.ts` - cost calculation utilities

**Dependencies:** 2.1, 4.2

**Acceptance Criteria:**
- [ ] Session cost calculated correctly
- [ ] Totals summed accurately
- [ ] Monthly calculations work across month boundaries
- [ ] Grouping functions return correct aggregates
- [ ] Edge cases handled gracefully

---

## 5. Location & Rate Management

### 5.1 Create Location Database Operations
**Objective:** Implement operations for managing location rates.

**Approach:**
- Create getLocations function (returns all four locations)
- Create getLocation function (by ID)
- Create updateLocationRate function (updates defaultRate only)
- Prevent deletion of default locations
- Validate rate updates (positive numbers only)

**Files:**
- `src/lib/db.ts` - add location operations

**Dependencies:** 2.2, 2.3

**Acceptance Criteria:**
- [ ] Can fetch all locations
- [ ] Can update individual location rates
- [ ] Validation prevents invalid rates
- [ ] Default locations cannot be deleted

---

### 5.2 Build Rate Configuration UI
**Objective:** Create settings interface for editing location rates.

**Approach:**
- Display all four locations with current rates
- Provide edit input for each location's default rate
- Show rate per kWh clearly
- Validate inputs (positive decimals only)
- Save button to persist changes
- Show success/error feedback
- Display when rates were last updated

**Files to Create:**
- `src/components/RateConfig.tsx` - rate editing component

**Dependencies:** 5.1

**Acceptance Criteria:**
- [ ] All four locations shown with current rates
- [ ] Rates editable inline or via modal
- [ ] Validation prevents invalid rates
- [ ] Changes saved to database
- [ ] User feedback on save success/failure

---

## 6. Analytics & Statistics

### 6.1 Implement Monthly Cost Aggregation
**Objective:** Calculate total charging costs grouped by month.

**Approach:**
- Create function to group sessions by month/year
- Sum costs for each month
- Handle sessions across multiple months
- Return data structure suitable for display and charts
- Consider timezone in month boundaries
- Support filtering by vehicle

**Files:**
- `src/lib/calculations.ts` - add monthly aggregation

**Dependencies:** 4.5

**Acceptance Criteria:**
- [ ] Sessions correctly grouped by month
- [ ] Costs summed accurately per month
- [ ] Timezone handled correctly
- [ ] Can filter by specific vehicle
- [ ] Returns clean data structure

---

### 6.2 Build Stats Summary Component
**Objective:** Display key statistics on home screen.

**Approach:**
- Show current month total cost
- Show current month total kWh
- Show number of sessions this month
- Show average cost per session
- Display most-used location
- Use Chakra UI stat components
- Update in real-time as data changes

**Files to Create:**
- `src/components/StatsSummary.tsx` - statistics display

**Dependencies:** 6.1, 4.5

**Acceptance Criteria:**
- [ ] Current month stats calculated correctly
- [ ] All key metrics displayed clearly
- [ ] Stats update when new sessions added
- [ ] Handles month with no sessions gracefully
- [ ] Responsive layout

---

### 6.3 Create Vehicle-Specific Analytics
**Objective:** Build analytics grouped and filtered by vehicle.

**Approach:**
- Create function to filter sessions by vehicle
- Calculate per-vehicle totals (cost, kWh, session count)
- Calculate average cost per kWh by vehicle
- Support date range filtering
- Return data suitable for display or charting

**Files:**
- `src/lib/calculations.ts` - add vehicle analytics

**Dependencies:** 4.5

**Acceptance Criteria:**
- [ ] Sessions correctly filtered by vehicle
- [ ] Per-vehicle totals accurate
- [ ] Averages calculated correctly
- [ ] Date range filtering works
- [ ] Handles vehicles with no sessions

---

## 7. Backup & Restore

### 7.1 Implement Data Export Function
**Objective:** Create function to export all data to JSON format.

**Approach:**
- Fetch all vehicles, locations, and sessions from database
- Create BackupFile structure with version, exportDate, and data
- Serialize to JSON with proper formatting
- Include metadata (version: 1, exportDate as ISO string)
- Return JSON string ready for file save or upload

**Files to Create:**
- `src/lib/backup.ts` - backup/restore utilities

**Dependencies:** 2.1, 2.2

**Acceptance Criteria:**
- [ ] All data exported in correct format
- [ ] JSON structure matches BackupFile type
- [ ] Export includes version and timestamp
- [ ] JSON is valid and properly formatted

---

### 7.2 Implement Data Import/Restore Function
**Objective:** Create function to restore data from backup JSON.

**Approach:**
- Parse JSON backup file
- Validate backup file structure and version
- Clear existing data (with confirmation)
- Import vehicles, locations, and sessions
- Handle import errors gracefully
- Verify data integrity after import
- Return success/failure status

**Files:**
- `src/lib/backup.ts` - add restore function

**Dependencies:** 7.1

**Acceptance Criteria:**
- [ ] Backup file validated before import
- [ ] Data cleared safely before restore
- [ ] All records imported correctly
- [ ] Errors handled with user feedback
- [ ] Database state consistent after import

---

### 7.3 Integrate Google Drive API
**Objective:** Set up Google Drive API for cloud backup storage.

**Approach:**
- Configure Google Cloud project and OAuth 2.0
- Implement authentication flow
- Create function to upload backup file to Drive
- Create function to download backup from Drive
- Store backup in app-specific folder
- Handle authentication errors and token refresh
- Store last backup timestamp

**Files:**
- `src/lib/backup.ts` - add Google Drive integration
- Environment configuration for API credentials

**Dependencies:** 7.1, 7.2

**Acceptance Criteria:**
- [ ] User can authenticate with Google account
- [ ] Backup file uploads successfully to Drive
- [ ] Backup stored in dedicated app folder
- [ ] Can download and restore from Drive backup
- [ ] Authentication state persists appropriately

---

### 7.4 Build Backup Settings UI
**Objective:** Create user interface for backup and restore operations.

**Approach:**
- Add section to Settings screen
- "Backup to Google Drive" button with loading state
- "Restore from Backup" button with confirmation
- Display last backup timestamp
- Show backup/restore progress and status
- Handle errors with clear messaging
- Provide local file export option as fallback

**Files:**
- `src/components/Settings.tsx` - add backup UI section

**Dependencies:** 7.3, 5.2 (Settings screen exists)

**Acceptance Criteria:**
- [ ] Backup button triggers Google Drive upload
- [ ] Restore button shows confirmation before proceeding
- [ ] Last backup time displayed
- [ ] Loading states during operations
- [ ] Success/error messages clear and helpful
- [ ] Local export/import available as backup option

---

## 8. UI/UX & Navigation

### 8.1 Set Up Chakra UI Theme
**Note:** This task was moved earlier to Task 3.2 to support building vehicle form components. See Task 3.2 for details.

---

### 8.2 Create Main Navigation
**Objective:** Build navigation system between main screens.

**Approach:**
- Set up routing (using React Router or similar)
- Create navigation component (tab bar or drawer)
- Define routes: Home, Vehicles, Add Session, Settings
- Highlight active route
- Make navigation mobile-friendly
- Ensure navigation accessible on all screens

**Files:**
- `src/App.tsx` - routing setup
- `src/components/Navigation.tsx` - navigation component

**Dependencies:** 8.1

**Acceptance Criteria:**
- [ ] All main screens accessible via navigation
- [ ] Active route highlighted
- [ ] Navigation works on mobile and desktop
- [ ] Routes map to correct components
- [ ] Browser back/forward work correctly

---

### 8.3 Build Home Screen
**Objective:** Create main dashboard with quick actions and recent activity.

**Approach:**
- Display StatsSummary component for current month
- Show recent sessions (last 30)
- Include prominent "Add Session" button
- Display quick stats (total sessions, avg cost, etc.)
- Provide navigation to other screens
- Ensure mobile-responsive layout

**Files to Create:**
- `src/components/Home.tsx` - home screen component

**Dependencies:** 6.2 (StatsSummary), 4.4 (SessionList), 8.1

**Acceptance Criteria:**
- [ ] Stats summary displayed prominently
- [ ] Recent sessions shown (last 30)
- [ ] Quick "Add Session" button functional
- [ ] Navigation to other screens easy
- [ ] Layout responsive on all devices

---

### 8.4 Build Settings Screen
**Objective:** Create comprehensive settings interface.

**Approach:**
- Include RateConfig component for location rates
- Include backup/restore section
- Add "About" section with version info
- Add PWA install prompt (if not installed)
- Organize sections clearly with headings
- Use Chakra UI for consistent styling

**Files to Create:**
- `src/components/Settings.tsx` - settings screen

**Dependencies:** 5.2 (RateConfig), 7.4 (Backup UI), 8.1

**Acceptance Criteria:**
- [ ] Rate configuration accessible and functional
- [ ] Backup/restore section complete
- [ ] About section shows app info
- [ ] PWA install prompt shown when appropriate
- [ ] Sections well-organized and scannable

---

### 8.5 Implement Loading and Error States
**Objective:** Add proper loading indicators and error handling throughout app.

**Approach:**
- Create reusable loading component (spinner or skeleton)
- Create error boundary component
- Show loading states during data fetches
- Display user-friendly error messages
- Handle network errors gracefully
- Provide retry mechanisms where appropriate

**Files to Create:**
- `src/components/LoadingSpinner.tsx` - loading component
- `src/components/ErrorBoundary.tsx` - error boundary

**Dependencies:** 8.1

**Acceptance Criteria:**
- [ ] Loading states shown during async operations
- [ ] Errors caught and displayed user-friendly
- [ ] Error boundary prevents app crashes
- [ ] Users can retry failed operations
- [ ] Offline state handled gracefully

---

### 8.6 Ensure Mobile Responsiveness
**Objective:** Verify and optimize all screens for mobile devices.

**Approach:**
- Test all components on mobile viewport sizes
- Ensure touch targets are appropriately sized
- Make forms mobile-friendly (appropriate inputs, keyboards)
- Use responsive Chakra UI components
- Test on actual mobile devices if possible
- Optimize spacing and sizing for small screens

**Files:**
- All component files - responsive adjustments as needed

**Dependencies:** All UI components (3.x, 4.x, 5.x, 6.x, 8.x)

**Acceptance Criteria:**
- [ ] All screens usable on mobile devices
- [ ] Forms easy to fill on touchscreens
- [ ] Navigation accessible on mobile
- [ ] No horizontal scrolling on mobile
- [ ] Text readable without zooming

---

## 9. PWA Configuration

### 9.1 Configure Service Worker Caching
**Objective:** Set up service worker to cache assets for offline use.

**Approach:**
- Configure Workbox glob patterns to cache JS, CSS, HTML, images
- Set up runtime caching for API calls (if any)
- Implement offline fallback pages
- Configure cache update strategy
- Test offline functionality

**Files:**
- `vite.config.ts` - Workbox configuration

**Dependencies:** 1.3 (PWA plugin configured)

**Acceptance Criteria:**
- [ ] Static assets cached on install
- [ ] App loads offline
- [ ] Updates fetch in background
- [ ] Cache invalidation works correctly
- [ ] Offline fallbacks functional

---

### 9.2 Create App Manifest and Icons
**Objective:** Set up complete PWA manifest with all required assets.

**Approach:**
- Generate app icons in multiple sizes (192x192, 512x512, etc.)
- Create manifest.json with complete metadata
- Set theme color to green (#38A169)
- Configure display mode to standalone
- Add start_url and scope
- Set background color and orientation

**Files:**
- `public/manifest.json` - PWA manifest
- `public/icons/` - app icons in various sizes

**Dependencies:** 1.3

**Acceptance Criteria:**
- [ ] Manifest complete with all fields
- [ ] Icons generated in required sizes
- [ ] Theme and background colors match design
- [ ] Display mode set to standalone
- [ ] Manifest validates successfully

---

### 9.3 Implement Install Prompt
**Objective:** Add UI to prompt users to install the PWA.

**Approach:**
- Listen for beforeinstallprompt event
- Create Install button in Settings
- Show install prompt when user clicks
- Hide button after installation
- Track installation state
- Provide instructions for browsers that don't support prompt

**Files:**
- `src/components/Settings.tsx` - add install button
- `src/hooks/useInstallPrompt.ts` - install prompt hook

**Dependencies:** 9.2

**Acceptance Criteria:**
- [ ] Install button appears when app installable
- [ ] Click triggers browser install prompt
- [ ] Button hides after installation
- [ ] Works across different browsers
- [ ] Fallback instructions for unsupported browsers

---

### 9.4 Test Offline Functionality
**Objective:** Verify all core features work without internet connection.

**Approach:**
- Test app with network disabled
- Verify database operations work offline
- Confirm UI remains functional
- Check that new sessions can be logged offline
- Verify cached assets load correctly
- Test that online-only features (Google Drive) degrade gracefully

**Files:**
- N/A - testing task

**Dependencies:** 9.1, all core features (3.x, 4.x, 5.x, 6.x)

**Acceptance Criteria:**
- [ ] App loads and functions offline
- [ ] Can log sessions without network
- [ ] Database operations work offline
- [ ] Cached assets serve correctly
- [ ] Online-only features show appropriate messaging

---

## 10. Testing & Validation

### 10.1 Test Data Persistence
**Objective:** Verify IndexedDB data persists across sessions and browser restarts.

**Approach:**
- Create test data (vehicles, locations, sessions)
- Close and reopen browser
- Verify all data still present
- Test data updates persist
- Test data deletion persists
- Check multiple browser tabs don't cause conflicts

**Files:**
- N/A - testing task

**Dependencies:** 2.2, 3.1, 4.2, 5.1

**Acceptance Criteria:**
- [ ] Data survives browser restart
- [ ] Updates persist correctly
- [ ] Deletions persist correctly
- [ ] No data corruption across sessions
- [ ] Multi-tab access works correctly

---

### 10.2 Verify Rate Snapshot Accuracy
**Objective:** Ensure historical rate snapshots remain accurate after rate changes.

**Approach:**
- Create sessions with current rates
- Change location rates
- Verify old sessions still show original rates
- Confirm new sessions use updated rates
- Test cost calculations use snapshotted rates
- Verify monthly totals remain accurate after rate changes

**Files:**
- N/A - testing task

**Dependencies:** 4.1, 5.1

**Acceptance Criteria:**
- [ ] Historical sessions preserve original rates
- [ ] New sessions capture current rates
- [ ] Cost calculations always use session rate (not location rate)
- [ ] Historical data integrity maintained
- [ ] Rate changes don't affect past calculations

---

### 10.3 Test Backup and Restore Workflow
**Objective:** Verify complete backup and restore process works correctly.

**Approach:**
- Create full dataset (vehicles, sessions with various dates)
- Export backup (both local and Google Drive)
- Clear all data
- Restore from backup
- Verify all data restored correctly
- Test edge cases (empty backup, corrupted file, version mismatch)

**Files:**
- N/A - testing task

**Dependencies:** 7.1, 7.2, 7.3

**Acceptance Criteria:**
- [ ] Backup exports all data completely
- [ ] Restore recreates exact data state
- [ ] No data loss in backup/restore cycle
- [ ] Corrupted backups handled gracefully
- [ ] Both local and cloud backup work

---

### 10.4 Test Multi-Vehicle Support
**Objective:** Verify app correctly handles multiple vehicles and vehicle-specific data.

**Approach:**
- Create 3+ vehicles
- Create sessions for each vehicle
- Test filtering sessions by vehicle
- Test vehicle-specific analytics
- Delete a vehicle and verify orphaned sessions handled
- Test editing vehicle doesn't affect sessions

**Files:**
- N/A - testing task

**Dependencies:** 3.x, 4.x, 6.3

**Acceptance Criteria:**
- [ ] Multiple vehicles display correctly
- [ ] Sessions correctly associated with vehicles
- [ ] Filtering by vehicle works accurately
- [ ] Analytics per vehicle calculated correctly
- [ ] Deleting vehicle handled appropriately

---

### 10.5 Cross-Browser Compatibility Testing
**Objective:** Ensure app works across major browsers and devices.

**Approach:**
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers (iOS Safari, Chrome Mobile)
- Verify PWA features work on each browser
- Test IndexedDB compatibility
- Verify responsive layouts on different screens
- Check for browser-specific bugs

**Files:**
- N/A - testing task

**Dependencies:** All features complete

**Acceptance Criteria:**
- [ ] App functional on all major browsers
- [ ] PWA installable on supporting browsers
- [ ] Mobile experience consistent across devices
- [ ] No critical browser-specific bugs
- [ ] Graceful degradation where features unsupported

---

### 10.6 End-to-End User Flow Testing
**Objective:** Test complete user workflows from start to finish.

**Approach:**
- Test new user flow: install, add vehicle, configure rates, log session
- Test daily use: open app, log session, view stats
- Test monthly review: view analytics, check costs, export data
- Test backup workflow: backup data, restore on new device
- Identify and fix any UX friction points

**Files:**
- N/A - testing task

**Dependencies:** All features complete

**Acceptance Criteria:**
- [ ] New user onboarding smooth
- [ ] Daily logging workflow efficient
- [ ] Analytics and reports useful and accurate
- [ ] Backup/restore process clear and reliable
- [ ] No major UX issues identified

---

## Task Completion Notes

- Mark tasks complete only when all acceptance criteria are met
- Test each feature thoroughly before moving to dependent tasks
- Keep technical design document updated if changes made during implementation
- Document any deviations from the original plan
- Consider creating smaller subtasks for complex items as needed

## Next Steps After All Tasks Complete

1. Gather initial user feedback
2. Identify most-requested features for v2.0
3. Prioritize post-MVP features from technical design
4. Consider performance optimizations
5. Plan for enhanced analytics and charting
