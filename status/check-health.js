#!/usr/bin/env node

/**
 * Health Check Script
 * Checks all health endpoints and stores results in JSON files
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://app.chargingthefuture.com';
const HISTORY_DIR = path.join(__dirname, 'history');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Health check configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // Base delay in ms (exponential backoff)
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Response time thresholds (in milliseconds)
const RESPONSE_TIME_THRESHOLDS = {
  FAST: 200,      // < 200ms = up
  SLOW: 2000,     // 200-2000ms = degraded
  // > 2000ms = down (or error)
};

// Services to check based on the upptime config
const SERVICES = [
  { name: 'Main Platform', endpoint: '/api/health', key: 'main' },
  { name: 'ChatGroups', endpoint: '/api/health/chatgroups', key: 'chatgroups' },
  { name: 'Directory', endpoint: '/api/health/directory', key: 'directory' },
  { name: 'GentlePulse', endpoint: '/api/health/gentlepulse', key: 'gentlepulse' },
  { name: 'Chyme', endpoint: '/api/health/chyme', key: 'chyme' },
  { name: 'Default Alive or Dead', endpoint: '/api/health/default-alive-or-dead', key: 'default-alive-or-dead' },
  { name: 'Workforce Recruiter', endpoint: '/api/health/workforce-recruiter', key: 'workforce-recruiter' },
  { name: 'LightHouse', endpoint: '/api/health/lighthouse', key: 'lighthouse' },
  { name: 'LostMail', endpoint: '/api/health/lostmail', key: 'lostmail' },
  { name: 'MechanicMatch', endpoint: '/api/health/mechanicmatch', key: 'mechanicmatch' },
  { name: 'CompareNotes', endpoint: '/api/health/research', key: 'research' },
  { name: 'SocketRelay', endpoint: '/api/health/socketrelay', key: 'socketrelay' },
  { name: 'SupportMatch', endpoint: '/api/health/supportmatch', key: 'supportmatch' },
  { name: 'TrustTransport', endpoint: '/api/health/trusttransport', key: 'trusttransport' },
];

// Ensure directories exist
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

/**
 * Make HTTP/HTTPS request with timeout
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Status-Page-Health-Check/1.0',
      },
      timeout: REQUEST_TIMEOUT,
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          responseTime,
          body: data,
          headers: res.headers,
        });
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime,
      });
    });

    // Set timeout explicitly - this is required for the timeout event to fire
    req.setTimeout(REQUEST_TIMEOUT, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      reject({
        error: 'Request timeout',
        responseTime,
      });
    });

    req.end();
  });
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate health check response body
 */
function validateResponse(body, statusCode) {
  if (statusCode !== 200 && statusCode !== 503) {
    return { valid: false, error: `Unexpected status code: ${statusCode}` };
  }
  
  try {
    const data = JSON.parse(body);
    
    // Check required fields
    if (!data.service) {
      return { valid: false, error: 'Missing "service" field in response' };
    }
    
    if (!data.status) {
      return { valid: false, error: 'Missing "status" field in response' };
    }
    
    // Validate status values
    const validStatuses = ['ok', 'up', 'degraded', 'down'];
    if (!validStatuses.includes(data.status)) {
      return { valid: false, error: `Invalid status value: ${data.status}` };
    }
    
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: `Invalid JSON response: ${e.message}` };
  }
}

/**
 * Determine status based on response time and HTTP status
 */
function determineStatus(statusCode, responseTime, responseData) {
  // If HTTP status is 503, service is down
  if (statusCode === 503) {
    return 'down';
  }
  
  // If HTTP status is not 200, service is down
  if (statusCode !== 200) {
    return 'down';
  }
  
  // Check response data status if available
  if (responseData && responseData.status) {
    if (responseData.status === 'down') {
      return 'down';
    }
    if (responseData.status === 'degraded') {
      return 'degraded';
    }
  }
  
  // Determine based on response time
  if (responseTime >= RESPONSE_TIME_THRESHOLDS.SLOW) {
    return 'down';
  }
  if (responseTime >= RESPONSE_TIME_THRESHOLDS.FAST) {
    return 'degraded';
  }
  
  return 'up';
}

/**
 * Check a single service with retry logic
 */
async function checkService(service) {
  const url = `${BASE_URL}${service.endpoint}`;
  const timestamp = new Date().toISOString();
  let lastError = null;
  let lastResult = null;
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await makeRequest(url);
      
      // Validate response
      const validation = validateResponse(result.body, result.status);
      if (!validation.valid) {
        lastError = validation.error;
        // If validation fails, retry (might be transient)
        if (attempt < MAX_RETRIES - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }
        // Last attempt failed validation
        return {
          name: service.name,
          key: service.key,
          endpoint: service.endpoint,
          status: 'down',
          statusCode: result.status,
          responseTime: result.responseTime,
          timestamp,
          error: validation.error,
        };
      }
      
      // Determine status based on response time and data
      const status = determineStatus(result.status, result.responseTime, validation.data);
      
      return {
        name: service.name,
        key: service.key,
        endpoint: service.endpoint,
        status: status,
        statusCode: result.status,
        responseTime: result.responseTime,
        timestamp,
        error: status === 'down' ? (validation.data?.error || `HTTP ${result.status}`) : null,
      };
    } catch (error) {
      lastError = error.error || error.message || 'Unknown error';
      lastResult = {
        responseTime: error.responseTime || null,
      };
      
      // Retry on transient errors (timeout, network errors)
      const isTransientError = error.error?.includes('timeout') || 
                               error.error?.includes('ECONNREFUSED') ||
                               error.error?.includes('ENOTFOUND') ||
                               error.error?.includes('ETIMEDOUT');
      
      if (isTransientError && attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      
      // Non-transient error or last attempt
      break;
    }
  }
  
  // All retries failed
  return {
    name: service.name,
    key: service.key,
    endpoint: service.endpoint,
    status: 'down',
    statusCode: null,
    responseTime: lastResult?.responseTime || null,
    timestamp,
    error: lastError || 'Unknown error',
  };
}

/**
 * Check all services
 */
async function checkAllServices() {
  console.log(`Checking ${SERVICES.length} services...`);
  
  const results = await Promise.all(
    SERVICES.map(service => checkService(service))
  );
  
  return results;
}

/**
 * Save individual service history
 */
function saveServiceHistory(result) {
  const historyFile = path.join(HISTORY_DIR, `${result.key}.json`);
  let history = [];
  
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (e) {
      console.error(`Error reading history for ${result.key}:`, e);
      history = [];
    }
  }
  
  // Add new result
  history.push({
    timestamp: result.timestamp,
    status: result.status,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    error: result.error,
  });
  
  // Keep only last 1000 entries (about 3.5 days at 5-minute intervals)
  if (history.length > 1000) {
    history = history.slice(-1000);
  }
  
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

/**
 * Save summary status
 */
function saveSummary(results) {
  const summary = {
    timestamp: new Date().toISOString(),
    services: results.map(r => ({
      name: r.name,
      key: r.key,
      status: r.status,
      responseTime: r.responseTime,
      statusCode: r.statusCode,
    })),
    overall: {
      total: results.length,
      up: results.filter(r => r.status === 'up').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      down: results.filter(r => r.status === 'down').length,
    },
  };
  
  const summaryFile = path.join(PUBLIC_DIR, 'status.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Also save to history
  const historyFile = path.join(HISTORY_DIR, 'summary.json');
  let history = [];
  
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (e) {
      console.error('Error reading summary history:', e);
      history = [];
    }
  }
  
  history.push(summary);
  
  // Keep only last 1000 entries
  if (history.length > 1000) {
    history = history.slice(-1000);
  }
  
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

/**
 * Main function
 */
async function main() {
  // Validate BASE_URL
  if (!BASE_URL || BASE_URL.trim() === '') {
    console.error('Error: BASE_URL environment variable is not set or is empty');
    process.exit(1);
  }
  
  try {
    // Validate URL format
    new URL(BASE_URL);
  } catch (e) {
    console.error(`Error: BASE_URL "${BASE_URL}" is not a valid URL: ${e.message}`);
    process.exit(1);
  }
  
  console.log(`Starting health checks for ${BASE_URL}...`);
  
  try {
    const results = await checkAllServices();
    
    // Save individual service histories
    results.forEach(result => {
      saveServiceHistory(result);
      const statusInfo = result.statusCode 
        ? `${result.status.toUpperCase()} (HTTP ${result.statusCode}, ${result.responseTime}ms)`
        : `${result.status.toUpperCase()} (${result.error || 'error'}, ${result.responseTime || 'N/A'}ms)`;
      console.log(`${result.name}: ${statusInfo}`);
    });
    
    // Save summary
    saveSummary(results);
    
    // Print summary
    const upCount = results.filter(r => r.status === 'up').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;
    const downCount = results.filter(r => r.status === 'down').length;
    
    console.log(`\nSummary: ${upCount} up, ${degradedCount} degraded, ${downCount} down`);
    
    // Exit with error code if any service is down
    // Degraded services don't cause exit failure (they're still operational)
    if (downCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during health checks:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkAllServices, SERVICES };


