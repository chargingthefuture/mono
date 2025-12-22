/**
 * LostMail routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId, isUserAdmin } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError, ForbiddenError, UnauthorizedError, ValidationError } from "../errors";
import { logInfo } from "../errorLogger";
import { logAdminAction } from "./shared";
import { z } from "zod";
import {
  insertLostmailIncidentSchema,
  insertLostmailAnnouncementSchema,
  insertLostmailAuditTrailSchema,
  type LostmailIncident,
  type LostmailAnnouncement,
  type User,
} from "@shared/schema";

export function registerLostMailRoutes(app: Express) {
  // LOSTMAIL ROUTES

  // LostMail Announcement routes (public)
  app.get('/api/lostmail/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveLostmailAnnouncements(),
      'getActiveLostmailAnnouncements'
    );
    res.json(announcements);
  }));

  // LostMail Incident routes
  app.post('/api/lostmail/incidents', asyncHandler(async (req, res) => {
    // Photos feature removed - ensure it's always null
    const body = { ...req.body, photos: null };

    const validatedData = validateWithZod(insertLostmailIncidentSchema, body, 'Invalid incident data');
    const incident = await withDatabaseErrorHandling(
      () => storage.createLostmailIncident(validatedData),
      'createLostmailIncident'
    ) as LostmailIncident;
    
    logInfo(`LostMail incident created: ${incident.id} by ${incident.reporterEmail}`, req);
    
    res.json(incident);
  }));

  app.get('/api/lostmail/incidents', asyncHandler(async (req, res) => {
    const email = req.query.email as string;
    
    if (email) {
      // User lookup by email
      const incidents = await withDatabaseErrorHandling(
        () => storage.getLostmailIncidentsByEmail(email),
        'getLostmailIncidentsByEmail'
      );
      res.json(incidents);
    } else if (await isUserAdmin(req)) {
      // Admin list with filters
      const filters: any = {};
      if (req.query.incidentType) filters.incidentType = req.query.incidentType as string;
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.severity) filters.severity = req.query.severity as string;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.search) filters.search = req.query.search as string;
      filters.limit = parseInt(req.query.limit as string || "50");
      filters.offset = parseInt(req.query.offset as string || "0");
      
      const result = await withDatabaseErrorHandling(
        () => storage.getLostmailIncidents(filters),
        'getLostmailIncidents'
      );
      res.json(result);
    } else {
      throw new UnauthorizedError("Unauthorized");
    }
  }));

  app.get('/api/lostmail/incidents/:id', asyncHandler(async (req, res) => {
    const incident = await withDatabaseErrorHandling(
      () => storage.getLostmailIncidentById(req.params.id),
      'getLostmailIncidentById'
    ) as LostmailIncident | undefined;
    if (!incident) {
      throw new NotFoundError('Incident', req.params.id);
    }
    
    // Only admins or the reporter can view details
    const email = req.query.email as string;
    if (!(await isUserAdmin(req)) && incident.reporterEmail !== email) {
      throw new ForbiddenError("Forbidden");
    }
    
    res.json(incident);
  }));

  app.put('/api/lostmail/incidents/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const incidentId = req.params.id;
    const updateData = req.body;
    
    // Get old incident to track status changes
    const oldIncident = await withDatabaseErrorHandling(
      () => storage.getLostmailIncidentById(incidentId),
      'getLostmailIncidentById'
    ) as LostmailIncident | undefined;
    if (!oldIncident) {
      throw new NotFoundError('Incident', incidentId);
    }
    
    // Get admin user info
    const adminUser = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUser'
    ) as User | undefined;
    const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "Admin";
    
    // Track status change in audit trail
    if (updateData.status && updateData.status !== oldIncident.status) {
      await withDatabaseErrorHandling(
        () => storage.createLostmailAuditTrailEntry({
          incidentId,
          adminName,
          action: "status_change",
          note: `Status changed from ${oldIncident.status} to ${updateData.status}${updateData.note ? `: ${updateData.note}` : ""}`,
        }),
        'createLostmailAuditTrailEntry'
      );
    }
    
    // Track assignment change
    if (updateData.assignedTo !== undefined && updateData.assignedTo !== oldIncident.assignedTo) {
      await withDatabaseErrorHandling(
        () => storage.createLostmailAuditTrailEntry({
          incidentId,
          adminName,
          action: "assigned",
          note: `Assigned to ${updateData.assignedTo || "unassigned"}`,
        }),
        'createLostmailAuditTrailEntry'
      );
    }
    
    // Track note addition
    if (updateData.note && updateData.note !== "") {
      await withDatabaseErrorHandling(
        () => storage.createLostmailAuditTrailEntry({
          incidentId,
          adminName,
          action: "note_added",
          note: updateData.note,
        }),
        'createLostmailAuditTrailEntry'
      );
    }
    
    // Remove note from update data (it's only for audit trail)
    const { note, ...updateDataWithoutNote } = updateData;
    
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLostmailIncident(incidentId, updateDataWithoutNote),
      'updateLostmailIncident'
    );
    
    logInfo(`LostMail incident ${incidentId} updated by admin ${adminName}`, req);
    
    res.json(updated);
  }));

  app.get('/api/lostmail/incidents/:id/audit-trail', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const auditTrail = await withDatabaseErrorHandling(
      () => storage.getLostmailAuditTrailByIncident(req.params.id),
      'getLostmailAuditTrailByIncident'
    );
    res.json(auditTrail);
  }));


  // Bulk export endpoint
  app.get('/api/lostmail/admin/export', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const format = req.query.format as string || "json";
    const ids = req.query.ids as string | string[];
    
    if (format !== "csv" && format !== "json") {
      throw new ValidationError("Invalid format. Must be 'csv' or 'json'");
    }
    
    let incidents: any[];
    
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : [ids];
      incidents = await Promise.all(
        idArray.map(id => withDatabaseErrorHandling(
          () => storage.getLostmailIncidentById(id),
          'getLostmailIncidentById'
        ))
      );
      incidents = incidents.filter(i => i !== undefined);
    } else {
      const result = await withDatabaseErrorHandling(
        () => storage.getLostmailIncidents({ limit: 1000 }),
        'getLostmailIncidents'
      ) as { incidents: LostmailIncident[] };
      incidents = result.incidents;
    }
    
    if (format === "csv") {
      // CSV export
      const headers = ["ID", "Reporter Name", "Email", "Type", "Status", "Severity", "Tracking Number", "Carrier", "Created At"];
      const rows = incidents.map(inc => [
        inc.id,
        inc.reporterName,
        inc.reporterEmail,
        inc.incidentType,
        inc.status,
        inc.severity,
        inc.trackingNumber,
        inc.carrier || "",
        new Date(inc.createdAt).toISOString(),
      ]);
      
      const csv = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="lostmail-incidents-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      // JSON export
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="lostmail-incidents-${Date.now()}.json"`);
      res.json(incidents);
    }
    
    logInfo(`LostMail export: ${incidents.length} incidents exported as ${format}`, req);
  }));

  // LostMail Admin Announcement routes
  app.get('/api/lostmail/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllLostmailAnnouncements(),
      'getAllLostmailAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/lostmail/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLostmailAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createLostmailAnnouncement(validatedData),
      'createLostmailAnnouncement'
    ) as LostmailAnnouncement;
    
    await logAdminAction(
      userId,
      "create_lostmail_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/lostmail/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLostmailAnnouncementSchema.partial(), req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertLostmailAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateLostmailAnnouncement(req.params.id, validatedData as any),
      'updateLostmailAnnouncement'
    ) as LostmailAnnouncement;
    
    await logAdminAction(
      userId,
      "update_lostmail_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/lostmail/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateLostmailAnnouncement(req.params.id),
      'deactivateLostmailAnnouncement'
    ) as LostmailAnnouncement;
    
    await logAdminAction(
      userId,
      "deactivate_lostmail_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));


}
