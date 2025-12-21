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

**Issues:**
- ✅ **744 lines** - Nearly 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Profile form, validation, country/state selectors, delete functionality
- ✅ **Complex form logic** - Multiple form fields with conditional rendering
- ✅ **Multiple state hooks** - useState for dialogs, dropdowns, copy state
- ✅ **Mixed concerns** - UI, validation, API calls, navigation all in one component

**Refactoring Recommendations:**
1. **Extract form components**:
   - `MechanicMatchProfileForm.tsx` (~300 lines) - Main form component
   - `MechanicMatchCountrySelector.tsx` (~100 lines) - Country dropdown
   - `MechanicMatchStateSelector.tsx` (~100 lines) - State dropdown
   - `MechanicMatchProfileHeader.tsx` (~80 lines) - Header with back button and actions
2. **Extract hooks**:
   - `useMechanicMatchProfile.ts` - Data fetching and mutations
   - `useMechanicMatchProfileForm.ts` - Form logic and validation
3. **Extract utilities**:
   - `mechanicMatchProfileUtils.ts` - Helper functions for form data transformation

**Target Structure:**
```
client/src/pages/mechanicmatch/
  profile.tsx (~150 lines) - Main component orchestrator
  components/
    MechanicMatchProfileForm.tsx
    MechanicMatchCountrySelector.tsx
    MechanicMatchStateSelector.tsx
    MechanicMatchProfileHeader.tsx
  hooks/
    useMechanicMatchProfile.ts
    useMechanicMatchProfileForm.ts
```

---

### 12. `client/src/pages/admin/payments.tsx` (744 lines)

**Issues:**
- ✅ **744 lines** - Nearly 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Payment listing, filtering, details view, actions
- ✅ **Complex state management** - Multiple filters, pagination, selection state
- ✅ **Mixed concerns** - Data fetching, UI rendering, business logic

**Refactoring Recommendations:**
1. **Extract components**:
   - `PaymentList.tsx` (~200 lines) - Payment table/list
   - `PaymentFilters.tsx` (~150 lines) - Filter controls
   - `PaymentDetailsDialog.tsx` (~150 lines) - Payment details modal
   - `PaymentActions.tsx` (~100 lines) - Action buttons (export, etc.)
2. **Extract hooks**:
   - `usePayments.ts` - Data fetching and filtering
   - `usePaymentFilters.ts` - Filter state management
3. **Extract utilities**:
   - `paymentUtils.ts` - Formatting, calculations, export logic

---

### 13. `client/src/pages/socketrelay/dashboard.tsx` (743 lines)

**Issues:**
- ✅ **743 lines** - Nearly 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Request listing, fulfillment listing, filtering, actions
- ✅ **Complex conditional rendering** - Different views based on user role and state
- ✅ **Multiple data sources** - Requests, fulfillments, messages

**Refactoring Recommendations:**
1. **Extract components**:
   - `SocketRelayRequestList.tsx` (~200 lines) - Request listing
   - `SocketRelayFulfillmentList.tsx` (~200 lines) - Fulfillment listing
   - `SocketRelayDashboardFilters.tsx` (~100 lines) - Filter controls
   - `SocketRelayQuickActions.tsx` (~100 lines) - Quick action buttons
2. **Extract hooks**:
   - `useSocketRelayDashboard.ts` - Data fetching and state
   - `useSocketRelayFilters.ts` - Filter logic
3. **Split by view**: Consider separate components for different dashboard views

---

### 14. `client/src/pages/directory/profile.tsx` (741 lines)

**Issues:**
- ✅ **741 lines** - Nearly 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Profile form, skills selector, sectors selector, job titles selector
- ✅ **Complex form logic** - Multiple interdependent selectors
- ✅ **Large component** - Many form fields and conditional sections

**Refactoring Recommendations:**
1. **Extract components**:
   - `DirectoryProfileForm.tsx` (~300 lines) - Main form
   - `DirectorySkillsSelector.tsx` (~150 lines) - Skills multi-select
   - `DirectorySectorsSelector.tsx` (~100 lines) - Sectors selector
   - `DirectoryJobTitlesSelector.tsx` (~100 lines) - Job titles selector
2. **Extract hooks**:
   - `useDirectoryProfile.ts` - Data fetching and mutations
   - `useDirectoryProfileForm.ts` - Form logic
3. **Extract utilities**:
   - `directoryProfileUtils.ts` - Skills/sectors/job titles helpers

---

### 15. `test/api/default-alive-or-dead.test.ts` (731 lines)

**Issues:**
- ✅ **731 lines** - Over 1.5x the 500 line limit
- ✅ **Multiple test suites** - Many test cases for different features
- ✅ **Large test file** - Hard to navigate and maintain

**Refactoring Recommendations:**
1. **Split by feature**: Create separate test files:
   - `default-alive-or-dead/profile.test.ts` - Profile tests
   - `default-alive-or-dead/items.test.ts` - Items tests
   - `default-alive-or-dead/admin.test.ts` - Admin tests
   - `default-alive-or-dead/announcements.test.ts` - Announcement tests
2. **Extract test utilities**: Create shared test helpers for common setup
3. **Use test fixtures**: Extract common test data to fixtures

**Target Structure:**
```
test/api/default-alive-or-dead/
  profile.test.ts (~200 lines)
  items.test.ts (~200 lines)
  admin.test.ts (~200 lines)
  announcements.test.ts (~100 lines)
  fixtures.ts - Shared test data
```

---

### 16. `client/src/components/ui/sidebar.tsx` (727 lines)

**Issues:**
- ✅ **727 lines** - Over 1.5x the 500 line limit
- ✅ **Multiple responsibilities** - Navigation menu, user menu, admin menu, conditional rendering
- ✅ **Complex navigation logic** - Multiple menu structures based on user role
- ✅ **Large component** - Many menu items and sections

**Refactoring Recommendations:**
1. **Extract components**:
   - `SidebarNavigation.tsx` (~200 lines) - Main navigation
   - `UserMenuSection.tsx` (~150 lines) - User menu items
   - `AdminMenuSection.tsx` (~150 lines) - Admin menu items
   - `SidebarHeader.tsx` (~100 lines) - Sidebar header
   - `SidebarFooter.tsx` (~80 lines) - Sidebar footer
2. **Extract navigation config**: Move menu items to configuration file
3. **Extract hooks**:
   - `useSidebarNavigation.ts` - Navigation state and logic

**Target Structure:**
```
client/src/components/ui/sidebar/
  index.tsx (~150 lines) - Main component
  SidebarNavigation.tsx
  UserMenuSection.tsx
  AdminMenuSection.tsx
  SidebarHeader.tsx
  SidebarFooter.tsx
  sidebarConfig.ts - Menu configuration
```

---

### 17. `server/routes/chyme-rooms.routes.ts` (682 lines)

**Issues:**
- ✅ **682 lines** - Over 1.3x the 500 line limit
- ✅ **Multiple responsibilities** - Rooms, participants, messages, admin operations
- ✅ **15+ route handlers** - Many function definitions
- ✅ **Complex route organization** - Multiple resource types

**Refactoring Recommendations:**
1. **Split by resource**: Create separate route files:
   - `chyme/rooms.routes.ts` (~200 lines) - Room CRUD operations
   - `chyme/participants.routes.ts` (~150 lines) - Participant management
   - `chyme/messages.routes.ts` (~150 lines) - Message operations
   - `chyme/admin.routes.ts` (~150 lines) - Admin operations
2. **Create route index**: `chyme/index.ts` to compose all routes
3. **Extract shared middleware**: Create shared middleware for common patterns
4. **Extract utilities**: Move room closure scheduling logic to separate module

**Target Structure:**
```
server/routes/chyme/
  index.ts (main route registration)
  rooms.routes.ts
  participants.routes.ts
  messages.routes.ts
  admin.routes.ts
  roomClosureScheduler.ts - Room closure logic
```

---

### 18. `server/storage/mini-apps/supportmatch-storage.ts` (667 lines)

**Issues:**
- ✅ **667 lines** - Over 1.3x the 500 line limit
- ✅ **30+ method definitions** - Many storage operations
- ✅ **Multiple responsibilities** - Profiles, partnerships, messages, exclusions, reports, announcements

**Refactoring Recommendations:**
1. **Split by domain**:
   - `supportmatch/profiles-storage.ts` (~150 lines) - Profile operations
   - `supportmatch/partnerships-storage.ts` (~150 lines) - Partnership operations
   - `supportmatch/messages-storage.ts` (~100 lines) - Message operations
   - `supportmatch/exclusions-storage.ts` (~80 lines) - Exclusion operations
   - `supportmatch/reports-storage.ts` (~100 lines) - Report operations
   - `supportmatch/announcements-storage.ts` (~80 lines) - Announcement operations
2. **Create composed class**: `supportmatch-storage.ts` that composes all sub-storages

**Target Structure:**
```
server/storage/mini-apps/supportmatch/
  index.ts - Composed storage class
  profiles-storage.ts
  partnerships-storage.ts
  messages-storage.ts
  exclusions-storage.ts
  reports-storage.ts
  announcements-storage.ts
```

---

### 19. `server/routes/research.routes.ts` (656 lines)

**Issues:**
- ✅ **656 lines** - Over 1.3x the 500 line limit
- ✅ **Multiple responsibilities** - Items, answers, comments, votes, bookmarks, follows, reports
- ✅ **20+ route handlers** - Many function definitions
- ✅ **Complex route organization** - Multiple nested resource types

**Refactoring Recommendations:**
1. **Split by resource**: Create separate route files:
   - `research/items.routes.ts` (~200 lines) - Item CRUD operations
   - `research/answers.routes.ts` (~150 lines) - Answer operations
   - `research/comments.routes.ts` (~100 lines) - Comment operations
   - `research/votes.routes.ts` (~80 lines) - Vote operations
   - `research/bookmarks.routes.ts` (~80 lines) - Bookmark operations
   - `research/follows.routes.ts` (~80 lines) - Follow operations
   - `research/reports.routes.ts` (~80 lines) - Report operations
2. **Create route index**: `research/index.ts` to compose all routes
3. **Extract shared middleware**: Create shared middleware for common patterns

**Target Structure:**
```
server/routes/research/
  index.ts (main route registration)
  items.routes.ts
  answers.routes.ts
  comments.routes.ts
  votes.routes.ts
  bookmarks.routes.ts
  follows.routes.ts
  reports.routes.ts
```

---

### 20. `client/src/routes/mini-app-routes.tsx` (644 lines)

**Issues:**
- ✅ **644 lines** - Over 1.2x the 500 line limit
- ✅ **Multiple responsibilities** - Route definitions for all mini-apps
- ✅ **Large route configuration** - Many route entries
- ✅ **Hard to maintain** - Adding new routes requires editing large file

**Refactoring Recommendations:**
1. **Split by mini-app**: Create separate route files for each mini-app:
   - `routes/supportmatch.routes.tsx` (~80 lines)
   - `routes/lighthouse.routes.tsx` (~80 lines)
   - `routes/mechanicmatch.routes.tsx` (~80 lines)
   - `routes/socketrelay.routes.tsx` (~80 lines)
   - `routes/directory.routes.tsx` (~80 lines)
   - `routes/research.routes.tsx` (~80 lines)
   - `routes/trusttransport.routes.tsx` (~80 lines)
   - `routes/chyme.routes.tsx` (~80 lines)
   - `routes/chatgroups.routes.tsx` (~80 lines)
   - `routes/gentlepulse.routes.tsx` (~80 lines)
   - `routes/workforce-recruiter.routes.tsx` (~80 lines)
   - `routes/blog.routes.tsx` (~80 lines)
   - `routes/default-alive-or-dead.routes.tsx` (~80 lines)
   - `routes/lostmail.routes.tsx` (~80 lines)
2. **Create route index**: `routes/index.tsx` to compose all mini-app routes
3. **Extract route configuration**: Move route definitions to configuration objects

**Target Structure:**
```
client/src/routes/
  index.tsx (~100 lines) - Main route composer
  mini-apps/
    supportmatch.routes.tsx
    lighthouse.routes.tsx
    mechanicmatch.routes.tsx
    ... (one per mini-app)
```

---

### 21. `client/src/pages/user-payments.tsx` (637 lines)

**Issues:**
- ✅ **637 lines** - Over 1.2x the 500 line limit
- ✅ **Multiple responsibilities** - Payment listing, filtering, form, actions
- ✅ **Complex state management** - Filters, pagination, form state
- ✅ **Mixed concerns** - Data fetching, UI rendering, business logic

**Refactoring Recommendations:**
1. **Extract components**:
   - `UserPaymentList.tsx` (~200 lines) - Payment list/table
   - `UserPaymentForm.tsx` (~200 lines) - Payment creation form
   - `UserPaymentFilters.tsx` (~100 lines) - Filter controls
2. **Extract hooks**:
   - `useUserPayments.ts` - Data fetching and mutations
   - `usePaymentForm.ts` - Form logic
3. **Extract utilities**:
   - `paymentUtils.ts` - Formatting and calculations

---

### 22. `client/src/pages/lighthouse/admin.tsx` (636 lines)

**Issues:**
- ✅ **636 lines** - Over 1.2x the 500 line limit
- ✅ **Multiple responsibilities** - Profile management, property management, match management
- ✅ **Complex component** - Multiple admin sections
- ✅ **Multiple state management** - State for different admin operations

**Refactoring Recommendations:**
1. **Extract components**:
   - `LighthouseAdminProfiles.tsx` (~200 lines) - Profile management
   - `LighthouseAdminProperties.tsx` (~200 lines) - Property management
   - `LighthouseAdminMatches.tsx` (~150 lines) - Match management
   - `LighthouseAdminTabs.tsx` (~80 lines) - Tab navigation
2. **Extract hooks**:
   - `useLighthouseAdmin.ts` - Data fetching and state
3. **Split into separate pages**: Consider separate admin pages for each section

---

### 23. `server/routes/socketrelay.routes.ts` (626 lines)

**Issues:**
- ✅ **626 lines** - Over 1.2x the 500 line limit
- ✅ **Multiple responsibilities** - Requests, fulfillments, messages, announcements
- ✅ **15+ route handlers** - Many function definitions
- ✅ **Complex route organization** - Multiple resource types

**Refactoring Recommendations:**
1. **Split by resource**: Create separate route files:
   - `socketrelay/requests.routes.ts` (~200 lines) - Request operations
   - `socketrelay/fulfillments.routes.ts` (~150 lines) - Fulfillment operations
   - `socketrelay/messages.routes.ts` (~150 lines) - Message operations
   - `socketrelay/announcements.routes.ts` (~100 lines) - Announcement operations
2. **Create route index**: `socketrelay/index.ts` to compose all routes
3. **Extract shared middleware**: Create shared middleware for common patterns

**Target Structure:**
```
server/routes/socketrelay/
  index.ts (main route registration)
  requests.routes.ts
  fulfillments.routes.ts
  messages.routes.ts
  announcements.routes.ts
```

---

### 24. `server/storage/core/analytics-storage.ts` (624 lines)

**Issues:**
- ✅ **624 lines** - Over 1.2x the 500 line limit
- ✅ **25+ method definitions** - Many analytics operations
- ✅ **Multiple responsibilities** - Different analytics domains (users, payments, mini-apps, etc.)
- ✅ **Complex query logic** - Many SQL queries with aggregations

**Refactoring Recommendations:**
1. **Split by analytics domain**:
   - `analytics/user-analytics-storage.ts` (~150 lines) - User analytics
   - `analytics/payment-analytics-storage.ts` (~150 lines) - Payment analytics
   - `analytics/mini-app-analytics-storage.ts` (~200 lines) - Mini-app analytics
   - `analytics/general-analytics-storage.ts` (~100 lines) - General analytics
2. **Create composed class**: `analytics-storage.ts` that composes all sub-storages
3. **Extract query builders**: Create reusable query builder utilities

**Target Structure:**
```
server/storage/core/analytics/
  index.ts - Composed storage class
  user-analytics-storage.ts
  payment-analytics-storage.ts
  mini-app-analytics-storage.ts
  general-analytics-storage.ts
  query-builders.ts - Reusable query utilities
```

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

