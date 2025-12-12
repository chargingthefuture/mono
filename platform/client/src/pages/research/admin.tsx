import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageSquare, FileText, AlertTriangle } from "lucide-react";

export default function CompareNotesAdmin() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">CompareNotes Administration</h1>
        <p className="text-muted-foreground">
          Manage research items, reports, and announcements
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and manage reported content.
            </p>
            <Link href="/apps/research/admin/reports">
              <Button className="w-full" data-testid="button-manage-reports">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Manage Reports
              </Button>
            </Link>
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
              Create and manage CompareNotes announcements.
            </p>
            <Link href="/apps/research/admin/announcements">
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
