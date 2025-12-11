import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteProfileDialog } from '@/components/delete-profile-dialog';
import { renderWithProviders } from '@test/fixtures/testHelpers';

describe('DeleteProfileDialog', () => {
  it('should render when open', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <DeleteProfileDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        appName="TestApp"
        isDeleting={false}
      />
    );

    // Use getByRole to find the heading specifically
    expect(screen.getByRole('heading', { name: /delete.*testapp.*profile/i })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <DeleteProfileDialog
        open={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        appName="TestApp"
        isDeleting={false}
      />
    );

    expect(screen.queryByText(/delete.*profile/i)).not.toBeInTheDocument();
  });

  it('should call onConfirm with reason when confirmed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <DeleteProfileDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        appName="TestApp"
        isDeleting={false}
      />
    );

    const reasonInput = screen.getByLabelText(/reason/i);
    await user.type(reasonInput, 'Test reason');

    const confirmButton = screen.getByRole('button', { name: /confirm.*delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('Test reason');
    });
  });

  it('should call onOpenChange when cancelled', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <DeleteProfileDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        appName="TestApp"
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable confirm button while deleting', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <DeleteProfileDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        appName="TestApp"
        isDeleting={true}
      />
    );

    // When isDeleting is true, button text changes to "Deleting..."
    const confirmButton = screen.getByRole('button', { name: /deleting/i });
    expect(confirmButton).toBeDisabled();
  });
});

