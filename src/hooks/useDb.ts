import { useEffect } from 'react';
import { createDexieDb } from '@/lib/dexieDb';
import { initDb } from '@/lib/db';

export function useDb() {
  useEffect(() => {
    initDb(createDexieDb());
  }, []);
}
