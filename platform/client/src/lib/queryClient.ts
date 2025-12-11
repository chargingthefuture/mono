import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { parseApiError } from "./errorHandler";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Clone the response so we can read the body without consuming it
    const clonedRes = res.clone();
    const contentType = res.headers.get("content-type");
    let errorData: any;
    
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await clonedRes.json();
      } catch {
        // If JSON parsing fails, read as text
        const textRes = res.clone();
        const errorText = (await textRes.text()) || res.statusText;
        errorData = { message: errorText };
      }
    } else {
      const errorText = (await clonedRes.text()) || res.statusText;
      // If it's HTML, provide a better error message
      if (errorText.trim().startsWith("<!DOCTYPE") || errorText.trim().startsWith("<html")) {
        errorData = { 
          message: `Server returned HTML error page (status ${res.status}). Please check server logs.` 
        };
      } else {
        errorData = { message: errorText };
      }
    }
    
    // Create error with structured data
    const error = new Error(`${res.status}: ${JSON.stringify(errorData)}`);
    (error as any).response = res;
    (error as any).data = errorData;
    throw error;
  }
}

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'X-CSRF-Token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Check if this is an admin endpoint that requires CSRF protection
  // Patterns: /api/admin/*, /api/{app}/admin/*, or specific admin-protected endpoints
  const isAdminEndpoint = 
    url.includes('/api/admin') || 
    url.match(/\/api\/[^/]+\/admin/) ||
    // Workforce recruiter meetup events (admin-only)
    url.match(/\/api\/workforce-recruiter\/meetup-events/) ||
    // Chyme admin rooms
    url.match(/\/api\/chyme\/admin\/rooms/) ||
    // Skills admin endpoints
    url.match(/\/api\/skills\/(sectors|job-titles|skills)/);
  
  // For state-changing methods on admin endpoints, include CSRF token
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  const needsCsrfToken = isAdminEndpoint && stateChangingMethods.includes(method.toUpperCase());
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add CSRF token header if needed
  if (needsCsrfToken) {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // For auth endpoints, if JSON parsing fails, treat as authentication error
    const isAuthEndpoint = url.includes('/api/auth/user');
    
    try {
      return await res.json();
    } catch (error) {
      // If JSON parsing fails (e.g., "Unexpected end of JSON input"), 
      // and this is an auth endpoint, treat as authentication failure
      if (isAuthEndpoint && error instanceof SyntaxError) {
        console.error("Failed to parse auth response - treating as auth failure:", error);
        // Throw an authentication error instead of a JSON parse error
        throw new Error("401: Authentication failed - invalid response from server");
      }
      // For other endpoints, re-throw the original error
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
