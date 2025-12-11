import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import TrustTransportProfile from '@/pages/trusttransport/profile';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/apps/trusttransport/profile', vi.fn()],
  };
});

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('TrustTransportProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create form when no profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<TrustTransportProfile />);

    await waitFor(() => {
      // Use getAllByRole and check the first one (the h1 heading, not the button)
      const headings = screen.getAllByRole('heading', { name: /create.*profile/i });
      expect(headings[0]).toBeInTheDocument();
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
      isDriver: false,
      isRider: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProfile),
      } as Response)
    );

    renderWithProviders(<TrustTransportProfile />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /edit.*profile/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('should show delete button only when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      isDriver: false,
      isRider: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProfile),
      } as Response)
    );

    renderWithProviders(<TrustTransportProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-profile');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should not show delete button when profile does not exist', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<TrustTransportProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-profile');
      expect(deleteButton).not.toBeInTheDocument();
    });
  });
});

