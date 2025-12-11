import { Link, useLocation } from "wouter";
import { Home, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function GentlePulseDesktopNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Library", path: "/apps/gentlepulse", testId: "nav-desktop-library" },
    { icon: HelpCircle, label: "Support", path: "/apps/gentlepulse/support", testId: "nav-desktop-support" },
    { icon: Settings, label: "Settings", path: "/apps/gentlepulse/settings", testId: "nav-desktop-settings" },
  ];

  return (
    <nav className="hidden sm:flex border-b mb-6" aria-label="GentlePulse navigation">
      <div className="flex gap-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "border-b-2 border-transparent",
                  isActive
                    ? "text-primary bg-primary/10 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                data-testid={item.testId}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}





