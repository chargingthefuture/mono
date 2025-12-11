import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminActionLog } from "@shared/schema";
import { FileText } from "lucide-react";

export default function AdminActivity() {
  const { data: logs, isLoading } = useQuery<AdminActionLog[]>({
    queryKey: ["/api/admin/activity"],
  });

  const getActionBadge = (action: string) => {
    if (action.includes("create") || action.includes("generate")) {
      return <Badge variant="default">{action}</Badge>;
    } else if (action.includes("delete") || action.includes("deactivate")) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Activity Log</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track all administrative actions and system events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activity log...
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Administrative actions will be logged here
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-activity-${log.id}`}>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="capitalize">{log.resourceType}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {log.resourceId ? log.resourceId.substring(0, 8) : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} data-testid={`row-activity-${log.id}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {getActionBadge(log.action)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Resource Type</span>
                          <p className="capitalize">{log.resourceType}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Resource ID</span>
                          <p className="font-mono text-xs">
                            {log.resourceId ? log.resourceId.substring(0, 8) : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
