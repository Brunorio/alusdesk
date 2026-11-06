import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface StandardTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const StandardTextarea = forwardRef<HTMLTextAreaElement, StandardTextareaProps>(
  ({ label, error, helperText, className, id, rows = 4, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 transition-colors',
            'placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  },
);

StandardTextarea.displayName = 'StandardTextarea';

