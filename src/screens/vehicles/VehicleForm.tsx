import { useState, useEffect } from 'react';
import { Box, Button, Field, Input, Stack } from '@chakra-ui/react';
import type { Vehicle } from '@/lib/types';
import {
  validateVehicle,
  type VehicleValidationErrors
} from '@/lib/validation';
import { addVehicle, updateVehicle } from '@/lib/db';
import { useImmerState } from '@/hooks/useImmerState';

type VehicleFormProps = {
  vehicle?: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormData = {
  year: string;
  make: string;
  model: string;
  batterySize: string;
  trim: string;
  nickname: string;
  range: string;
};

const initialFormData: FormData = {
  year: '',
  make: '',
  model: '',
  batterySize: '',
  trim: '',
  nickname: '',
  range: ''
};

export function VehicleForm({
  vehicle,
  onSuccess,
  onCancel
}: VehicleFormProps) {
  const [formData, setFormData] = useImmerState<FormData>(initialFormData);
  const [errors, setErrors] = useImmerState<VehicleValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = !!vehicle;

  useEffect(() => {
    if (vehicle) {
      setFormData({
        year: vehicle.year.toString(),
        make: vehicle.make,
        model: vehicle.model,
        batterySize: vehicle.batterySize.toString(),
        trim: vehicle.trim || '',
        nickname: vehicle.nickname || '',
        range: vehicle.range?.toString() || ''
      });
    }
  }, [vehicle]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((draft) => {
      draft[field] = value;
    });
    if (errors[field as keyof VehicleValidationErrors]) {
      setErrors((draft) => {
        delete draft[field as keyof VehicleValidationErrors];
      });
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    const vehicleData: Partial<Vehicle> = {
      year: formData.year ? Number(formData.year) : undefined,
      make: formData.make,
      model: formData.model,
      batterySize: formData.batterySize
        ? Number(formData.batterySize)
        : undefined,
      trim: formData.trim || undefined,
      nickname: formData.nickname || undefined,
      range: formData.range ? Number(formData.range) : undefined
    };

    const validationErrors = validateVehicle(vehicleData);

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && vehicle) {
        await updateVehicle(vehicle.id, vehicleData as Omit<Vehicle, 'id'>);
        setSuccessMessage('Vehicle updated successfully!');
      } else {
        await addVehicle(vehicleData as Omit<Vehicle, 'id'>);
        setSuccessMessage('Vehicle added successfully!');
        setFormData(initialFormData);
      }

      if (onSuccess) {
        // TODO - why?
        setTimeout(() => onSuccess(), 500);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save vehicle';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (vehicle) {
      setFormData({
        year: vehicle.year.toString(),
        make: vehicle.make,
        model: vehicle.model,
        batterySize: vehicle.batterySize.toString(),
        trim: vehicle.trim || '',
        nickname: vehicle.nickname || '',
        range: vehicle.range?.toString() || ''
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack gap={4}>
        <Field.Root required invalid={!!errors.year}>
          <Field.Label>Year</Field.Label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder="2024"
            min="2000"
            max="2099"
          />
          {errors.year && <Field.ErrorText>{errors.year}</Field.ErrorText>}
        </Field.Root>

        <Field.Root required invalid={!!errors.make}>
          <Field.Label>Make</Field.Label>
          <Input
            value={formData.make}
            onChange={(e) => handleChange('make', e.target.value)}
            placeholder="Tesla"
          />
          {errors.make && <Field.ErrorText>{errors.make}</Field.ErrorText>}
        </Field.Root>

        <Field.Root required invalid={!!errors.model}>
          <Field.Label>Model</Field.Label>
          <Input
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Model 3"
          />
          {errors.model && <Field.ErrorText>{errors.model}</Field.ErrorText>}
        </Field.Root>

        <Field.Root required invalid={!!errors.batterySize}>
          <Field.Label>Battery Size (kWh)</Field.Label>
          <Input
            type="number"
            value={formData.batterySize}
            onChange={(e) => handleChange('batterySize', e.target.value)}
            placeholder="75"
            min="0"
            step="0.1"
          />
          {errors.batterySize && (
            <Field.ErrorText>{errors.batterySize}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.trim}>
          <Field.Label>Trim (Optional)</Field.Label>
          <Input
            value={formData.trim}
            onChange={(e) => handleChange('trim', e.target.value)}
            placeholder="Long Range"
          />
          {errors.trim && <Field.ErrorText>{errors.trim}</Field.ErrorText>}
        </Field.Root>

        <Field.Root invalid={!!errors.nickname}>
          <Field.Label>Nickname (Optional)</Field.Label>
          <Input
            value={formData.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            placeholder="My EV"
          />
          {errors.nickname && (
            <Field.ErrorText>{errors.nickname}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.range}>
          <Field.Label>Range (miles) (Optional)</Field.Label>
          <Input
            type="number"
            value={formData.range}
            onChange={(e) => handleChange('range', e.target.value)}
            placeholder="300"
            min="0"
          />
          {errors.range && <Field.ErrorText>{errors.range}</Field.ErrorText>}
        </Field.Root>

        {successMessage && (
          <Box p={3} bg="green.subtle" color="green.fg" borderRadius="md">
            {successMessage}
          </Box>
        )}

        {errorMessage && (
          <Box p={3} bg="red.subtle" color="red.fg" borderRadius="md">
            {errorMessage}
          </Box>
        )}

        <Stack direction="row" gap={2}>
          <Button type="submit" colorPalette="brand" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : isEditMode
                ? 'Update Vehicle'
                : 'Add Vehicle'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
