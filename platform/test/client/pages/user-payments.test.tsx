import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import UserPayments from '@/pages/user-payments';
import { renderWithProviders, mockUseAuth, createTestQueryClient } from '@test/fixtures/testHelpers';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Clerk PricingTable so tests don't require a real ClerkProvider
vi.mock('@clerk/clerk-react', () => ({
  PricingTable: () => null,
}));

describe('UserPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render payments page for authenticated user', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ 
      user: { 
        id: 'test-user',
        subscriptionStatus: 'active',
        pricingTier: 0,
      } 
    }));

    // Create query client and pre-populate queries to avoid fetch mocks
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['/api/payments'], []);
    queryClient.setQueryData(['/api/payments/status'], {
      isDelinquent: false,
      missingMonths: [],
      nextBillingDate: null,
      amountOwed: "0",
    });

    renderWithProviders(<UserPayments />, { queryClient });

    // Wait for the heading to appear - use exact text match
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'My Payments' });
      expect(heading).toBeInTheDocument();
    });
  });

  it('should display payment history when available', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth({ 
      user: { 
        id: 'test-user',
        subscriptionStatus: 'active',
        pricingTier: 0,
      } 
    }));

    const mockPayments = [
      {
        id: 'payment-1',
        amount: 10.0,
        billingPeriod: 'monthly',
        billingMonth: '2024-01',
        paymentMethod: 'venmo',
        paymentDate: '2024-01-15',
        notes: 'Test payment',
      },
    ];

    // Create query client and pre-populate queries to avoid fetch mocks
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['/api/payments'], mockPayments);
    queryClient.setQueryData(['/api/payments/status'], {
      isDelinquent: false,
      missingMonths: [],
      nextBillingDate: null,
      amountOwed: "0",
    });

    renderWithProviders(<UserPayments />, { queryClient });

    // Wait for the heading to appear - use exact text match
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'My Payments' });
      expect(heading).toBeInTheDocument();
    });

    // Wait for payment data to load and verify it's displayed
    await waitFor(() => {
      expect(screen.getByTestId('row-payment-payment-1')).toBeInTheDocument();
    });
  });
});

