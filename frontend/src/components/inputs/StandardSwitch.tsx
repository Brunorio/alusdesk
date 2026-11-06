import React, { forwardRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../../utils/cn';

export interface StandardSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

export const StandardSwitch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  StandardSwitchProps
>(({ label, description, className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                'text-sm font-medium text-slate-700 select-none cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {label}
            </label>
          )}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
      <SwitchPrimitive.Root
        id={switchId}
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200',
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
});

StandardSwitch.displayName = 'StandardSwitch';

