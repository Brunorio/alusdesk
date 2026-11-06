import { forwardRef, useState } from 'react';
import { StandardInput, StandardInputProps } from './StandardInput';

export function maskDocument(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export interface DocumentInputProps extends Omit<StandardInputProps, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(
  ({ value, defaultValue, onChange, placeholder = '000.000.000-00 or 00.000.000/0000-00', ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue ? maskDocument(String(defaultValue)) : '');
    const isControlled = value !== undefined;
    const displayValue = isControlled ? maskDocument(String(value)) : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskDocument(e.target.value);
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

DocumentInput.displayName = 'DocumentInput';
