/**
 * Route definitions - consolidated route configuration
 * 
 * This file imports and combines all route definitions from separate modules.
 */

import { Switch, Route } from "wouter";
import { ProtectedRoute, AdminRoute, RootRoute } from "./route-wrappers";
import NotFound from "@/pages/not-found";
import Terms from "@/pages/terms";
import BlogIndex from "@/pages/blog/index";
import BlogPostPage from "@/pages/blog/post";
import Services from "@/pages/services";
import UserPayments from "@/pages/user-payments";
import DeleteAccount from "@/pages/account/delete";
import AdminUsers from "@/pages/admin/users";
import AdminPayments from "@/pages/admin/payments";
import AdminActivity from "@/pages/admin/activity";
import AdminPricingTiers from "@/pages/admin/pricing-tiers";
import AdminWeeklyPerformance from "@/pages/admin/weekly-performance";
import ConversionCalculator from "@/pages/admin/conversion-calculator";
import AdminSkills from "@/pages/admin/skills";
import { registerPublicRoutes } from "./public-routes";
import { registerMiniAppRoutes } from "./mini-app-routes";

export function AppRouter() {
  return (
    <Switch>
      {/* Public routes */}
      {registerPublicRoutes()}
      
      {/* Protected user routes */}
      <Route path="/services">
        <ProtectedRoute>
          <Services />
        </ProtectedRoute>
      </Route>
      <Route path="/payments">
        <ProtectedRoute>
          <UserPayments />
        </ProtectedRoute>
      </Route>
      <Route path="/account/delete">
        <ProtectedRoute>
          <DeleteAccount />
        </ProtectedRoute>
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/users">
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      </Route>
      <Route path="/admin/skills">
        <AdminRoute>
          <AdminSkills />
        </AdminRoute>
      </Route>
      <Route path="/admin/payments">
        <AdminRoute>
          <AdminPayments />
        </AdminRoute>
      </Route>
      <Route path="/admin/pricing">
        <AdminRoute>
          <AdminPricingTiers />
        </AdminRoute>
      </Route>
      <Route path="/admin/activity">
        <AdminRoute>
          <AdminActivity />
        </AdminRoute>
      </Route>
      <Route path="/admin/weekly-performance">
        <AdminRoute>
          <AdminWeeklyPerformance />
        </AdminRoute>
      </Route>
      <Route path="/admin/conversion-calculator">
        <AdminRoute>
          <ConversionCalculator />
        </AdminRoute>
      </Route>
      
      {/* Mini-app routes */}
      {registerMiniAppRoutes()}
      
      {/* Root route - handles landing vs redirect (must be last) */}
      <Route path="/">
        <RootRoute />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

