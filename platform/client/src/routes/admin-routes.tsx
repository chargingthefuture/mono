/**
 * Admin routes - require admin privileges
 */

import { Route } from "wouter";
import { AdminRoute } from "./route-wrappers";
import AdminUsers from "@/pages/admin/users";
import AdminPayments from "@/pages/admin/payments";
import AdminActivity from "@/pages/admin/activity";
import AdminPricingTiers from "@/pages/admin/pricing-tiers";
import AdminWeeklyPerformance from "@/pages/admin/weekly-performance";
import ConversionCalculator from "@/pages/admin/conversion-calculator";
import AdminSkills from "@/pages/admin/skills";

export function AdminRoutes() {
  return (
    <>
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
    </>
  );
}

