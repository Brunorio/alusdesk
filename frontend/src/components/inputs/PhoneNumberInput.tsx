import { forwardRef, useState } from 'react';
import { StandardInput, StandardInputProps } from './StandardInput';

export function maskPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export interface PhoneNumberInputProps extends Omit<StandardInputProps, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhoneNumberInput = forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  ({ value, defaultValue, onChange, placeholder = '(00) 00000-0000', ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue ? maskPhoneNumber(String(defaultValue)) : '');
    const isControlled = value !== undefined;
    const displayValue = isControlled ? maskPhoneNumber(String(value)) : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskPhoneNumber(e.target.value);
      e.target.value = masked;
      if (!isControlled) {
        setInternalValue(masked);
      }
      onChange?.(e);
    };

    return (
      <StandardInput
        placeholder={placeholder}
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
      />
    );
  },
);

PhoneNumberInput.displayName = 'PhoneNumberInput';
