/**
 * Skills database routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { logAdminAction } from "./shared";
import {
  insertSkillsSectorSchema,
  insertSkillsJobTitleSchema,
  insertSkillsSkillSchema,
  type SkillsSector,
  type SkillsJobTitle,
  type SkillsSkill,
} from "@shared/schema";

export function registerSkillsRoutes(app: Express) {
  // SHARED SKILLS DATABASE API ROUTES

  // Get full hierarchy (for admin management)
  app.get('/api/skills/hierarchy', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const hierarchy = await withDatabaseErrorHandling(
      () => storage.getSkillsHierarchy(),
      'getSkillsHierarchy'
    );
    res.json(hierarchy);
  }));

  // Get flattened list (for Directory app)
  app.get('/api/skills/flattened', isAuthenticated, asyncHandler(async (_req, res) => {
    const skills = await withDatabaseErrorHandling(
      () => storage.getAllSkillsFlattened(),
      'getAllSkillsFlattened'
    );
    res.json(skills);
  }));

  // Sectors CRUD
  app.get('/api/skills/sectors', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const sectors = await withDatabaseErrorHandling(
      () => storage.getAllSkillsSectors(),
      'getAllSkillsSectors'
    );
    res.json(sectors);
  }));

  app.post('/api/skills/sectors', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertSkillsSectorSchema, req.body, 'Invalid sector data');
    const sector = await withDatabaseErrorHandling(
      () => storage.createSkillsSector(validated),
      'createSkillsSector'
    ) as SkillsSector;
    await logAdminAction(adminId, 'create_skills_sector', 'skills_sector', sector.id, { name: sector.name });
    res.json(sector);
  }));

  app.put('/api/skills/sectors/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const sector = await withDatabaseErrorHandling(
      () => storage.updateSkillsSector(req.params.id, req.body),
      'updateSkillsSector'
    ) as SkillsSector;
    await logAdminAction(adminId, 'update_skills_sector', 'skills_sector', sector.id, { name: sector.name });
    res.json(sector);
  }));

  app.delete('/api/skills/sectors/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteSkillsSector(req.params.id),
      'deleteSkillsSector'
    );
    await logAdminAction(adminId, 'delete_skills_sector', 'skills_sector', req.params.id, {});
    res.json({ message: 'Sector deleted successfully' });
  }));

  // Job Titles CRUD
  app.get('/api/skills/job-titles', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const sectorId = req.query.sectorId as string | undefined;
    const jobTitles = await withDatabaseErrorHandling(
      () => storage.getAllSkillsJobTitles(sectorId),
      'getAllSkillsJobTitles'
    );
    res.json(jobTitles);
  }));

  app.post('/api/skills/job-titles', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertSkillsJobTitleSchema, req.body, 'Invalid job title data');
    const jobTitle = await withDatabaseErrorHandling(
      () => storage.createSkillsJobTitle(validated),
      'createSkillsJobTitle'
    ) as SkillsJobTitle;
    await logAdminAction(adminId, 'create_skills_job_title', 'skills_job_title', jobTitle.id, { name: jobTitle.name });
    res.json(jobTitle);
  }));

  app.put('/api/skills/job-titles/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const jobTitle = await withDatabaseErrorHandling(
      () => storage.updateSkillsJobTitle(req.params.id, req.body),
      'updateSkillsJobTitle'
    ) as SkillsJobTitle;
    await logAdminAction(adminId, 'update_skills_job_title', 'skills_job_title', jobTitle.id, { name: jobTitle.name });
    res.json(jobTitle);
  }));

  app.delete('/api/skills/job-titles/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteSkillsJobTitle(req.params.id),
      'deleteSkillsJobTitle'
    );
    await logAdminAction(adminId, 'delete_skills_job_title', 'skills_job_title', req.params.id, {});
    res.json({ message: 'Job title deleted successfully' });
  }));

  // Skills CRUD
  app.get('/api/skills/skills', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const jobTitleId = req.query.jobTitleId as string | undefined;
    const skills = await withDatabaseErrorHandling(
      () => storage.getAllSkillsSkills(jobTitleId),
      'getAllSkillsSkills'
    );
    res.json(skills);
  }));

  app.post('/api/skills/skills', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertSkillsSkillSchema, req.body, 'Invalid skill data');
    const skill = await withDatabaseErrorHandling(
      () => storage.createSkillsSkill(validated),
      'createSkillsSkill'
    ) as SkillsSkill;
    await logAdminAction(adminId, 'create_skills_skill', 'skills_skill', skill.id, { name: skill.name });
    res.json(skill);
  }));

  app.put('/api/skills/skills/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const skill = await withDatabaseErrorHandling(
      () => storage.updateSkillsSkill(req.params.id, req.body),
      'updateSkillsSkill'
    ) as SkillsSkill;
    await logAdminAction(adminId, 'update_skills_skill', 'skills_skill', skill.id, { name: skill.name });
    res.json(skill);
  }));

  app.delete('/api/skills/skills/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteSkillsSkill(req.params.id),
      'deleteSkillsSkill'
    );
    await logAdminAction(adminId, 'delete_skills_skill', 'skills_skill', req.params.id, {});
    res.json({ message: 'Skill deleted successfully' });
  }));

}
