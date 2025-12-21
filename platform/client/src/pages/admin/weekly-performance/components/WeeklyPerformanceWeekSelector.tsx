/**
 * Week selector component for weekly performance page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { WeeklyPerformanceData } from "../hooks/useWeeklyPerformance";

interface WeeklyPerformanceWeekSelectorProps {
  selectedWeek: string;
  onWeekChange: (dateString: string) => void;
  onGoToCurrentWeek: () => void;
  onGoToPreviousWeek: () => void;
  onGoToNextWeek: () => void;
  canGoToNextWeek: boolean;
  isCurrentWeek: boolean;
  data?: WeeklyPerformanceData;
}

export function WeeklyPerformanceWeekSelector({
  selectedWeek,
  onWeekChange,
  onGoToCurrentWeek,
  onGoToPreviousWeek,
  onGoToNextWeek,
  canGoToNextWeek,
  isCurrentWeek,
  data,
}: WeeklyPerformanceWeekSelectorProps) {
  return (
    <>
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
            onClick={onGoToPreviousWeek}
            data-testid="button-previous-week"
          >
            ← Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToCurrentWeek}
            data-testid="button-current-week"
          >
            Current Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToNextWeek}
            data-testid="button-next-week"
            disabled={!canGoToNextWeek}
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
                onChange={(e) => onWeekChange(e.target.value)}
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
    </>
  );
}

