/**
 * WorkforceRecruiter routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError } from "../errors";
import { logAdminAction } from "./shared";
import { z } from "zod";
import {
  insertWorkforceRecruiterProfileSchema,
    insertWorkforceRecruiterConfigSchema,
    insertWorkforceRecruiterOccupationSchema,
    insertWorkforceRecruiterMeetupEventSchema,
    insertWorkforceRecruiterMeetupEventSignupSchema,
    insertWorkforceRecruiterAnnouncementSchema,
} from "@shared/schema";

export function registerWorkforceRecruiterRoutes(app: Express) {
  // WORKFORCE RECRUITER TRACKER ROUTES

  // Workforce Recruiter Tracker Announcement routes (public)
  app.get('/api/workforce-recruiter/announcements', isAuthenticated, asyncHandler(async (req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveWorkforceRecruiterAnnouncements(),
      'getActiveWorkforceRecruiterAnnouncements'
    );
    res.json(announcements);
  }));

  // Workforce Recruiter Tracker Profile routes
  app.get('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterProfile(userId),
      'getWorkforceRecruiterProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForWorkforceRecruiterProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterProfileSchema, req.body, 'Invalid profile data');
    
    const profile = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterProfile({
        ...validatedData,
        userId,
      }),
      'createWorkforceRecruiterProfile'
    );
    res.json(profile);
  }));

  app.put('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterProfile(userId, req.body),
      'updateWorkforceRecruiterProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterProfile(userId, reason),
      'deleteWorkforceRecruiterProfile'
    );
    res.json({ message: "Workforce Recruiter Tracker profile deleted successfully" });
  }));

  // Workforce Recruiter Tracker Config routes
  app.get('/api/workforce-recruiter/config', isAuthenticated, asyncHandler(async (req, res) => {
    const config = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterConfig(),
      'getWorkforceRecruiterConfig'
    );
    res.json(config);
  }));

  app.put('/api/workforce-recruiter/config', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const validatedData = validateWithZod(insertWorkforceRecruiterConfigSchema.partial(), req.body, 'Invalid config data');
    const config = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterConfig(validatedData),
      'updateWorkforceRecruiterConfig'
    );
    res.json(config);
  }));

  // Workforce Recruiter Tracker Occupation routes
  app.get('/api/workforce-recruiter/occupations', isAuthenticated, asyncHandler(async (req: any, res) => {
    const sector = req.query.sector as string | undefined;
    const skillLevel = req.query.skillLevel as 'Foundational' | 'Intermediate' | 'Advanced' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {};
    if (sector) filters.sector = sector;
    if (skillLevel) filters.skillLevel = skillLevel;
    filters.limit = limit;
    filters.offset = offset;

    const result = await withDatabaseErrorHandling(
      () => storage.getAllWorkforceRecruiterOccupations(filters),
      'getAllWorkforceRecruiterOccupations'
    );
    res.json(result);
  }));

  app.get('/api/workforce-recruiter/occupations/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const occupation = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterOccupation(req.params.id),
      'getWorkforceRecruiterOccupation'
    );
    if (!occupation) {
      throw new NotFoundError("Occupation not found");
    }
    res.json(occupation);
  }));

  app.post('/api/workforce-recruiter/occupations', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterOccupationSchema, req.body, 'Invalid occupation data');
    const occupation = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterOccupation(validatedData),
      'createWorkforceRecruiterOccupation'
    );
    
    await logAdminAction(
      userId,
      "create_workforce_recruiter_occupation",
      "occupation",
      occupation.id,
      { title: occupation.occupationTitle, sector: occupation.sector }
    );

    res.json(occupation);
  }));

  app.put('/api/workforce-recruiter/occupations/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterOccupationSchema.partial(), req.body, 'Invalid occupation data');
    const occupation = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterOccupation(req.params.id, validatedData),
      'updateWorkforceRecruiterOccupation'
    );
    
    await logAdminAction(
      userId,
      "update_workforce_recruiter_occupation",
      "occupation",
      occupation.id,
      { title: occupation.occupationTitle }
    );

    res.json(occupation);
  }));

  app.delete('/api/workforce-recruiter/occupations/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterOccupation(req.params.id),
      'deleteWorkforceRecruiterOccupation'
    );
    
    await logAdminAction(
      userId,
      "delete_workforce_recruiter_occupation",
      "occupation",
      req.params.id,
      {}
    );

    res.json({ message: "Occupation deleted successfully" });
  }));

  // Workforce Recruiter Meetup Event routes
  app.post('/api/workforce-recruiter/meetup-events', isAuthenticated, isAdmin, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSchema, req.body, 'Invalid meetup event data');
    
    // Add createdBy after validation (schema omits it, but database requires it)
    const event = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterMeetupEvent({
        ...validatedData,
        createdBy: userId,
      } as any),
      'createWorkforceRecruiterMeetupEvent'
    );
    
    await logAdminAction(
      userId,
      "create_workforce_recruiter_meetup_event",
      "meetup_event",
      event.id,
      { title: event.title, occupationId: event.occupationId }
    );
    
    res.json(event);
  }));

  app.get('/api/workforce-recruiter/meetup-events', isAuthenticated, asyncHandler(async (req: any, res) => {
    const occupationId = req.query.occupationId as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {};
    if (occupationId) filters.occupationId = occupationId;
    if (isActive !== undefined) filters.isActive = isActive;
    filters.limit = limit;
    filters.offset = offset;

    const result = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEvents(filters),
      'getWorkforceRecruiterMeetupEvents'
    );
    res.json(result);
  }));

  app.get('/api/workforce-recruiter/meetup-events/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const event = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventById(req.params.id),
      'getWorkforceRecruiterMeetupEventById'
    );
    if (!event) {
      return res.status(404).json({ message: "Meetup event not found" });
    }
    res.json(event);
  }));

  app.put('/api/workforce-recruiter/meetup-events/:id', isAuthenticated, isAdmin, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSchema.partial(), req.body, 'Invalid meetup event data');
    const event = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterMeetupEvent(req.params.id, validatedData),
      'updateWorkforceRecruiterMeetupEvent'
    );
    
    await logAdminAction(
      userId,
      "update_workforce_recruiter_meetup_event",
      "meetup_event",
      event.id,
      { title: event.title }
    );
    
    res.json(event);
  }));

  app.delete('/api/workforce-recruiter/meetup-events/:id', isAuthenticated, isAdmin, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterMeetupEvent(req.params.id),
      'deleteWorkforceRecruiterMeetupEvent'
    );
    
    await logAdminAction(
      userId,
      "delete_workforce_recruiter_meetup_event",
      "meetup_event",
      req.params.id,
      {}
    );
    
    res.json({ message: "Meetup event deleted successfully" });
  }));

  // Workforce Recruiter Meetup Event Signup routes
  app.post('/api/workforce-recruiter/meetup-events/:eventId/signups', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const eventId = req.params.eventId;
    
    // Check if user already signed up
    const existingSignup = await withDatabaseErrorHandling(
      () => storage.getUserMeetupEventSignup(eventId, userId),
      'getUserMeetupEventSignup'
    );
    
    if (existingSignup) {
      return res.status(400).json({ message: "You have already signed up for this event" });
    }
    
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSignupSchema, {
      ...req.body,
      eventId,
    }, 'Invalid signup data');
    
    // Add userId after validation (schema omits it, but database requires it)
    const signup = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterMeetupEventSignup({
        ...validatedData,
        userId,
      } as any),
      'createWorkforceRecruiterMeetupEventSignup'
    );
    res.json(signup);
  }));

  app.get('/api/workforce-recruiter/meetup-events/:eventId/signups', isAuthenticated, asyncHandler(async (req: any, res) => {
    const eventId = req.params.eventId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {
      eventId,
      limit,
      offset,
    };

    const result = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignups(filters),
      'getWorkforceRecruiterMeetupEventSignups'
    );
    res.json(result);
  }));

  app.get('/api/workforce-recruiter/meetup-events/:eventId/signup-count', isAuthenticated, asyncHandler(async (req: any, res) => {
    const eventId = req.params.eventId;
    const count = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignupCount(eventId),
      'getWorkforceRecruiterMeetupEventSignupCount'
    );
    res.json({ count });
  }));

  app.get('/api/workforce-recruiter/meetup-events/:eventId/my-signup', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const eventId = req.params.eventId;
    const signup = await withDatabaseErrorHandling(
      () => storage.getUserMeetupEventSignup(eventId, userId),
      'getUserMeetupEventSignup'
    );
    res.json(signup || null);
  }));

  app.put('/api/workforce-recruiter/meetup-events/:eventId/signups/:signupId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const signupId = req.params.signupId;
    
    // Verify user owns this signup
    const existingSignup = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignups({ userId, limit: 1000, offset: 0 }),
      'getWorkforceRecruiterMeetupEventSignups'
    );
    const signup = existingSignup.signups.find(s => s.id === signupId);
    if (!signup || signup.userId !== userId) {
      return res.status(403).json({ message: "You can only update your own signup" });
    }
    
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSignupSchema.partial(), req.body, 'Invalid signup data');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterMeetupEventSignup(signupId, validatedData),
      'updateWorkforceRecruiterMeetupEventSignup'
    );
    res.json(updated);
  }));

  app.delete('/api/workforce-recruiter/meetup-events/:eventId/signups/:signupId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const signupId = req.params.signupId;
    
    // Verify user owns this signup
    const existingSignup = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignups({ userId, limit: 1000, offset: 0 }),
      'getWorkforceRecruiterMeetupEventSignups'
    );
    const signup = existingSignup.signups.find(s => s.id === signupId);
    if (!signup || signup.userId !== userId) {
      return res.status(403).json({ message: "You can only delete your own signup" });
    }
    
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterMeetupEventSignup(signupId),
      'deleteWorkforceRecruiterMeetupEventSignup'
    );
    res.json({ message: "Signup deleted successfully" });
  }));

  // Workforce Recruiter Tracker Reports routes
  app.get('/api/workforce-recruiter/reports/summary', isAuthenticated, asyncHandler(async (req, res) => {
    const report = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterSummaryReport(),
      'getWorkforceRecruiterSummaryReport'
    );
    res.json(report);
  }));

  app.get('/api/workforce-recruiter/reports/skill-level/:skillLevel', isAuthenticated, asyncHandler(async (req, res) => {
    const { skillLevel } = req.params;
    const detail = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterSkillLevelDetail(skillLevel),
      'getWorkforceRecruiterSkillLevelDetail'
    );
    res.json(detail);
  }));

  // Workforce Recruiter Tracker Export route
  app.get('/api/workforce-recruiter/export', isAuthenticated, asyncHandler(async (req: any, res) => {
    const format = (req.query.format as string) || 'csv';
    
    const [report, occupationsResult] = await Promise.all([
      withDatabaseErrorHandling(
        () => storage.getWorkforceRecruiterSummaryReport(),
        'getWorkforceRecruiterSummaryReport'
      ),
      withDatabaseErrorHandling(
        () => storage.getAllWorkforceRecruiterOccupations({ limit: 10000, offset: 0 }),
        'getAllWorkforceRecruiterOccupations'
      ),
    ]);

    const occupations = occupationsResult.occupations;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="workforce-recruiter-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        summary: report,
        occupations,
        exportedAt: new Date().toISOString(),
      });
    } else {
      // CSV export
      const csvRows: string[] = [];
      
      // Summary section
      csvRows.push('Summary');
      csvRows.push(`Total Workforce Target,${report.totalWorkforceTarget}`);
      csvRows.push(`Total Current Recruited,${report.totalCurrentRecruited}`);
      csvRows.push(`Percent Recruited,${report.percentRecruited.toFixed(2)}%`);
      csvRows.push('');
      
      // Sector breakdown
      csvRows.push('Sector Breakdown');
      csvRows.push('Sector,Target,Recruited,Percent');
      report.sectorBreakdown.forEach(sector => {
        csvRows.push(`${sector.sector},${sector.target},${sector.recruited},${sector.percent.toFixed(2)}%`);
      });
      csvRows.push('');
      
      // Skill level breakdown
      csvRows.push('Skill Level Breakdown');
      csvRows.push('Skill Level,Target,Recruited,Percent');
      report.skillLevelBreakdown.forEach(skill => {
        csvRows.push(`${skill.skillLevel},${skill.target},${skill.recruited},${skill.percent.toFixed(2)}%`);
      });
      csvRows.push('');
      
      // Occupations
      csvRows.push('Occupations');
      csvRows.push('Sector,Occupation Title,Headcount Target,Current Recruited,Skill Level,Annual Training Target,Notes');
      occupations.forEach(occ => {
        const notes = (occ.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
        csvRows.push(`${occ.sector},${occ.occupationTitle},${occ.headcountTarget},${occ.currentRecruited},${occ.skillLevel},${occ.annualTrainingTarget},"${notes}"`);
      });
      
      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="workforce-recruiter-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }
  }));

  // Workforce Recruiter Tracker Admin Announcement routes
  app.get('/api/workforce-recruiter/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllWorkforceRecruiterAnnouncements(),
      'getAllWorkforceRecruiterAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/workforce-recruiter/admin/announcements', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterAnnouncement(validatedData),
      'createWorkforceRecruiterAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_workforce_recruiter_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/workforce-recruiter/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterAnnouncementSchema.partial(), req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterAnnouncement(req.params.id, validatedData),
      'updateWorkforceRecruiterAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_workforce_recruiter_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/workforce-recruiter/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateWorkforceRecruiterAnnouncement(req.params.id),
      'deactivateWorkforceRecruiterAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_workforce_recruiter_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // Add this route after the existing workforce-recruiter routes (around line 2800+)

  // Get sector details with skills and job titles breakdown
  app.get(
    "/api/workforce-recruiter/sector/:sector",
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
      const sector = decodeURIComponent(req.params.sector);

      const details = await withDatabaseErrorHandling(
        () => storage.getWorkforceRecruiterSectorDetail(sector),
        'getWorkforceRecruiterSectorDetail'
      );

      res.json(details);
    })
  );


}
