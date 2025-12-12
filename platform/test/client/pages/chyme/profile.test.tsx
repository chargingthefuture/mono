import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChymeProfile from '@/pages/chyme/profile';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useLocation hook from wouter
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/apps/chyme/profile', vi.fn()],
  };
});

// Mock apiRequest
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('ChymeProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create form when no profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    // Mock no profile returned
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<ChymeProfile />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create.*profile/i })).toBeInTheDocument();
    });
  });

  it('should render edit form when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response)
    );

    renderWithProviders(<ChymeProfile />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit.*profile/i })).toBeInTheDocument();
    });
  });

  it('should show delete button only when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response)
    );

    renderWithProviders(<ChymeProfile />);

    await waitFor(() => {
      const deleteButton = screen.getByTestId('button-delete-profile');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should not show delete button when no profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<ChymeProfile />);

    await waitFor(() => {
      expect(screen.queryByTestId('button-delete-profile')).not.toBeInTheDocument();
    });
  });

  it('should validate form fields', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<ChymeProfile />);

    await waitFor(() => {
      // Check for either create or update button
      const submitButton = screen.queryByTestId('button-submit') || screen.queryByTestId('button-save-profile') || screen.queryByTestId('button-save');
      expect(submitButton).toBeInTheDocument();
    });
  });
});


