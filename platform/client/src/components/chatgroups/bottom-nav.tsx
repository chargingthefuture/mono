import { Link, useLocation } from "wouter";
import { Home, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatGroupsBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Groups", path: "/apps/chatgroups", testId: "nav-groups" },
    { icon: Bell, label: "Announcements", path: "/apps/chatgroups/announcements", testId: "nav-announcements" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 sm:hidden">
      <div className="grid grid-cols-2 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || location.startsWith(item.path + "/");
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                data-testid={item.testId}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}














