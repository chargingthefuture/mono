# Platform Folder Refactoring Analysis

This document identifies files in the `platform` folder that meet immediate refactoring indicators.

## Refactoring Indicators

- ✅ File is more than 500 lines long
- ✅ Multiple responsibilities in a single file
- ✅ Difficulty understanding the file's purpose at a glance
- ✅ More than 5-7 function/method definitions
- ✅ Excessive nested conditionals
- ✅ Multiple import groups with many dependencies

---

## 🔴 CRITICAL PRIORITY (Files > 500 lines)

### 1. `server/storage/composed-storage.ts` (1,759 lines)

**Issues:**
- ✅ **1,759 lines** - Far exceeds 500 line limit
- ✅ **Multiple responsibilities** - Aggregates ALL storage modules (core + 14 mini-apps)
- ✅ **200+ method definitions** - Massive delegation class
- ✅ **16+ import groups** - Imports from all storage modules
- ✅ **Single responsibility violation** - Acts as facade for entire storage layer

**Refactoring Recommendations:**
1. **Split by domain**: Create separate composed storage files:
   - `composed-storage-core.ts` - Core operations (users, auth, payments, etc.)
   - `composed-storage-mini-apps.ts` - Mini-app operations
   - `composed-storage-factory.ts` - Factory to create composed storage instances
2. **Use Proxy pattern**: Dynamically delegate method calls instead of explicit methods
3. **Create domain-specific interfaces**: Split `IStorage` into smaller interfaces per domain
4. **Consider composition over inheritance**: Use mixins or composition for shared behavior

**Target Structure:**
```
server/storage/
  composed/
    core-storage-composed.ts (Core operations)
    mini-apps-storage-composed.ts (Mini-app operations)
    storage-factory.ts (Factory pattern)
```

---

### 2. `server/storage/types.ts` (961 lines)

**Issues:**
- ✅ **961 lines** - Nearly double the 500 line limit
- ✅ **160+ lines of type imports** - Excessive dependencies
- ✅ **Single massive interface** - `IStorage` with 200+ methods
- ✅ **Multiple responsibilities** - Defines types for all domains (core + 14 mini-apps)

**Refactoring Recommendations:**
1. **Split IStorage interface** into domain-specific interfaces:
   - `ICoreStorage` - User, auth, payment operations
   - `ISupportMatchStorage` - SupportMatch operations
   - `ILighthouseStorage` - Lighthouse operations
   - `IMechanicMatchStorage` - MechanicMatch operations
   - etc.
2. **Create separate type files per domain**:
   - `types/core-storage.interface.ts`
   - `types/mini-apps-storage.interface.ts`
   - `types/index.ts` - Re-exports
3. **Use interface composition**: `IStorage extends ICoreStorage, ISupportMatchStorage, ...`

**Target Structure:**
```
server/storage/types/
  core-storage.interface.ts
  supportmatch-storage.interface.ts
  lighthouse-storage.interface.ts
  mechanicmatch-storage.interface.ts
  ...
  index.ts (composed IStorage)
```

---

### 3. `client/src/pages/mechanicmatch/admin-profiles.tsx` (917 lines)

**Issues:**
- ✅ **917 lines** - Nearly double the 500 line limit
- ✅ **Multiple responsibilities**:
  - Profile CRUD operations
  - Form handling (create/edit)
  - User assignment dialog
  - Delete confirmation dialog
  - Search and filtering
  - Pagination
- ✅ **33+ function/method definitions** - Many mutations, handlers, form components
- ✅ **Multiple import groups** - 20+ imports

**Refactoring Recommendations:**
1. **Extract dialogs into separate components**:
   - `components/mechanicmatch/ProfileEditDialog.tsx`
   - `components/mechanicmatch/ProfileAssignDialog.tsx`
   - `components/mechanicmatch/ProfileDeleteDialog.tsx`
2. **Extract form components**:
   - `components/mechanicmatch/ProfileForm.tsx`
   - `components/mechanicmatch/RoleCheckbox.tsx`
   - `components/mechanicmatch/LocationSelect.tsx`
3. **Extract mutations into custom hooks**:
   - `hooks/useMechanicMatchProfileMutations.ts`
4. **Extract list component**:
   - `components/mechanicmatch/ProfileList.tsx`

**Target Structure:**
```
client/src/pages/mechanicmatch/admin-profiles/
  index.tsx (main component, ~200 lines)
  components/
    ProfileForm.tsx
    ProfileList.tsx
    ProfileEditDialog.tsx
    ProfileAssignDialog.tsx
    ProfileDeleteDialog.tsx
  hooks/
    useMechanicMatchProfileMutations.ts
```

---

### 4. `server/routes/mechanicmatch.routes.ts` (833 lines)

**Issues:**
- ✅ **833 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities** - Handles 10+ route groups:
  - Profile routes (public, admin, user)
  - Vehicle routes
  - Service request routes
  - Job routes
  - Availability routes
  - Review routes
  - Message routes
  - Search routes
  - Announcement routes
- ✅ **30+ route handlers** - Far exceeds 5-7 function limit
- ✅ **Complex nested conditionals** - Authorization checks, validation

**Refactoring Recommendations:**
1. **Split into domain-specific route files**:
   - `routes/mechanicmatch/profiles.routes.ts`
   - `routes/mechanicmatch/vehicles.routes.ts`
   - `routes/mechanicmatch/jobs.routes.ts`
   - `routes/mechanicmatch/service-requests.routes.ts`
   - `routes/mechanicmatch/announcements.routes.ts`
2. **Create shared middleware**:
   - `routes/mechanicmatch/middleware.ts` - Common auth/validation
3. **Extract route handlers**:
   - `routes/mechanicmatch/handlers/` - Separate handler files

**Target Structure:**
```
server/routes/mechanicmatch/
  index.ts (registers all routes)
  profiles.routes.ts
  vehicles.routes.ts
  jobs.routes.ts
  service-requests.routes.ts
  availability.routes.ts
  reviews.routes.ts
  messages.routes.ts
  search.routes.ts
  announcements.routes.ts
  middleware.ts
```

---

### 5. `client/src/pages/admin/skills.tsx` (783 lines)

**Issues:**
- ✅ **783 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities**:
  - Sector management (CRUD)
  - Job title management (CRUD)
  - Skill management (CRUD)
  - Dialog management (3 dialogs)
  - Form state management
- ✅ **15+ function definitions** - Mutations, handlers, form components
- ✅ **Multiple import groups** - 15+ imports

**Refactoring Recommendations:**
1. **Extract dialogs into separate components**:
   - `components/admin/skills/SectorDialog.tsx`
   - `components/admin/skills/JobTitleDialog.tsx`
   - `components/admin/skills/SkillDialog.tsx`
   - `components/admin/skills/DeleteConfirmDialog.tsx`
2. **Extract hierarchy display component**:
   - `components/admin/skills/SkillsHierarchy.tsx`
3. **Extract mutations into custom hooks**:
   - `hooks/useSkillsMutations.ts`

**Target Structure:**
```
client/src/pages/admin/skills/
  index.tsx (main component, ~200 lines)
  components/
    SkillsHierarchy.tsx
    SectorDialog.tsx
    JobTitleDialog.tsx
    SkillDialog.tsx
    DeleteConfirmDialog.tsx
  hooks/
    useSkillsMutations.ts
```

---

### 6. `server/storage/mini-apps/research-storage.ts` (771 lines)

**Issues:**
- ✅ **771 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities** - Handles 10+ operation types:
  - Research items
  - Answers
  - Comments
  - Votes
  - Link provenances
  - Bookmarks
  - Follows
  - Reports
  - Announcements
  - Timeline
  - Reputation
- ✅ **30+ method definitions** - Far exceeds 5-7 function limit

**Refactoring Recommendations:**
1. **Split into domain-specific storage classes**:
   - `research-storage-items.ts` - Items operations
   - `research-storage-answers.ts` - Answers operations
   - `research-storage-engagement.ts` - Comments, votes, bookmarks, follows
   - `research-storage-moderation.ts` - Reports, announcements
   - `research-storage-analytics.ts` - Timeline, reputation
2. **Use composition**: Main `ResearchStorage` composes these classes

**Target Structure:**
```
server/storage/mini-apps/research/
  research-storage.ts (main class, composes others)
  research-items-storage.ts
  research-answers-storage.ts
  research-engagement-storage.ts
  research-moderation-storage.ts
  research-analytics-storage.ts
```

---

### 7. `server/storage/mini-apps/mechanicmatch-storage.ts` (747 lines)

**Issues:**
- ✅ **747 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities** - Handles 8+ operation types:
  - Profiles
  - Vehicles
  - Service requests
  - Jobs
  - Availability
  - Reviews
  - Messages
  - Announcements
- ✅ **25+ method definitions** - Exceeds 5-7 function limit

**Refactoring Recommendations:**
1. **Split into domain-specific storage classes**:
   - `mechanicmatch-profiles-storage.ts`
   - `mechanicmatch-vehicles-storage.ts`
   - `mechanicmatch-jobs-storage.ts`
   - `mechanicmatch-engagement-storage.ts` - Reviews, messages
2. **Use composition**: Main `MechanicMatchStorage` composes these classes

**Target Structure:**
```
server/storage/mini-apps/mechanicmatch/
  mechanicmatch-storage.ts (main class)
  mechanicmatch-profiles-storage.ts
  mechanicmatch-vehicles-storage.ts
  mechanicmatch-jobs-storage.ts
  mechanicmatch-engagement-storage.ts
```

---

### 8. `client/src/pages/mechanicmatch/profile.tsx` (744 lines)

**Issues:**
- ✅ **744 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities**:
  - Form handling
  - Profile display
  - Public URL management
  - Delete dialog
  - Location selectors
- ✅ **15+ function definitions** - Form handlers, mutations, utilities

**Refactoring Recommendations:**
1. **Extract form component**:
   - `components/mechanicmatch/ProfileForm.tsx`
2. **Extract location selectors**:
   - `components/mechanicmatch/LocationSelect.tsx`
3. **Extract profile display**:
   - `components/mechanicmatch/ProfileDisplay.tsx`
4. **Extract mutations**:
   - `hooks/useMechanicMatchProfile.ts`

**Target Structure:**
```
client/src/pages/mechanicmatch/profile/
  index.tsx (main component, ~200 lines)
  components/
    ProfileForm.tsx
    ProfileDisplay.tsx
    LocationSelect.tsx
  hooks/
    useMechanicMatchProfile.ts
```

---

### 9. `client/src/pages/admin/payments.tsx` (744 lines)

**Issues:**
- ✅ **744 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities** - Payment management, filtering, dialogs

**Refactoring Recommendations:**
1. Extract payment list component
2. Extract payment dialogs
3. Extract payment mutations hook

---

### 10. `client/src/pages/socketrelay/dashboard.tsx` (743 lines)

**Issues:**
- ✅ **743 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities** - Dashboard, requests, fulfillments

**Refactoring Recommendations:**
1. Extract request list component
2. Extract fulfillment components
3. Extract dashboard hooks

---

### 11. `client/src/pages/directory/profile.tsx` (741 lines)

**Issues:**
- ✅ **741 lines** - Exceeds 500 line limit
- ✅ **Multiple responsibilities** - Profile form, display, skills management

**Refactoring Recommendations:**
1. Extract profile form component
2. Extract skills selector component
3. Extract profile display component

---

## 🟡 MEDIUM PRIORITY (Files 500-600 lines)

### Additional files needing attention:

- `server/routes/chyme-rooms.routes.ts` (682 lines)
- `server/routes/research.routes.ts` (656 lines)
- `client/src/routes/mini-app-routes.tsx` (644 lines)
- `client/src/pages/user-payments.tsx` (637 lines)
- `client/src/pages/lighthouse/admin.tsx` (636 lines)
- `server/routes/socketrelay.routes.ts` (626 lines)
- `server/storage/core/analytics-storage.ts` (624 lines)
- `client/src/pages/default-alive-or-dead/dashboard.tsx` (596 lines)
- `client/src/pages/workforce-recruiter/admin-occupations.tsx` (593 lines)
- `server/auth.ts` (591 lines)
- `server/routes/directory.routes.ts` (580 lines)

---

## 📋 Summary

### By Category:

**Storage Layer:**
- `composed-storage.ts` (1,759 lines) - **CRITICAL**
- `types.ts` (961 lines) - **CRITICAL**
- `research-storage.ts` (771 lines) - **HIGH**
- `mechanicmatch-storage.ts` (747 lines) - **HIGH**
- `analytics-storage.ts` (624 lines) - **MEDIUM**

**Routes Layer:**
- `mechanicmatch.routes.ts` (833 lines) - **HIGH**
- `chyme-rooms.routes.ts` (682 lines) - **MEDIUM**
- `research.routes.ts` (656 lines) - **MEDIUM**
- `socketrelay.routes.ts` (626 lines) - **MEDIUM**
- `directory.routes.ts` (580 lines) - **MEDIUM**

**Client Components:**
- `admin-profiles.tsx` (917 lines) - **HIGH**
- `skills.tsx` (783 lines) - **HIGH**
- `profile.tsx` (744 lines) - **HIGH** (multiple instances)
- `payments.tsx` (744 lines) - **HIGH**
- `dashboard.tsx` (743 lines) - **HIGH**

### Recommended Refactoring Order:

1. **Phase 1 - Storage Layer** (Highest impact):
   - Split `composed-storage.ts` into domain-specific files
   - Split `types.ts` into domain-specific interfaces
   
2. **Phase 2 - Routes Layer**:
   - Split large route files by domain
   
3. **Phase 3 - Client Components**:
   - Extract dialogs and forms from large components
   - Extract custom hooks for mutations
   - Extract reusable UI components

---

## Notes

- All files over 500 lines should be considered for refactoring
- Files with multiple responsibilities should be split by domain
- Files with 5+ function definitions should extract related functions
- Consider using composition over large single classes
- Extract reusable components and hooks to reduce duplication
