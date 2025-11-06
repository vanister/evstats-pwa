import { useState, useEffect, useCallback } from 'react';
import { getSessions, addSession, updateSession, deleteSession } from '@/lib/db';
import type { Session } from '@/lib/types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const create = useCallback(
    async (data: Omit<Session, 'id' | 'rate'> & { costOverride?: number }) => {
      const session = await addSession(data);
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    []
  );

  const update = useCallback(async (id: string, updates: Partial<Omit<Session, 'id'>>) => {
    const updated = await updateSession(id, updates);
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sessions,
    loading,
    error,
    refresh: loadSessions,
    create,
    update,
    remove
  };
}
