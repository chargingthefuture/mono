import { Link, useLocation } from "wouter";
import { Home, User, Search, FileText, CheckCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustTransportBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/apps/trusttransport", testId: "nav-dashboard" },
    { icon: User, label: "Profile", path: "/apps/trusttransport/profile", testId: "nav-profile" },
    { icon: Search, label: "Browse", path: "/apps/trusttransport/browse", testId: "nav-browse" },
    { icon: FileText, label: "My Requests", path: "/apps/trusttransport/my-requests", testId: "nav-my-requests" },
    { icon: CheckCircle, label: "My Claimed", path: "/apps/trusttransport/my-claimed", testId: "nav-my-claimed" },
    { icon: Bell, label: "Announcements", path: "/apps/trusttransport/announcements", testId: "nav-announcements" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 sm:hidden">
      <div className="grid grid-cols-3 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || location.startsWith(item.path + "/");
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                data-testid={item.testId}
                aria-label={item.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}














