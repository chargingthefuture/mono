import { Link, useLocation } from "wouter";
import { Home, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function GentlePulseBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Library", path: "/apps/gentlepulse", testId: "nav-library" },
    { icon: HelpCircle, label: "Support", path: "/apps/gentlepulse/support", testId: "nav-support" },
    { icon: Settings, label: "Settings", path: "/apps/gentlepulse/settings", testId: "nav-settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 sm:hidden" aria-label="GentlePulse navigation">
      <div className="grid grid-cols-3 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
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
                aria-current={isActive ? "page" : undefined}
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
