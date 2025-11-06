import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Field,
  Input,
  NativeSelectRoot,
  NativeSelectField,
  Textarea,
  Stack
} from '@chakra-ui/react';
import type { Vehicle, Location, Locations } from '@/lib/types';
import {
  validateSession,
  type SessionValidationErrors
} from '@/lib/validation';
import { addSession, getVehicles, getLocations } from '@/lib/db';
import { useImmerState } from '@/hooks/useImmerState';
import { getCurrentTimestamp, parseToISO } from '@/lib/dates';

type SessionFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormData = {
  vehicleId: string;
  locationId: string;
  date: string;
  kwhAdded: string;
  costOverride: string;
  notes: string;
};

const initialFormData: FormData = {
  vehicleId: '',
  locationId: '',
  date: '',
  kwhAdded: '',
  costOverride: '',
  notes: ''
};

export function SessionForm({ onSuccess, onCancel }: SessionFormProps) {
  const [formData, setFormData] = useImmerState<FormData>(initialFormData);
  const [errors, setErrors] = useImmerState<SessionValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesData, locationsData] = await Promise.all([
          getVehicles(),
          getLocations()
        ]);
        setVehicles(vehiclesData);
        setLocations(locationsData);

        setFormData((draft) => {
          draft.date = new Date().toISOString().slice(0, 16);
        });
      } catch (error) {
        setErrorMessage('Failed to load form data');
      }
    };

    loadData();
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((draft) => {
      draft[field] = value;
    });
    if (errors[field as keyof SessionValidationErrors]) {
      setErrors((draft) => {
        delete draft[field as keyof SessionValidationErrors];
      });
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    const dateISO = formData.date
      ? parseToISO(formData.date)
      : getCurrentTimestamp();

    if (!dateISO) {
      setErrors({ date: 'Invalid date format' });
      return;
    }

    const sessionData = {
      vehicleId: formData.vehicleId,
      locationId: formData.locationId as Locations,
      date: dateISO,
      kwhAdded: formData.kwhAdded ? Number(formData.kwhAdded) : undefined,
      costOverride: formData.costOverride
        ? Number(formData.costOverride)
        : undefined,
      notes: formData.notes || undefined
    };

    const validationErrors = validateSession(sessionData);

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await addSession(sessionData as any);
      setSuccessMessage('Session added successfully!');
      setFormData({
        ...initialFormData,
        date: new Date().toISOString().slice(0, 16)
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save session';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...initialFormData,
      date: new Date().toISOString().slice(0, 16)
    });
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack gap={4}>
        <Field.Root required invalid={!!errors.vehicleId}>
          <Field.Label>Vehicle</Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={formData.vehicleId}
              onChange={(e) => handleChange('vehicleId', e.target.value)}
              placeholder="Select a vehicle"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname ||
                    `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
          {errors.vehicleId && (
            <Field.ErrorText>{errors.vehicleId}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root required invalid={!!errors.locationId}>
          <Field.Label>Location</Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={formData.locationId}
              onChange={(e) => handleChange('locationId', e.target.value)}
              placeholder="Select a location"
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} (${location.defaultRate}/kWh)
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
          {errors.locationId && (
            <Field.ErrorText>{errors.locationId}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root required invalid={!!errors.date}>
          <Field.Label>Date & Time</Field.Label>
          <Input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          {errors.date && <Field.ErrorText>{errors.date}</Field.ErrorText>}
        </Field.Root>

        <Field.Root required invalid={!!errors.kwhAdded}>
          <Field.Label>kWh Added</Field.Label>
          <Input
            type="number"
            value={formData.kwhAdded}
            onChange={(e) => handleChange('kwhAdded', e.target.value)}
            placeholder="50.5"
            min="0"
            step="0.1"
          />
          {errors.kwhAdded && (
            <Field.ErrorText>{errors.kwhAdded}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.costOverride}>
          <Field.Label>Cost Override (Optional)</Field.Label>
          <Input
            type="number"
            value={formData.costOverride}
            onChange={(e) => handleChange('costOverride', e.target.value)}
            placeholder="15.00"
            min="0"
            step="0.01"
          />
          <Field.HelperText>
            Override calculated cost for variable pricing (e.g., DC fast
            charging)
          </Field.HelperText>
          {errors.costOverride && (
            <Field.ErrorText>{errors.costOverride}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label>Notes (Optional)</Field.Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional notes about this charging session..."
            rows={3}
          />
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
            {isLoading ? 'Saving...' : 'Add Session'}
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
