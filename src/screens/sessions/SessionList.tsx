import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Box,
  Button,
  Card,
  EmptyState,
  Field,
  Heading,
  Input,
  NativeSelectRoot,
  NativeSelectField,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  HStack,
  Badge
} from '@chakra-ui/react';
import { getSessions, getVehicles, getLocations, calculateSessionCost } from '@/lib/db';
import { formatDateTime, formatDateShort } from '@/lib/dates';

type SessionListProps = {
  limit?: number;
};

type FilterState = {
  vehicleId: string;
  locationId: string;
  startDate: string;
  endDate: string;
};

export function SessionList({ limit }: SessionListProps) {
  const sessions = useLiveQuery(() => getSessions(), []);
  const vehicles = useLiveQuery(() => getVehicles(), []);
  const locations = useLiveQuery(() => getLocations(), []);

  const [filters, setFilters] = useState<FilterState>({
    vehicleId: '',
    locationId: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      vehicleId: '',
      locationId: '',
      startDate: '',
      endDate: ''
    });
  };

  const filteredSessions = useMemo(() => {
    if (!sessions) {
      return [];
    }

    let filtered = sessions;

    if (filters.vehicleId) {
      filtered = filtered.filter((s) => s.vehicleId === filters.vehicleId);
    }

    if (filters.locationId) {
      filtered = filtered.filter((s) => s.locationId === filters.locationId);
    }

    if (filters.startDate) {
      filtered = filtered.filter((s) => s.date >= filters.startDate);
    }

    if (filters.endDate) {
      const endDateEndOfDay = new Date(filters.endDate);
      endDateEndOfDay.setHours(23, 59, 59, 999);
      const endDateISO = endDateEndOfDay.toISOString();
      filtered = filtered.filter((s) => s.date <= endDateISO);
    }

    if (limit) {
      return filtered.slice(0, limit);
    }

    return filtered;
  }, [sessions, filters, limit]);

  const totals = useMemo(() => {
    if (!filteredSessions.length) {
      return {
        totalSessions: 0,
        totalKwh: 0,
        totalCost: 0
      };
    }

    return {
      totalSessions: filteredSessions.length,
      totalKwh: filteredSessions.reduce((sum, s) => sum + s.kwhAdded, 0),
      totalCost: filteredSessions.reduce(
        (sum, s) => sum + calculateSessionCost(s.kwhAdded, s.rate),
        0
      )
    };
  }, [filteredSessions]);

  const getVehicleName = (vehicleId: string): string => {
    if (!vehicles) {
      return 'Unknown Vehicle';
    }
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return 'Unknown Vehicle';
    }
    return vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getLocationName = (locationId: string): string => {
    if (!locations) {
      return locationId;
    }
    const location = locations.find((l) => l.id === locationId);
    return location ? location.name : locationId;
  };

  const hasActiveFilters =
    filters.vehicleId || filters.locationId || filters.startDate || filters.endDate;

  if (sessions === undefined || vehicles === undefined || locations === undefined) {
    return (
      <Box p={4}>
        <Text color="fg.muted">Loading sessions...</Text>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <VStack textAlign="center">
            <EmptyState.Title>No charging sessions yet</EmptyState.Title>
            <EmptyState.Description>
              Start tracking your EV charging by adding your first session
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <Stack gap={6}>
      {/* Filters Section */}
      <Card.Root>
        <Card.Header>
          <Heading size="sm">Filter Sessions</Heading>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <Field.Root>
              <Field.Label>Vehicle</Field.Label>
              <NativeSelectRoot>
                <NativeSelectField
                  value={filters.vehicleId}
                  onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field.Root>

            <Field.Root>
              <Field.Label>Location</Field.Label>
              <NativeSelectRoot>
                <NativeSelectField
                  value={filters.locationId}
                  onChange={(e) => handleFilterChange('locationId', e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field.Root>

            <Field.Root>
              <Field.Label>Start Date</Field.Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>End Date</Field.Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </Field.Root>
          </SimpleGrid>
        </Card.Body>
        {hasActiveFilters && (
          <Card.Footer>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Card.Footer>
        )}
      </Card.Root>

      {/* Totals Summary */}
      {filteredSessions.length > 0 && (
        <Card.Root>
          <Card.Body>
            <HStack justify="space-around" wrap="wrap" gap={4}>
              <VStack gap={1}>
                <Text textStyle="xs" color="fg.muted">
                  Total Sessions
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totals.totalSessions}
                </Text>
              </VStack>
              <VStack gap={1}>
                <Text textStyle="xs" color="fg.muted">
                  Total kWh
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totals.totalKwh.toFixed(2)}
                </Text>
              </VStack>
              <VStack gap={1}>
                <Text textStyle="xs" color="fg.muted">
                  Total Cost
                </Text>
                <Text fontSize="2xl" fontWeight="bold" colorPalette="green">
                  ${totals.totalCost.toFixed(2)}
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <VStack textAlign="center">
              <EmptyState.Title>No sessions match filters</EmptyState.Title>
              <EmptyState.Description>
                Try adjusting your filters to see more results
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <Stack gap={3}>
          {filteredSessions.map((session) => (
            <Card.Root key={session.id}>
              <Card.Body>
                <Stack gap={3}>
                  <HStack justify="space-between" align="start" wrap="wrap">
                    <Box>
                      <Heading size="sm">{getVehicleName(session.vehicleId)}</Heading>
                      <Text color="fg.muted" textStyle="sm">
                        {formatDateTime(session.date)}
                      </Text>
                    </Box>
                    <Badge colorPalette="green" size="lg">
                      {getLocationName(session.locationId)}
                    </Badge>
                  </HStack>

                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <Box>
                      <Text textStyle="xs" color="fg.muted">
                        Energy Added
                      </Text>
                      <Text fontWeight="medium">{session.kwhAdded.toFixed(2)} kWh</Text>
                    </Box>
                    <Box>
                      <Text textStyle="xs" color="fg.muted">
                        Rate
                      </Text>
                      <Text fontWeight="medium">${session.rate.toFixed(3)}/kWh</Text>
                    </Box>
                    <Box>
                      <Text textStyle="xs" color="fg.muted">
                        Cost
                      </Text>
                      <Text fontWeight="medium" colorPalette="green">
                        ${calculateSessionCost(session.kwhAdded, session.rate).toFixed(2)}
                      </Text>
                    </Box>
                    <Box>
                      <Text textStyle="xs" color="fg.muted">
                        Date
                      </Text>
                      <Text fontWeight="medium">{formatDateShort(session.date)}</Text>
                    </Box>
                  </SimpleGrid>

                  {session.notes && (
                    <Box>
                      <Text textStyle="xs" color="fg.muted">
                        Notes
                      </Text>
                      <Text textStyle="sm">{session.notes}</Text>
                    </Box>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
