# Platform Folder Refactoring Analysis

## Overview

This document identifies files in the `platform` folder that meet the immediate refactoring indicators:

- ✅ File is more than 500 lines long
- ✅ Multiple responsibilities in a single file
- ✅ Difficulty understanding the file's purpose at a glance
- ✅ More than 5-7 function/method definitions
- ✅ Excessive nested conditionals
- ✅ Multiple import groups with many dependencies

---

## 🔴 CRITICAL PRIORITY - Files > 1000 Lines

### 1. `server/routes.ts` - **7,681 lines** ⚠️ CRITICAL

**Refactoring Indicators:**
- ✅ **7,681 lines** (15x over limit)
- ✅ **381+ route handlers** (functions)
- ✅ **22 import statements** with 80+ imported items
- ✅ **Multiple responsibilities**: Health, Auth, Webhooks, Admin, Directory, Skills, ChatGroups, Lighthouse, TrustTransport, MechanicMatch, Research, GentlePulse, Blog, LostMail, Chyme, Chyme Rooms, Workforce Recruiter, Default Alive or Dead
- ✅ **Difficulty understanding**: Monolithic route file handling all API endpoints

**Current Status:**
- Partial refactoring in progress (see `server/routes/ROUTE_EXTRACTION_GUIDE.md`)
- Some routes already extracted: `health.routes.ts`, `auth.routes.ts`, `webhooks.routes.ts`, `admin.routes.ts`
- **Remaining routes to extract:**
  - Directory Routes (lines 923-1478)
  - Skills Routes (lines 1480-1622)
  - ChatGroups Routes (lines 1624-2126)
  - Lighthouse Routes (lines 2127-3334) - **Note: `lighthouse.routes.ts` exists but routes.ts still contains them**
  - TrustTransport Routes (lines 3335-3670)
  - MechanicMatch Routes (lines 3671-4475)
  - Research Routes (lines 4476-5105)
  - GentlePulse Routes (lines 5106-5296)
  - Blog Routes (lines 5297-5613)
  - LostMail Routes (lines 5614-5898)
  - Chyme Routes (lines 5899-6316)
  - Chyme Rooms Routes (lines 6317-6974)
  - Workforce Recruiter Routes (lines 6975-7517)
  - Default Alive or Dead Routes (lines 7518-7681)

**Recommended Refactoring:**
1. Complete route extraction following the existing pattern in `server/routes/`
2. Update `server/routes/index.ts` to register all extracted routes
3. Remove extracted routes from `routes.ts`
4. Verify all route handlers are properly extracted

---

### 2. `server/storage/composed-storage.ts` - **1,759 lines** ⚠️ HIGH

**Refactoring Indicators:**
- ✅ **1,759 lines** (3.5x over limit)
- ✅ **394+ method definitions** (delegation methods)
- ✅ **Multiple responsibilities**: Delegates to 15+ mini-app storage modules + core storage
- ✅ **Pattern**: Composed class with delegation - acceptable pattern but file is too large

**Current Status:**
- This is a composition class that delegates to extracted storage modules
- All methods are simple delegation wrappers

**Recommended Refactoring:**
1. **Option A**: Keep current structure but split into multiple files:
   - `composed-storage-core.ts` - Core operations delegation
   - `composed-storage-mini-apps.ts` - Mini-app operations delegation
   - `composed-storage.ts` - Main class that imports both
2. **Option B**: Generate delegation methods programmatically using TypeScript's Proxy or method mapping
3. **Option C**: Accept current structure if it's auto-generated or tool-assisted

---

### 3. `client/src/pages/directory/admin.tsx` - **1,242 lines** ⚠️ HIGH

**Refactoring Indicators:**
- ✅ **1,242 lines** (2.5x over limit)
- ✅ **25+ import statements**
- ✅ **Multiple responsibilities**: Profile management, skills management, sectors, job titles, search, pagination, CRUD operations
- ✅ **14+ conditional blocks** (if/else/switch/try-catch)
- ✅ **Difficulty understanding**: Large admin component with many features

**Recommended Refactoring:**
1. Extract into sub-components:
   - `DirectoryAdminProfileList.tsx` - Profile listing and search
   - `DirectoryAdminProfileForm.tsx` - Create/edit profile form
   - `DirectoryAdminSkillsManager.tsx` - Skills management section
   - `DirectoryAdminSectorsManager.tsx` - Sectors management
   - `DirectoryAdminJobTitlesManager.tsx` - Job titles management
2. Extract custom hooks:
   - `useDirectoryAdminProfiles.ts` - Profile data fetching and mutations
   - `useDirectoryAdminSkills.ts` - Skills data management
3. Extract utility functions:
   - `directoryAdminUtils.ts` - Helper functions for validation, formatting

---

### 4. `client/src/pages/admin/weekly-performance.tsx` - **1,091 lines** ⚠️ HIGH

**Refactoring Indicators:**
- ✅ **1,091 lines** (2.2x over limit)
- ✅ **Multiple responsibilities**: Data fetching, chart rendering, metric calculations, date handling, formatting
- ✅ **Difficulty understanding**: Complex dashboard with many metrics and visualizations

**Recommended Refactoring:**
1. Extract metric components:
   - `WeeklyPerformanceMetrics.tsx` - Core metrics display
   - `WeeklyPerformanceCharts.tsx` - Chart visualizations
   - `WeeklyPerformanceComparison.tsx` - Week-over-week comparison
2. Extract custom hooks:
   - `useWeeklyPerformance.ts` - Data fetching and calculations
   - `useWeekSelection.ts` - Week selection logic
3. Extract utility functions:
   - `weeklyPerformanceUtils.ts` - Formatting, calculations, date utilities

---

### 5. `server/routes/lighthouse.routes.ts` - **1,231 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **1,231 lines** (2.5x over limit)
- ✅ **Multiple responsibilities**: Profile routes, property routes, match routes, announcement routes, admin routes
- ✅ **Many route handlers** (likely 30+ routes)

**Recommended Refactoring:**
1. Split into domain-specific route files:
   - `lighthouse-profile.routes.ts` - Profile CRUD operations
   - `lighthouse-property.routes.ts` - Property management
   - `lighthouse-match.routes.ts` - Matching logic
   - `lighthouse-announcement.routes.ts` - Announcements
   - `lighthouse-admin.routes.ts` - Admin operations
2. Create `lighthouse.routes.ts` that imports and registers all sub-routes

---

### 6. `client/src/App.tsx` - **976 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **976 lines** (2x over limit)
- ✅ **138 import statements** (massive import list)
- ✅ **Multiple responsibilities**: Route configuration, auth setup, error boundaries, terms acceptance, NPS surveys
- ✅ **Difficulty understanding**: Main app file with routing for 15+ mini-apps

**Recommended Refactoring:**
1. Extract route configuration:
   - `routes/index.tsx` - Route definitions
   - `routes/public.tsx` - Public routes
   - `routes/authenticated.tsx` - Authenticated routes
   - `routes/admin.tsx` - Admin routes
2. Extract app setup:
   - `AppProviders.tsx` - All context providers (QueryClient, Sidebar, etc.)
   - `AppLayout.tsx` - Layout components (Sidebar, ErrorBoundary, etc.)
3. Group imports by category (UI components, pages, hooks, etc.)

---

## 🟡 MEDIUM PRIORITY - Files 500-1000 Lines

### 7. `server/storage/types.ts` - **961 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **961 lines** (2x over limit)
- ✅ **Multiple responsibilities**: Interface definitions for all storage operations (core + 15 mini-apps)
- ✅ **Difficulty understanding**: Massive interface with 200+ method signatures

**Current Status:**
- This is a type definition file that defines the `IStorage` interface
- Contains method signatures for all storage operations

**Recommended Refactoring:**
1. Split interface into domain-specific interfaces:
   - `storage-types-core.ts` - Core operations interface
   - `storage-types-supportmatch.ts` - SupportMatch interface
   - `storage-types-lighthouse.ts` - Lighthouse interface
   - (etc. for each mini-app)
2. Create `storage-types.ts` that extends/combines all interfaces
3. Or use TypeScript's interface merging/extending features

---

### 8. `client/src/pages/mechanicmatch/admin-profiles.tsx` - **917 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **917 lines** (1.8x over limit)
- ✅ **Multiple responsibilities**: Profile management, search, filtering, CRUD operations

**Recommended Refactoring:**
1. Extract sub-components:
   - `MechanicMatchAdminProfileList.tsx`
   - `MechanicMatchAdminProfileForm.tsx`
   - `MechanicMatchAdminProfileFilters.tsx`
2. Extract hooks:
   - `useMechanicMatchAdminProfiles.ts`

---

### 9. `server/routes/mechanicmatch.routes.ts` - **833 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **833 lines** (1.7x over limit)
- ✅ **Multiple responsibilities**: Profile, vehicle, service request, job, availability, review, message, announcement routes

**Recommended Refactoring:**
1. Split into domain-specific route files:
   - `mechanicmatch-profile.routes.ts`
   - `mechanicmatch-vehicle.routes.ts`
   - `mechanicmatch-service.routes.ts`
   - `mechanicmatch-admin.routes.ts`

---

### 10. `client/src/pages/admin/skills.tsx` - **783 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **783 lines** (1.6x over limit)
- ✅ **Multiple responsibilities**: Skills, sectors, job titles management

**Recommended Refactoring:**
1. Extract into tabs/sections:
   - `SkillsManagement.tsx`
   - `SectorsManagement.tsx`
   - `JobTitlesManagement.tsx`

---

### 11. `client/src/pages/mechanicmatch/profile.tsx` - **744 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **744 lines** (1.5x over limit)
- ✅ **Multiple responsibilities**: Profile display, editing, vehicle management, availability

**Recommended Refactoring:**
1. Extract sub-components:
   - `MechanicMatchProfileView.tsx`
   - `MechanicMatchProfileEdit.tsx`
   - `MechanicMatchVehiclesSection.tsx`

---

### 12. `client/src/pages/admin/payments.tsx` - **744 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **744 lines** (1.5x over limit)
- ✅ **Multiple responsibilities**: Payment listing, filtering, search, details

**Recommended Refactoring:**
1. Extract sub-components:
   - `PaymentsList.tsx`
   - `PaymentFilters.tsx`
   - `PaymentDetails.tsx`

---

### 13. `client/src/pages/socketrelay/dashboard.tsx` - **743 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **743 lines** (1.5x over limit)
- ✅ **Multiple responsibilities**: Dashboard, request management, chat

**Recommended Refactoring:**
1. Extract sub-components:
   - `SocketRelayRequestList.tsx`
   - `SocketRelayChatSection.tsx`
   - `SocketRelayStats.tsx`

---

### 14. `client/src/pages/directory/profile.tsx` - **741 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **741 lines** (1.5x over limit)
- ✅ **Multiple responsibilities**: Profile display, editing, skills management

**Recommended Refactoring:**
1. Extract sub-components:
   - `DirectoryProfileView.tsx`
   - `DirectoryProfileEdit.tsx`
   - `DirectorySkillsSection.tsx`

---

### 15. `server/routes/chyme-rooms.routes.ts` - **679 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **679 lines** (1.4x over limit)
- ✅ **Multiple responsibilities**: Room management, messaging, scheduling

**Recommended Refactoring:**
1. Split into:
   - `chyme-rooms.routes.ts` - Room CRUD
   - `chyme-messages.routes.ts` - Messaging
   - `chyme-scheduling.routes.ts` - Room scheduling

---

### 16. `server/storage/mini-apps/supportmatch-storage.ts` - **667 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **667 lines** (1.3x over limit)
- ✅ **40+ methods** (per refactoring guide)

**Recommended Refactoring:**
1. Split into domain-specific modules:
   - `supportmatch-profile-storage.ts`
   - `supportmatch-partnership-storage.ts`
   - `supportmatch-message-storage.ts`
   - `supportmatch-admin-storage.ts`

---

### 17. `server/routes/research.routes.ts` - **656 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **656 lines** (1.3x over limit)
- ✅ **Multiple responsibilities**: Items, answers, comments, votes, bookmarks, reports

**Recommended Refactoring:**
1. Split into:
   - `research-items.routes.ts`
   - `research-interactions.routes.ts` (answers, comments, votes)
   - `research-admin.routes.ts`

---

### 18. `client/src/pages/user-payments.tsx` - **637 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **637 lines** (1.3x over limit)
- ✅ **Multiple responsibilities**: Payment history, subscription management

**Recommended Refactoring:**
1. Extract sub-components:
   - `PaymentHistory.tsx`
   - `SubscriptionDetails.tsx`

---

### 19. `client/src/pages/lighthouse/admin.tsx` - **636 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **636 lines** (1.3x over limit)
- ✅ **Multiple responsibilities**: Profile management, property management, admin operations

**Recommended Refactoring:**
1. Extract sub-components:
   - `LighthouseAdminProfiles.tsx`
   - `LighthouseAdminProperties.tsx`

---

### 20. `server/routes/socketrelay.routes.ts` - **626 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **626 lines** (1.3x over limit)
- ✅ **Multiple responsibilities**: Request, fulfillment, message, profile routes

**Recommended Refactoring:**
1. Split into:
   - `socketrelay-requests.routes.ts`
   - `socketrelay-messages.routes.ts`
   - `socketrelay-admin.routes.ts`

---

### 21. `server/storage/core/analytics-storage.ts` - **624 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **624 lines** (1.2x over limit)
- ✅ **Multiple responsibilities**: Analytics, metrics, performance tracking

**Recommended Refactoring:**
1. Split into:
   - `analytics-storage.ts` - Core analytics
   - `metrics-storage.ts` - Metrics calculations
   - `performance-storage.ts` - Performance tracking

---

### 22. `client/src/components/ui/sidebar.tsx` - **727 lines** ⚠️ MEDIUM

**Refactoring Indicators:**
- ✅ **727 lines** (1.5x over limit)
- ✅ **Multiple responsibilities**: Sidebar context, provider, components, mobile/desktop variants

**Recommended Refactoring:**
1. Split into:
   - `sidebar-context.tsx` - Context and provider
   - `sidebar-components.tsx` - UI components
   - `sidebar-hooks.ts` - Custom hooks

---

## 🟢 LOWER PRIORITY - Files 500-600 Lines

### 23. `client/src/pages/default-alive-or-dead/dashboard.tsx` - **596 lines**
### 24. `client/src/pages/workforce-recruiter/admin-occupations.tsx` - **593 lines**
### 25. `server/storage/mini-apps/research-storage.ts` - **771 lines**
### 26. `server/storage/mini-apps/mechanicmatch-storage.ts` - **747 lines**

**Recommended Refactoring:**
- Similar patterns as above: extract sub-components, hooks, and utilities

---

## 📊 Summary Statistics

### By Category

| Category | Files > 500 lines | Files > 1000 lines |
|----------|------------------|-------------------|
| **Server Routes** | 8 files | 1 file (routes.ts) |
| **Client Pages** | 12 files | 2 files |
| **Storage** | 5 files | 1 file |
| **Components** | 1 file | 0 files |
| **Total** | **26 files** | **4 files** |

### Refactoring Priority

1. **🔴 CRITICAL (4 files)**: > 1000 lines, immediate action needed
2. **🟡 HIGH (6 files)**: 750-1000 lines, should be refactored soon
3. **🟢 MEDIUM (16 files)**: 500-750 lines, consider refactoring

---

## 🎯 Recommended Refactoring Strategy

### Phase 1: Critical Files (Immediate)
1. Complete `server/routes.ts` extraction (highest priority)
2. Refactor `server/storage/composed-storage.ts`
3. Break down `client/src/pages/directory/admin.tsx`
4. Refactor `client/src/pages/admin/weekly-performance.tsx`

### Phase 2: High Priority Files
1. Split large route files (`lighthouse.routes.ts`, `mechanicmatch.routes.ts`)
2. Refactor large admin pages
3. Extract route configuration from `App.tsx`

### Phase 3: Medium Priority Files
1. Refactor remaining large pages
2. Split storage modules that exceed 500 lines
3. Extract components from large UI files

---

## 📝 Notes

- Some files (like `composed-storage.ts`) may be acceptable if they're auto-generated or follow a clear delegation pattern
- Route files can be large but should be split when they handle multiple domains
- Component files should prioritize readability and single responsibility
- Consider using code generation tools for repetitive delegation patterns

---

## ✅ Already Refactored

- ✅ `shared/schema/schema.ts` - Successfully split into domain modules (see `shared/schema/REFACTORING_SUMMARY.md`)
- ✅ `server/storage/storage.ts` - Split into modular structure (see `server/storage/REFACTORING_GUIDE.md`)
- ✅ Partial route extraction in `server/routes/` directory

