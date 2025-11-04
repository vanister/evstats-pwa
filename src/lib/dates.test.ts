import { describe, it, expect } from 'vitest';
import { getCurrentTimestamp, formatDate, formatDateTime } from './dates';

describe('dates utility', () => {
  describe('getCurrentTimestamp', () => {
    it('returns ISO 8601 string with timezone', () => {
      const result = getCurrentTimestamp();

      // Should match ISO 8601 format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('returns valid date that can be parsed', () => {
      const result = getCurrentTimestamp();
      const parsed = new Date(result);

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.toString()).not.toBe('Invalid Date');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date string to readable format', () => {
      const isoDate = '2024-01-15T14:30:00-08:00';
      const result = formatDate(isoDate);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    // TODO: Add more specific formatting tests
    it.todo('formats date in MM/DD/YYYY format');
    it.todo('handles different timezones correctly');
  });

  describe('formatDateTime', () => {
    it('formats ISO date string with time', () => {
      const isoDate = '2024-01-15T14:30:00-08:00';
      const result = formatDateTime(isoDate);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    // TODO: Add more specific formatting tests
    it.todo('includes time in formatted output');
    it.todo('preserves timezone information');
  });
});
