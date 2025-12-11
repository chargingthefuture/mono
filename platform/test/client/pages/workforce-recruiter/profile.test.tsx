import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkforceRecruiterProfile from '@/pages/workforce-recruiter/profile';
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
    useLocation: () => ['/apps/workforce-recruiter/profile', vi.fn()],
  };
});

// Mock apiRequest
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('WorkforceRecruiterProfile', () => {
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

    renderWithProviders(<WorkforceRecruiterProfile />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /create.*profile/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('should render edit form when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      displayName: 'Test User',
      notes: 'Test notes',
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

    renderWithProviders(<WorkforceRecruiterProfile />);

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
      displayName: 'Test User',
      notes: 'Test notes',
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

    renderWithProviders(<WorkforceRecruiterProfile />);

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

    renderWithProviders(<WorkforceRecruiterProfile />);

    await waitFor(() => {
      const deleteButton = screen.queryByTestId('button-delete-profile');
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  it('should display form fields with correct test IDs', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(null),
      } as Response)
    );

    renderWithProviders(<WorkforceRecruiterProfile />);

    await waitFor(() => {
      expect(screen.getByTestId('input-display-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-notes')).toBeInTheDocument();
      expect(screen.getByTestId('button-submit')).toBeInTheDocument();
    });
  });

  it('should pre-fill form fields when profile exists', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth());

    const mockProfile = {
      id: 'test-id',
      userId: 'test-user-id',
      displayName: 'Existing User',
      notes: 'Existing notes',
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

    renderWithProviders(<WorkforceRecruiterProfile />);

    // Wait for profile to load and form to reset
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /edit.*profile/i });
      expect(heading).toBeInTheDocument();
    });

    // Wait for form fields to be pre-filled
    await waitFor(() => {
      const displayNameInput = screen.getByTestId('input-display-name') as HTMLInputElement;
      const notesInput = screen.getByTestId('input-notes') as HTMLTextAreaElement;
      expect(displayNameInput.value).toBe('Existing User');
      expect(notesInput.value).toBe('Existing notes');
    });
  });
});

