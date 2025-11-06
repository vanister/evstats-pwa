import { useEffect, type ReactNode } from 'react';
import { createDexieDb } from '@/lib/dexieDb';
import { initDb } from '@/lib/db';

type DbProviderProps = {
  children: ReactNode;
};

export function DbProvider({ children }: DbProviderProps) {
  useEffect(() => {
    initDb(createDexieDb());
  }, []);

  return <>{children}</>;
}
