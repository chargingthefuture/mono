import type { Request, Response, NextFunction } from "express";

/**
 * Anti-scraping protection module
 * Implements request fingerprinting, pattern detection, and monitoring
 */

interface RequestFingerprint {
  ip: string;
  userAgent: string | undefined;
  acceptLanguage: string | undefined;
  accept: string | undefined;
  referer: string | undefined;
  timestamp: number;
  path: string;
}

interface SuspiciousPattern {
  ip: string;
  pattern: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  details: string[];
}

// In-memory storage for fingerprints and patterns (consider database for production)
const requestFingerprints: Map<string, RequestFingerprint[]> = new Map();
const suspiciousPatterns: Map<string, SuspiciousPattern> = new Map();

// Cleanup old data every 30 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  // Clean fingerprints older than maxAge
  for (const [ip, fingerprints] of requestFingerprints.entries()) {
    const filtered = fingerprints.filter(f => now - f.timestamp < maxAge);
    if (filtered.length === 0) {
      requestFingerprints.delete(ip);
    } else {
      requestFingerprints.set(ip, filtered);
    }
  }

  // Clean suspicious patterns older than maxAge
  for (const [key, pattern] of suspiciousPatterns.entries()) {
    if (now - pattern.lastSeen > maxAge) {
      suspiciousPatterns.delete(key);
    }
  }
}, 30 * 60 * 1000);

/**
 * Generate a fingerprint for a request
 */
function generateFingerprint(req: Request): RequestFingerprint {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : req.ip || req.socket.remoteAddress || 'unknown';

  return {
    ip,
    userAgent: req.headers['user-agent'],
    acceptLanguage: req.headers['accept-language'],
    accept: req.headers['accept'],
    referer: req.headers['referer'],
    timestamp: Date.now(),
    path: req.path,
  };
}

/**
 * Analyze request patterns to detect scraping behavior
 */
function detectSuspiciousPatterns(ip: string, fingerprint: RequestFingerprint): boolean {
  const fingerprints = requestFingerprints.get(ip) || [];
  
  // Check for missing browser headers (typical of bots)
  const missingHeaders = [
    !fingerprint.userAgent || fingerprint.userAgent.length < 10,
    !fingerprint.acceptLanguage,
    !fingerprint.accept || !fingerprint.accept.includes('text/html'),
  ].filter(Boolean).length;

  if (missingHeaders >= 2) {
    const key = `${ip}-missing-headers`;
    recordSuspiciousPattern(key, ip, `Missing browser headers (${missingHeaders} missing)`, fingerprint);
    return true;
  }

  // Check for rapid sequential requests (scraping pattern)
  if (fingerprints.length >= 5) {
    const recent = fingerprints.slice(-5);
    const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
    const avgTimeBetween = timeSpan / (recent.length - 1);
    
    // If requests are happening faster than every 2 seconds, it's likely automated
    if (avgTimeBetween < 2000 && timeSpan < 10000) {
      const key = `${ip}-rapid-requests`;
      recordSuspiciousPattern(key, ip, `Rapid sequential requests (${avgTimeBetween.toFixed(0)}ms avg)`, fingerprint);
      return true;
    }
  }

  // Check for uniform request patterns (same path repeatedly)
  if (fingerprints.length >= 10) {
    const recent = fingerprints.slice(-10);
    const pathCounts = new Map<string, number>();
    recent.forEach(f => {
      pathCounts.set(f.path, (pathCounts.get(f.path) || 0) + 1);
    });
    
    // If same path requested many times in short period
    for (const [path, count] of pathCounts.entries()) {
      if (count >= 8 && path.includes('/public')) {
        const key = `${ip}-repetitive-${path}`;
        recordSuspiciousPattern(key, ip, `Repetitive requests to ${path} (${count} times)`, fingerprint);
        return true;
      }
    }
  }

  // Check for missing referer on listing pages (direct API access, likely scraping)
  if (fingerprint.path.includes('/api/') && !fingerprint.referer && fingerprints.length >= 3) {
    const recentApiCalls = fingerprints.filter(f => 
      f.path.includes('/api/') && !f.referer
    ).length;
    
    if (recentApiCalls >= 3) {
      const key = `${ip}-direct-api`;
      recordSuspiciousPattern(key, ip, `Direct API access without referer (${recentApiCalls} times)`, fingerprint);
      return true;
    }
  }

  return false;
}

/**
 * Record a suspicious pattern for monitoring
 */
function recordSuspiciousPattern(key: string, ip: string, reason: string, fingerprint: RequestFingerprint) {
  const existing = suspiciousPatterns.get(key);
  const now = Date.now();

  if (existing) {
    existing.count++;
    existing.lastSeen = now;
    existing.details.push(`${reason} at ${new Date(now).toISOString()}`);
    // Keep only last 10 details
    if (existing.details.length > 10) {
      existing.details = existing.details.slice(-10);
    }
  } else {
    suspiciousPatterns.set(key, {
      ip,
      pattern: reason,
      count: 1,
      firstSeen: now,
      lastSeen: now,
      details: [`${reason} at ${new Date(now).toISOString()}`],
    });
  }

  // Log suspicious activity
  console.warn(`[ANTI-SCRAPING] Suspicious pattern detected: ${reason}`, {
    ip,
    path: fingerprint.path,
    userAgent: fingerprint.userAgent,
    count: suspiciousPatterns.get(key)?.count || 1,
  });
}

/**
 * Middleware to track request fingerprints and detect scraping patterns
 */
export function fingerprintRequests(req: Request, res: Response, next: NextFunction) {
  // Only track public endpoints
  if (req.path.includes('/api/directory/public') || req.path.includes('/api/socketrelay/public')) {
    const fingerprint = generateFingerprint(req);
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0].trim() 
      : req.ip || req.socket.remoteAddress || 'unknown';

    // Store fingerprint
    const fingerprints = requestFingerprints.get(ip) || [];
    fingerprints.push(fingerprint);
    // Keep last 20 requests per IP
    if (fingerprints.length > 20) {
      fingerprints.shift();
    }
    requestFingerprints.set(ip, fingerprints);

    // Detect suspicious patterns
    const isSuspicious = detectSuspiciousPatterns(ip, fingerprint);
    
    // Add suspicious flag to request for rate limiter to use
    (req as any).isSuspicious = isSuspicious;
  }

  next();
}

/**
 * Get current suspicious patterns (for admin monitoring)
 */
export function getSuspiciousPatterns(): SuspiciousPattern[] {
  return Array.from(suspiciousPatterns.values()).sort((a, b) => b.lastSeen - a.lastSeen);
}

/**
 * Get suspicious patterns for a specific IP
 */
export function getSuspiciousPatternsForIP(ip: string): SuspiciousPattern[] {
  return Array.from(suspiciousPatterns.values())
    .filter(p => p.ip === ip)
    .sort((a, b) => b.lastSeen - a.lastSeen);
}

/**
 * Clear suspicious patterns (for admin)
 */
export function clearSuspiciousPatterns(ip?: string): void {
  if (ip) {
    for (const [key, pattern] of suspiciousPatterns.entries()) {
      if (pattern.ip === ip) {
        suspiciousPatterns.delete(key);
      }
    }
  } else {
    suspiciousPatterns.clear();
  }
}

