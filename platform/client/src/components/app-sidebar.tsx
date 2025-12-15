import { 
  Home,
  Users, 
  Ticket, 
  DollarSign, 
  FileText,
  LogOut,
  UserCheck,
  TrendingUp,
  Moon,
  Sun,
  Building2,
  Radio,
  MessageCircle,
  BarChart3,
  Car,
  Wrench,
  Mail,
  Search,
  HeartPulse,
  Video,
  Briefcase,
  Activity
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/clerk-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useExternalLink } from "@/hooks/useExternalLink";
import { ExternalLink } from "lucide-react";

const baseAdminMenuItems = [
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
    testId: "link-admin-users",
  },
  {
    title: "Skills Database",
    url: "/admin/skills",
    icon: Wrench,
    testId: "link-admin-skills",
  },
  {
    title: "Payments",
    url: "/admin/payments",
    icon: DollarSign,
    testId: "link-admin-payments",
  },
  {
    title: "Pricing",
    url: "/admin/pricing",
    icon: TrendingUp,
    testId: "link-admin-pricing",
  },
  {
    title: "Activity Log",
    url: "/admin/activity",
    icon: FileText,
    testId: "link-admin-activity",
  },
  {
    title: "Weekly Performance",
    url: "/admin/weekly-performance",
    icon: BarChart3,
    testId: "link-admin-weekly-performance",
  },
  {
    title: "Chat Groups Admin",
    url: "/apps/chatgroups/admin",
    icon: MessageCircle,
    testId: "link-chatgroups-admin",
  },
  {
    title: "Directory Admin",
    url: "/apps/directory/admin",
    icon: Users,
    testId: "link-directory-admin",
  },
  {
    title: "LightHouse Admin",
    url: "/apps/lighthouse/admin",
    icon: Building2,
    testId: "link-lighthouse-admin",
  },
  {
    title: "SocketRelay Admin",
    url: "/apps/socketrelay/admin",
    icon: Radio,
    testId: "link-socketrelay-admin",
  },
  {
    title: "SupportMatch Admin",
    url: "/apps/supportmatch/admin",
    icon: UserCheck,
    testId: "link-supportmatch-admin",
  },
  {
    title: "TrustTransport Admin",
    url: "/apps/trusttransport/admin",
    icon: Car,
    testId: "link-trusttransport-admin",
  },
  {
    title: "MechanicMatch Admin",
    url: "/apps/mechanicmatch/admin",
    icon: Wrench,
    testId: "link-mechanicmatch-admin",
  },
  {
    title: "LostMail Admin",
    url: "/apps/lostmail/admin",
    icon: Mail,
    testId: "link-lostmail-admin",
  },
  {
    title: "CompareNotes Admin",
    url: "/apps/comparenotes/admin",
    icon: Search,
    testId: "link-research-admin",
  },
  {
    title: "GentlePulse Admin",
    url: "/apps/gentlepulse/admin",
    icon: HeartPulse,
    testId: "link-gentlepulse-admin",
  },
  {
    title: "Chyme Admin",
    url: "/apps/chyme/admin",
    icon: Radio,
    testId: "link-chyme-admin",
  },
  {
    title: "Workforce Admin",
    url: "/apps/workforce-recruiter/admin",
    icon: Briefcase,
    testId: "link-workforce-recruiter-admin",
  },
  {
    title: "Default Alive or Dead",
    url: "/apps/default-alive-or-dead",
    icon: Activity,
    testId: "link-default-alive-or-dead",
  },
  {
    title: "Conversion Calculator",
    url: "/admin/conversion-calculator",
    icon: BarChart3,
    testId: "link-conversion-calculator",
  },
];

const pinnedAdminTitles = ["User Management", "Workforce Admin", "Weekly Performance", "Payments", "Pricing", "Default Alive or Dead", "Conversion Calculator"];

const pinnedAdminMenuItems = pinnedAdminTitles
  .map((title) => baseAdminMenuItems.find((item) => item.title === title))
  .filter((item): item is (typeof baseAdminMenuItems)[number] => Boolean(item));

const otherAdminMenuItems = baseAdminMenuItems
  .filter((item) => !pinnedAdminTitles.includes(item.title))
  .sort((a, b) => a.title.localeCompare(b.title));

const adminMenuItems = [...pinnedAdminMenuItems, ...otherAdminMenuItems];

// Pinned items that always appear at the top
const pinnedUserMenuItems = [
  {
    title: "My Dashboard",
    url: "/",
    icon: Home,
    testId: "link-home",
  },
  {
    title: "My Payments",
    url: "/payments",
    icon: DollarSign,
    testId: "link-payments",
  },
];

// Mini-apps that will be sorted alphabetically
const miniAppMenuItems = [
  {
    title: "Chat Groups",
    url: "/apps/chatgroups",
    icon: MessageCircle,
    testId: "link-chatgroups",
  },
  {
    title: "Directory",
    url: "/apps/directory",
    icon: Users,
    testId: "link-directory",
  },
  {
    title: "GentlePulse",
    url: "/apps/gentlepulse",
    icon: HeartPulse,
    testId: "link-gentlepulse",
  },
  {
    title: "Chyme",
    url: "/apps/chyme",
    icon: Radio,
    testId: "link-chyme",
    showBeta: true,
  },
  {
    title: "Workforce Recruiter",
    url: "/apps/workforce-recruiter",
    icon: Briefcase,
    testId: "link-workforce-recruiter",
  },
  {
    title: "LightHouse",
    url: "/apps/lighthouse",
    icon: Building2,
    testId: "link-lighthouse",
  },
  {
    title: "LostMail",
    url: "/apps/lostmail",
    icon: Mail,
    testId: "link-lostmail",
  },
  {
    title: "MechanicMatch",
    url: "/apps/mechanicmatch",
    icon: Wrench,
    testId: "link-mechanicmatch",
  },
  {
    title: "CompareNotes",
    url: "/apps/comparenotes",
    icon: Search,
    testId: "link-research",
    showBeta: true,
  },
  {
    title: "SocketRelay",
    url: "/apps/socketrelay",
    icon: Radio,
    testId: "link-socketrelay",
  },
  {
    title: "SupportMatch",
    url: "/apps/supportmatch",
    icon: UserCheck,
    testId: "link-supportmatch",
  },
  {
    title: "TrustTransport",
    url: "/apps/trusttransport",
    icon: Car,
    testId: "link-trusttransport",
  },
];

// Combine pinned items with alphabetically sorted mini-apps
const userMenuItems = [
  ...pinnedUserMenuItems,
  ...miniAppMenuItems.sort((a, b) => a.title.localeCompare(b.title)),
];

export function AppSidebar() {
  const [location] = useLocation();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const clerk = useClerk();
  const { isMobile, setOpenMobile } = useSidebar();

  const townsquareUrl = "https://chargingthefuture.discourse.group";

  // Close sidebar on mobile when navigation link is clicked
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Don't pass redirectUrl - let Clerk use the afterSignOutUrl configured in ClerkProvider
      // This ensures it uses the correct domain (custom domain if configured, or baseUrl)
      await clerk.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: redirect to sign-in page
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isProduction = hostname.includes('app.chargingthefuture.com');
      const isStaging = hostname.includes('the-comic.com') || hostname.includes('staging');
      
      let signInUrl: string;
      if (isProduction) {
        signInUrl = 'https://accounts.app.chargingthefuture.com/sign-in';
      } else if (isStaging) {
        const stagingCustomDomain = import.meta.env.VITE_CLERK_STAGING_DOMAIN;
        if (stagingCustomDomain) {
          signInUrl = `https://${stagingCustomDomain}/sign-in`;
        } else {
          signInUrl = `${window.location.origin}/sign-in`;
        }
      } else {
        signInUrl = 'https://sure-oarfish-90.accounts.dev/sign-in';
      }
      window.location.href = signInUrl;
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-primary px-4 py-4">
            psyop-free economy
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={item.testId}>
                      <Link href={item.url} onClick={handleNavClick}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                        {(item as any).showBeta && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Beta
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-2">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} data-testid={item.testId}>
                        <Link href={item.url} onClick={handleNavClick}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => openExternal(townsquareUrl)}
          data-testid="link-townsquare"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Townsquare
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </SidebarFooter>
      <ExternalLinkDialog />
    </Sidebar>
  );
}
