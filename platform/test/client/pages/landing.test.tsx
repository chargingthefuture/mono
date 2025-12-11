import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import Landing from '@/pages/landing';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/', vi.fn()],
  };
});

describe('Landing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return value to prevent undefined errors
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: null }));
  });

  it('should render landing page for unauthenticated users', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: null }));

    renderWithProviders(<Landing />);

    expect(screen.getByText(/psyop-free/i)).toBeInTheDocument();
  });

  it('should display login form', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: null }));

    renderWithProviders(<Landing />);

    expect(screen.getByTestId('button-login')).toBeInTheDocument();
  });
});

