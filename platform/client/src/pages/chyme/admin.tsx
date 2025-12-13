import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ChymeAdmin() {

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chyme Admin</h1>
          <p className="text-muted-foreground">
            Manage announcements
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Create and manage announcements for Chyme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create and manage announcements for this mini-app.
          </p>
          <Link href="/apps/chyme/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
