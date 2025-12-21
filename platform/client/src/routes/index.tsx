/**
 * Main router component - combines all route groups
 */

import { Switch, Route } from "wouter";
import { RootRoute } from "./route-wrappers";
import { PublicRoutes } from "./public-routes";
import { ProtectedRoutes } from "./protected-routes";
import { AdminRoutes } from "./admin-routes";
import { MiniAppRoutes } from "./mini-app-routes";
import NotFound from "@/pages/not-found";

export function Router() {
  return (
    <Switch>
      <PublicRoutes />
      <ProtectedRoutes />
      <AdminRoutes />
      <MiniAppRoutes />
      
      {/* Root route - handles landing vs redirect (must be last) */}
      <Route path="/">
        <RootRoute />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

