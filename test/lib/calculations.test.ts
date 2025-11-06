import { describe, it, expect } from 'vitest';
import {
  calculateTotalCost,
  calculateTotalKwh,
  calculateSessionTotals,
  calculateMonthlyTotals,
  groupByVehicle,
  groupByLocation,
  getSessionsForMonth,
  getCurrentMonthSessions,
  getCurrentMonthTotals
} from '@/lib/calculations';
import type { Session } from '@/lib/types';

describe('calculations', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      vehicleId: 'vehicle-1',
      locationId: 'home',
      date: '2024-01-15T10:00:00.000Z',
      kwhAdded: 50,
      rate: 0.15,
      notes: 'Test session 1'
    },
    {
      id: '2',
      vehicleId: 'vehicle-1',
      locationId: 'work',
      date: '2024-01-20T14:00:00.000Z',
      kwhAdded: 30,
      rate: 0.18,
      notes: 'Test session 2'
    },
    {
      id: '3',
      vehicleId: 'vehicle-2',
      locationId: 'home',
      date: '2024-02-10T09:00:00.000Z',
      kwhAdded: 60,
      rate: 0.15,
      notes: 'Test session 3'
    },
    {
      id: '4',
      vehicleId: 'vehicle-2',
      locationId: 'dc',
      date: '2024-02-25T16:00:00.000Z',
      kwhAdded: 40,
      rate: 0.32,
      notes: 'Test session 4'
    }
  ];

  describe('calculateTotalCost', () => {
    it('should calculate total cost correctly', () => {
      const total = calculateTotalCost(mockSessions);
      const expected = 50 * 0.15 + 30 * 0.18 + 60 * 0.15 + 40 * 0.32;
      expect(total).toBe(expected);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalCost([])).toBe(0);
    });

    it('should handle null or undefined', () => {
      expect(calculateTotalCost(null as any)).toBe(0);
      expect(calculateTotalCost(undefined as any)).toBe(0);
    });
  });

  describe('calculateTotalKwh', () => {
    it('should calculate total kWh correctly', () => {
      const total = calculateTotalKwh(mockSessions);
      expect(total).toBe(180);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalKwh([])).toBe(0);
    });

    it('should handle null or undefined', () => {
      expect(calculateTotalKwh(null as any)).toBe(0);
      expect(calculateTotalKwh(undefined as any)).toBe(0);
    });
  });

  describe('calculateSessionTotals', () => {
    it('should calculate all totals correctly', () => {
      const totals = calculateSessionTotals(mockSessions);

      expect(totals.totalSessions).toBe(4);
      expect(totals.totalKwh).toBe(180);
      expect(totals.totalCost).toBe(
        50 * 0.15 + 30 * 0.18 + 60 * 0.15 + 40 * 0.32
      );
      expect(totals.averageKwh).toBe(45);
      expect(totals.averageCost).toBeCloseTo(
        (50 * 0.15 + 30 * 0.18 + 60 * 0.15 + 40 * 0.32) / 4
      );
    });

    it('should return zeros for empty array', () => {
      const totals = calculateSessionTotals([]);
      expect(totals.totalSessions).toBe(0);
      expect(totals.totalKwh).toBe(0);
      expect(totals.totalCost).toBe(0);
      expect(totals.averageCost).toBe(0);
      expect(totals.averageKwh).toBe(0);
    });
  });

  describe('calculateMonthlyTotals', () => {
    it('should group sessions by month correctly', () => {
      const monthlyTotals = calculateMonthlyTotals(mockSessions);

      expect(monthlyTotals).toHaveLength(2);

      const feb = monthlyTotals.find((m) => m.month === 'February');
      expect(feb).toBeDefined();
      expect(feb?.year).toBe(2024);
      expect(feb?.totalSessions).toBe(2);
      expect(feb?.totalKwh).toBe(100);
      expect(feb?.totalCost).toBe(60 * 0.15 + 40 * 0.32);

      const jan = monthlyTotals.find((m) => m.month === 'January');
      expect(jan).toBeDefined();
      expect(jan?.year).toBe(2024);
      expect(jan?.totalSessions).toBe(2);
      expect(jan?.totalKwh).toBe(80);
      expect(jan?.totalCost).toBe(50 * 0.15 + 30 * 0.18);
    });

    it('should handle sessions across month boundaries', () => {
      const sessions: Session[] = [
        {
          id: '1',
          vehicleId: 'v1',
          locationId: 'home',
          date: '2024-01-31T12:00:00.000Z',
          kwhAdded: 50,
          rate: 0.15
        },
        {
          id: '2',
          vehicleId: 'v1',
          locationId: 'home',
          date: '2024-02-01T12:00:00.000Z',
          kwhAdded: 50,
          rate: 0.15
        }
      ];

      const monthlyTotals = calculateMonthlyTotals(sessions);
      expect(monthlyTotals).toHaveLength(2);

      const jan = monthlyTotals.find((m) => m.month === 'January');
      const feb = monthlyTotals.find((m) => m.month === 'February');

      expect(jan).toBeDefined();
      expect(jan?.totalSessions).toBe(1);
      expect(feb).toBeDefined();
      expect(feb?.totalSessions).toBe(1);
    });

    it('should return empty array for no sessions', () => {
      expect(calculateMonthlyTotals([])).toEqual([]);
    });
  });

  describe('groupByVehicle', () => {
    it('should group sessions by vehicle correctly', () => {
      const vehicleTotals = groupByVehicle(mockSessions);

      expect(vehicleTotals).toHaveLength(2);

      const vehicle1 = vehicleTotals.find((v) => v.vehicleId === 'vehicle-1');
      expect(vehicle1).toBeDefined();
      expect(vehicle1?.totalSessions).toBe(2);
      expect(vehicle1?.totalKwh).toBe(80);
      expect(vehicle1?.totalCost).toBe(50 * 0.15 + 30 * 0.18);
      expect(vehicle1?.averageCostPerKwh).toBeCloseTo(
        (50 * 0.15 + 30 * 0.18) / 80
      );

      const vehicle2 = vehicleTotals.find((v) => v.vehicleId === 'vehicle-2');
      expect(vehicle2).toBeDefined();
      expect(vehicle2?.totalSessions).toBe(2);
      expect(vehicle2?.totalKwh).toBe(100);
      expect(vehicle2?.totalCost).toBe(60 * 0.15 + 40 * 0.32);
    });

    it('should sort by total cost descending', () => {
      const vehicleTotals = groupByVehicle(mockSessions);
      expect(vehicleTotals[0].totalCost).toBeGreaterThanOrEqual(
        vehicleTotals[1].totalCost
      );
    });

    it('should return empty array for no sessions', () => {
      expect(groupByVehicle([])).toEqual([]);
    });
  });

  describe('groupByLocation', () => {
    it('should group sessions by location correctly', () => {
      const locationTotals = groupByLocation(mockSessions);

      expect(locationTotals).toHaveLength(3);

      const home = locationTotals.find((l) => l.locationId === 'home');
      expect(home).toBeDefined();
      expect(home?.totalSessions).toBe(2);
      expect(home?.totalKwh).toBe(110);
      expect(home?.totalCost).toBe(50 * 0.15 + 60 * 0.15);
      expect(home?.averageCostPerKwh).toBeCloseTo(
        (50 * 0.15 + 60 * 0.15) / 110
      );

      const work = locationTotals.find((l) => l.locationId === 'work');
      expect(work).toBeDefined();
      expect(work?.totalSessions).toBe(1);

      const dc = locationTotals.find((l) => l.locationId === 'dc');
      expect(dc).toBeDefined();
      expect(dc?.totalSessions).toBe(1);
    });

    it('should sort by total cost descending', () => {
      const locationTotals = groupByLocation(mockSessions);
      for (let i = 0; i < locationTotals.length - 1; i++) {
        expect(locationTotals[i].totalCost).toBeGreaterThanOrEqual(
          locationTotals[i + 1].totalCost
        );
      }
    });

    it('should return empty array for no sessions', () => {
      expect(groupByLocation([])).toEqual([]);
    });
  });

  describe('getSessionsForMonth', () => {
    it('should filter sessions for specific month', () => {
      const janSessions = getSessionsForMonth(mockSessions, 2024, 1);
      expect(janSessions).toHaveLength(2);
      expect(janSessions.every((s) => s.date.startsWith('2024-01'))).toBe(true);

      const febSessions = getSessionsForMonth(mockSessions, 2024, 2);
      expect(febSessions).toHaveLength(2);
      expect(febSessions.every((s) => s.date.startsWith('2024-02'))).toBe(true);
    });

    it('should return empty array for month with no sessions', () => {
      const marchSessions = getSessionsForMonth(mockSessions, 2024, 3);
      expect(marchSessions).toEqual([]);
    });

    it('should return empty array for no sessions', () => {
      expect(getSessionsForMonth([], 2024, 1)).toEqual([]);
    });
  });

  describe('getCurrentMonthSessions', () => {
    it('should filter sessions for current month', () => {
      const now = new Date();
      const currentMonthSession: Session = {
        id: '5',
        vehicleId: 'vehicle-1',
        locationId: 'home',
        date: now.toISOString(),
        kwhAdded: 50,
        rate: 0.15
      };

      const sessions = [...mockSessions, currentMonthSession];
      const currentSessions = getCurrentMonthSessions(sessions);

      expect(currentSessions).toContain(currentMonthSession);
    });

    it('should return empty array for no sessions', () => {
      expect(getCurrentMonthSessions([])).toEqual([]);
    });
  });

  describe('getCurrentMonthTotals', () => {
    it('should calculate totals for current month only', () => {
      const now = new Date();
      const currentMonthSessions: Session[] = [
        {
          id: '1',
          vehicleId: 'v1',
          locationId: 'home',
          date: now.toISOString(),
          kwhAdded: 50,
          rate: 0.15
        },
        {
          id: '2',
          vehicleId: 'v1',
          locationId: 'home',
          date: now.toISOString(),
          kwhAdded: 30,
          rate: 0.15
        }
      ];

      const sessions = [...mockSessions, ...currentMonthSessions];
      const totals = getCurrentMonthTotals(sessions);

      expect(totals.totalSessions).toBe(2);
      expect(totals.totalKwh).toBe(80);
      expect(totals.totalCost).toBe(80 * 0.15);
    });

    it('should return zeros for no current month sessions', () => {
      const totals = getCurrentMonthTotals(mockSessions);
      expect(totals.totalSessions).toBe(0);
    });
  });
});
