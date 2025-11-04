# Testing Guide

## Overview

This project uses Vitest and React Testing Library for component and unit testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Directory Structure

```
evstats_tracker/
  src/
    screens/
      vehicles/
        VehicleForm.tsx
        VehicleForm.test.tsx      # Test files live next to components
    lib/
      validation.ts
      validation.test.ts          # Test files live next to utilities
  test/                           # Test infrastructure (sibling to src)
    setup.ts                      # Test environment setup
    testUtils.tsx                 # Custom render helpers
    README.md                     # This file
```

**Convention**: Test files (*.test.tsx) live next to the code they test. Test infrastructure lives in `test/` directory.

## Writing Tests

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/testUtils';
import { VehicleForm } from './VehicleForm';

describe('VehicleForm', () => {
  it('renders form fields', () => {
    render(<VehicleForm />);
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
  });
});
```

**Note**: jest-dom matchers (like `toBeInTheDocument()`) are available globally through the configuration in `src/vite-env.d.ts` and `test/setup.ts`.

### Testing Form Validation

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/testUtils';
import userEvent from '@testing-library/user-event';

describe('VehicleForm validation', () => {
  it('shows error for invalid year', async () => {
    const user = userEvent.setup();
    render(<VehicleForm />);

    const yearInput = screen.getByLabelText(/year/i);
    await user.type(yearInput, '1800');
    await user.tab(); // Trigger blur

    expect(screen.getByText(/year must be/i)).toBeInTheDocument();
  });
});
```

### Testing with Mocked Database

```typescript
import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/lib/db';

describe('Database operations', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('creates a vehicle', async () => {
    const vehicle = {
      id: crypto.randomUUID(),
      year: 2024,
      make: 'Tesla',
      model: 'Model 3',
      batterySize: 75,
    };

    await db.vehicles.add(vehicle);
    const saved = await db.vehicles.get(vehicle.id);

    expect(saved).toEqual(vehicle);
  });
});
```

## Custom Test Utilities

The `test/testUtils.tsx` provides a custom `render` function that wraps components with `ThemeProvider` automatically.

**Always use the custom render** from `test/testUtils`:

```typescript
// ✅ Custom render wraps with ThemeProvider automatically
import { render, screen } from '../../../test/testUtils';

// ❌ Don't use plain render - Chakra components will fail
import { render } from '@testing-library/react';
```

The path is relative from your test file location. For deeply nested files like `src/screens/vehicles/VehicleForm.test.tsx`, use `../../../test/testUtils`.

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use accessible queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test user interactions** - Use `userEvent` for realistic interactions
4. **Mock external dependencies** - Mock API calls, IndexedDB, etc.
5. **Keep tests focused** - One concept per test
6. **Use descriptive test names** - Explain what the test verifies

## Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
