import { format, parseISO, isValid } from 'date-fns';

/**
 * Get current timestamp as ISO 8601 string with timezone
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format an ISO 8601 date string for display
 * @param isoString - ISO 8601 date string
 * @param formatString - date-fns format string (default: 'PPp' = "Dec 28, 2024, 2:30 PM")
 * @returns Formatted date string, or empty string if invalid
 */
export function formatDate(isoString: string, formatString: string = 'PPp'): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) {
      return '';
    }
    return format(date, formatString);
  } catch {
    return '';
  }
}

/**
 * Format date for short display (e.g., "Dec 28, 2024")
 */
export function formatDateShort(isoString: string): string {
  return formatDate(isoString, 'PP');
}

/**
 * Format date with time (e.g., "Dec 28, 2024, 2:30 PM")
 */
export function formatDateTime(isoString: string): string {
  return formatDate(isoString, 'PPp');
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTime(isoString: string): string {
  return formatDate(isoString, 'p');
}

/**
 * Format date for month/year grouping (e.g., "December 2024")
 */
export function formatMonthYear(isoString: string): string {
  return formatDate(isoString, 'MMMM yyyy');
}

/**
 * Parse a date input and return ISO 8601 string
 * @param dateInput - Date object, ISO string, or timestamp
 * @returns ISO 8601 string with timezone, or null if invalid
 */
export function parseToISO(dateInput: Date | string | number): string | null {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(date)) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Validate if a string is a valid ISO 8601 date
 */
export function isValidISODate(isoString: string): boolean {
  try {
    const date = parseISO(isoString);
    return isValid(date);
  } catch {
    return false;
  }
}
