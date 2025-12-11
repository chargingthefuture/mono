import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with comma separators for thousands
 * @param value - The number to format (can be string or number)
 * @returns Formatted string like "$15,000.00"
 */
export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "$0.00";
  }
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return "$0.00";
  }
  
  return `$${numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
