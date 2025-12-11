import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DirectoryProfile from '@/pages/directory/profile';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/apps/directory/profile', vi.fn()],
  };
});

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('DirectoryProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create form when no profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    // Mock all required queries
    global.fetch = vi.fn((url: string | Request | URL) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('/api/directory/skills')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/api/directory/sectors')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/api/directory/job-titles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/api/directory/announcements')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      // Profile query
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);
    });

    renderWithProviders(<DirectoryProfile />);

    await waitFor(() => {
      expect(screen.getByText(/create.*your.*profile/i)).toBeInTheDocument();
    });
  });

  it('should show delete button when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      country: 'United States',
      state: 'NY',
      city: 'New York',
      bio: 'Test bio',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock all required queries
    global.fetch = vi.fn((url: string | Request | URL) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('/api/directory/skills')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/api/directory/sectors')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/api/directory/job-titles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/api/directory/announcements')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      // Profile query
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response);
    });

    renderWithProviders(<DirectoryProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-directory-profile');
      expect(deleteButton).toBeInTheDocument();
    });
  });
});

