import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface StandardInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const StandardInput = forwardRef<HTMLInputElement, StandardInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">{leftIcon}</div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 transition-colors',
              'placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300',
              className,
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-slate-400">{rightIcon}</div>}
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  },
);

StandardInput.displayName = 'StandardInput';

