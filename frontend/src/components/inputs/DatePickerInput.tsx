import { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import { StandardInput, StandardInputProps } from './StandardInput';

export interface DatePickerInputProps extends Omit<StandardInputProps, 'type'> {
  showTime?: boolean;
}

export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ showTime = false, ...props }, ref) => {
    return (
      <StandardInput
        ref={ref}
        type={showTime ? 'datetime-local' : 'date'}
        leftIcon={<Calendar className="h-4 w-4" />}
        {...props}
      />
    );
  },
);

DatePickerInput.displayName = 'DatePickerInput';
