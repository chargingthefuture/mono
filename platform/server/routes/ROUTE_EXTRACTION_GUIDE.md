# Route Extraction Guide

## Overview
The `routes.ts` file (7,681 lines) needs to be split into domain-specific route modules.

## Route Sections (by line number)

1. **Health Routes** (lines 110-315) - ✅ COMPLETED (`health.routes.ts`)
2. **Auth Routes** (lines 446-632) - ✅ COMPLETED (`auth.routes.ts`)
3. **Webhook Routes** (lines 365-444) - ✅ COMPLETED (`webhooks.routes.ts`)
4. **Admin Routes** (lines 653-916) - ✅ COMPLETED (`admin.routes.ts`)
5. **SupportMatch Routes** (lines 919-922) - Empty section, skip
6. **Directory Routes** (lines 923-1478) - Extract to `directory.routes.ts`
7. **Skills Routes** (lines 1480-1622) - Extract to `skills.routes.ts`
8. **ChatGroups Routes** (lines 1624-2126) - Extract to `chatgroups.routes.ts`
9. **Lighthouse Routes** (lines 2127-3334) - Extract to `lighthouse.routes.ts`
10. **TrustTransport Routes** (lines 3335-3670) - Extract to `trusttransport.routes.ts`
11. **MechanicMatch Routes** (lines 3671-4475) - Extract to `mechanicmatch.routes.ts`
12. **Research Routes** (lines 4476-5105) - Extract to `research.routes.ts`
13. **GentlePulse Routes** (lines 5106-5296) - Extract to `gentlepulse.routes.ts`
14. **Blog Routes** (lines 5297-5613) - Extract to `blog.routes.ts`
15. **LostMail Routes** (lines 5614-5898) - Extract to `lostmail.routes.ts`
16. **Chyme Routes** (lines 5899-6316) - Extract to `chyme.routes.ts`
17. **Chyme Rooms Routes** (lines 6317-6974) - Extract to `chyme-rooms.routes.ts`
18. **Workforce Recruiter Routes** (lines 6975-7517) - Extract to `workforce-recruiter.routes.ts`
19. **Default Alive or Dead Routes** (lines 7518-7681) - Extract to `default-alive-or-dead.routes.ts`

## Extraction Process

For each route section:

1. Read the section from `routes.ts` (lines start-end)
2. Extract all route handlers (app.get, app.post, app.put, app.delete, etc.)
3. Identify required imports
4. Create a new module file with:
   - Proper imports
   - Route handler functions
   - Export function `register{AppName}Routes(app: Express)`
5. Update `routes/index.ts` to import and register the module

## Common Imports Needed

```typescript
import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter, chatMessageLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError, ValidationError, ForbiddenError } from "../errors";
import { logError, logInfo, logWarning } from "../errorLogger";
import { logAdminAction } from "./shared";
import { rotateDisplayOrder, addAntiScrapingDelay, isLikelyBot } from "../dataObfuscation";
import * as Sentry from '@sentry/node';
import { z } from "zod";
// Schema imports as needed from "@shared/schema"
```

## Next Steps

1. Extract each route section into its module
2. Test that all routes still work
3. Remove old `routes.ts` file
4. Update `server/index.ts` to use new routes structure

