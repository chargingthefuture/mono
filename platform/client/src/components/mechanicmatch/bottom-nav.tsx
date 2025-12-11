import { Link, useLocation } from "wouter";
import { Home, User, Car, Wrench, Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MechanicMatchBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/apps/mechanicmatch", testId: "nav-dashboard" },
    { icon: User, label: "Profile", path: "/apps/mechanicmatch/profile", testId: "nav-profile" },
    { icon: Car, label: "Vehicles", path: "/apps/mechanicmatch/vehicles", testId: "nav-vehicles" },
    { icon: Wrench, label: "Browse", path: "/apps/mechanicmatch/browse-mechanics", testId: "nav-browse" },
    { icon: Calendar, label: "Availability", path: "/apps/mechanicmatch/availability", testId: "nav-availability" },
    { icon: Plus, label: "New Request", path: "/apps/mechanicmatch/request-new", testId: "nav-new-request" },
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














