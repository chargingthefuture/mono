"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { NpsSurveyDialog } from "./nps-survey-dialog";
import { apiRequest } from "@/lib/queryClient";

const MIN_LOGIN_TIME_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
const RANDOM_DELAY_MIN_MS = 0; // Can show immediately after 5 min
const RANDOM_DELAY_MAX_MS = 60 * 60 * 1000; // Up to 1 hour after 5 min (random)

export function NpsSurveyManager() {
  const { user, isAuthenticated } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [loginTime] = useState<number>(Date.now());
  const hasCheckedRef = useRef(false);
  const randomDelayRef = useRef<number | null>(null);

  // Check if user should see the survey
  const { data: shouldShowData } = useQuery<{ shouldShow: boolean; lastResponseMonth: string | null }>({
    queryKey: ["/api/nps/should-show"],
    enabled: isAuthenticated && !!user,
    refetchInterval: false,
    retry: false,
  });

  useEffect(() => {
    if (!isAuthenticated || !user || !shouldShowData || hasCheckedRef.current) {
      return;
    }

    // User has already responded this month
    if (!shouldShowData.shouldShow) {
      hasCheckedRef.current = true;
      return;
    }

    // Generate random delay (once) for when to show the survey
    if (randomDelayRef.current === null) {
      const randomDelay = Math.floor(
        Math.random() * (RANDOM_DELAY_MAX_MS - RANDOM_DELAY_MIN_MS) + RANDOM_DELAY_MIN_MS
      );
      randomDelayRef.current = randomDelay;
    }

    // Check if enough time has passed (5 min + random delay)
    const checkShouldShow = () => {
      const elapsed = Date.now() - loginTime;
      const totalRequiredTime = MIN_LOGIN_TIME_MS + (randomDelayRef.current || 0);

      if (elapsed >= totalRequiredTime && !showDialog) {
        setShowDialog(true);
        hasCheckedRef.current = true;
      }
    };

    // Check immediately
    checkShouldShow();

    // Set up interval to check periodically
    const interval = setInterval(checkShouldShow, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, user, shouldShowData, loginTime, showDialog]);

  // Reset when user changes (logout/login)
  useEffect(() => {
    if (!isAuthenticated) {
      hasCheckedRef.current = false;
      randomDelayRef.current = null;
      setShowDialog(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <NpsSurveyDialog
      open={showDialog}
      onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) {
          // Mark as checked when dialog is closed
          hasCheckedRef.current = true;
        }
      }}
    />
  );
}
