import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, MessageSquare, FileDown } from "lucide-react";
import LostMailAdminIncidents from "./admin-incidents";

export default function LostMailAdmin() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">LostMail Administration</h1>
        <p className="text-muted-foreground">
          Manage mail incident reports and announcements
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Incident Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View, filter, and manage all incident reports.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage announcements for LostMail users.
            </p>
            <Link href="/apps/lostmail/admin/announcements">
              <Button className="w-full" data-testid="button-manage-announcements">
                Manage Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Incident Management Table */}
      <LostMailAdminIncidents />
    </div>
  );
}
