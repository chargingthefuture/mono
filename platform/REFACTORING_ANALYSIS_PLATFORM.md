# Platform Folder Refactoring Analysis

This document identifies files in the `platform` folder that meet immediate refactoring indicators based on the workspace guidelines.

## Refactoring Indicators

- ✅ File is more than 500 lines long
- ✅ Multiple responsibilities in a single file
- ✅ Difficulty understanding the file's purpose at a glance
- ✅ More than 5-7 function/method definitions
- ✅ Excessive nested conditionals
- ✅ Multiple import groups with many dependencies

---

## 🔴 CRITICAL PRIORITY (Files > 500 lines)

### 1. `server/storage/composed/mini-apps-storage-composed.ts` (1,568 lines)

**Issues:**
- ✅ **1,568 lines** - Over 3x the 500 line limit
- ✅ **14 storage dependencies** - Implements 14 different interfaces
- ✅ **200+ method definitions** - Massive delegation class
- ✅ **Multiple responsibilities** - Handles all mini-app storage operations
- ✅ **22 import statements** - Multiple import groups

**Refactoring Recommendations:**
1. **Split by mini-app domain**: Create separate composed storage files for each mini-app:
   - `supportmatch-storage-composed.ts`
   - `lighthouse-storage-composed.ts`
   - `mechanicmatch-storage-composed.ts`
   - `socketrelay-storage-composed.ts`
   - `directory-storage-composed.ts`
   - `skills-storage-composed.ts`
   - `research-storage-composed.ts`
   - `lostmail-storage-composed.ts`
   - `trusttransport-storage-composed.ts`
   - `chatgroups-storage-composed.ts`
   - `gentlepulse-storage-composed.ts`
   - `chyme-storage-composed.ts`
   - `workforce-recruiter-storage-composed.ts`
   - `blog-storage-composed.ts`
   - `default-alive-or-dead-storage-composed.ts`

2. **Create factory pattern**: Use a factory to compose all mini-app storages
3. **Use mixins or composition**: Consider TypeScript mixins for shared behavior

**Target Structure:**
```
server/storage/composed/
  mini-apps/
    supportmatch-storage-composed.ts (~100 lines)
    lighthouse-storage-composed.ts (~100 lines)
    ... (one per mini-app)
  mini-apps-storage-factory.ts (Factory to compose all)
```

---

### 2. `server/storage/composed-storage.ts` (1,763 lines)

**Issues:**
- ✅ **1,763 lines** - Over 3x the 500 line limit
- ✅ **200+ method definitions** - Massive delegation class
- ✅ **Multiple responsibilities** - Aggregates ALL storage modules (core + 14 mini-apps)
- ✅ **16+ import groups** - Imports from all storage modules
- ✅ **Single responsibility violation** - Acts as facade for entire storage layer

**Refactoring Recommendations:**
1. **Already partially refactored** - Uses `CoreStorageComposed` and `MiniAppsStorageComposed`
2. **Complete the refactoring**: Move remaining direct storage references to composed classes
3. **Split remaining operations**: Move LostMail, Research, GentlePulse, Chyme, WorkforceRecruiter, Blog, and DefaultAliveOrDead to `MiniAppsStorageComposed`
4. **Consider Proxy pattern**: Dynamically delegate method calls instead of explicit methods

**Current State:**
- ✅ Core operations delegated to `CoreStorageComposed`
- ✅ Most mini-app operations delegated to `MiniAppsStorageComposed`
- ⚠️ Still has direct references to: LostMail, Research, GentlePulse, Chyme, WorkforceRecruiter, Blog, DefaultAliveOrDead

---

### 3. `server/storage/types.ts` (977 lines)

**Issues:**
- ✅ **977 lines** - Nearly double the 500 line limit
- ✅ **160+ lines of type imports** - Excessive dependencies
- ✅ **Single massive interface composition** - Composes all domain interfaces
- ✅ **Multiple responsibilities** - Defines types for all domains (core + 14 mini-apps)

**Refactoring Recommendations:**
1. **Already partially refactored** - Uses domain-specific interfaces from `types/` directory
2. **Split interface composition**: Create separate type composition files:
   - `types/core-types.ts` - Core types only
   - `types/mini-apps-types.ts` - Mini-app types composition
3. **Use type utilities**: Create helper types to reduce duplication
4. **Consider namespace exports**: Group related types in namespaces

**Current State:**
- ✅ Domain-specific interfaces extracted to `types/` directory
- ⚠️ Still has large type import section and interface composition

---

### 4. `scripts/data/skills-data.ts` (1,698 lines)

**Issues:**
- ✅ **1,698 lines** - Over 3x the 500 line limit
- ✅ **Single responsibility** - Data file (may be acceptable)
- ⚠️ **Large data structure** - Contains skill data definitions

**Refactoring Recommendations:**
1. **Split by domain**: If data is organized by domain, split into separate files:
   - `skills-data/sectors.ts`
   - `skills-data/job-titles.ts`
   - `skills-data/skills.ts`
2. **Use JSON/CSV**: Consider moving static data to JSON/CSV files if appropriate
3. **Lazy loading**: If data is large, consider lazy loading strategies

**Note**: Data files may be acceptable at this size if they're purely declarative.

---

### 5. `server/routes/mechanicmatch.routes.ts` (833 lines)

**Issues:**
- ✅ **833 lines** - Over 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Handles all MechanicMatch routes (profiles, vehicles, jobs, reviews, messages, announcements)
- ✅ **20+ route handlers** - Many function definitions
- ✅ **Complex route organization** - Multiple nested route groups

**Refactoring Recommendations:**
1. **Split by resource**: Create separate route files:
   - `mechanicmatch/profile.routes.ts`
   - `mechanicmatch/vehicles.routes.ts`
   - `mechanicmatch/jobs.routes.ts`
   - `mechanicmatch/reviews.routes.ts`
   - `mechanicmatch/messages.routes.ts`
   - `mechanicmatch/announcements.routes.ts`
2. **Create route index**: `mechanicmatch/index.ts` to compose all routes
3. **Extract shared middleware**: Create shared middleware file for common patterns

**Target Structure:**
```
server/routes/mechanicmatch/
  index.ts (main route registration)
  profile.routes.ts (~150 lines)
  vehicles.routes.ts (~150 lines)
  jobs.routes.ts (~200 lines)
  reviews.routes.ts (~100 lines)
  messages.routes.ts (~100 lines)
  announcements.routes.ts (~100 lines)
```

---

### 6. `client/src/pages/mechanicmatch/admin-profiles.tsx` (917 lines)

**Issues:**
- ✅ **917 lines** - Over 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Profile listing, creation, editing, deletion
- ✅ **Complex component** - Large React component with many sub-components
- ✅ **Multiple state management** - Many useState hooks

**Refactoring Recommendations:**
1. **Extract components**:
   - `MechanicMatchAdminProfileList.tsx` (~200 lines)
   - `MechanicMatchAdminProfileForm.tsx` (~200 lines)
   - `MechanicMatchAdminProfileDialog.tsx` (~150 lines)
2. **Extract hooks**:
   - `useMechanicMatchAdminProfiles.ts` - Data fetching and state
   - `useMechanicMatchProfileForm.ts` - Form logic
3. **Extract utilities**:
   - `mechanicMatchAdminUtils.ts` - Helper functions

---

### 7. `client/src/pages/admin/skills.tsx` (783 lines)

**Issues:**
- ✅ **783 lines** - Over 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Skills, sectors, job titles management
- ✅ **Complex component** - Multiple tabs/sections

**Refactoring Recommendations:**
1. **Extract components**:
   - `SkillsSectorsManager.tsx`
   - `SkillsJobTitlesManager.tsx`
   - `SkillsSkillsManager.tsx`
2. **Extract hooks**:
   - `useSkillsManagement.ts`
3. **Split into separate pages**: Consider separate pages for sectors, job titles, and skills

---

### 8. `test/api/mechanicmatch.test.ts` (772 lines)

**Issues:**
- ✅ **772 lines** - Over 1.5x the 500 line limit
- ✅ **Multiple test suites** - Many test cases

**Refactoring Recommendations:**
1. **Split by resource**: Create separate test files:
   - `mechanicmatch/profile.test.ts`
   - `mechanicmatch/vehicles.test.ts`
   - `mechanicmatch/jobs.test.ts`
   - `mechanicmatch/reviews.test.ts`
2. **Extract test utilities**: Create shared test helpers

---

### 9. `server/storage/mini-apps/research-storage.ts` (771 lines)

**Issues:**
- ✅ **771 lines** - Over 1.5x the 500 line limit
- ✅ **35+ method definitions** - Many storage operations
- ✅ **Multiple responsibilities** - Items, answers, comments, votes, bookmarks, follows, reports

**Refactoring Recommendations:**
1. **Split by domain**:
   - `research/items-storage.ts`
   - `research/answers-storage.ts`
   - `research/comments-storage.ts`
   - `research/votes-storage.ts`
   - `research/bookmarks-storage.ts`
   - `research/follows-storage.ts`
   - `research/reports-storage.ts`
2. **Create composed class**: `research-storage.ts` that composes all sub-storages

---

### 10. `server/storage/mini-apps/mechanicmatch-storage.ts` (747 lines)

**Issues:**
- ✅ **747 lines** - Over 1.5x the 500 line limit
- ✅ **46+ method definitions** - Many storage operations
- ✅ **Multiple responsibilities** - Profiles, vehicles, jobs, reviews, messages, availability

**Refactoring Recommendations:**
1. **Split by domain**:
   - `mechanicmatch/profiles-storage.ts`
   - `mechanicmatch/vehicles-storage.ts`
   - `mechanicmatch/jobs-storage.ts`
   - `mechanicmatch/reviews-storage.ts`
   - `mechanicmatch/messages-storage.ts`
   - `mechanicmatch/availability-storage.ts`
2. **Create composed class**: `mechanicmatch-storage.ts` that composes all sub-storages

---

## 🟡 MEDIUM PRIORITY (Files 400-500 lines)

### 11. `client/src/pages/mechanicmatch/profile.tsx` (744 lines)
- Extract form components
- Extract validation logic
- Extract hooks

### 12. `client/src/pages/admin/payments.tsx` (744 lines)
- Extract payment list component
- Extract payment details component
- Extract hooks

### 13. `client/src/pages/socketrelay/dashboard.tsx` (743 lines)
- Extract request list component
- Extract fulfillment list component
- Extract hooks

### 14. `client/src/pages/directory/profile.tsx` (741 lines)
- Extract profile form component
- Extract skills selector component
- Extract hooks

### 15. `test/api/default-alive-or-dead.test.ts` (731 lines)
- Split into separate test files by feature

### 16. `client/src/components/ui/sidebar.tsx` (727 lines)
- Extract sidebar sections into separate components
- Extract navigation logic

### 17. `server/routes/chyme-rooms.routes.ts` (682 lines)
- Split by resource (rooms, participants, messages)
- Extract shared middleware

### 18. `server/storage/mini-apps/supportmatch-storage.ts` (667 lines)
- Split by domain (profiles, partnerships, messages, reports)

### 19. `server/routes/research.routes.ts` (656 lines)
- Split by resource (items, answers, comments, votes)

### 20. `client/src/routes/mini-app-routes.tsx` (644 lines)
- Split route definitions by mini-app
- Extract route configuration

### 21. `client/src/pages/user-payments.tsx` (637 lines)
- Extract payment list component
- Extract payment form component

### 22. `client/src/pages/lighthouse/admin.tsx` (636 lines)
- Extract admin components
- Extract hooks

### 23. `server/routes/socketrelay.routes.ts` (626 lines)
- Split by resource (requests, fulfillments, messages)

### 24. `server/storage/core/analytics-storage.ts` (624 lines)
- Split by analytics domain
- Extract query builders

---

## 🟢 LOW PRIORITY (Files 300-400 lines)

Files in this range should be monitored but may not require immediate refactoring unless they show other indicators (multiple responsibilities, excessive nesting, etc.).

---

## Summary Statistics

- **Critical Priority (>500 lines)**: 10 files
- **Medium Priority (400-500 lines)**: 14 files
- **Total files requiring attention**: 24 files

## Refactoring Strategy

1. **Start with Critical Priority files** - These have the most impact
2. **Focus on storage layer first** - Largest files are in storage
3. **Then routes layer** - Route files are also large
4. **Finally client components** - UI components can be refactored incrementally

## Common Patterns for Refactoring

1. **Split by domain/resource** - Most large files handle multiple domains
2. **Extract composed classes** - Use composition over large classes
3. **Create factory patterns** - For composing multiple modules
4. **Extract hooks/utilities** - Move logic out of components
5. **Use type composition** - Split large type files into smaller ones

