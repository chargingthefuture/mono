import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Briefcase, Bell, Settings, Calendar } from "lucide-react";

export default function WorkforceRecruiterAdmin() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">Workforce Recruiter Administration</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage occupations, announcements, and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View and manage all occupations in the workforce tracker.
            </p>
            <Link href="/apps/workforce-recruiter/admin/occupations">
              <Button className="w-full text-sm sm:text-base" data-testid="button-manage-occupations">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="truncate">Manage Occupations</span>
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
              Create and manage announcements for this mini-app.
            </p>
            <Link href="/apps/workforce-recruiter/admin/announcements">
              <Button className="w-full text-sm sm:text-base" data-testid="button-manage-announcements">
                <Bell className="w-4 h-4 mr-2" />
                <span className="truncate">Manage Announcements</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meetup Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage meetup events, and view user signups.
            </p>
            <Link href="/apps/workforce-recruiter/admin/meetup-events">
              <Button className="w-full text-sm sm:text-base" data-testid="button-manage-meetup-events">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="truncate">Manage Meetup Events</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure population, workforce participation rate, and recruitable limits.
            </p>
            <Link href="/apps/workforce-recruiter/config">
              <Button variant="outline" className="w-full text-sm sm:text-base" data-testid="button-manage-config">
                <Settings className="w-4 h-4 mr-2" />
                <span className="truncate">Manage Configuration</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




