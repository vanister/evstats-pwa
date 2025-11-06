import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { Session, Locations } from './types';
import { calculateSessionCost } from './db';

export type SessionTotals = {
  totalSessions: number;
  totalKwh: number;
  totalCost: number;
  averageCost: number;
  averageKwh: number;
};

export type MonthlyTotal = {
  month: string;
  year: number;
  monthYear: string;
  totalSessions: number;
  totalKwh: number;
  totalCost: number;
};

export type VehicleTotal = {
  vehicleId: string;
  totalSessions: number;
  totalKwh: number;
  totalCost: number;
  averageCostPerKwh: number;
};

export type LocationTotal = {
  locationId: Locations;
  totalSessions: number;
  totalKwh: number;
  totalCost: number;
  averageCostPerKwh: number;
};

/**
 * Calculate total cost for an array of sessions
 */
export function calculateTotalCost(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  return sessions.reduce((total, session) => {
    return total + calculateSessionCost(session.kwhAdded, session.rate);
  }, 0);
}

/**
 * Calculate total kWh for an array of sessions
 */
export function calculateTotalKwh(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  return sessions.reduce((total, session) => {
    return total + session.kwhAdded;
  }, 0);
}

/**
 * Calculate summary totals for an array of sessions
 */
export function calculateSessionTotals(sessions: Session[]): SessionTotals {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalKwh: 0,
      totalCost: 0,
      averageCost: 0,
      averageKwh: 0,
    };
  }

  const totalKwh = calculateTotalKwh(sessions);
  const totalCost = calculateTotalCost(sessions);

  return {
    totalSessions: sessions.length,
    totalKwh,
    totalCost,
    averageCost: totalCost / sessions.length,
    averageKwh: totalKwh / sessions.length,
  };
}

/**
 * Calculate monthly totals from sessions
 * Groups sessions by month/year and calculates totals for each month
 */
export function calculateMonthlyTotals(sessions: Session[]): MonthlyTotal[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const monthlyMap = new Map<string, MonthlyTotal>();

  sessions.forEach((session) => {
    const date = parseISO(session.date);
    const monthStart = startOfMonth(date);
    const monthKey = format(monthStart, 'yyyy-MM');
    const month = format(monthStart, 'MMMM');
    const year = date.getFullYear();
    const monthYear = format(monthStart, 'MMMM yyyy');

    const existing = monthlyMap.get(monthKey);
    const sessionCost = calculateSessionCost(session.kwhAdded, session.rate);

    if (existing) {
      existing.totalSessions += 1;
      existing.totalKwh += session.kwhAdded;
      existing.totalCost += sessionCost;
    } else {
      monthlyMap.set(monthKey, {
        month,
        year,
        monthYear,
        totalSessions: 1,
        totalKwh: session.kwhAdded,
        totalCost: sessionCost,
      });
    }
  });

  return Array.from(monthlyMap.values()).sort((a, b) => {
    return `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`);
  });
}

/**
 * Group sessions by vehicle and calculate totals for each vehicle
 */
export function groupByVehicle(sessions: Session[]): VehicleTotal[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const vehicleMap = new Map<string, VehicleTotal>();

  sessions.forEach((session) => {
    const existing = vehicleMap.get(session.vehicleId);
    const sessionCost = calculateSessionCost(session.kwhAdded, session.rate);

    if (existing) {
      existing.totalSessions += 1;
      existing.totalKwh += session.kwhAdded;
      existing.totalCost += sessionCost;
      existing.averageCostPerKwh = existing.totalCost / existing.totalKwh;
    } else {
      vehicleMap.set(session.vehicleId, {
        vehicleId: session.vehicleId,
        totalSessions: 1,
        totalKwh: session.kwhAdded,
        totalCost: sessionCost,
        averageCostPerKwh: sessionCost / session.kwhAdded,
      });
    }
  });

  return Array.from(vehicleMap.values()).sort(
    (a, b) => b.totalCost - a.totalCost
  );
}

/**
 * Group sessions by location and calculate totals for each location
 */
export function groupByLocation(sessions: Session[]): LocationTotal[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const locationMap = new Map<Locations, LocationTotal>();

  sessions.forEach((session) => {
    const existing = locationMap.get(session.locationId);
    const sessionCost = calculateSessionCost(session.kwhAdded, session.rate);

    if (existing) {
      existing.totalSessions += 1;
      existing.totalKwh += session.kwhAdded;
      existing.totalCost += sessionCost;
      existing.averageCostPerKwh = existing.totalCost / existing.totalKwh;
    } else {
      locationMap.set(session.locationId, {
        locationId: session.locationId,
        totalSessions: 1,
        totalKwh: session.kwhAdded,
        totalCost: sessionCost,
        averageCostPerKwh: sessionCost / session.kwhAdded,
      });
    }
  });

  return Array.from(locationMap.values()).sort(
    (a, b) => b.totalCost - a.totalCost
  );
}

/**
 * Get sessions for a specific month
 */
export function getSessionsForMonth(
  sessions: Session[],
  year: number,
  month: number
): Session[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);

  return sessions.filter((session) => {
    const sessionDate = parseISO(session.date);
    return sessionDate >= monthStart && sessionDate <= monthEnd;
  });
}

/**
 * Get sessions for current month
 */
export function getCurrentMonthSessions(sessions: Session[]): Session[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const now = new Date();
  return getSessionsForMonth(sessions, now.getFullYear(), now.getMonth() + 1);
}

/**
 * Calculate current month totals
 */
export function getCurrentMonthTotals(sessions: Session[]): SessionTotals {
  const currentMonthSessions = getCurrentMonthSessions(sessions);
  return calculateSessionTotals(currentMonthSessions);
}
