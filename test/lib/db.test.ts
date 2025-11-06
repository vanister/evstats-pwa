import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDb, type MockDbInstance } from '../mockDexie';
import {
  setDb,
  getDb,
  addVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getLocations,
  getLocation,
  updateLocationRate
} from '@/lib/db';
import type { Vehicle, Locations } from '@/lib/types';

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

  describe('Location Operations', () => {
    beforeEach(async () => {
      const db = getDb();
      await db.locations.bulkAdd([
        { id: 'home', name: 'Home', defaultRate: 0.17 },
        { id: 'work', name: 'Work', defaultRate: 0.18 },
        { id: 'dc', name: 'DC Fast', defaultRate: 0.32 },
        { id: 'other', name: 'Other', defaultRate: 0.13 }
      ]);
    });

    it('should get all locations', async () => {
      const locations = await getLocations();

      expect(locations).toHaveLength(4);
      expect(locations.map((l) => l.id)).toEqual(['home', 'work', 'dc', 'other']);
    });

    it('should get a single location by id', async () => {
      const location = await getLocation('home' as Locations);

      expect(location).toBeDefined();
      expect(location?.id).toBe('home');
      expect(location?.name).toBe('Home');
      expect(location?.defaultRate).toBe(0.17);
    });

    it('should return undefined for non-existent location', async () => {
      const location = await getLocation('invalid' as Locations);

      expect(location).toBeUndefined();
    });

    it('should update location rate', async () => {
      const updated = await updateLocationRate('home' as Locations, 0.25);

      expect(updated.id).toBe('home');
      expect(updated.defaultRate).toBe(0.25);
      expect(updated.name).toBe('Home');
    });

    it('should throw error when updating with invalid rate (zero)', async () => {
      await expect(updateLocationRate('home' as Locations, 0)).rejects.toThrow(
        'Rate must be greater than 0'
      );
    });

    it('should throw error when updating with invalid rate (negative)', async () => {
      await expect(updateLocationRate('home' as Locations, -0.5)).rejects.toThrow(
        'Rate must be greater than 0'
      );
    });

    it('should throw error when updating with invalid rate (too high)', async () => {
      await expect(updateLocationRate('home' as Locations, 15)).rejects.toThrow(
        'Rate must be less than $10/kWh'
      );
    });

    it('should throw error when updating non-existent location', async () => {
      await expect(updateLocationRate('invalid' as Locations, 0.25)).rejects.toThrow(
        'Location with id invalid not found'
      );
    });
  });
});
