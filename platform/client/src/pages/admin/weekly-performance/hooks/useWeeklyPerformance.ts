/**
 * Hook for fetching and managing weekly performance data
 */

import { useQuery } from "@tanstack/react-query";

export interface WeeklyPerformanceData {
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
  };
}

export function useWeeklyPerformance(selectedWeek: string, isCurrentWeek: boolean) {
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

  return { data, isLoading, error };
}

