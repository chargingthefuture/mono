import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, TrendingDown, Calendar, Target, Activity, Zap, Heart, MessageSquare } from "lucide-react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { PrivacyField } from "@/components/ui/privacy-field";
import { formatCurrency } from "@/lib/utils";

interface WeeklyPerformanceData {
  currentWeek: {
    startDate: string;
    endDate: string;
    newUsers: number;
    dailyActiveUsers: Array<{ date: string; count: number }>;
    revenue: number;
    dailyRevenue: Array<{ date: string; amount: number }>;
    totalUsers: number;
    verifiedUsers: number;
    approvedUsers: number;
    isDefaultAlive: boolean | null;
  };
  previousWeek: {
    startDate: string;
    endDate: string;
    newUsers: number;
    dailyActiveUsers: Array<{ date: string; count: number }>;
    revenue: number;
    dailyRevenue: Array<{ date: string; amount: number }>;
    totalUsers: number;
    verifiedUsers: number;
    approvedUsers: number;
    isDefaultAlive: boolean | null;
  };
  comparison: {
    newUsersChange: number;
    revenueChange: number;
    totalUsersChange: number;
    verifiedUsersChange: number;
    approvedUsersChange: number;
  };
  metrics: {
    weeklyGrowthRate: number;
    mrr: number;
    arr: number;
    mrrGrowth: number;
    mau: number;
    churnRate: number;
    clv: number;
    retentionRate: number;
    nps: number;
    npsChange: number;
    npsResponses: number;
    verifiedUsersPercentage: number;
    verifiedUsersPercentageChange: number;
    averageMood: number;
    moodChange: number;
    moodResponses: number;
    chymeValuablePercentage: number;
    chymeValuableChange: number;
    chymeSurveyResponses: number;
  };
}

export default function WeeklyPerformanceReview() {
  const { toast } = useToast();
  
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    // Default to current week start (Saturday)
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday
    return format(weekStart, "yyyy-MM-dd");
  });

  // Check if selected week is the current week (for real-time updates)
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday
    const selectedWeekDate = parseISO(selectedWeek);
    return format(selectedWeekDate, "yyyy-MM-dd") === format(currentWeekStart, "yyyy-MM-dd");
  }, [selectedWeek]);

  const { data, isLoading, error } = useQuery<WeeklyPerformanceData>({
    queryKey: [`/api/admin/weekly-performance${selectedWeek ? `?weekStart=${selectedWeek}` : ""}`],
    // Real-time updates only for current week
    refetchInterval: isCurrentWeek ? 30000 : false, // Poll every 30 seconds for current week
    refetchOnWindowFocus: isCurrentWeek, // Refetch on window focus for current week only
  });

  // Debug: Log what we're receiving
  if (data && !data.metrics) {
    console.warn("Data received but no metrics property:", data);
    console.warn("Data keys:", Object.keys(data));
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };



  // Calculate total DAU for both weeks
  const currentWeekTotalDAU = data?.currentWeek.dailyActiveUsers.reduce((sum, day) => sum + day.count, 0) || 0;
  const previousWeekTotalDAU = data?.previousWeek.dailyActiveUsers.reduce((sum, day) => sum + day.count, 0) || 0;
  const dauChange = previousWeekTotalDAU === 0
    ? (currentWeekTotalDAU > 0 ? 100 : 0)
    : ((currentWeekTotalDAU - previousWeekTotalDAU) / previousWeekTotalDAU) * 100;

  const handleWeekChange = (dateString: string) => {
    setSelectedWeek(dateString);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday
    setSelectedWeek(format(weekStart, "yyyy-MM-dd"));
  };

  const goToPreviousWeek = () => {
    if (data?.currentWeek.startDate) {
      const currentStart = parseISO(data.currentWeek.startDate);
      const previousStart = addDays(currentStart, -7);
      setSelectedWeek(format(previousStart, "yyyy-MM-dd"));
    }
  };

  const goToNextWeek = () => {
    if (data?.currentWeek.startDate) {
      const currentStart = parseISO(data.currentWeek.startDate);
      const nextStart = addDays(currentStart, 7);
      // Don't allow future weeks
      if (nextStart <= new Date()) {
        setSelectedWeek(format(nextStart, "yyyy-MM-dd"));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Weekly Performance Review
            </h1>
            {isCurrentWeek && (
              <Badge variant="default" className="animate-pulse">
                Live
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track key metrics week-over-week with calendar week comparison
            {isCurrentWeek && " (updating in real-time)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            data-testid="button-previous-week"
          >
            ← Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentWeek}
            data-testid="button-current-week"
          >
            Current Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            data-testid="button-next-week"
            disabled={
              data?.currentWeek.startDate
                ? addDays(parseISO(data.currentWeek.startDate), 7) > new Date()
                : true
            }
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Week Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="week-start">Week Starting (Saturday)</Label>
              <Input
                id="week-start"
                type="date"
                value={selectedWeek}
                onChange={(e) => handleWeekChange(e.target.value)}
                data-testid="input-week-selector"
                className="w-full sm:w-auto"
              />
            </div>
            {data && (
              <div className="text-sm text-muted-foreground">
                <div>
                  <strong>Current Week:</strong> {format(parseISO(data.currentWeek.startDate), "MMM d")} - {format(parseISO(data.currentWeek.endDate), "MMM d, yyyy")}
                </div>
                <div>
                  <strong>Previous Week:</strong> {format(parseISO(data.previousWeek.startDate), "MMM d")} - {format(parseISO(data.previousWeek.endDate), "MMM d, yyyy")}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading weekly performance data...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">
              Error loading data
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Check the browser console and server logs for details.
            </p>
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No data available for the selected week
            </p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different week or check back later when users and payments are recorded.
            </p>
          </CardContent>
        </Card>
      ) : !data?.metrics ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Metrics not available
            </p>
            <p className="text-sm text-muted-foreground">
              The response did not include metrics data. Check server logs.
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Response keys: {data ? Object.keys(data).join(", ") : "none"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Growth Metrics */}
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
                    <p className="text-xs text-muted-foreground mt-2">MRR × 12 + yearly payments</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">MRR Growth</div>
                    <div className={`text-2xl font-bold tabular-nums ${
                      (data.metrics?.mrrGrowth ?? 0) < 0
                        ? "text-red-600"
                        : ""
                    }`}>
                      {formatPercentage(data.metrics?.mrrGrowth ?? 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Month-over-month change</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">New Customers (This Week)</div>
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
                    <div className="text-sm font-medium text-muted-foreground mb-1">Customer Lifetime Value (CLV)</div>
                    <div className="text-2xl font-bold tabular-nums">
                      <PrivacyField
                        value={formatCurrency(data.metrics?.clv ?? 0)}
                        type="text"
                        testId="privacy-clv"
                        className="text-2xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Average revenue per customer</p>
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

            {/* Engagement and Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Engagement and Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Active Users (MAU)</div>
                    <div className="text-2xl font-bold tabular-nums">{data.metrics?.mau ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Users with payments in current month
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

            {/* Chyme Survey Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chyme Audio Room Feedback
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Percentage of users who found audio rooms valuable (anonymous survey data)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Current Week</div>
                    <div className="text-3xl font-bold tabular-nums">
                      {data.metrics?.chymeValuablePercentage ?? 0}%
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          (data.metrics?.chymeValuablePercentage ?? 0) >= 70
                            ? "default"
                            : (data.metrics?.chymeValuablePercentage ?? 0) >= 50
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {(data.metrics?.chymeValuablePercentage ?? 0) >= 70
                          ? "High Value"
                          : (data.metrics?.chymeValuablePercentage ?? 0) >= 50
                          ? "Moderate"
                          : "Needs Improvement"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Found audio rooms valuable
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Week-over-Week Change</div>
                    <div className={`text-2xl font-bold tabular-nums ${
                      (data.metrics?.chymeValuableChange ?? 0) > 0
                        ? "text-green-600"
                        : (data.metrics?.chymeValuableChange ?? 0) < 0
                        ? "text-red-600"
                        : ""
                    }`}>
                      {(data.metrics?.chymeValuableChange ?? 0) > 0 ? "+" : ""}
                      {data.metrics?.chymeValuableChange ?? 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Change from previous week
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Total Responses</div>
                    <div className="text-2xl font-bold tabular-nums">{data.metrics?.chymeSurveyResponses ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Survey responses this week
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Privacy Note:</strong> All survey responses are collected anonymously using client IDs. 
                    Individual responses cannot be traced back to users, maintaining complete anonymity while 
                    providing valuable aggregated insights into the value of audio rooms.
                  </p>
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
                  Total unique users who were active during the week
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

            {/* Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Weekly Revenue
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Total revenue collected during the week
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Current Week</div>
                    <div className="text-3xl font-bold tabular-nums">
                      <PrivacyField
                        value={formatCurrency(data?.currentWeek.revenue ?? 0)}
                        type="text"
                        testId="privacy-revenue-current"
                        className="text-3xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total revenue this week
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Previous Week</div>
                    <div className="text-2xl font-bold tabular-nums text-muted-foreground">
                      <PrivacyField
                        value={formatCurrency(data?.previousWeek.revenue ?? 0)}
                        type="text"
                        testId="privacy-revenue-previous"
                        className="text-2xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total revenue last week
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Week-over-Week Change</div>
                    <div className={`text-2xl font-bold tabular-nums ${
                      (data?.comparison.revenueChange ?? 0) > 0
                        ? "text-green-600"
                        : (data?.comparison.revenueChange ?? 0) < 0
                        ? "text-red-600"
                        : ""
                    }`}>
                      {formatPercentage(data?.comparison.revenueChange ?? 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Change from previous week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
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
                      <td className="py-2 px-4 font-medium">Total Revenue</td>
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
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


