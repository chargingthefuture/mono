import { Link, useLocation } from "wouter";
import { Home, Clock, FileText, Bookmark, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompareNotesBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/apps/comparenotes", testId: "nav-dashboard" },
    { icon: Clock, label: "Timeline", path: "/apps/comparenotes/timeline", testId: "nav-timeline" },
    { icon: FileText, label: "My Items", path: "/apps/comparenotes/my-items", testId: "nav-my-items" },
    { icon: Bookmark, label: "Bookmarks", path: "/apps/comparenotes/bookmarks", testId: "nav-bookmarks" },
    { icon: Plus, label: "New Item", path: "/apps/comparenotes/new", testId: "nav-new-item" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 sm:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
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














