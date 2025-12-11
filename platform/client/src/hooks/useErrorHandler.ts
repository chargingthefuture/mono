/**
 * Error Handling Hook
 * 
 * Provides utilities for handling errors in React components,
 * including automatic toast notifications and error parsing.
 */

import { useToast } from "@/hooks/use-toast";
import { 
  parseApiError, 
  getUserFriendlyError, 
  formatValidationErrors,
  isNetworkError,
  isValidationError,
  isAuthError,
  isServerError,
  type FrontendError,
} from "@/lib/errorHandler";
import { useCallback } from "react";

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  onError?: (error: FrontendError) => void;
  logError?: boolean;
}

/**
 * Hook for handling errors in components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const {
    showToast = true,
    toastTitle,
    onError,
    logError = process.env.NODE_ENV === 'development',
  } = options;

  const handleError = useCallback(
    (error: any, customTitle?: string) => {
      const parsed = parseApiError(error);

      // Log error in development
      if (logError) {
        console.error('Error handled:', parsed);
      }

      // Call custom error handler if provided
      if (onError) {
        onError(parsed);
      }

      // Show toast notification
      if (showToast) {
        const title = customTitle || toastTitle || 'Error';
        const description = parsed.message;

        // For validation errors, include details
        if (isValidationError(error) && parsed.details) {
          const validationMessages = formatValidationErrors(parsed.details);
          toast({
            title,
            description: validationMessages.length > 0 
              ? `${description}\n\n${validationMessages.join('\n')}`
              : description,
            variant: "destructive",
          });
        } else {
          toast({
            title,
            description,
            variant: "destructive",
          });
        }
      }

      return parsed;
    },
    [toast, showToast, toastTitle, onError, logError]
  );

  return {
    handleError,
    parseError: parseApiError,
    getUserFriendlyMessage: getUserFriendlyError,
    isNetworkError: (error: any) => isNetworkError(error),
    isValidationError: (error: any) => isValidationError(error),
    isAuthError: (error: any) => isAuthError(error),
    isServerError: (error: any) => isServerError(error),
  };
}

