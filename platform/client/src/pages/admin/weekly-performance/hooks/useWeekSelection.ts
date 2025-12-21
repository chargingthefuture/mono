/**
 * Hook for managing week selection state and navigation
 */

import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";

export function useWeekSelection() {
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

  const handleWeekChange = (dateString: string) => {
    setSelectedWeek(dateString);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday
    setSelectedWeek(format(weekStart, "yyyy-MM-dd"));
  };

  const goToPreviousWeek = (currentWeekStartDate?: string) => {
    if (currentWeekStartDate) {
      const currentStart = parseISO(currentWeekStartDate);
      const previousStart = addDays(currentStart, -7);
      setSelectedWeek(format(previousStart, "yyyy-MM-dd"));
    }
  };

  const goToNextWeek = (currentWeekStartDate?: string) => {
    if (currentWeekStartDate) {
      const currentStart = parseISO(currentWeekStartDate);
      const nextStart = addDays(currentStart, 7);
      // Don't allow future weeks
      if (nextStart <= new Date()) {
        setSelectedWeek(format(nextStart, "yyyy-MM-dd"));
      }
    }
  };

  const canGoToNextWeek = (currentWeekStartDate?: string): boolean => {
    if (!currentWeekStartDate) return false;
    return addDays(parseISO(currentWeekStartDate), 7) <= new Date();
  };

  return {
    selectedWeek,
    isCurrentWeek,
    handleWeekChange,
    goToCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    canGoToNextWeek,
  };
}

