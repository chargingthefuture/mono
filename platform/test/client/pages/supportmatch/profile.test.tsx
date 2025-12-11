import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupportMatchProfile from '@/pages/supportmatch/profile';
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
    useLocation: () => ['/apps/supportmatch/profile', vi.fn()],
  };
});

// Mock apiRequest
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('SupportMatchProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create form when no profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    // Mock no profile returned
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<SupportMatchProfile />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create.*profile/i })).toBeInTheDocument();
    });
  });

  it('should render edit form when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      nickname: 'Test User',
      timezone: 'America/New_York',
      availabilityStart: '09:00',
      availabilityEnd: '17:00',
      preferredCommunicationMethod: 'text',
      interests: [],
      bio: 'Test bio',
      isPublic: false,
      isActive: true,
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

    renderWithProviders(<SupportMatchProfile />);

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
      nickname: 'Test User',
      timezone: 'America/New_York',
      availabilityStart: '09:00',
      availabilityEnd: '17:00',
      preferredCommunicationMethod: 'text',
      interests: [],
      bio: 'Test bio',
      isPublic: false,
      isActive: true,
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

    renderWithProviders(<SupportMatchProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-profile');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should not show delete button when profile does not exist', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<SupportMatchProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-profile');
      expect(deleteButton).not.toBeInTheDocument();
    });
  });
});

