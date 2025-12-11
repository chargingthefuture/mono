import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as clerkModule from '@clerk/clerk-react';
import { getQueryFn } from '@/lib/queryClient';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
      },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Set environment variable to prevent Clerk error checks from triggering
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_mock_key');
  });

  it('should return loading state when Clerk is not loaded', () => {
    vi.mocked(clerkModule.useUser).mockReturnValue({ isLoaded: false, isSignedIn: false, user: null } as any);
    vi.mocked(clerkModule.useAuth).mockReturnValue({ isSignedIn: false } as any);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    // When Clerk is not loaded and hasn't timed out, isLoading should be true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should return authenticated state when user is signed in', async () => {
    const mockClerkUser = { id: 'clerk-user-id', email: 'test@example.com' };
    
    vi.mocked(clerkModule.useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockClerkUser,
    } as any);
    vi.mocked(clerkModule.useAuth).mockReturnValue({ isSignedIn: true } as any);

    const mockDbUser = {
      id: 'db-user-id',
      email: 'test@example.com',
      isAdmin: false,
      isApproved: true,
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDbUser),
      } as Response)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    expect(result.current.user).toEqual(mockDbUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should return admin state when user is admin', async () => {
    const mockClerkUser = { id: 'clerk-user-id', email: 'admin@example.com' };
    
    vi.mocked(clerkModule.useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockClerkUser,
    } as any);
    vi.mocked(clerkModule.useAuth).mockReturnValue({ isSignedIn: true } as any);

    const mockDbUser = {
      id: 'db-user-id',
      email: 'admin@example.com',
      isAdmin: true,
      isApproved: true,
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDbUser),
      } as Response)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    expect(result.current.user).toEqual(mockDbUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('should expose Clerk internals', () => {
    vi.mocked(clerkModule.useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { id: 'clerk-user-id' },
    } as any);
    vi.mocked(clerkModule.useAuth).mockReturnValue({ isSignedIn: true } as any);

    // Mock fetch for the DB user query (even though we don't check the result)
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      } as Response)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current._clerk).toBeDefined();
    expect(result.current._clerk.clerkLoaded).toBe(true);
    expect(result.current._clerk.isSignedIn).toBe(true);
    expect(result.current._clerk.clerkUser).toBeDefined();
  });
});

