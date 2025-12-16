import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Logging removed for production
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Don't serve HTML for API routes - let them return JSON errors
    if (url.startsWith("/api/")) {
      return next();
    }

    try {
      // In development, use process.cwd() which is the project root
      // Use defensive checks to ensure we always have a valid path
      let baseDir: string = '/app'; // Default fallback
      try {
        const cwdResult = process.cwd();
        if (cwdResult && typeof cwdResult === 'string' && cwdResult.length > 0) {
          baseDir = cwdResult;
        }
      } catch (error) {
        console.warn('process.cwd() failed in setupVite, using /app fallback:', error);
      }
      
      // Ensure baseDir is always a valid string
      if (!baseDir || typeof baseDir !== 'string' || baseDir.length === 0) {
        baseDir = '/app';
      }
      
      const clientTemplate = path.resolve(
        baseDir,
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the bundled server code is at dist/index.js
  // The frontend build is at dist/public (from vite build)
  // Use process.cwd() which is the project root where npm runs
  // Use defensive checks to ensure we always have a valid path
  let cwd: string = '/app'; // Default fallback for Railway
  try {
    const cwdResult = process.cwd();
    if (cwdResult && typeof cwdResult === 'string' && cwdResult.length > 0) {
      cwd = cwdResult;
    } else {
      console.warn('process.cwd() returned invalid value, using /app fallback:', cwdResult);
    }
  } catch (error) {
    // Last resort fallback - assume we're in /app on Railway
    console.warn('process.cwd() failed, using /app as fallback:', error);
  }
  
  // Ensure cwd is always a valid string before using it
  if (!cwd || typeof cwd !== 'string' || cwd.length === 0) {
    cwd = '/app';
  }
  
  const distPath = path.resolve(cwd, "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files (JS, CSS, images, etc.) with proper caching headers
  // Only apply static middleware to requests that look like static assets
  // This prevents express.static from interfering with SPA routes like /admin/users
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map', '.json'];
  
  app.use((req, res, next) => {
    // Check if this is a request for a static asset (has a file extension)
    const hasExtension = staticExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
    
    if (hasExtension) {
      // Apply static middleware only for files with extensions
      // express.static will call next() if the file doesn't exist
      express.static(distPath, {
        index: false,
        maxAge: '1y',
        etag: true,
        lastModified: true,
      })(req, res, next);
    } else {
      // Not a static file - skip static middleware and go to catch-all
      next();
    }
  });

  // Fall through to index.html for all non-API GET requests (SPA routing)
  // This allows client-side routing to work - all routes serve the same HTML
  app.get("*", (req, res, next) => {
    // Don't serve HTML for API routes - let the 404 handler deal with it
    if (req.originalUrl.startsWith("/api/")) {
      return next(); // Let the 404 handler deal with it
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error(`Frontend build not found at: ${indexPath}`);
      return res.status(404).json({ message: "Frontend build not found" });
    }
    
    // Send the index.html file with proper content type and no caching
    // (HTML should not be cached so SPA updates work correctly)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        // Check if error is due to client disconnection (ECONNABORTED, EPIPE, etc.)
        // These are not server errors and should not be sent to Sentry
        // Type guard to check if error has a code property (NodeJS errors)
        const nodeError = err as NodeJS.ErrnoException;
        const isClientDisconnection = 
          nodeError.code === 'ECONNABORTED' || 
          nodeError.code === 'EPIPE' || 
          nodeError.code === 'ECONNRESET' ||
          err.message?.includes('Request aborted');
        
        if (isClientDisconnection) {
          // Client disconnected - this is normal behavior, just log and don't call next()
          // Don't treat this as an error that needs to go to Sentry
          console.log("Client disconnected while sending index.html:", nodeError.code);
          return;
        }
        
        // For actual server errors, log and pass to error handler
        console.error("Error sending index.html:", err);
        next(err);
      }
    });
  });
}
