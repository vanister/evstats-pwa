import { useState } from 'react';
import { Box, Button, Heading, Stack } from '@chakra-ui/react';
import type { Vehicle } from '@/lib/types';
import { VehicleForm } from './VehicleForm';
import { VehicleList } from './VehicleList';

export function VehicleManager() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleAddClick = () => {
    setEditingVehicle(null);
    setIsFormVisible(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormVisible(true);
  };

  const handleFormSuccess = () => {
    setIsFormVisible(false);
    setEditingVehicle(null);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingVehicle(null);
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Stack gap={6}>
        <Stack direction="row" justify="space-between" align="center">
          <Heading size="xl">Vehicles</Heading>
          {!isFormVisible && (
            <Button colorPalette="brand" onClick={handleAddClick}>
              Add Vehicle
            </Button>
          )}
        </Stack>

        {isFormVisible ? (
          <Box>
            <Heading size="md" mb={4}>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </Heading>
            <VehicleForm
              vehicle={editingVehicle || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Box>
        ) : (
          <VehicleList onEdit={handleEditClick} />
        )}
      </Stack>
    </Box>
  );
}
