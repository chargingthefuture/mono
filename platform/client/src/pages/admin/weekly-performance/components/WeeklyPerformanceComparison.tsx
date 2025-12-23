/**
 * Week-over-week comparison table component
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrivacyField } from "@/components/ui/privacy-field";
import { formatCurrency } from "@/lib/utils";
import { formatPercentage, calculateDauChange, getPreviousWeekNps, getPreviousWeekMood } from "../utils/weeklyPerformanceUtils";
import type { WeeklyPerformanceData } from "../hooks/useWeeklyPerformance";

interface WeeklyPerformanceComparisonProps {
  data: WeeklyPerformanceData;
  currentWeekTotalDAU: number;
  previousWeekTotalDAU: number;
}

export function WeeklyPerformanceComparison({
  data,
  currentWeekTotalDAU,
  previousWeekTotalDAU,
}: WeeklyPerformanceComparisonProps) {
  const dauChange = calculateDauChange(currentWeekTotalDAU, previousWeekTotalDAU);
  const previousWeekNps = getPreviousWeekNps(data.metrics?.nps, data.metrics?.npsChange);
  const previousWeekMood = getPreviousWeekMood(data.metrics?.averageMood, data.metrics?.moodChange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week-over-Week Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Metric</th>
                <th className="text-right py-2 px-4">This Week</th>
                <th className="text-right py-2 px-4">Last Week</th>
                <th className="text-right py-2 px-4">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">New Users</td>
                <td className="text-right py-2 px-4" data-testid="table-new-users-current">
                  {data?.currentWeek.newUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-new-users-previous">
                  {data?.previousWeek.newUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data?.comparison.newUsersChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(data?.comparison.newUsersChange ?? 0)}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Daily Active Users (DAU)</td>
                <td className="text-right py-2 px-4" data-testid="table-dau-current">
                  {currentWeekTotalDAU}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-dau-previous">
                  {previousWeekTotalDAU}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      dauChange >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(dauChange)}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Current Week Revenue</td>
                <td className="text-right py-2 px-4" data-testid="table-revenue-current">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data?.currentWeek.revenue ?? 0)}
                      type="text"
                      testId="privacy-table-revenue-current"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4" data-testid="table-revenue-previous">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data?.previousWeek.revenue ?? 0)}
                      type="text"
                      testId="privacy-table-revenue-previous"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data?.comparison.revenueChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(data?.comparison.revenueChange ?? 0)}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Monthly Recurring Revenue (MRR)</td>
                <td className="text-right py-2 px-4" data-testid="table-mrr-current">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data.metrics?.mrr ?? 0)}
                      type="text"
                      testId="privacy-table-mrr-current"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4" data-testid="table-mrr-previous">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data.metrics?.previousWeekMonthMRR ?? 0)}
                      type="text"
                      testId="privacy-table-mrr-previous"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      ((data.metrics?.mrr ?? 0) - (data.metrics?.previousWeekMonthMRR ?? 0)) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(
                      (data.metrics?.previousWeekMonthMRR ?? 0) === 0
                        ? ((data.metrics?.mrr ?? 0) > 0 ? 100 : 0)
                        : (((data.metrics?.mrr ?? 0) - (data.metrics?.previousWeekMonthMRR ?? 0)) / (data.metrics?.previousWeekMonthMRR ?? 1)) * 100
                    )}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Annual Recurring Revenue (ARR)</td>
                <td className="text-right py-2 px-4" data-testid="table-arr-current">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data.metrics?.arr ?? 0)}
                      type="text"
                      testId="privacy-table-arr-current"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4" data-testid="table-arr-previous">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data.metrics?.previousWeekMonthARR ?? 0)}
                      type="text"
                      testId="privacy-table-arr-previous"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      ((data.metrics?.arr ?? 0) - (data.metrics?.previousWeekMonthARR ?? 0)) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(
                      (data.metrics?.previousWeekMonthARR ?? 0) === 0
                        ? ((data.metrics?.arr ?? 0) > 0 ? 100 : 0)
                        : (((data.metrics?.arr ?? 0) - (data.metrics?.previousWeekMonthARR ?? 0)) / (data.metrics?.previousWeekMonthARR ?? 1)) * 100
                    )}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Churn Rate</td>
                <td className="text-right py-2 px-4" data-testid="table-churn-current">
                  {formatPercentage(data.metrics?.churnRate ?? 0)}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-churn-previous">
                  {formatPercentage(data.metrics?.previousWeekMonthChurnRate ?? 0)}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      ((data.metrics?.churnRate ?? 0) - (data.metrics?.previousWeekMonthChurnRate ?? 0)) <= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(
                      (data.metrics?.previousWeekMonthChurnRate ?? 0) === 0
                        ? ((data.metrics?.churnRate ?? 0) > 0 ? 100 : 0)
                        : (((data.metrics?.churnRate ?? 0) - (data.metrics?.previousWeekMonthChurnRate ?? 0)) / (data.metrics?.previousWeekMonthChurnRate || 1)) * 100
                    )}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">User Lifetime Value (CLV)</td>
                <td className="text-right py-2 px-4" data-testid="table-clv-current">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data.metrics?.clv ?? 0)}
                      type="text"
                      testId="privacy-table-clv-current"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4" data-testid="table-clv-previous">
                  <div className="flex items-center justify-end gap-2">
                    <PrivacyField
                      value={formatCurrency(data.metrics?.previousWeekMonthCLV ?? 0)}
                      type="text"
                      testId="privacy-table-clv-previous"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      ((data.metrics?.clv ?? 0) - (data.metrics?.previousWeekMonthCLV ?? 0)) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(
                      (data.metrics?.previousWeekMonthCLV ?? 0) === 0
                        ? ((data.metrics?.clv ?? 0) > 0 ? 100 : 0)
                        : (((data.metrics?.clv ?? 0) - (data.metrics?.previousWeekMonthCLV ?? 0)) / (data.metrics?.previousWeekMonthCLV ?? 1)) * 100
                    )}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Total Users</td>
                <td className="text-right py-2 px-4" data-testid="table-total-users-current">
                  {data?.currentWeek.totalUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-total-users-previous">
                  {data?.previousWeek.totalUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data?.comparison.totalUsersChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(data?.comparison.totalUsersChange ?? 0)}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Verified Users</td>
                <td className="text-right py-2 px-4" data-testid="table-verified-users-current">
                  {data?.currentWeek.verifiedUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-verified-users-previous">
                  {data?.previousWeek.verifiedUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data?.comparison.verifiedUsersChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(data?.comparison.verifiedUsersChange ?? 0)}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Approved Users</td>
                <td className="text-right py-2 px-4" data-testid="table-approved-users-current">
                  {data?.currentWeek.approvedUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-approved-users-previous">
                  {data?.previousWeek.approvedUsers ?? 0}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data?.comparison.approvedUsersChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(data?.comparison.approvedUsersChange ?? 0)}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Monthly Active Users (MAU)</td>
                <td className="text-right py-2 px-4" data-testid="table-mau-current">
                  {data.metrics?.mau ?? 0}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-mau-previous">
                  {data.metrics?.previousWeekMonthMAU ?? 0}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      ((data.metrics?.mau ?? 0) - (data.metrics?.previousWeekMonthMAU ?? 0)) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {formatPercentage(
                      (data.metrics?.previousWeekMonthMAU ?? 0) === 0
                        ? ((data.metrics?.mau ?? 0) > 0 ? 100 : 0)
                        : (((data.metrics?.mau ?? 0) - (data.metrics?.previousWeekMonthMAU ?? 0)) / (data.metrics?.previousWeekMonthMAU ?? 1)) * 100
                    )}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Net Promoter Score (NPS)</td>
                <td className="text-right py-2 px-4" data-testid="table-nps-current">
                  {(data.metrics?.nps ?? 0).toFixed(1)}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-nps-previous">
                  {previousWeekNps !== null ? previousWeekNps.toFixed(1) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data.metrics?.npsChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {(data.metrics?.npsChange ?? 0) > 0 ? "+" : ""}
                    {data.metrics?.npsChange ?? 0}
                  </Badge>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Mood</td>
                <td className="text-right py-2 px-4" data-testid="table-mood-current">
                  {(data.metrics?.averageMood ?? 0).toFixed(2)}
                </td>
                <td className="text-right py-2 px-4" data-testid="table-mood-previous">
                  {previousWeekMood !== null ? previousWeekMood.toFixed(2) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="text-right py-2 px-4">
                  <Badge
                    variant={
                      (data.metrics?.moodChange ?? 0) >= 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {(data.metrics?.moodChange ?? 0) > 0 ? "+" : ""}
                    {data.metrics?.moodChange ?? 0}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

