import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import MechanicMatchProfile from '@/pages/mechanicmatch/profile';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/apps/mechanicmatch/profile', vi.fn()],
  };
});

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('MechanicMatchProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create form when no profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<MechanicMatchProfile />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create.*profile/i })).toBeInTheDocument();
    });
  });

  it('should render edit form when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-1234',
      country: 'United States',
      state: 'NY',
      city: 'New York',
      bio: 'Test bio',
      isMechanic: false,
      isOwner: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response)
    );

    renderWithProviders(<MechanicMatchProfile />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit.*profile/i })).toBeInTheDocument();
    });
  });

  it('should show delete button only when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      isMechanic: false,
      isOwner: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response)
    );

    renderWithProviders(<MechanicMatchProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-profile');
      expect(deleteButton).toBeInTheDocument();
    });
  });
});

