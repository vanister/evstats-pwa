import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDb, type MockDbInstance } from '../mockDexie';
import {
  setDb,
  getDb,
  addVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle
} from '@/lib/db';
import type { Vehicle } from '@/lib/types';

vi.mock('@/lib/crypto', () => ({
  generateId: vi.fn(() => crypto.randomUUID())
}));

describe('Database Operations', () => {
  let mockDb: MockDbInstance;

  beforeEach(() => {
    mockDb = createMockDb();
    setDb(mockDb);
    mockDb.reset();
  });

  describe('Vehicle CRUD Operations', () => {
    it('should add a vehicle with generated UUID', async () => {
      const vehicleData: Omit<Vehicle, 'id'> = {
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75,
        trim: 'Long Range',
        nickname: 'My Tesla'
      };

      const vehicle = await addVehicle(vehicleData);

      expect(vehicle.id).toBeDefined();
      expect(vehicle.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(vehicle.year).toBe(2024);
      expect(vehicle.make).toBe('Tesla');
      expect(vehicle.model).toBe('Model 3');
      expect(vehicle.batterySize).toBe(75);
      expect(vehicle.trim).toBe('Long Range');
      expect(vehicle.nickname).toBe('My Tesla');
    });

    it('should get all vehicles', async () => {
      await addVehicle({
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75
      });
      await addVehicle({
        year: 2023,
        make: 'Ford',
        model: 'Mustang Mach-E',
        batterySize: 88
      });

      const vehicles = await getVehicles();

      expect(vehicles).toHaveLength(2);
      expect(vehicles[0].make).toBe('Tesla');
      expect(vehicles[1].make).toBe('Ford');
    });

    it('should get a single vehicle by id', async () => {
      const added = await addVehicle({
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75
      });

      const vehicle = await getVehicle(added.id);

      expect(vehicle).toBeDefined();
      expect(vehicle?.id).toBe(added.id);
      expect(vehicle?.make).toBe('Tesla');
    });

    it('should return undefined for non-existent vehicle', async () => {
      const vehicle = await getVehicle('non-existent-id');

      expect(vehicle).toBeUndefined();
    });

    it('should update an existing vehicle', async () => {
      const added = await addVehicle({
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75
      });

      const updated = await updateVehicle(added.id, {
        nickname: 'Updated Nickname',
        range: 358
      });

      expect(updated.id).toBe(added.id);
      expect(updated.nickname).toBe('Updated Nickname');
      expect(updated.range).toBe(358);
      expect(updated.make).toBe('Tesla');
    });

    it('should throw error when updating non-existent vehicle', async () => {
      await expect(updateVehicle('non-existent-id', { nickname: 'Test' })).rejects.toThrow(
        'Vehicle with id non-existent-id not found'
      );
    });

    it('should delete a vehicle', async () => {
      const added = await addVehicle({
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75
      });

      await deleteVehicle(added.id);

      const vehicle = await getVehicle(added.id);
      expect(vehicle).toBeUndefined();
    });

    it('should cascade delete sessions when deleting a vehicle', async () => {
      const vehicle = await addVehicle({
        year: 2024,
        make: 'Tesla',
        model: 'Model 3',
        batterySize: 75
      });

      const db = getDb();
      await db.sessions.add({
        id: 'session-1',
        vehicleId: vehicle.id,
        locationId: 'home',
        date: new Date().toISOString(),
        kwhAdded: 50,
        rate: 0.17
      });

      await deleteVehicle(vehicle.id);

      const sessions = await db.sessions.toArray();
      expect(sessions).toHaveLength(0);
    });

    it('should throw error when deleting non-existent vehicle', async () => {
      await expect(deleteVehicle('non-existent-id')).rejects.toThrow(
        'Vehicle with id non-existent-id not found'
      );
    });
  });
});
