/**
 * Security Probe Blocker Middleware
 * 
 * Blocks common security probe paths that attackers use to scan for vulnerabilities.
 * Returns 404 for these paths to avoid revealing information and prevent unnecessary
 * error logging in Sentry.
 */

import { Request, Response, NextFunction } from 'express';

// List of path patterns that are commonly used in security probes
// These patterns match both root paths (/.env) and API paths (/api/.env)
const BLOCKED_PATH_PATTERNS = [
  /^\/\.git\//,           // Git repository files
  /^\/\.env/,             // Environment files (/.env, /api/.env, etc.)
  /^\/api\/\.env/,        // API environment files (explicit)
  /^\/\.aws\//,           // AWS credentials
  /^\/api\/\.aws\//,      // API AWS credentials
  /^\/\.ssh\//,           // SSH keys
  /^\/api\/\.ssh\//,      // API SSH keys
  /^\/\.docker/,          // Docker config
  /^\/api\/\.docker/,     // API Docker config
  /^\/\.kube/,            // Kubernetes config
  /^\/api\/\.kube/,       // API Kubernetes config
  /^\/\.npmrc/,           // NPM config
  /^\/api\/\.npmrc/,      // API NPM config
  /^\/\.htaccess/,        // Apache config
  /^\/api\/\.htaccess/,   // API Apache config
  /^\/\.htpasswd/,        // Apache passwords
  /^\/api\/\.htpasswd/,   // API Apache passwords
  /^\/wp-admin\//,        // WordPress admin
  /^\/wp-content\//,      // WordPress content
  /^\/wp-includes\//,     // WordPress includes
  /^\/phpmyadmin\//,      // phpMyAdmin
  /^\/\.well-known\/security\.txt$/,  // Allow security.txt
  /^\/\.well-known\/change-password$/, // Allow change-password
  /^\/\.well-known\/(?!security\.txt|change-password)/, // Block other .well-known except allowed
  /^\/\.config\//,        // Config directories
  /^\/api\/\.config\//,   // API config directories
  /^\/\.vscode\//,        // VSCode config
  /^\/api\/\.vscode\//,   // API VSCode config
  /^\/\.idea\//,          // IntelliJ config
  /^\/api\/\.idea\//,     // API IntelliJ config
  /^\/backup/,            // Backup files
  /^\/api\/backup/,       // API backup files
  /^\/config\//,          // Config directory
  /^\/api\/config\//,     // API config directory
  /^\/database\//,        // Database files
  /^\/api\/database\//,  // API database files
  /^\/\.DS_Store/,        // macOS metadata
  /^\/api\/\.DS_Store/,   // API macOS metadata
  /^\/composer\.json/,    // PHP composer
  /^\/api\/composer\.json/, // API PHP composer
  /^\/composer\.lock/,    // PHP composer lock
  /^\/api\/composer\.lock/, // API PHP composer lock
  /^\/package\.json$/,    // Expose package info (block it)
  /^\/api\/package\.json$/, // API package info
  /^\/package-lock\.json$/, // Expose package info (block it)
  /^\/api\/package-lock\.json$/, // API package lock
  /^\/yarn\.lock$/,       // Expose package info (block it)
  /^\/api\/yarn\.lock$/,  // API yarn lock
  // Note: /admin/ routes are legitimate and should NOT be blocked
  // Admin routes are handled by the SPA router and should be served index.html
];

/**
 * Middleware that blocks requests to security probe paths
 * 
 * This middleware intercepts common security probe patterns (like /.env, /api/.env, etc.)
 * and returns a silent 404 without logging to Sentry. This prevents:
 * 1. Information disclosure (revealing system structure)
 * 2. Sentry noise from automated scanning attempts
 * 3. Unnecessary error logging for expected attack patterns
 */
export function blockSecurityProbes(req: Request, res: Response, next: NextFunction): void {
  const path = req.path;
  
  // Check if the path matches any blocked pattern
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(path)) {
      // Return 404 without any information to avoid revealing system details
      // Don't call next() to avoid error logging in Sentry
      // This is a silent 404 - we don't want to log security probes
      res.status(404).send('Not Found');
      return;
    }
  }
  
  // Path is not blocked, continue to next middleware
  next();
}
