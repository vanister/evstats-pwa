import { useState, useEffect, useCallback } from 'react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '@/lib/db';
import type { Vehicle } from '@/lib/types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load vehicles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const create = useCallback(
    async (data: Omit<Vehicle, 'id'>) => {
      const vehicle = await addVehicle(data);
      setVehicles((prev) => [...prev, vehicle]);
      return vehicle;
    },
    []
  );

  const update = useCallback(async (id: string, updates: Partial<Omit<Vehicle, 'id'>>) => {
    const updated = await updateVehicle(id, updates);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return {
    vehicles,
    loading,
    error,
    refresh: loadVehicles,
    create,
    update,
    remove
  };
}
