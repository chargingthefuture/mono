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
 * Make HTTP/HTTPS request
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
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Status-Page-Health-Check/1.0',
      },
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

    req.on('timeout', () => {
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
 * Check a single service
 */
async function checkService(service) {
  const url = `${BASE_URL}${service.endpoint}`;
  const timestamp = new Date().toISOString();
  
  try {
    const result = await makeRequest(url);
    const isUp = result.status === 200;
    
    return {
      name: service.name,
      key: service.key,
      endpoint: service.endpoint,
      status: isUp ? 'up' : 'down',
      statusCode: result.status,
      responseTime: result.responseTime,
      timestamp,
      error: null,
    };
  } catch (error) {
    return {
      name: service.name,
      key: service.key,
      endpoint: service.endpoint,
      status: 'down',
      statusCode: null,
      responseTime: error.responseTime || null,
      timestamp,
      error: error.error || 'Unknown error',
    };
  }
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
  console.log(`Starting health checks for ${BASE_URL}...`);
  
  try {
    const results = await checkAllServices();
    
    // Save individual service histories
    results.forEach(result => {
      saveServiceHistory(result);
      console.log(`${result.name}: ${result.status.toUpperCase()} (${result.responseTime}ms)`);
    });
    
    // Save summary
    saveSummary(results);
    
    // Print summary
    const upCount = results.filter(r => r.status === 'up').length;
    const downCount = results.filter(r => r.status === 'down').length;
    
    console.log(`\nSummary: ${upCount} up, ${downCount} down`);
    
    // Exit with error code if any service is down
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


