import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Car, ArrowLeft, Bell } from "lucide-react";

export default function TrustTransportAdmin() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">TrustTransport Administration</h1>
          <p className="text-muted-foreground">
            Manage TrustTransport content and settings
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage announcements for TrustTransport users.
            </p>
            <Link href="/apps/trusttransport/admin/announcements">
              <Button className="w-full" data-testid="button-manage-announcements">
                Manage Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




