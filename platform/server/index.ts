// CRITICAL: Load environment variables FIRST, before any other imports
// This must be at the very top so env vars are available when other modules import db.ts
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") }); // Fallback to .env

// Initialize Sentry BEFORE any other imports that might throw errors
import { initSentry, setupConsoleLogging, Sentry } from "./sentry";
initSentry();
setupConsoleLogging();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler, notFoundHandler } from "./errorHandler";
import { blockSecurityProbes } from "./securityProbeBlocker";

const app = express();

// Trust proxy for rate limiting IP detection (important for production behind load balancers)
app.set('trust proxy', 1);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Required for CSRF token cookies

// Clerk middleware - must be before routes
app.use(clerkMiddleware());

// Security headers middleware
app.use((req, res, next) => {
  // HTTP Strict Transport Security (HSTS)
  // Forces browsers to only connect via HTTPS for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy (CSP)
  // Prevents XSS attacks by controlling what resources can be loaded
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.app.chargingthefuture.com https://*.app.chargingthefuture.com https://*.the-comic.com https://js.stripe.com", // Clerk CDN + custom domains + staging + Stripe
    "worker-src 'self' blob:", // Allow blob: URLs for Clerk workers
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://*.clerk.com https://clerk.app.chargingthefuture.com https://*.app.chargingthefuture.com https://*.the-comic.com", // Clerk styles + OpenDyslexic font
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://*.clerk.com https://clerk.app.chargingthefuture.com https://*.app.chargingthefuture.com https://*.the-comic.com", // Clerk fonts + OpenDyslexic font files
    "img-src 'self' data: https:",
    "connect-src 'self' wss: ws: https://*.clerk.accounts.dev https://*.clerk.com https://clerk.app.chargingthefuture.com https://*.app.chargingthefuture.com https://*.the-comic.com https://api.stripe.com https://*.basemaps.cartocdn.com https://*.ingest.sentry.io", // Clerk API calls + Stripe API + CartoCDN basemaps + Sentry error reporting
    "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.app.chargingthefuture.com https://*.app.chargingthefuture.com https://*.the-comic.com https://js.stripe.com", // Clerk iframes for auth + Stripe Elements
    "frame-ancestors 'none'", // Prevents clickjacking
  ].join('; ');
  res.setHeader('Content-Security-Policy', cspDirectives);
  
  // X-Frame-Options - prevents clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options - prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy - controls how much referrer information is shared
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy - restricts browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global error handlers for unhandled promise rejections and exceptions
// These catch errors that occur outside of the Express request/response cycle
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Log to Sentry if available
  if (Sentry) {
    Sentry.captureException(reason, {
      tags: { errorType: 'unhandledRejection' },
    });
  }
  // Don't exit - let the process continue running
  // The deployment platform will handle health checks
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Log to Sentry if available
  if (Sentry) {
    Sentry.captureException(error, {
      tags: { errorType: 'uncaughtException' },
    });
  }
  // Exit with error code so deployment platform knows something went wrong
  process.exit(1);
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Attach Chyme WebRTC signaling WebSocket server
    try {
      const { attachChymeSignaling } = await import("./chymeSignaling");
      attachChymeSignaling(server);
    } catch (err) {
      console.error("Failed to attach Chyme signaling WebSocket server:", err);
    }

    // Block security probe paths before serving static files
    // This prevents requests to /.git/*, /.env, etc. from being served
    app.use(blockSecurityProbes);

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ========================================
    // 404 NOT FOUND HANDLER
    // ========================================
    // CRITICAL: This MUST be registered AFTER all route handlers (app.get, app.post, etc.)
    // 
    // In Express, middleware registered with app.use() executes BEFORE route matching,
    // which means it would intercept ALL requests before they reach route handlers.
    // This would cause valid API routes to return 404 errors incorrectly.
    //
    // SOLUTION: Use app.all("*", ...) instead of app.use() for 404 handling.
    // app.all() is a route handler that only executes if NO other route matched,
    // ensuring that valid routes are processed first.
    //
    // DO NOT use app.use() for API 404 handling - it will break route matching!
    // ========================================
    app.all("*", async (req, res, next) => {
      // Only handle API routes that weren't matched by any route handler
      // Express will only reach this route if no other route matched
      // Use req.originalUrl to be consistent with serveStatic
      if (req.originalUrl.startsWith("/api/")) {
        return notFoundHandler(req, res, next);
      }

      // Check for security probe paths before serving index.html
      // These paths should return 404, not serve the SPA
      const securityProbePatterns = [
        /^\/\.git\//,
        /^\/\.env/,
        /^\/\.aws\//,
        /^\/\.ssh\//,
        /^\/\.docker/,
        /^\/\.kube/,
        /^\/\.npmrc/,
        /^\/\.htaccess/,
        /^\/\.htpasswd/,
        /^\/wp-admin\//,
        /^\/wp-content\//,
        /^\/wp-includes\//,
        /^\/phpmyadmin\//,
        /^\/\.config\//,
        /^\/\.vscode\//,
        /^\/\.idea\//,
        /^\/backup/,
        /^\/config\//,
        /^\/database\//,
        /^\/\.DS_Store/,
        /^\/composer\.(json|lock)/,
        /^\/package(-lock)?\.json$/,
        /^\/yarn\.lock$/,
      ];
      
      for (const pattern of securityProbePatterns) {
        if (pattern.test(req.path)) {
          // Return 404 for security probe paths without logging
          return res.status(404).send('Not Found');
        }
      }

      // For non-API routes, we want to behave like an SPA:
      // fall back to serving index.html so client-side routing (Wouter) can handle
      // paths like /admin/weekly-performance on hard refresh.
      //
      // Normally, serveStatic's catch-all handler should already have handled this,
      // but in case something slipped through (proxy config, method differences, etc.),
      // we add a defensive fallback here.
      if (req.method === "GET") {
        try {
          const { resolve } = await import("path");
          const fs = await import("fs");

          // Mirror the dist path logic from serveStatic in vite.ts
          let cwd: string = "/app";
          try {
            const cwdResult = process.cwd();
            if (cwdResult && typeof cwdResult === "string" && cwdResult.length > 0) {
              cwd = cwdResult;
            }
          } catch {
            // ignore and use default /app
          }

          const distPath = resolve(cwd, "dist", "public");
          const indexPath = resolve(distPath, "index.html");

          if ((fs as any).existsSync && (fs as any).existsSync(indexPath)) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            return res.sendFile(indexPath, (err) => {
              if (err) {
                // ECONNABORTED errors occur when the client aborts the connection
                // This is expected behavior and should not be logged as an error
                const nodeErr = err as NodeJS.ErrnoException;
                if (nodeErr.code === 'ECONNABORTED' || err.message?.includes('aborted')) {
                  // Client aborted - silently ignore, don't log or call error handler
                  return;
                }
                // For other errors, use the notFoundHandler
                return notFoundHandler(req, res, next);
              }
            });
          }
        } catch {
          // If anything goes wrong while trying to send index.html,
          // fall through to the JSON 404 below.
        }
      }

      // Final fallback: use notFoundHandler for consistent error handling
      return notFoundHandler(req, res, next);
    });

    // Error handler - must be last
    app.use(errorHandler);

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: false,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    // Catch any errors during startup and log them properly
    console.error('Failed to start server:', error);
    
    // Log to Sentry if available
    if (Sentry) {
      Sentry.captureException(error, {
        tags: { errorType: 'startupError' },
      });
    }
    
    // Exit with error code so deployment platform knows startup failed
    process.exit(1);
  }
})();
