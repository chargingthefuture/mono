import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationControls } from '@/components/pagination-controls';

describe('PaginationControls', () => {
  it('should not render when only one page', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <PaginationControls
        currentPage={0}
        totalItems={10}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when no items', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <PaginationControls
        currentPage={0}
        totalItems={0}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls for multiple pages', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={0}
        totalItems={50}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={0}
        totalItems={50}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={2}
        totalItems={50}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange when next button clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={0}
        totalItems={50}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange when previous button clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={1}
        totalItems={50}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    await user.click(previousButton);

    expect(onPageChange).toHaveBeenCalledWith(0);
  });
});

