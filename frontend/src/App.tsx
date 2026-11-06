import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { DialogProvider } from './components/dialog/DialogProvider';
import { Toaster } from './components/feedback/Toast';

export const App: React.FC = () => {
  return (
    <DialogProvider>
      <RouterProvider router={router} />
      <Toaster />
    </DialogProvider>
  );
};

export default App;

