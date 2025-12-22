# Platform Gaps Analysis

**Generated:** 2025-01-22  
**Scope:** Platform folder (server routes, storage, and backend logic)  
**Purpose:** Identify TODOs, stubs, partially wired flows, and concrete gaps in logic and behavior

---

## Executive Summary

This analysis identifies **critical gaps**, **incomplete implementations**, and **fragile areas** in the platform backend. The findings are organized by severity and category to help prioritize fixes.

---

## 🔴 Critical Gaps (Must Fix)

### 1. Empty `deleteUser` Implementation in CoreStorageComposed
**Location:** `platform/server/storage/composed/core-storage-composed.ts:162-164`

```typescript
async deleteUser(userId: string) {
  // EMPTY - No implementation
}
```

**Impact:** User account deletion will fail silently or throw errors when called through the composed storage layer.

**Fix Required:** Implement the method to call `this.coreStorage.deleteUser(userId)`.

---

### 2. Missing `getDefaultAliveOrDeadEbitdaSnapshot` Implementation
**Location:** `platform/server/storage/composed/core-storage-composed.ts:168-171`

```typescript
private async getDefaultAliveOrDeadEbitdaSnapshot(weekStart: Date) {
  // This will be provided by the main DatabaseStorage class
  throw new Error('getDefaultAliveOrDeadEbitdaSnapshot must be provided by DatabaseStorage');
}
```

**Impact:** Weekly Performance Review will fail when trying to fetch EBITDA snapshots. The method is called via closure in `getWeeklyPerformanceReview` but throws an error instead of delegating.

**Fix Required:** 
- The method should delegate to `this.miniAppsStorageComposed.getDefaultAliveOrDeadEbitdaSnapshot(weekStart)` 
- OR the closure should be updated to use the correct storage instance

**Note:** The actual implementation exists in `default-alive-or-dead-storage.ts`, but the composed layer doesn't wire it correctly.

---

### 3. Webhook Signature Verification (Partially Complete)
**Location:** `platform/server/routes/webhooks.routes.ts`

**Status:** ✅ **FIXED** - Webhook signature verification is now implemented using `svix`.

**Previous Issue:** The archived `routes.ts.backup` file shows a TODO comment indicating webhook verification was missing, but this has been resolved in the current `webhooks.routes.ts` file.

---

## 🟡 Incomplete Implementations

### 4. Route Extraction Script TODO
**Location:** `platform/server/routes/extract_routes.py:105`

```python
# TODO: Add schema imports from "@shared/schema" as needed
```

**Impact:** Low - This is a helper script used during refactoring. The actual routes have been extracted and are working.

**Status:** Script is kept for reference but is no longer actively used.

---

### 5. Generic Error Messages in User Storage
**Location:** `platform/server/storage/core/user-storage.ts`

Multiple locations throw generic `Error("User not found")` instead of using the `NotFoundError` class:
- Line 165: `throw new Error("User not found");`
- Line 223: `throw new Error("User not found");`
- Line 267: `throw new Error("User not found");`

**Impact:** Medium - These errors won't be properly categorized by error handlers and may not return appropriate HTTP status codes.

**Fix Required:** Replace with `throw new NotFoundError("User");`

---

## 🟢 Fragile Areas (Need Attention)

### 6. Missing Mini-App Profile Deletions in `deleteUserAccount`
**Location:** `platform/server/storage/composed-storage.ts:566-574`

**Current Implementation:**
```typescript
const profileDeletions = [
  { name: "SupportMatch", deleteFn: () => this.deleteSupportMatchProfile(userId, reason) },
  { name: "Lighthouse", deleteFn: () => this.deleteLighthouseProfile(userId, reason) },
  { name: "SocketRelay", deleteFn: () => this.deleteSocketrelayProfile(userId, reason) },
  { name: "Directory", deleteFn: () => this.deleteDirectoryProfileWithCascade(userId, reason) },
  { name: "TrustTransport", deleteFn: () => this.deleteTrusttransportProfile(userId, reason) },
  { name: "MechanicMatch", deleteFn: () => this.deleteMechanicmatchProfile(userId, reason) },
  { name: "WorkforceRecruiter", deleteFn: () => this.deleteWorkforceRecruiterProfile(userId, reason) },
];
```

**Missing Mini-Apps:**
- Research
- GentlePulse
- Chyme
- ChatGroups
- LostMail
- Blog
- DefaultAliveOrDead

**Impact:** High - User account deletion will not clean up profiles in these mini-apps, leading to orphaned data and potential foreign key constraint violations.

**Fix Required:** Add deletion methods for all remaining mini-apps to the `profileDeletions` array.

---

### 7. Incomplete User Data Anonymization
**Location:** `platform/server/storage/core/user-deletion-storage.ts:25-74`

**Current Coverage:**
- ✅ loginEvents
- ✅ otpCodes
- ✅ authTokens
- ✅ payments
- ✅ adminActionLogs
- ✅ npsResponses
- ✅ gentlepulseMoodChecks

**Missing Tables:**
- Pricing tiers (if they reference users)
- All mini-app profile tables (handled separately, but should be verified)
- Any other tables with foreign keys to `users.id`

**Impact:** Medium - Some user data may not be properly anonymized before deletion.

**Fix Required:** Audit all tables with foreign keys to `users.id` and ensure they're included in anonymization.

---

### 8. Error Handling Inconsistencies
**Location:** Multiple route files

**Pattern Found:** Some routes use `throw new Error()` while others use proper error classes (`NotFoundError`, `ValidationError`, `ForbiddenError`).

**Examples:**
- `platform/server/routes/research.routes.ts:630` - `throw new Error(\`Answer ${answerId} not found\`)`
- `platform/server/routes/admin.routes.ts:50` - `throw new Error("Invalid weekStart date format")`

**Impact:** Medium - Inconsistent error handling makes it harder to:
- Return appropriate HTTP status codes
- Log errors with proper context
- Handle errors consistently in the frontend

**Fix Required:** Standardize error handling across all routes to use appropriate error classes.

---

## 🔵 Partially Wired Flows

### 9. Weekly Performance Review Dependency Chain
**Location:** `platform/server/storage/composed/core-storage-composed.ts:132-138`

The `getWeeklyPerformanceReview` method uses closures to pass dependencies:
```typescript
async getWeeklyPerformanceReview(weekStart: Date) {
  return this.coreStorage.getWeeklyPerformanceReview(
    weekStart,
    (weekStart: Date, weekEnd: Date) => this.getNpsResponsesForWeek(weekStart, weekEnd),
    (weekStart: Date) => this.getDefaultAliveOrDeadEbitdaSnapshot(weekStart) // ❌ This throws an error
  );
}
```

**Issue:** The third parameter (`getDefaultAliveOrDeadEbitdaSnapshot`) throws an error instead of delegating properly.

**Impact:** Medium - Weekly Performance Review will fail when trying to fetch EBITDA data.

**Fix Required:** Update the closure to delegate to the correct storage instance:
```typescript
(weekStart: Date) => this.miniAppsStorageComposed.getDefaultAliveOrDeadEbitdaSnapshot(weekStart)
```

**Note:** This requires access to `miniAppsStorageComposed` in `CoreStorageComposed`, which may require architectural changes.

---

### 10. Route Handler Incomplete Patterns
**Location:** Multiple route files

Some route handlers have incomplete error handling or missing validation:

**Example in `mechanicmatch-service-request.routes.ts`:**
- Missing validation for service request updates
- No check for service request status before allowing updates

**Example in `research.routes.ts`:**
- Generic error messages instead of specific error types
- Some routes may not handle edge cases (e.g., deleted items)

**Impact:** Low to Medium - Routes may fail unexpectedly or provide poor error messages.

**Fix Required:** Audit each route file for:
- Proper validation using Zod schemas
- Appropriate error types
- Edge case handling
- Consistent error responses

---

## 📋 TODO Items Found

### 11. Schema Import TODOs
**Location:** `platform/server/routes/extract_routes.py:105`

```python
# TODO: Add schema imports from "@shared/schema" as needed
```

**Status:** Low priority - This is in a refactoring helper script that's no longer actively used.

---

### 12. Webhook Verification (Historical)
**Location:** `platform/server/routes.ts.backup:277`

```typescript
// TODO: Add webhook signature verification using CLERK_WEBHOOK_SECRET
```

**Status:** ✅ **RESOLVED** - Webhook verification is now implemented in `webhooks.routes.ts`.

---

## 🛡️ Security & Validation Gaps

### 13. Missing Rate Limiting on Some Routes
**Location:** Various route files

**Pattern:** Some public routes may not have rate limiting applied.

**Examples to Check:**
- Public announcement endpoints
- Public listing endpoints
- Anonymous submission endpoints (e.g., LostMail incidents, GentlePulse ratings)

**Impact:** Medium - Potential for abuse or scraping.

**Fix Required:** Audit all public routes and ensure appropriate rate limiting is applied.

---

### 14. CSRF Token Validation Gaps
**Location:** Admin routes

**Pattern:** Some admin routes may not validate CSRF tokens.

**Impact:** Medium - Potential for CSRF attacks on admin operations.

**Fix Required:** Ensure all admin routes that modify data use `isAdminWithCsrf` middleware and validate CSRF tokens.

---

## 📊 Data Integrity Concerns

### 15. Foreign Key Cascade Deletion
**Location:** User deletion flow

**Issue:** When deleting a user account, related data in mini-apps should be deleted, but the current implementation may not handle all relationships.

**Current Approach:**
- Mini-app profiles are deleted individually
- Core tables are anonymized (not deleted)
- Some relationships may not be properly handled

**Impact:** High - Orphaned data or foreign key constraint violations.

**Fix Required:**
- Verify all foreign key relationships are handled
- Consider using database-level CASCADE DELETE where appropriate
- Ensure all mini-apps are included in deletion flow

---

### 16. Transaction Safety
**Location:** `deleteUserAccount` and other multi-step operations

**Issue:** The `deleteUserAccount` method performs multiple operations without transaction safety:
1. Delete mini-app profiles (multiple async operations)
2. Anonymize core data
3. Log deletion
4. Delete user account

**Impact:** Medium - If any step fails, the system may be left in an inconsistent state.

**Fix Required:** Consider wrapping critical operations in database transactions where possible, or implement a rollback mechanism.

---

## 🔧 Architectural Issues

### 17. Storage Composition Pattern
**Location:** `platform/server/storage/composed/`

**Issue:** The storage composition pattern creates complex dependency chains:
- `DatabaseStorage` → `CoreStorageComposed` → `CoreStorage`
- `DatabaseStorage` → `MiniAppsStorageComposed` → Individual storage classes
- `CoreStorageComposed` needs access to `MiniAppsStorageComposed` for `getDefaultAliveOrDeadEbitdaSnapshot`

**Impact:** Medium - Makes it harder to wire dependencies correctly and can lead to circular dependency issues.

**Fix Required:** Consider refactoring to:
- Use dependency injection
- Create a shared context object
- Simplify the composition pattern

---

### 18. Error Type Inconsistencies
**Location:** Throughout codebase

**Issue:** Mix of error types:
- Generic `Error` objects
- Custom error classes (`NotFoundError`, `ValidationError`, etc.)
- String error messages

**Impact:** Low to Medium - Makes error handling and logging inconsistent.

**Fix Required:** Standardize on custom error classes and ensure all errors are properly typed.

---

## 📝 Recommendations Priority

### Immediate (P0)
1. ✅ Fix empty `deleteUser` in `CoreStorageComposed`
2. ✅ Fix `getDefaultAliveOrDeadEbitdaSnapshot` delegation
3. ✅ Add missing mini-app profile deletions to `deleteUserAccount`

### High Priority (P1)
4. Replace generic `Error` with `NotFoundError` in user storage
5. Complete user data anonymization audit
6. Fix weekly performance review dependency chain
7. Standardize error handling across routes

### Medium Priority (P2)
8. Audit and add rate limiting to all public routes
9. Verify CSRF token validation on all admin routes
10. Implement transaction safety for critical operations
11. Audit foreign key relationships for deletion flow

### Low Priority (P3)
12. Refactor storage composition pattern
13. Standardize error types across codebase
14. Clean up TODO comments in helper scripts

---

## 📚 Related Documentation

- `platform/SCHEMA_FIX_SUMMARY.md` - Previous fixes for missing implementations
- `platform/CRITICAL_REFACTORING_COMPLETE.md` - Refactoring status
- `platform/server/storage/REFACTORING_GUIDE.md` - Storage refactoring guide
- `platform/server/routes/ROUTE_EXTRACTION_GUIDE.md` - Route extraction status

---

## 🔍 How to Use This Document

1. **For Immediate Fixes:** Focus on P0 items that will cause runtime errors
2. **For Code Quality:** Address P1 items to improve maintainability
3. **For Security:** Review P2 security-related items
4. **For Long-term:** Consider P3 architectural improvements

Each item includes:
- **Location:** Exact file and line numbers
- **Impact:** Severity and what breaks
- **Fix Required:** Specific steps to resolve

---

**Last Updated:** 2025-01-22  
**Next Review:** After addressing P0 and P1 items


