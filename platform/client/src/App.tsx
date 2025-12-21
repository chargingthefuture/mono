/**
 * Main App component
 * 
 * This file has been refactored to extract route configuration and route wrappers.
 * See routes/ directory for route definitions.
 */

import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { NpsSurveyManager } from "@/components/nps-survey-manager";
import { ErrorBoundary } from "@/components/error-boundary";
import { setSentryUser } from "@/sentry";
import { Router } from "@/routes";

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const needsApproval = user && !user.isApproved && !user.isAdmin;

  // Sidebar width customization for better content display
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <>
      {!isLoading && isAuthenticated && !needsApproval ? (
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between min-h-14 h-14 sm:h-16 px-3 sm:px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="text-xs sm:text-sm text-muted-foreground">
                  a work of optimism
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <Router />
      )}
      <Toaster />
      {isAuthenticated && <NpsSurveyManager />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
