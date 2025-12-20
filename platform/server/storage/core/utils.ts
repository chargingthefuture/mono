/**
 * Shared utilities for storage modules
 */

import { randomBytes } from "crypto";
import { startOfWeek, endOfWeek } from "date-fns";

/**
 * Generates an anonymized user ID in the format: deleted_user_[random_string]
 */
export function generateAnonymizedUserId(): string {
  const randomString = randomBytes(16).toString('hex');
  return `deleted_user_${randomString}`;
}

/**
 * Helper to get start of week (Saturday) for a given date
 */
export function getWeekStart(date: Date): Date {
  // Weeks start on Saturday and end on Friday
  // Use date-fns startOfWeek with weekStartsOn: 6 (Saturday)
  return startOfWeek(date, { weekStartsOn: 6 });
}

/**
 * Helper to get end of week (Friday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  // Weeks start on Saturday and end on Friday
  // Use date-fns endOfWeek with weekStartsOn: 6 (Saturday)
  const weekEnd = endOfWeek(date, { weekStartsOn: 6 });
  // Explicitly set to end of day to ensure we capture all users created on Friday
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Helper to format date as YYYY-MM-DD (using local time, not UTC)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to get all days in a week
 */
export function getDaysInWeek(weekStart: Date): Array<{ date: Date; dateString: string }> {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push({
      date: day,
      dateString: formatDate(day),
    });
  }
  return days;
}

