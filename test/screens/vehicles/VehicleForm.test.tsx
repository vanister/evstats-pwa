import { describe, it, expect } from 'vitest';
import { render, screen } from '../../testUtils';
import { VehicleForm } from '@/screens/vehicles/VehicleForm';

describe('VehicleForm', () => {
  it('renders all required form fields', () => {
    render(<VehicleForm />);

    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/battery size/i)).toBeInTheDocument();
  });

  it('renders optional form fields', () => {
    render(<VehicleForm />);

    expect(screen.getByLabelText(/trim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
  });

  // TODO: Add validation tests when implementing form submission
  it.todo('validates required fields on submit');
  it.todo('validates year is within valid range');
  it.todo('validates battery size is positive number');
  it.todo('calls onSave with form data when valid');
  it.todo('displays error messages for invalid fields');
});
