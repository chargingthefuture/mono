/**
 * Status Page Integration Utilities
 * 
 * Provides utilities for integrating with external status page services
 * (Upptime, Statuspage.io, UptimeRobot, etc.) via webhooks and APIs.
 */

import * as Sentry from '@sentry/node';
import { logInfo, logWarning, logError } from './errorLogger';

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
 * Sends webhook to configured status page service if available
 */
export async function updateStatusPage(
  service: StatusPageService,
  incident: IncidentInfo
): Promise<void> {
  logInfo(`[Status Page] ${service}: ${incident.name} - ${incident.status}`, undefined, {
    service,
    incidentName: incident.name,
    status: incident.status,
    message: incident.message
  });
  
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

  // Send webhook if configured
  await sendStatusPageWebhook(service, incident);
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
 * Sends actual HTTP request to configured webhook URL if available
 */
export async function sendStatusPageWebhook(
  service: StatusPageService,
  incident: IncidentInfo
): Promise<boolean> {
  const webhookUrl = getStatusPageWebhookUrl(service);
  
  // Format payload based on service type
  const payload = formatWebhookPayload(service, incident);
  
  // If no webhook URL is configured, log and return false
  if (!webhookUrl) {
    logInfo(`[Status Page] No webhook URL configured for ${service} - skipping webhook`, undefined, {
      service,
      incident: incident.name,
      status: incident.status,
      message: incident.message
    });
    
    // Log to Sentry for tracking (but not as an error)
    Sentry.addBreadcrumb({
      message: `Status page webhook skipped (not configured): ${incident.name}`,
      level: 'info',
      category: 'status-page-webhook',
      data: {
        service,
        status: incident.status,
        affectedServices: incident.affectedServices,
      },
    });
    
    return false;
  }
  
  // Log webhook attempt
  logInfo(`[Status Page] Sending webhook to ${service}`, undefined, {
    service,
    url: webhookUrl,
    incident: incident.name,
    status: incident.status,
    message: incident.message
  });
  
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
    
    logInfo(`[Status Page] Successfully sent webhook to ${service}`, undefined, {
      service,
      incident: incident.name
    });
    
    // Log success to Sentry
    Sentry.addBreadcrumb({
      message: `Status page webhook sent successfully: ${incident.name}`,
      level: 'info',
      category: 'status-page-webhook',
      data: {
        service,
        status: incident.status,
        affectedServices: incident.affectedServices,
      },
    });
    
    return true;
  } catch (error: any) {
    logError(error, undefined, 'error');
    
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        service: 'status-page-integration',
        target: service,
      },
      extra: {
        incidentName: incident.name,
        incidentStatus: incident.status,
        webhookUrl: webhookUrl ? '(configured)' : '(not configured)',
      },
    });
    
    return false;
  }
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

