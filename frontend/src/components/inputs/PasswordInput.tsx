import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { StandardInput, StandardInputProps } from './StandardInput';

export interface PasswordInputProps extends Omit<StandardInputProps, 'type' | 'rightIcon'> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <StandardInput
      {...props}
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
