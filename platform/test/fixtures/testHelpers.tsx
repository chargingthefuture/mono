import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Test helpers for React components
 */

/**
 * Create a test QueryClient with disabled retries
 * Uses fetch for queries so mocked global.fetch works
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Use fetch-based queryFn so mocked global.fetch works in tests
        queryFn: async ({ queryKey }) => {
          const url = queryKey.join("/") as string;
          const res = await fetch(url, {
            credentials: "include",
          });

          // Return null for 401/404, throw for other errors
          if (res.status === 401 || res.status === 404) {
            return null;
          }

          if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
          }

          return await res.json();
        },
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) {
  const queryClient = options?.queryClient || createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  const { queryClient: _, ...renderOptions } = options || {};
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock useAuth hook
export const mockUseAuth = (overrides = {}) => {
  const defaultClerk = {
    isSignedIn: false,
    clerkLoaded: false,
    clerkUser: null,
    clerkError: null,
  };

  // Extract _clerk from overrides if present, otherwise use default
  const clerkOverrides = overrides._clerk || {};
  const finalClerk = { ...defaultClerk, ...clerkOverrides };

  // Remove _clerk from overrides to avoid duplicate key
  const { _clerk: _, ...overridesWithoutClerk } = overrides as any;

  const merged = {
    user: null,
    isAdmin: false,
    isAuthenticated: undefined as boolean | undefined,
    isLoading: false,
    _dbError: null,
    ...overridesWithoutClerk,
    // Ensure _clerk is always defined (overwrite any undefined/null from overrides)
    _clerk: finalClerk,
  };

  // If isAuthenticated wasn't explicitly provided, derive it from the presence of a user.
  if (merged.isAuthenticated === undefined) {
    merged.isAuthenticated = Boolean(merged.user);
  }

  // Keep Clerk's isSignedIn in sync with authentication state when not explicitly set.
  if (merged._clerk && merged._clerk.isSignedIn === false && merged.isAuthenticated) {
    merged._clerk = { ...merged._clerk, isSignedIn: true };
  }

  return merged;
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

