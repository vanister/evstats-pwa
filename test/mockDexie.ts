import { vi } from 'vitest';
import type { DbInstance } from '@/lib/dexieDb';
import type { Vehicle, Location, Session } from '@/lib/types';

type TableData = Vehicle | Location | Session;

export type MockDbInstance = DbInstance & {
  reset: () => void;
};

function createMockTable<T extends TableData>() {
  const data = new Map<string, T>();

  return {
    add: vi.fn(async (item: T) => {
      const id = (item as { id: string }).id;
      if (data.has(id)) {
        throw new Error(`Item with id ${id} already exists`);
      }
      data.set(id, item);
      return id;
    }),
    bulkAdd: vi.fn(async (items: T[]) => {
      items.forEach((item) => data.set((item as { id: string }).id, item));
      return '';
    }),
    put: vi.fn(async (item: T) => {
      const id = (item as { id: string }).id;
      data.set(id, item);
      return id;
    }),
    get: vi.fn(async (id: string) => data.get(id)),
    toArray: vi.fn(async () => Array.from(data.values())),
    delete: vi.fn(async (id: string) => {
      data.delete(id);
    }),
    count: vi.fn(async () => data.size),
    where: vi.fn((field: keyof T) => ({
      equals: (value: unknown) => ({
        delete: vi.fn(async () => {
          for (const [id, item] of data.entries()) {
            if (item[field] === value) {
              data.delete(id);
            }
          }
        })
      })
    })),
    clear: () => data.clear()
  };
}

export function createMockDb(): MockDbInstance {
  const vehicles = createMockTable<Vehicle>();
  const locations = createMockTable<Location>();
  const sessions = createMockTable<Session>();

  return {
    vehicles,
    locations,
    sessions,
    version: vi.fn(() => ({ stores: vi.fn(() => {}) })),
    on: vi.fn(() => {}),
    transaction: vi.fn(async (_mode: string, ...args: unknown[]) => {
      const callback = args[args.length - 1] as () => Promise<void>;
      await callback();
    }),
    reset: () => {
      vehicles.clear();
      locations.clear();
      sessions.clear();
    }
  } as unknown as MockDbInstance;
}
