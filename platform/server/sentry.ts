/**
 * Sentry Configuration for Server-Side Error Tracking
 * 
 * Initializes Sentry for comprehensive error tracking, logging, and monitoring.
 * Captures all errors, console logs, and unhandled exceptions.
 * 
 * Metrics are automatically enabled and can be used via Sentry.metrics API:
 * - Sentry.metrics.count('metric_name', value)
 * - Sentry.metrics.gauge('metric_name', value)
 * - Sentry.metrics.distribution('metric_name', value)
 */

import * as Sentry from '@sentry/node';

// Export Sentry for use throughout the app (e.g., for metrics)
export { Sentry };

/**
 * Initialize Sentry for server-side error tracking
 * Must be called before any other imports that might throw errors
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';
  const release = process.env.SENTRY_RELEASE || process.env.RAILWAY_GIT_COMMIT_SHA || undefined;
  const tracesSampleRate = environment === 'production' ? 0.1 : 1.0; // 10% in prod, 100% in dev
  const profilesSampleRate = environment === 'production' ? 0.1 : 1.0;

  if (!dsn) {
    console.warn('SENTRY_DSN not set - Sentry error tracking is disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    
    // Performance monitoring
    integrations: [
      // HTTP integration for Express
      Sentry.httpIntegration({
        tracing: true,
      }),
      // Console logging integration to send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],

    // Traces sampling
    tracesSampleRate,

    // Set profilesSampleRate to profile transactions
    // Since profilesSampleRate is relative to tracesSampleRate,
    // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
    // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
    // results in 25% of transactions being profiled (0.5*0.5=0.25)
    profilesSampleRate,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Metrics are automatically enabled in Sentry.init()
    // Use Sentry.metrics API to emit metrics:
    // - Sentry.metrics.count('metric_name', value)
    // - Sentry.metrics.gauge('metric_name', value)
    // - Sentry.metrics.distribution('metric_name', value)

    // Capture unhandled exceptions and rejections
    captureUnhandledRejections: true,
    captureUncaughtException: true,

    // Send default PII (Personally Identifiable Information)
    sendDefaultPii: false, // Set to true if you need user email/username in Sentry

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
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      // Browser extension errors
      'ResizeObserver loop limit exceeded',
      // Clerk errors that are handled gracefully
      'Clerk',
    ],

    // Additional options
    maxBreadcrumbs: 100, // Increase breadcrumb limit for better debugging
  });

  console.log(`Sentry initialized for ${environment} environment`);
}

/**
 * Capture console logs and send to Sentry
 * This is a wrapper around console methods to send logs to Sentry
 */
export function setupConsoleLogging() {
  if (!process.env.SENTRY_DSN) {
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

