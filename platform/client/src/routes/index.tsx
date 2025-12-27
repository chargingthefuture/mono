/**
 * Main router component - combines all route groups
 * 
 * Note: Using fragments directly without Switch. wouter's Route components
 * work fine with fragments - Switch was causing the white screen issue.
 * 
 * IMPORTANT: In wouter, when using fragments (not Switch), a Route without
 * a path matches everything and renders alongside other routes. To fix this,
 * we use a Route with a path that only matches when explicitly checking for
 * unmatched routes. However, since wouter evaluates routes independently in
 * fragments, we need to ensure the NotFound only renders when no other route matches.
 * 
 * The solution: Remove the catch-all Route and handle 404s within individual
 * route components, or use a more specific pattern that doesn't conflict.
 * For now, we'll use a pattern that matches but checks if it should render.
 */

import { Route, useLocation } from "wouter";
import { RootRoute } from "./route-wrappers";
import { PublicRoutes } from "./public-routes";
import { ProtectedRoutes } from "./protected-routes";
import { AdminRoutes } from "./admin-routes";
import { MiniAppRoutes } from "./mini-app-routes";
import NotFound from "@/pages/not-found";

function ConditionalNotFound() {
  const [location] = useLocation();
  
  // List of all known route base paths
  const knownRouteBases = [
    "/apps/",
    "/services",
    "/payments",
    "/account/",
    "/admin",
    "/terms",
    "/blog",
  ];
  
  // Check if this location starts with any known route base
  const isKnownRoute = knownRouteBases.some(base => 
    location === base || location.startsWith(base)
  );
  
  // Only render NotFound if this is not a known route
  // (root path "/" is handled by RootRoute, so we skip it here)
  if (location === "/" || isKnownRoute) {
    return null;
  }
  
  return <NotFound />;
}

export function Router() {
  return (
    <>
      {/* Public routes */}
      <PublicRoutes />
      
      {/* Protected routes */}
      <ProtectedRoutes />
      
      {/* Admin routes */}
      <AdminRoutes />
      
      {/* Mini-app routes */}
      <MiniAppRoutes />
      
      {/* Root route - handles landing vs redirect (must be last) */}
      <Route path="/">
        <RootRoute />
      </Route>
      
      {/* 404 - only renders for truly unmatched routes */}
      <Route path="/*">
        <ConditionalNotFound />
      </Route>
    </>
  );
}

