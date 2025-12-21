/**
 * Metrics display component for weekly performance page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrivacyField } from "@/components/ui/privacy-field";
import { formatCurrency } from "@/lib/utils";
import { Target, DollarSign, Users, Activity, Heart, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { formatPercentage, calculateDauChange } from "../utils/weeklyPerformanceUtils";
import type { WeeklyPerformanceData } from "../hooks/useWeeklyPerformance";

interface WeeklyPerformanceMetricsProps {
  data: WeeklyPerformanceData;
  currentWeekTotalDAU: number;
  previousWeekTotalDAU: number;
}

export function WeeklyPerformanceMetrics({
  data,
  currentWeekTotalDAU,
  previousWeekTotalDAU,
}: WeeklyPerformanceMetricsProps) {
  const dauChange = calculateDauChange(currentWeekTotalDAU, previousWeekTotalDAU);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Growth Metrics</h2>
        <p className="text-sm text-muted-foreground">
          Key metrics to track growth and reporting
        </p>
      </div>

      {/* Growth Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Growth Rate
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Weekly growth rate of <strong>5-7%</strong> is good, <strong>10%</strong> is exceptional
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-4">
            <div className={`text-4xl font-bold tabular-nums ${
              (data.metrics?.weeklyGrowthRate ?? 0) < 0
                ? "text-red-600"
                : ""
            }`}>
              {formatPercentage(data.metrics?.weeklyGrowthRate ?? 0)}
            </div>
            <Badge
              variant={
                (data.metrics?.weeklyGrowthRate ?? 0) >= 10
                  ? "default"
                  : (data.metrics?.weeklyGrowthRate ?? 0) >= 5
                  ? "default"
                  : "destructive"
              }
              className="flex items-center gap-1"
            >
              {(data.metrics?.weeklyGrowthRate ?? 0) >= 10 ? (
                <>
                  <Zap className="w-3 h-3" />
                  Exceptional
                </>
              ) : (data.metrics?.weeklyGrowthRate ?? 0) >= 5 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  Good
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  Needs Improvement
                </>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            New users this week vs. last week
          </p>
        </CardContent>
      </Card>

      {/* Revenue Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Week Revenue</div>
              <div className="text-2xl font-bold tabular-nums">
                <PrivacyField
                  value={formatCurrency(data?.currentWeek.revenue ?? 0)}
                  type="text"
                  testId="privacy-revenue-current"
                  className="text-2xl"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data?.comparison.revenueChange ?? 0) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {formatPercentage(data?.comparison.revenueChange ?? 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Recurring Revenue (MRR)</div>
              <div className="text-2xl font-bold tabular-nums">
                <PrivacyField
                  value={formatCurrency(data.metrics?.mrr ?? 0)}
                  type="text"
                  testId="privacy-mrr"
                  className="text-2xl"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.metrics?.mrrGrowth ?? 0) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {formatPercentage(data.metrics?.mrrGrowth ?? 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Annual Recurring Revenue (ARR)</div>
              <div className="text-2xl font-bold tabular-nums">
                <PrivacyField
                  value={formatCurrency(data.metrics?.arr ?? 0)}
                  type="text"
                  testId="privacy-arr"
                  className="text-2xl"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total value of active yearly subscriptions this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">New Users (This Week)</div>
              <div className="text-2xl font-bold tabular-nums">{data.currentWeek.newUsers}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.comparison.newUsersChange ?? 0) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {formatPercentage(data.comparison.newUsersChange ?? 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Churn Rate</div>
              <div className={`text-2xl font-bold tabular-nums ${
                (data.metrics?.churnRate ?? 0) > 10
                  ? "text-red-600"
                  : ""
              }`}>
                {formatPercentage(data.metrics?.churnRate ?? 0)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.metrics?.churnRate ?? 0) > 10 ? "destructive" : (data.metrics?.churnRate ?? 0) > 5 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {(data.metrics?.churnRate ?? 0) > 10
                    ? "High"
                    : (data.metrics?.churnRate ?? 0) > 5
                    ? "Moderate"
                    : "Low"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Users who paid last month but not this month
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">User Lifetime Value (CLV)</div>
              <div className="text-2xl font-bold tabular-nums">
                <PrivacyField
                  value={formatCurrency(data.metrics?.clv ?? 0)}
                  type="text"
                  testId="privacy-clv"
                  className="text-2xl"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average revenue per user</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Statistics
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Total platform users and their verification/approval status
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Users</div>
              <div className="text-3xl font-bold tabular-nums">
                {data.currentWeek.totalUsers ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.comparison.totalUsersChange ?? 0) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {formatPercentage(data.comparison.totalUsersChange ?? 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Previous week: {data.previousWeek.totalUsers ?? 0} users
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Verified Users</div>
              <div className="text-3xl font-bold tabular-nums">
                {data.currentWeek.verifiedUsers ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.comparison.verifiedUsersChange ?? 0) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {formatPercentage(data.comparison.verifiedUsersChange ?? 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.currentWeek.totalUsers > 0 
                  ? `${Math.round((data.currentWeek.verifiedUsers / data.currentWeek.totalUsers) * 100)}% verified`
                  : "0% verified"} • Previous: {data.previousWeek.verifiedUsers ?? 0}
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Approved Users</div>
              <div className="text-3xl font-bold tabular-nums">
                {data.currentWeek.approvedUsers ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.comparison.approvedUsersChange ?? 0) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {formatPercentage(data.comparison.approvedUsersChange ?? 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.currentWeek.totalUsers > 0 
                  ? `${Math.round((data.currentWeek.approvedUsers / data.currentWeek.totalUsers) * 100)}% approved`
                  : "0% approved"} • Previous: {data.previousWeek.approvedUsers ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Active Users (DAU) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Daily Active Users (DAU)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Total daily active users across the week, based on unique logins to the webapp (users are counted once per day they log in)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Week</div>
              <div className="text-3xl font-bold tabular-nums">
                {currentWeekTotalDAU}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total active users this week
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Previous Week</div>
              <div className="text-2xl font-bold tabular-nums text-muted-foreground">
                {previousWeekTotalDAU}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total active users last week
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Week-over-Week Change</div>
              <div className={`text-2xl font-bold tabular-nums ${
                dauChange > 0
                  ? "text-green-600"
                  : dauChange < 0
                  ? "text-red-600"
                  : ""
              }`}>
                {formatPercentage(dauChange)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Change from previous week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Monthly Active Users (MAU)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Active Users (MAU)</div>
              <div className="text-2xl font-bold tabular-nums">{data.metrics?.mau ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Unique users who logged into the webapp at least once in the current month
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Retention Rate</div>
              <div className={`text-2xl font-bold tabular-nums ${
                (data.metrics?.retentionRate ?? 0) < 70
                  ? "text-red-600"
                  : ""
              }`}>
                {formatPercentage(data.metrics?.retentionRate ?? 0)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={(data.metrics?.retentionRate ?? 0) < 70 ? "destructive" : (data.metrics?.retentionRate ?? 0) < 85 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {(data.metrics?.retentionRate ?? 0) < 70
                    ? "Needs Improvement"
                    : (data.metrics?.retentionRate ?? 0) < 85
                    ? "Good"
                    : "Excellent"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                % of last month&apos;s users still active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Promoter Score (NPS) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Net Promoter Score (NPS)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Measures customer satisfaction and likelihood to recommend
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Week NPS</div>
              <div className="text-3xl font-bold tabular-nums">
                {data.metrics?.nps ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    (data.metrics?.nps ?? 0) >= 50
                      ? "default"
                      : (data.metrics?.nps ?? 0) >= 0
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {(data.metrics?.nps ?? 0) >= 50
                    ? "Excellent"
                    : (data.metrics?.nps ?? 0) >= 0
                    ? "Good"
                    : "Needs Improvement"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Range: -100 to +100
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Week-over-Week Change</div>
              <div className={`text-2xl font-bold tabular-nums ${
                (data.metrics?.npsChange ?? 0) > 0
                  ? "text-green-600"
                  : (data.metrics?.npsChange ?? 0) < 0
                  ? "text-red-600"
                  : ""
              }`}>
                {(data.metrics?.npsChange ?? 0) > 0 ? "+" : ""}
                {data.metrics?.npsChange ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Change from previous week
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Responses</div>
              <div className="text-2xl font-bold tabular-nums">{data.metrics?.npsResponses ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Survey responses this week
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>How NPS is calculated:</strong> The question asks &quot;How would you feel if this app no longer existed?&quot; 
              Scores are inverted before calculation: 0 (extremely unhappy about losing app) = Promoter, 
              10 (extremely happy about losing app) = Detractor. Percentage of Promoters (inverted scores 9-10) 
              minus percentage of Detractors (inverted scores 0-6). Scores of 7-8 are considered Passive and don&apos;t affect the calculation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GentlePulse Mood Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            GentlePulse Mood Ratings
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Average mood ratings from GentlePulse users (anonymous, aggregated data)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Week Average</div>
              <div className="text-3xl font-bold tabular-nums">
                {data.metrics?.averageMood ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    (data.metrics?.averageMood ?? 0) >= 4
                      ? "default"
                      : (data.metrics?.averageMood ?? 0) >= 3
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {(data.metrics?.averageMood ?? 0) >= 4
                    ? "Positive"
                    : (data.metrics?.averageMood ?? 0) >= 3
                    ? "Neutral"
                    : "Needs Attention"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scale: 1 (very sad) to 5 (very happy)
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Week-over-Week Change</div>
              <div className={`text-2xl font-bold tabular-nums ${
                (data.metrics?.moodChange ?? 0) > 0
                  ? "text-green-600"
                  : (data.metrics?.moodChange ?? 0) < 0
                  ? "text-red-600"
                  : ""
              }`}>
                {(data.metrics?.moodChange ?? 0) > 0 ? "+" : ""}
                {data.metrics?.moodChange ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Change from previous week
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Responses</div>
              <div className="text-2xl font-bold tabular-nums">{data.metrics?.moodResponses ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Mood check responses this week
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy Note:</strong> All mood ratings are collected anonymously using client IDs. 
              Individual responses cannot be traced back to users, maintaining complete anonymity while 
              providing valuable aggregated insights into user wellbeing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

