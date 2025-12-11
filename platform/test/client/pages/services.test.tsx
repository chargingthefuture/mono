import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Services from '@/pages/services';
import { renderWithProviders, mockUseAuth } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render services page', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: { id: 'test-user' } }));

    renderWithProviders(<Services />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /available services/i })).toBeInTheDocument();
    });
  });

  it('should display all available mini-apps', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ user: { id: 'test-user' } }));

    renderWithProviders(<Services />);

    const serviceTestIds = [
      'card-service-chatgroups',
      'card-service-directory',
      'card-service-lighthouse',
      'card-service-socketrelay',
      'card-service-supportmatch',
      'card-service-mechanicmatch',
      'card-service-lostmail',
      'card-service-research',
      'card-service-gentlepulse',
      'card-service-chyme',
      'card-service-trusttransport',
      'card-service-workforce-recruiter',
    ];

    await waitFor(() => {
      serviceTestIds.forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    });
  });
});

