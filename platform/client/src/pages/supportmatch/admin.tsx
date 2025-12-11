import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

interface SupportMatchStats {
  activeUsers: number;
  currentPartnerships: number;
  pendingReports: number;
}

export default function SupportMatchAdmin() {
  const { data: stats } = useQuery<SupportMatchStats>({
    queryKey: ["/api/supportmatch/admin/stats"],
  });

  const statCards = [
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Current Partnerships",
      value: stats?.currentPartnerships || 0,
      icon: UserCheck,
      color: "bg-chart-2/10 text-chart-2",
    },
    {
      title: "Pending Reports",
      value: stats?.pendingReports || 0,
      icon: AlertTriangle,
      color: "bg-chart-3/10 text-chart-3",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          SupportMatch Administration
        </h1>
        <p className="text-muted-foreground">
          Manage partnerships, reports, and announcements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Partnership Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create manual matches, view all partnerships, and manage partnership statuses.
            </p>
            <Link href="/apps/supportmatch/admin/partnerships">
              <Button className="w-full" data-testid="button-manage-partnerships">
                Manage Partnerships
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and respond to safety reports from users.
            </p>
            {stats && stats.pendingReports > 0 && (
              <Badge variant="destructive">
                {stats.pendingReports} pending report{stats.pendingReports > 1 ? 's' : ''}
              </Badge>
            )}
            <Link href="/apps/supportmatch/admin/reports">
              <Button className="w-full" data-testid="button-manage-reports">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage platform announcements for users.
            </p>
            <Link href="/apps/supportmatch/admin/announcements">
              <Button className="w-full" data-testid="button-manage-announcements">
                Manage Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all SupportMatch user profiles and activity status.
            </p>
            <Link href="/apps/supportmatch/admin/users">
              <Button className="w-full" data-testid="button-view-users">
                View Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
