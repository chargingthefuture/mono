/**
 * Protected routes - require authentication
 */

import { Route } from "wouter";
import { ProtectedRoute } from "./route-wrappers";
import Services from "@/pages/services";
import UserPayments from "@/pages/user-payments";
import DeleteAccount from "@/pages/account/delete";

export function ProtectedRoutes() {
  return (
    <>
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
    </>
  );
}

