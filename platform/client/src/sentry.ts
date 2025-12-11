/**
 * Sentry Configuration for Client-Side Error Tracking
 * 
 * Initializes Sentry for comprehensive error tracking, logging, and monitoring.
 * Captures all errors, console logs, and unhandled exceptions in the browser.
 * 
 * Metrics are automatically enabled and can be used via Sentry.metrics API:
 * - Sentry.metrics.count('metric_name', value)
 * - Sentry.metrics.gauge('metric_name', value)
 * - Sentry.metrics.distribution('metric_name', value)
 * 
 * User identification is set up to track user adoption metrics such as:
 * - Crash-free rate percentage per user
 * - Number of users that have adopted a specific release
 */

import * as Sentry from '@sentry/react';

// Export Sentry for use throughout the app (e.g., for metrics)
export { Sentry };

/**
 * Initialize Sentry for client-side error tracking
 * Must be called before React app initialization
 */
export function initSentry() {
  // Use environment variable if set, otherwise use default DSN
  const dsn = import.meta.env.VITE_SENTRY_DSN || 'https://cb4b56fb7ca8bdfa89e4880a46555ee9@o4510455625482240.ingest.us.sentry.io/4510455626596352';
  const environment = import.meta.env.MODE || 'development';
  const release = import.meta.env.VITE_SENTRY_RELEASE || undefined;
  const tracesSampleRate = environment === 'production' ? 0.1 : 1.0; // 10% in prod, 100% in dev
  const profilesSampleRate = environment === 'production' ? 0.1 : 1.0;

  if (!dsn) {
    console.warn('VITE_SENTRY_DSN not set - Sentry error tracking is disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,

    // Performance monitoring
    integrations: [
      // Browser tracing integration
      Sentry.browserTracingIntegration(),
      // Browser profiling integration
      Sentry.browserProfilingIntegration(),
      // Session Replay integration
      Sentry.replayIntegration(),
      // Console logging integration to send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      // Capture fetch requests
      Sentry.httpClientIntegration({
        failedRequestStatusCodes: [[400, 599]], // Capture 4xx and 5xx errors
        failedRequestTargets: [/.*/], // Capture all failed requests
      }),
    ],

    // Traces sampling
    tracesSampleRate,

    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /\/api/],

    // Set profilesSampleRate to profile transactions
    // Since profilesSampleRate is relative to tracesSampleRate,
    // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
    // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
    // results in 25% of transactions being profiled (0.5*0.5=0.25)
    profilesSampleRate,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Session Replay sampling
    // Sample 10% of all sessions in production, 100% in development
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Always record sessions where errors occur (100% sample rate)
    replaysOnErrorSampleRate: 1.0,

    // Metrics are automatically enabled in Sentry.init()
    // Use Sentry.metrics API to emit metrics:
    // - Sentry.metrics.count('metric_name', value)
    // - Sentry.metrics.gauge('metric_name', value)
    // - Sentry.metrics.distribution('metric_name', value)

    // Capture unhandled exceptions and rejections
    captureUnhandledRejections: true,
    captureUncaughtException: true,

    // Send default PII (Personally Identifiable Information)
    // Setting this to true will send default PII data to Sentry
    // For example, automatic IP address collection on events
    sendDefaultPii: true,

    // Set user in initialScope to track user adoption metrics
    // This enables tracking of crash-free rate percentage and release adoption
    initialScope: (scope) => {
      // User will be set later via setSentryUser() when authentication completes
      return scope;
    },

    // Filter out health check endpoints
    beforeSend(event, hint) {
      // Don't send events for health checks
      if (event.request?.url?.includes('/health') || event.request?.url?.includes('/ping')) {
        return null;
      }
      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      // Browser extension errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Clerk errors that are handled gracefully
      'Clerk',
    ],

    // Additional options
    maxBreadcrumbs: 100, // Increase breadcrumb limit for better debugging
  });

  console.log(`Sentry initialized for ${environment} environment`);
}

/**
 * Set the user in Sentry scope for tracking user adoption metrics
 * This enables tracking of:
 * - Crash-free rate percentage per user
 * - Number of users that have adopted a specific release
 * 
 * Call this function when user authentication state changes
 * 
 * @param user - User object with id and optional email, or null to clear user
 */
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email || undefined,
    });
  } else {
    // Clear user when logged out
    Sentry.setUser(null);
  }
}

/**
 * Capture console logs and send to Sentry
 * This is a wrapper around console methods to send logs to Sentry
 */
export function setupConsoleLogging() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return; // Sentry not configured
  }

  // Store original console methods
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
    debug: console.debug,
  };

  // Override console.error to send to Sentry
  console.error = (...args: any[]) => {
    originalConsole.error(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    Sentry.captureMessage(message, {
      level: 'error',
    });
  };

  // Override console.warn to send to Sentry
  console.warn = (...args: any[]) => {
    originalConsole.warn(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    Sentry.captureMessage(message, {
      level: 'warning',
    });
  };

  // Override console.log/info/debug to send as breadcrumbs
  console.log = (...args: any[]) => {
    originalConsole.log(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      category: 'console',
    });
  };

  console.info = (...args: any[]) => {
    originalConsole.info(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      category: 'console',
    });
  };

  console.debug = (...args: any[]) => {
    originalConsole.debug(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    Sentry.addBreadcrumb({
      message,
      level: 'debug',
      category: 'console',
    });
  };
}

