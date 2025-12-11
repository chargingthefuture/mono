import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { DollarSign, TrendingUp, FileText } from "lucide-react";
import type { DefaultAliveOrDeadFinancialEntry, DefaultAliveOrDeadEbitdaSnapshot } from "@shared/schema";
import { format } from "date-fns";
import { PaginationControls } from "@/components/pagination-controls";
import { useState } from "react";

export default function DefaultAliveOrDeadAdmin() {
  const [financialEntriesPage, setFinancialEntriesPage] = useState(0);
  const [snapshotsPage, setSnapshotsPage] = useState(0);
  const limit = 20;

  const { data: financialEntriesData, isLoading: entriesLoading } = useQuery<{
    entries: DefaultAliveOrDeadFinancialEntry[];
    total: number;
  }>({
    queryKey: [`/api/default-alive-or-dead/financial-entries?limit=${limit}&offset=${financialEntriesPage * limit}`],
  });

  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery<{
    snapshots: DefaultAliveOrDeadEbitdaSnapshot[];
    total: number;
  }>({
    queryKey: [`/api/default-alive-or-dead/ebitda-snapshots?limit=${limit}&offset=${snapshotsPage * limit}`],
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Default Alive or Dead Administration</h1>
        <p className="text-muted-foreground">
          Manage financial entries and EBITDA snapshots
        </p>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all financial entries (operating expenses, depreciation, amortization).
            </p>
            <Link href="/apps/default-alive-or-dead/admin/financial-entries">
              <Button className="w-full" data-testid="button-manage-financial-entries">
                <DollarSign className="w-4 h-4 mr-2" />
                Manage Financial Entries
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Financial Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Financial Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : financialEntriesData && financialEntriesData.entries.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week Start</th>
                      <th className="text-right p-2">Operating Expenses</th>
                      <th className="text-right p-2">Depreciation</th>
                      <th className="text-right p-2">Amortization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialEntriesData.entries.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="p-2">
                          {format(new Date(entry.weekStartDate), "MMM d, yyyy")}
                        </td>
                        <td className="text-right p-2">
                          ${parseFloat(entry.operatingExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="text-right p-2">
                          ${parseFloat(entry.depreciation || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="text-right p-2">
                          ${parseFloat(entry.amortization || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={financialEntriesPage}
                totalItems={financialEntriesData.total}
                itemsPerPage={limit}
                onPageChange={setFinancialEntriesPage}
                className="mt-4"
              />
            </>
          ) : (
            <p className="text-muted-foreground">No financial entries found.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent EBITDA Snapshots */}
      <Card>
        <CardHeader>
          <CardTitle>Recent EBITDA Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshotsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : snapshotsData && snapshotsData.snapshots.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week Start</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Expenses</th>
                      <th className="text-right p-2">EBITDA</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshotsData.snapshots.map((snapshot) => {
                      const ebitdaValue = parseFloat(snapshot.ebitda);
                      return (
                        <tr key={snapshot.id} className="border-b">
                          <td className="p-2">
                            {format(new Date(snapshot.weekStartDate), "MMM d, yyyy")}
                          </td>
                          <td className="text-right p-2">
                            ${parseFloat(snapshot.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2">
                            ${parseFloat(snapshot.operatingExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`text-right p-2 font-medium ${ebitdaValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${ebitdaValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-center p-2">
                            <span className={`text-xs px-2 py-1 rounded ${snapshot.isDefaultAlive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {snapshot.isDefaultAlive ? "Alive" : "Dead"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={snapshotsPage}
                totalItems={snapshotsData.total}
                itemsPerPage={limit}
                onPageChange={setSnapshotsPage}
                className="mt-4"
              />
            </>
          ) : (
            <p className="text-muted-foreground">No EBITDA snapshots found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

