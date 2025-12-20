# Storage Refactoring Guide

## Overview

The original `storage.ts` file is 7811 lines with 355 methods. This guide outlines the systematic refactoring approach to split it into domain-specific modules.

## Structure

```
storage/
├── core/
│   ├── core-storage.ts      # Core operations (users, auth, pricing, payments, admin, NPS, weekly review)
│   └── utils.ts             # Shared utilities (already created)
├── mini-apps/
│   ├── supportmatch-storage.ts    # 40 methods
│   ├── lighthouse-storage.ts      # 25 methods
│   ├── socketrelay-storage.ts      # 28 methods
│   ├── directory-storage.ts       # 15 methods
│   ├── skills-storage.ts           # 18 methods (shared)
│   ├── chatgroups-storage.ts       # 11 methods
│   ├── trusttransport-storage.ts   # 17 methods
│   ├── mechanicmatch-storage.ts    # 46 methods
│   ├── lostmail-storage.ts         # 12 methods
│   ├── research-storage.ts         # 35 methods
│   ├── gentlepulse-storage.ts      # 21 methods
│   ├── chyme-storage.ts            # 27 methods
│   ├── workforce-recruiter-storage.ts  # 25 methods
│   ├── blog-storage.ts             # TBD
│   └── default-alive-or-dead-storage.ts  # TBD
├── profile-deletion.ts      # Profile deletion operations (shared across apps)
├── composed-storage.ts       # Composed DatabaseStorage class
└── index.ts                  # Central export point
```

## Extraction Strategy

### Step 1: Core Storage Module
Extract from `storage.ts`:
- Lines 1048-1406: User operations
- Lines 1408-1457: Pricing tier operations
- Lines 1459-1670: Payment operations
- Lines 1672-1687: Admin action log operations
- Lines 1690-1725: Admin stats
- Lines 1727-2435: Weekly performance review
- NPS operations (if implemented)
- Profile deletion utilities

### Step 2: Mini-App Modules
For each mini-app, extract:
1. All methods related to that domain
2. Required imports from `@shared/schema`
3. Database operations using `db` from `./db`
4. Error handling using `./errors`

### Step 3: Profile Deletion Module
Extract profile deletion methods:
- `generateAnonymizedUserId()` (already in utils.ts)
- `logProfileDeletion()`
- `deleteSupportMatchProfile()`
- `deleteLighthouseProfile()`
- `deleteSocketrelayProfile()`
- `deleteDirectoryProfileWithCascade()`
- `deleteTrusttransportProfile()`
- `deleteMechanicmatchProfile()`
- `deleteWorkforceRecruiterProfile()`
- `deleteUserAccount()` (if implemented)

### Step 4: Composed Storage Class
Create `composed-storage.ts` that:
- Imports all mini-app storage classes
- Implements `IStorage` interface
- Delegates method calls to appropriate modules
- Maintains backward compatibility

### Step 5: Update Index
Update `storage/index.ts` to:
- Export `IStorage` interface
- Export `DatabaseStorage` from composed-storage
- Export `storage` instance
- Maintain backward compatibility

## Module Template

Each module should follow this structure:

```typescript
import { db } from "../db";
import { eq, and, desc, asc, sql, or, inArray, gte, lte, lt } from "drizzle-orm";
import { NotFoundError, ValidationError, AppError, normalizeError } from "../errors";
import { logError } from "../errorLogger";
// Domain-specific imports from @shared/schema

export class SupportMatchStorage {
  // All SupportMatch-related methods
  async getSupportMatchProfile(userId: string): Promise<SupportMatchProfile | undefined> {
    // Implementation
  }
  
  // ... other methods
}
```

## Key Considerations

1. **Dependencies**: Some methods depend on others (e.g., `getWeeklyPerformanceReview` uses NPS methods)
2. **Cross-module calls**: Use composition - pass storage instances to modules that need them
3. **Error handling**: Maintain consistent error handling patterns
4. **Type safety**: Ensure all types are properly imported from `@shared/schema`
5. **Testing**: Test each module independently after extraction

## Migration Checklist

- [ ] Extract core storage module
- [ ] Extract SupportMatch storage
- [ ] Extract Lighthouse storage
- [ ] Extract SocketRelay storage
- [ ] Extract Directory storage
- [ ] Extract Skills storage
- [ ] Extract Chat Groups storage
- [ ] Extract TrustTransport storage
- [ ] Extract MechanicMatch storage
- [ ] Extract LostMail storage
- [ ] Extract Research storage
- [ ] Extract GentlePulse storage
- [ ] Extract Chyme storage
- [ ] Extract Workforce Recruiter storage
- [ ] Extract Blog storage
- [ ] Extract Default Alive or Dead storage
- [ ] Extract Profile Deletion module
- [ ] Create composed storage class
- [ ] Update index.ts
- [ ] Test all modules
- [ ] Update imports in routes.ts and other files
- [ ] Remove original storage.ts (after verification)

## Next Steps

1. Start with core-storage.ts (most critical)
2. Extract one mini-app at a time
3. Test after each extraction
4. Update composed-storage.ts incrementally
5. Finally, update index.ts and remove original file

