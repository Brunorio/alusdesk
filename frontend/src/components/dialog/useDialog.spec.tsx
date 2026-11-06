import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogProvider, useDialog } from './DialogProvider';

const TestComponent = ({ disableBackdropClose = false }: { disableBackdropClose?: boolean }) => {
  const { openDialog, closeDialog } = useDialog();

  return (
    <div>
      <button
        onClick={() =>
          openDialog(
            <div>
              <p>Modal Test Content</p>
              <button onClick={closeDialog}>Modal Close Action</button>
            </div>,
            {
              title: 'Test Modal Title',
              disableBackdropClose,
            },
          )
        }
      >
        Open
      </button>
    </div>
  );
};

describe('useDialog and DialogProvider', () => {
  it('should open and close dialog via useDialog hook', () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>,
    );

    expect(screen.queryByText('Test Modal Title')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Test Content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Modal Close Action'));
    expect(screen.queryByText('Test Modal Title')).not.toBeInTheDocument();
  });
});
