import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

beforeAll(() => {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Could not parse CSS stylesheet')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterEach(() => {
  cleanup();
});
