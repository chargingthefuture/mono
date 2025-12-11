import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Home from '@/pages/home';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render home page for authenticated user', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: { id: 'test-user' } }));

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  it('should display user information when available', async () => {
    const mockUser = {
      id: 'test-user',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: mockUser }));

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });
});

