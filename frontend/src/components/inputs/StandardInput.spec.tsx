import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StandardInput } from './StandardInput';
import { PasswordInput } from './PasswordInput';
import { DocumentInput } from './DocumentInput';

describe('StandardInput Components', () => {
  it('should render input with label and helper text', () => {
    render(<StandardInput label="Full Name" helperText="Enter your first and last name" />);

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Enter your first and last name')).toBeInTheDocument();
  });

  it('should render error message and apply error styling', () => {
    render(<StandardInput label="Email" error="Invalid email address" />);

    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('border-red-500');
  });

  it('should toggle password visibility in PasswordInput', () => {
    render(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button');

    expect(input.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');
    fireEvent.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('should format CPF correctly in DocumentInput', () => {
    render(<DocumentInput label="CPF" placeholder="000.000.000-00" />);
    const input = screen.getByPlaceholderText('000.000.000-00') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '12345678901' } });
    expect(input.value).toBe('123.456.789-01');
  });
});

