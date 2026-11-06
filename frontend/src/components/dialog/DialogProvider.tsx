import React, { createContext, useContext, useState, useCallback } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DialogOptions {
  title?: string;
  description?: string;
  disableBackdropClose?: boolean;
  maxWidth?: string;
  onClose?: () => void;
}

interface DialogContextValue {
  openDialog: (content: React.ReactNode, options?: DialogOptions) => void;
  closeDialog: () => void;
  isOpen: boolean;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [options, setOptions] = useState<DialogOptions>({});

  const closeDialog = useCallback(() => {
    options.onClose?.();
    setIsOpen(false);
    setContent(null);
    setOptions({});
  }, [options]);

  const openDialog = useCallback((dialogContent: React.ReactNode, dialogOptions?: DialogOptions) => {
    setContent(dialogContent);
    setOptions(dialogOptions || {});
    setIsOpen(true);
  }, []);

  const handlePointerDownOutside = (event: Event) => {
    if (options.disableBackdropClose) {
      event.preventDefault();
    }
  };

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (options.disableBackdropClose) {
      event.preventDefault();
    }
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, isOpen }}>
      {children}
      <DialogPrimitive.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !options.disableBackdropClose) {
            closeDialog();
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0" />
          <DialogPrimitive.Content
            onPointerDownOutside={handlePointerDownOutside}
            onEscapeKeyDown={handleEscapeKeyDown}
            className={cn(
              'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-xl duration-200 sm:rounded-lg',
              options.maxWidth || 'max-w-lg',
            )}
          >
            {(options.title || options.description) && (
              <div className="flex flex-col space-y-1.5 text-left">
                {options.title && (
                  <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight text-slate-900">
                    {options.title}
                  </DialogPrimitive.Title>
                )}
                {options.description && (
                  <DialogPrimitive.Description className="text-sm text-slate-500">
                    {options.description}
                  </DialogPrimitive.Description>
                )}
              </div>
            )}

            <div>{content}</div>

            <DialogPrimitive.Close
              onClick={closeDialog}
              className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

