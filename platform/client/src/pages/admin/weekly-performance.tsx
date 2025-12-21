import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useWeekSelection } from "./weekly-performance/hooks/useWeekSelection";
import { useWeeklyPerformance } from "./weekly-performance/hooks/useWeeklyPerformance";
import { WeeklyPerformanceWeekSelector } from "./weekly-performance/components/WeeklyPerformanceWeekSelector";
import { WeeklyPerformanceMetrics } from "./weekly-performance/components/WeeklyPerformanceMetrics";
import { WeeklyPerformanceComparison } from "./weekly-performance/components/WeeklyPerformanceComparison";

export default function WeeklyPerformanceReview() {
  const {
    selectedWeek,
    isCurrentWeek,
    handleWeekChange,
    goToCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    canGoToNextWeek,
  } = useWeekSelection();

  const { data, isLoading, error } = useWeeklyPerformance(selectedWeek, isCurrentWeek);

  // Calculate total DAU for both weeks
  const currentWeekTotalDAU = useMemo(
    () => data?.currentWeek.dailyActiveUsers.reduce((sum, day) => sum + day.count, 0) || 0,
    [data?.currentWeek.dailyActiveUsers]
  );
  const previousWeekTotalDAU = useMemo(
    () => data?.previousWeek.dailyActiveUsers.reduce((sum, day) => sum + day.count, 0) || 0,
    [data?.previousWeek.dailyActiveUsers]
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <WeeklyPerformanceWeekSelector
        selectedWeek={selectedWeek}
        onWeekChange={handleWeekChange}
        onGoToCurrentWeek={goToCurrentWeek}
        onGoToPreviousWeek={() => goToPreviousWeek(data?.currentWeek.startDate)}
        onGoToNextWeek={() => goToNextWeek(data?.currentWeek.startDate)}
        canGoToNextWeek={canGoToNextWeek(data?.currentWeek.startDate)}
        isCurrentWeek={isCurrentWeek}
        data={data}
      />

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
          <WeeklyPerformanceMetrics
            data={data}
            currentWeekTotalDAU={currentWeekTotalDAU}
            previousWeekTotalDAU={previousWeekTotalDAU}
          />
          <WeeklyPerformanceComparison
            data={data}
            currentWeekTotalDAU={currentWeekTotalDAU}
            previousWeekTotalDAU={previousWeekTotalDAU}
          />
        </>
      )}
    </div>
  );
}
