/**
 * Main router component - combines all route groups
 * 
 * Note: Using fragments directly without Switch. wouter's Route components
 * work fine with fragments - Switch was causing the white screen issue.
 */

import { Route } from "wouter";
import { RootRoute } from "./route-wrappers";
import { PublicRoutes } from "./public-routes";
import { ProtectedRoutes } from "./protected-routes";
import { AdminRoutes } from "./admin-routes";
import { MiniAppRoutes } from "./mini-app-routes";
import NotFound from "@/pages/not-found";

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
      
      {/* 404 - must be last */}
      <Route component={NotFound} />
    </>
  );
}

