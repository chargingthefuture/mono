/**
 * Status Page Integration Utilities
 * 
 * Provides utilities for integrating with external status page services
 * (Upptime, Statuspage.io, UptimeRobot, etc.) via webhooks and APIs.
 */

import * as Sentry from '@sentry/node';

/**
 * Status page service types
 */
export type StatusPageService = 'upptime' | 'statuspage' | 'uptimerobot' | 'betterstack';

/**
 * Status levels for incidents
 */
export type StatusLevel = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';

/**
 * Incident information
 */
export interface IncidentInfo {
  name: string;
  status: StatusLevel;
  message: string;
  affectedServices?: string[];
  startedAt: Date;
  resolvedAt?: Date;
}

/**
 * Update status page via webhook or API
 * PLACEHOLDER: Logs only, no actual webhooks sent
 * To enable webhooks, call sendStatusPageWebhook() after configuring webhook URLs
 */
export async function updateStatusPage(
  service: StatusPageService,
  incident: IncidentInfo
): Promise<void> {
  // PLACEHOLDER: This function only logs status updates
  // For now, Upptime auto-detects issues, but you can extend this
  // to call Statuspage.io, UptimeRobot, or Better Stack APIs
  
  console.log(`[Status Page] ${service}: ${incident.name} - ${incident.status}`);
  console.log(`[Status Page] Message: ${incident.message}`);
  
  // Log to Sentry for tracking
  Sentry.addBreadcrumb({
    message: `Status page update: ${incident.name}`,
    level: incident.status === 'major_outage' ? 'error' : 'warning',
    category: 'status-page',
    data: {
      service,
      status: incident.status,
      affectedServices: incident.affectedServices,
    },
  });
}

/**
 * Create Sentry breadcrumb for status monitoring
 * This helps track when services go down and recover
 */
export function logStatusChange(
  serviceName: string,
  status: 'up' | 'down' | 'degraded',
  responseTime?: number,
  error?: Error
): void {
  Sentry.addBreadcrumb({
    message: `Service status: ${serviceName} - ${status}`,
    level: status === 'down' ? 'error' : status === 'degraded' ? 'warning' : 'info',
    category: 'health-check',
    data: {
      service: serviceName,
      status,
      responseTime,
      error: error?.message,
    },
  });
  
  // If service is down, also send as message to Sentry
  if (status === 'down') {
    Sentry.captureMessage(`Service ${serviceName} is down`, {
      level: 'error',
      tags: {
        service: serviceName,
        type: 'health-check',
      },
      extra: {
        responseTime,
        error: error?.message,
      },
    });
  }
}

/**
 * Get status page webhook URL from environment
 * Set these in your Railway environment variables
 */
export function getStatusPageWebhookUrl(service: StatusPageService): string | undefined {
  const envVar = `STATUS_PAGE_${service.toUpperCase()}_WEBHOOK_URL`;
  return process.env[envVar];
}

/**
 * Send webhook to status page service
 * PLACEHOLDER: Logs only, no actual webhooks sent
 * To enable webhooks, uncomment the fetch call and configure webhook URLs
 */
export async function sendStatusPageWebhook(
  service: StatusPageService,
  incident: IncidentInfo
): Promise<boolean> {
  const webhookUrl = getStatusPageWebhookUrl(service);
  
  // Format payload based on service type (for logging purposes)
  const payload = formatWebhookPayload(service, incident);
  
  // Log webhook details
  console.log(`[Status Page] Webhook placeholder for ${service}:`);
  console.log(`[Status Page]   URL: ${webhookUrl || '(not configured)'}`);
  console.log(`[Status Page]   Incident: ${incident.name}`);
  console.log(`[Status Page]   Status: ${incident.status}`);
  console.log(`[Status Page]   Message: ${incident.message}`);
  console.log(`[Status Page]   Payload:`, JSON.stringify(payload, null, 2));
  
  // Log to Sentry for tracking
  Sentry.addBreadcrumb({
    message: `Status page webhook (placeholder): ${incident.name}`,
    level: incident.status === 'major_outage' ? 'error' : 'warning',
    category: 'status-page-webhook',
    data: {
      service,
      status: incident.status,
      affectedServices: incident.affectedServices,
      webhookUrl: webhookUrl ? '(configured)' : '(not configured)',
      payload,
    },
  });
  
  // PLACEHOLDER: No actual webhook is sent
  // To enable webhooks, uncomment the code below:
  /*
  if (!webhookUrl) {
    console.warn(`[Status Page] No webhook URL configured for ${service}`);
    return false;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    console.log(`[Status Page] Successfully sent webhook to ${service}`);
    return true;
  } catch (error: any) {
    console.error(`[Status Page] Failed to send webhook to ${service}:`, error);
    Sentry.captureException(error, {
      tags: {
        service: 'status-page-integration',
        target: service,
      },
    });
    return false;
  }
  */
  
  // Placeholder returns true to indicate "success" (logged)
  return true;
}

/**
 * Format webhook payload for different status page services
 */
function formatWebhookPayload(service: StatusPageService, incident: IncidentInfo): any {
  const basePayload = {
    name: incident.name,
    status: incident.status,
    message: incident.message,
    startedAt: incident.startedAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString(),
    affectedServices: incident.affectedServices || [],
  };
  
  switch (service) {
    case 'statuspage':
      // Statuspage.io format
      return {
        incident: {
          name: incident.name,
          status: mapStatusToStatuspage(incident.status),
          impact: mapStatusToImpact(incident.status),
          body: incident.message,
          components: incident.affectedServices?.map(s => ({ name: s })) || [],
        },
      };
      
    case 'uptimerobot':
      // UptimeRobot format (if they support webhooks)
      return basePayload;
      
    case 'betterstack':
      // Better Stack format
      return {
        title: incident.name,
        status: mapStatusToBetterStack(incident.status),
        description: incident.message,
        affected_components: incident.affectedServices || [],
      };
      
    case 'upptime':
      // Upptime uses GitHub Issues, not webhooks
      // This would need to use GitHub API instead
      return basePayload;
      
    default:
      return basePayload;
  }
}

/**
 * Map our status levels to Statuspage.io status
 */
function mapStatusToStatuspage(status: StatusLevel): string {
  const mapping: Record<StatusLevel, string> = {
    operational: 'resolved',
    degraded: 'investigating',
    partial_outage: 'identified',
    major_outage: 'investigating',
    maintenance: 'scheduled',
  };
  return mapping[status] || 'investigating';
}

/**
 * Map our status levels to Statuspage.io impact
 */
function mapStatusToImpact(status: StatusLevel): string {
  const mapping: Record<StatusLevel, string> = {
    operational: 'none',
    degraded: 'minor',
    partial_outage: 'major',
    major_outage: 'critical',
    maintenance: 'maintenance',
  };
  return mapping[status] || 'minor';
}

/**
 * Map our status levels to Better Stack status
 */
function mapStatusToBetterStack(status: StatusLevel): string {
  const mapping: Record<StatusLevel, string> = {
    operational: 'resolved',
    degraded: 'investigating',
    partial_outage: 'identified',
    major_outage: 'investigating',
    maintenance: 'scheduled',
  };
  return mapping[status] || 'investigating';
}

