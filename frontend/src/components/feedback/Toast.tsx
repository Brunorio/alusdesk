import React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

export const Toaster: React.FC = () => {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        className: 'font-sans text-sm',
      }}
    />
  );
};

export { toast };
