/**
 * Directory routes
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
import { logInfo } from "../errorLogger";
import { logAdminAction } from "./shared";
import { rotateDisplayOrder, addAntiScrapingDelay, isLikelyBot } from "../dataObfuscation";
import { readSkillsFromFile, addSkillToFile, removeSkillFromFile } from "../skillsFileManager";
import * as Sentry from '@sentry/node';
import { z } from "zod";
import {
  insertDirectoryProfileSchema,
  insertDirectorySkillSchema,
  type User,
  type DirectoryProfile,
  type SkillsJobTitle,
} from "@shared/schema";

export function registerDirectoryRoutes(app: Express) {
  // Current user's Directory profile
  app.get('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileByUserId(userId),
      'getDirectoryProfileByUserId'
    ) as DirectoryProfile | null;
    if (!profile) {
      return res.json(null);
    }
    let displayName: string | null = null;
    let userIsVerified = false;
    let userFirstName: string | null = null;
    let userLastName: string | null = null;
    
    // Get user data if userId exists
    if (profile.userId) {
      const userId = profile.userId;
      const user = await withDatabaseErrorHandling(
        () => storage.getUser(userId),
        'getUserForDirectoryProfile'
      ) as User | null;
      if (user) {
        // Handle empty strings as null
        userFirstName = (user.firstName && user.firstName.trim()) || null;
        userLastName = (user.lastName && user.lastName.trim()) || null;
        userIsVerified = user.isVerified || false;
        // Build display name from firstName and lastName
        if (userFirstName && userLastName) {
          displayName = `${userFirstName} ${userLastName}`;
        } else if (userFirstName) {
          displayName = userFirstName;
        } else if (userLastName) {
          displayName = userLastName;
        }
      }
    } else {
      // For admin-created profiles without userId, use profile's own isVerified field
      userIsVerified = profile.isVerified || false;
    }
    
    res.json({ ...profile, displayName, userIsVerified, firstName: userFirstName, lastName: userLastName });
  }));

  app.post('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    // Prevent duplicate
    const existing = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileByUserId(userId),
      'getDirectoryProfileByUserId'
    );
    if (existing) {
      // Reuse validation error pathway
      return res.status(400).json({ message: "Directory profile already exists" });
    }

    const validated = validateWithZod(insertDirectoryProfileSchema, {
      ...req.body,
      userId,
      isClaimed: true,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createDirectoryProfile(validated),
      'createDirectoryProfile'
    );
    res.json(profile);
  }));

  app.put('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileByUserId(userId),
      'getDirectoryProfileByUserId'
    ) as DirectoryProfile | null;
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Do not allow changing userId/isClaimed directly
    const { userId: _u, isClaimed: _c, ...update } = req.body;
    const validated = validateWithZod(insertDirectoryProfileSchema.partial() as any, update, 'Invalid profile update') as any;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateDirectoryProfile(profile.id, validated),
      'updateDirectoryProfile'
    );
    res.json(updated);
  }));

  app.delete('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteDirectoryProfileWithCascade(userId, reason),
      'deleteDirectoryProfileWithCascade'
    );
    res.json({ message: "Directory profile deleted successfully" });
  }));

  // Public skills endpoint (for authenticated users to view available skills)
  // Returns flattened list of all skills for Directory app compatibility
  app.get('/api/directory/skills', isAuthenticated, asyncHandler(async (_req, res) => {
    try {
      const skills = await withDatabaseErrorHandling(
        () => storage.getAllSkillsFlattened(),
        'getAllSkillsFlattened'
      ) as Array<{ id: string; name: string }>;
      // Format as DirectorySkill[] for backward compatibility
      const formatted = skills.map(s => ({ id: s.id, name: s.name }));
      
      // Log if no skills found (helps debug seeding issues)
      if (formatted.length === 0) {
        console.warn('⚠️ No skills found in database. Run seed script: npx tsx scripts/seedSkills.ts');
      }
      
      res.json(formatted);
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { route: '/api/directory/skills' },
        extra: { context: 'Error fetching skills from database' }
      });
      res.status(500).json({ 
        message: error.message || 'Failed to fetch skills',
        error: 'Database error occurred while fetching skills'
      });
    }
  }));

  // Public sectors endpoint (for authenticated users to view available sectors)
  app.get('/api/directory/sectors', isAuthenticated, asyncHandler(async (_req, res) => {
    try {
      const sectors = await withDatabaseErrorHandling(
        () => storage.getAllSkillsSectors(),
        'getAllSkillsSectors'
      ) as Array<{ id: string; name: string }>;
      // Format as { id, name }[] for Directory app compatibility
      const formatted = sectors.map(s => ({ id: s.id, name: s.name }));
      
      // Log if no sectors found (helps debug seeding issues)
      if (formatted.length === 0) {
        console.warn('⚠️ No sectors found in database. Run seed script: npx tsx scripts/seedSkills.ts');
      }
      
      res.json(formatted);
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { route: '/api/directory/sectors' },
        extra: { context: 'Error fetching sectors from database' }
      });
      res.status(500).json({ 
        message: error.message || 'Failed to fetch sectors',
        error: 'Database error occurred while fetching sectors'
      });
    }
  }));

  // Public job titles endpoint (for authenticated users to view available job titles)
  app.get('/api/directory/job-titles', isAuthenticated, asyncHandler(async (req, res) => {
    const jobTitles = await withDatabaseErrorHandling(
      () => storage.getAllSkillsJobTitles(),
      'getAllSkillsJobTitles'
    ) as SkillsJobTitle[];
    // Format as { id, name }[] for Directory app compatibility
    const formatted = (jobTitles as SkillsJobTitle[]).map(jt => ({ id: jt.id, name: jt.name }));
    
    // Log if no job titles found (helps debug seeding issues)
    if (formatted.length === 0) {
      console.warn('⚠️ No job titles found in database. Run seed script: npx tsx scripts/seedSkills.ts');
    }
    
    res.json(formatted);
  }));

  // Public routes (with rate limiting to prevent scraping)
  app.get('/api/directory/public/:id', publicItemLimiter, asyncHandler(async (req, res) => {
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileById(req.params.id),
      'getDirectoryProfileById'
    ) as DirectoryProfile | null;
    if (!profile || !profile.isPublic) {
      return res.status(404).json({ message: "Profile not found" });
    }
    let displayName: string | null = null;
    let userIsVerified = false;
    let userFirstName: string | null = null;
    let userLastName: string | null = null;
    
    // Get user data if userId exists
    if (profile.userId) {
      const user = await withDatabaseErrorHandling(
        () => storage.getUser(profile.userId!),
        'getUserForPublicDirectoryProfile'
      ) as User | null;
      if (user) {
        // Handle empty strings as null
        userFirstName = (user.firstName && user.firstName.trim()) || null;
        userLastName = (user.lastName && user.lastName.trim()) || null;
        userIsVerified = user.isVerified || false;
        // Build display name from firstName and lastName
        if (userFirstName && userLastName) {
          displayName = `${userFirstName} ${userLastName}`;
        } else if (userFirstName) {
          displayName = userFirstName;
        } else if (userLastName) {
          displayName = userLastName;
        }
      }
    } else {
      // For admin-created profiles without userId, use profile's own isVerified field
      userIsVerified = profile.isVerified || false;
      // For unclaimed profiles, fall back to the profile's own firstName field if set
      userFirstName = (profile as any).firstName || null;
    }
    res.json({ ...profile, displayName, userIsVerified, firstName: userFirstName, lastName: userLastName });
  }));

  app.get('/api/directory/public', publicListingLimiter, asyncHandler(async (req, res) => {
    // Add delay for suspicious requests
    const isSuspicious = (req as any).isSuspicious || false;
    const userAgent = req.headers['user-agent'];
    const accept = req.headers['accept'];
    const acceptLang = req.headers['accept-language'];
    const likelyBot = isLikelyBot(userAgent, accept, acceptLang);
    
    if (isSuspicious || likelyBot) {
      await addAntiScrapingDelay(true, 200, 800);
    } else {
      await addAntiScrapingDelay(false, 50, 200);
    }

    const profiles = await withDatabaseErrorHandling(
      () => storage.listPublicDirectoryProfiles(),
      'listPublicDirectoryProfiles'
    ) as DirectoryProfile[];
    const withNames = await Promise.all(profiles.map(async (p) => {
      let name: string | null = null;
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Get user data if userId exists
      if (p.userId) {
        const userId = p.userId;
        const u = await withDatabaseErrorHandling(
          () => storage.getUser(userId),
          'getUserForPublicDirectoryList'
        ) as User | null;
        if (u) {
          // Handle empty strings as null
          userFirstName = (u.firstName && u.firstName.trim()) || null;
          userLastName = (u.lastName && u.lastName.trim()) || null;
          userIsVerified = u.isVerified || false;
          // Build display name from firstName and lastName
          if (userFirstName && userLastName) {
            name = `${userFirstName} ${userLastName}`;
          } else if (userFirstName) {
            name = userFirstName;
          } else if (userLastName) {
            name = userLastName;
          }
        }
      } else {
        // For admin-created profiles without userId, use profile's own isVerified field
        userIsVerified = p.isVerified || false;
        // For unclaimed profiles, fall back to the profile's own firstName field if set
        userFirstName = (p as any).firstName || null;
      }
      
      // Ensure we always return displayName, firstName, and lastName (even if null)
      // Also include coordinates (convert from numeric to number)
      const result = { 
        ...p, 
        displayName: name || null, 
        userIsVerified, 
        firstName: userFirstName, 
        lastName: userLastName,
        latitude: p.latitude ? parseFloat(p.latitude.toString()) : null,
        longitude: p.longitude ? parseFloat(p.longitude.toString()) : null,
      };
      // Debug: Log if firstName exists but displayName doesn't
      if (userFirstName && !name) {
        logInfo(`[DEBUG] Profile ${p.id}`, req, {
          firstName: userFirstName,
          lastName: userLastName,
          displayName: name,
          userId: p.userId
        });
      }
      return result;
    }));
    
    // Rotate display order to make scraping harder
    const rotated = rotateDisplayOrder(withNames);
    
    res.json(rotated);
  }));

  // Authenticated list (shows additional non-public fields like signalUrl)
  app.get('/api/directory/list', isAuthenticated, asyncHandler(async (_req, res) => {
    const profiles = await withDatabaseErrorHandling(
      () => storage.listAllDirectoryProfiles(),
      'listAllDirectoryProfiles'
    ) as DirectoryProfile[];
    const withNames = await Promise.all(profiles.map(async (p) => {
      let name: string | null = null;
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Fetch user data once if userId exists
      let user: User | null = null;
      if (p.userId) {
        const userId = p.userId;
        user = await withDatabaseErrorHandling(
          () => storage.getUser(userId),
          'getUserForDirectoryList'
        ) as User | null;
        if (user) {
          userFirstName = user.firstName || null;
          userLastName = user.lastName || null;
          userIsVerified = user.isVerified || false;
          // Build display name from firstName and lastName
          if (userFirstName && userLastName) {
            name = `${userFirstName} ${userLastName}`;
          } else if (userFirstName) {
            name = userFirstName;
          }
        }
      } else {
        // For admin-created profiles without userId, use profile's own isVerified field
        userIsVerified = p.isVerified || false;
        // For unclaimed profiles, fall back to the profile's own firstName field if set
        userFirstName = (p as any).firstName || null;
        // Build display name from profile's firstName if available
        if (userFirstName) {
          name = userFirstName;
        }
      }
      
      // Ensure we always return displayName, firstName, and lastName (even if null)
      return { 
        ...p, 
        displayName: name || null, 
        userIsVerified,
        firstName: userFirstName || null,
        lastName: userLastName || null,
      };
    }));
    res.json(withNames);
  }));

  // Admin routes for Directory
  app.get('/api/directory/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    // For admin, return all profiles (no pagination on server)
    // Client-side pagination and search provides better UX for admins
    const profiles = await withDatabaseErrorHandling(
      () => storage.listAllDirectoryProfiles(),
      'listAllDirectoryProfiles'
    ) as DirectoryProfile[];
    // Enrich profiles with user data (firstName, lastName) like /api/directory/list does
    const withNames = await Promise.all(profiles.map(async (p) => {
      let name: string | null = null;
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Fetch user data once if userId exists
      let user: User | null = null;
      if (p.userId) {
        user = await withDatabaseErrorHandling(
          () => storage.getUser(p.userId!),
          'getUserForDirectoryAdmin'
        ) as User | null;
        if (user) {
          userFirstName = user.firstName || null;
          userLastName = user.lastName || null;
          userIsVerified = user.isVerified || false;
          // Build display name from firstName and lastName
          if (userFirstName && userLastName) {
            name = `${userFirstName} ${userLastName}`;
          } else if (userFirstName) {
            name = userFirstName;
          }
        }
      } else {
        // For admin-created profiles without userId, use profile's own isVerified field
        // and use profile's firstName field (for unclaimed profiles)
        userIsVerified = p.isVerified || false;
        userFirstName = ((p as any).firstName && (p as any).firstName.trim()) || null;
      }
      
      // Ensure we always return displayName, firstName, and lastName (even if null)
      return { 
        ...p, 
        displayName: name || null, 
        userIsVerified,
        firstName: userFirstName || null,
        lastName: userLastName || null,
      };
    }));
    res.json(withNames);
  }));

  // Admin creates an unclaimed profile
  app.post('/api/directory/admin/profiles', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertDirectoryProfileSchema, {
      ...req.body,
      userId: req.body.userId || null,
      isClaimed: !!req.body.userId,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createDirectoryProfile(validated),
      'createDirectoryProfile'
    ) as DirectoryProfile;
    await logAdminAction(adminId, 'create_directory_profile', 'directory_profile', profile.id, { isClaimed: profile.isClaimed });
    res.json(profile);
  }));

  // Removed admin seed endpoint; use scripts/seedDirectory.ts instead

  // Admin assigns an unclaimed profile to a user
  app.put('/api/directory/admin/profiles/:id/assign', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const updated = await withDatabaseErrorHandling(
      () => storage.updateDirectoryProfile(req.params.id, { userId, isClaimed: true } as any),
      'assignDirectoryProfile'
    ) as DirectoryProfile;
    await logAdminAction(adminId, 'assign_directory_profile', 'directory_profile', updated.id, { userId });
    res.json(updated);
  }));

  // Admin update Directory profile (for editing unclaimed profiles)
  app.put('/api/directory/admin/profiles/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertDirectoryProfileSchema.partial() as any, req.body, 'Invalid profile update') as Partial<z.infer<typeof insertDirectoryProfileSchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateDirectoryProfile(req.params.id, validated),
      'updateDirectoryProfile'
    ) as DirectoryProfile;
    await logAdminAction(adminId, 'update_directory_profile', 'directory_profile', updated.id);
    res.json(updated);
  }));

  // Admin delete Directory profile (for deleting unclaimed profiles)
  // NOTE: Unclaimed profile deletion is EXEMPT from data integrity requirements.
  // Unclaimed profiles have no user account, so no anonymization, cascade handling, or
  // profile deletion logging is required. This is a simple hard delete for admin cleanup.
  app.delete('/api/directory/admin/profiles/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const profileId = req.params.id;
    
    // Get profile first to check if it's unclaimed
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileById(profileId),
      'getDirectoryProfileById'
    ) as DirectoryProfile | null;
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Only allow deletion of unclaimed profiles via admin endpoint
    // Claimed profiles must use the user profile deletion endpoint which handles data integrity
    if (profile.isClaimed) {
      return res.status(400).json({ message: 'Cannot delete claimed profiles. Use profile deletion instead.' });
    }
    
    // Simple hard delete - no data integrity requirements for unclaimed profiles
    // No anonymization, no cascade handling, no profile deletion logging needed
    await withDatabaseErrorHandling(
      () => storage.deleteDirectoryProfile(profileId),
      'deleteDirectoryProfile'
    );
    
    // Log admin action for audit trail (not a profile deletion log)
    await logAdminAction(adminId, 'delete_directory_profile', 'directory_profile', profileId, { 
      wasUnclaimed: true,
      description: profile.description 
    });
    
    res.json({ message: 'Profile deleted successfully' });
  }));

  // Admin routes for Directory Skills (admin only) - Legacy, now uses hierarchical skills database
  app.get('/api/directory/admin/skills', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const skills = await withDatabaseErrorHandling(
      () => storage.getAllSkillsFlattened(),
      'getAllSkillsFlattened'
    ) as Array<{ id: string; name: string }>;
    // Format as DirectorySkill[] for backward compatibility
    const formatted = skills.map(s => ({ id: s.id, name: s.name }));
    res.json(formatted);
  }));

  app.post('/api/directory/admin/skills', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertDirectorySkillSchema, req.body, 'Invalid skill data');
    
    try {
      addSkillToFile(validated.name);
      const skill = { name: validated.name };
      
      await logAdminAction(adminId, 'create_directory_skill', 'skill_file', validated.name, { name: validated.name });
      res.json(skill);
    } catch (error: any) {
      console.error('Error adding skill to file:', error);
      if (error.message?.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to add skill' });
      }
    }
  }));

  app.delete('/api/directory/admin/skills', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { name: skillNameParam } = req.body;
    
    if (!skillNameParam || typeof skillNameParam !== 'string') {
      return res.status(400).json({ message: 'Skill name is required in request body' });
    }
    
    const trimmedName = skillNameParam.trim();
    
    try {
      // Get all skills and find the exact match (case-insensitive)
      const skills = readSkillsFromFile();
      const skillLower = trimmedName.toLowerCase();
      const exactSkill = skills.find(s => s.trim().toLowerCase() === skillLower);
      
      if (!exactSkill) {
        console.error(`Skill not found: "${trimmedName}"`);
        console.error(`Searching for (lowercase): "${skillLower}"`);
        console.error(`Total skills in file: ${skills.length}`);
        console.error(`Sample skills:`, skills.slice(0, 10).map(s => `"${s}"`));
        return res.status(404).json({ message: `Skill "${trimmedName}" not found` });
      }
      
      // Use the exact skill name from the file for deletion
      removeSkillFromFile(exactSkill);
      
      await logAdminAction(adminId, 'delete_directory_skill', 'skill_file', exactSkill, { name: exactSkill });
      res.json({ message: 'Skill deleted successfully' });
    } catch (error: any) {
      console.error('Error removing skill from file:', error);
      if (error.message?.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to delete skill' });
      }
    }
  }));

}
