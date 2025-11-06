import { useState, useEffect, useCallback } from 'react';
import { getLocations, updateLocationRate } from '@/lib/db';
import type { Location, Locations } from '@/lib/types';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load locations'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const updateRate = useCallback(async (id: Locations, newRate: number) => {
    const updated = await updateLocationRate(id, newRate);
    setLocations((prev) => prev.map((loc) => (loc.id === id ? updated : loc)));
    return updated;
  }, []);

  return {
    locations,
    loading,
    error,
    refresh: loadLocations,
    updateRate
  };
}
