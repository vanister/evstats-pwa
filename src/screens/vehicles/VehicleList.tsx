import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Box,
  Button,
  Card,
  Dialog,
  EmptyState,
  Heading,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { getVehicles, deleteVehicle } from '@/lib/db';
import type { Vehicle } from '@/lib/types';

type VehicleListProps = {
  onEdit?: (vehicle: Vehicle) => void;
  onVehicleChange?: () => void;
};

export function VehicleList({ onEdit, onVehicleChange }: VehicleListProps) {
  const vehicles = useLiveQuery(() => getVehicles(), []);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteVehicle(vehicleToDelete.id);
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);

      if (onVehicleChange) {
        onVehicleChange();
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  if (vehicles === undefined) {
    return (
      <Box p={4}>
        <Text color="fg.muted">Loading vehicles...</Text>
      </Box>
    );
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <VStack textAlign="center">
            <EmptyState.Title>No vehicles yet</EmptyState.Title>
            <EmptyState.Description>
              Add your first electric vehicle to start tracking charging sessions
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  const getDisplayName = (vehicle: Vehicle): string => {
    if (vehicle.nickname) {
      return vehicle.nickname;
    }
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getSecondaryInfo = (vehicle: Vehicle): string => {
    if (vehicle.nickname) {
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    }
    return vehicle.trim || '';
  };

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {vehicles.map((vehicle) => (
          <Card.Root key={vehicle.id}>
            <Card.Body>
              <Stack gap={3}>
                <Box>
                  <Heading size="md">{getDisplayName(vehicle)}</Heading>
                  {getSecondaryInfo(vehicle) && (
                    <Text color="fg.muted" textStyle="sm">
                      {getSecondaryInfo(vehicle)}
                    </Text>
                  )}
                </Box>

                <Stack gap={1} fontSize="sm">
                  <Text>
                    <Text as="span" fontWeight="medium">
                      Battery:
                    </Text>{' '}
                    {vehicle.batterySize} kWh
                  </Text>
                  {vehicle.range && (
                    <Text>
                      <Text as="span" fontWeight="medium">
                        Range:
                      </Text>{' '}
                      {vehicle.range} miles
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Card.Body>

            <Card.Footer justifyContent="flex-end" gap={2}>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(vehicle)}>
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                colorPalette="red"
                size="sm"
                onClick={() => handleDeleteClick(vehicle)}
              >
                Delete
              </Button>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Dialog.Root
        role="alertdialog"
        open={deleteDialogOpen}
        onOpenChange={(e) => !isDeleting && setDeleteDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Vehicle?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to delete{' '}
                  <Text as="span" fontWeight="semibold">
                    {vehicleToDelete && getDisplayName(vehicleToDelete)}
                  </Text>
                  ?
                </Text>
                <Text mt={2} color="fg.muted">
                  This will also delete all associated charging sessions. This action cannot be
                  undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button colorPalette="red" onClick={handleDeleteConfirm} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
