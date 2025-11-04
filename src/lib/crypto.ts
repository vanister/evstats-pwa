/**
 * Generate a unique identifier using crypto.randomUUID()
 * This function can be easily mocked in tests for predictable IDs
 */
export function generateId(): string {
  return crypto.randomUUID();
}
