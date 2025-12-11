# Comprehensive Testing Plan

This document outlines a comprehensive testing strategy for the secure platform serving survivors of human trafficking. Given the critical nature of this application, testing must be thorough, covering all aspects of functionality, security, usability, and reliability.

---

## Table of Contents

1. [Functional Testing](#functional-testing)
2. [Usability Testing](#usability-testing)
3. [Performance Testing](#performance-testing)
4. [Security Testing](#security-testing)
5. [AI Model Evaluation](#ai-model-evaluation)
6. [Regression Testing](#regression-testing)
7. [Integration Testing](#integration-testing)
8. [Test Tools and Frameworks](#test-tools-and-frameworks)
9. [Test Execution Strategy](#test-execution-strategy)

---

## 1. Functional Testing

### 1.1 Authentication & Authorization

#### Test Cases

**TC-AUTH-001: Login Flow**
- **Description**: Verify successful login via Replit OIDC
- **Preconditions**: Valid Replit account
- **Steps**:
  1. Navigate to landing page
  2. Click login button
  3. Complete OIDC authentication flow
  4. Verify redirect to home page
- **Expected**: User is authenticated, session created, user object available via `/api/auth/user`
- **Acceptance Criteria**:
  - ✅ HTTP-only session cookie set
  - ✅ User data returned from `/api/auth/user`
  - ✅ Token refresh mechanism works (if token expired)
  - ✅ Session stored in PostgreSQL

**TC-AUTH-002: User Approval**
- **Description**: Authenticated user without approval must wait for admin approval
- **Preconditions**: Authenticated user with `isApproved = false`
- **Steps**:
  1. Attempt to access `/home` or any mini-app
  2. Verify "Access Pending" message is shown
  3. Admin approves user via `/admin/users`
  4. User refreshes or navigates
- **Expected**: User can access features after approval
- **Acceptance Criteria**:
  - ✅ Unapproved users see "Access Pending" message
  - ✅ Approved users can access all features
  - ✅ Admin can approve/revoke access via UI
  - ✅ Admin action logged when approval status changes

**TC-AUTH-003: Authorization Levels**
- **Description**: Verify access control for different user roles
- **Test Matrix**:
  | Role | Landing | Home | Mini-Apps | Admin |
  |------|---------|------|-----------|-------|
  | Unauthenticated | ✅ | ❌ | ❌ | ❌ |
  | Authenticated (not approved) | ✅ | ❌ | ❌ | ❌ |
  | Authenticated (approved) | ✅ | ✅ | ✅ | ❌ |
  | Admin | ✅ | ✅ | ✅ | ✅ |
- **Acceptance Criteria**:
  - ✅ Unauthorized access returns 401/403 with clear error
  - ✅ Frontend routing prevents access to unauthorized pages
  - ✅ API endpoints enforce `isAuthenticated` and `isAdmin` middleware
  - ✅ Admin actions logged in `admin_action_logs` table

**TC-AUTH-004: Session Management**
- **Description**: Verify session expiration and refresh
- **Steps**:
  1. Login successfully
  2. Wait for token expiration (or simulate expired token)
  3. Make API request
  4. Verify token refresh
- **Expected**: Session automatically refreshed, user remains logged in
- **Acceptance Criteria**:
  - ✅ Expired tokens trigger refresh
  - ✅ Invalid refresh tokens log user out
  - ✅ Session persistence across page reloads
  - ✅ Logout clears session cookie

**TC-AUTH-005: Logout Flow**
- **Description**: Verify complete logout and session cleanup
- **Steps**:
  1. Login as authenticated user
  2. Navigate to logout button
  3. Click logout
  4. Verify redirect to landing page
- **Expected**: Session destroyed, cookie cleared, redirect to landing
- **Acceptance Criteria**:
  - ✅ Session removed from database
  - ✅ Cookie cleared (HTTP-only flag respected)
  - ✅ OIDC end session URL called
  - ✅ User redirected to landing page

### 1.2 Mini-App Functionality

#### SupportMatch

**TC-SM-001: Profile Creation**
- **Description**: Create SupportMatch profile
- **Steps**:
  1. Navigate to `/apps/supportmatch`
  2. Click "Create Profile" or navigate to `/apps/supportmatch/profile`
  3. Fill required fields (preferences, availability, etc.)
  4. Submit form
- **Expected**: Profile created, user redirected to dashboard
- **Acceptance Criteria**:
  - ✅ All required fields validated (Zod schema)
  - ✅ Profile stored in `supportmatch_profiles` table
  - ✅ User ID linked correctly
  - ✅ Timestamps set (createdAt, updatedAt)
  - ✅ Success toast shown

**TC-SM-002: Profile Update**
- **Description**: Update existing SupportMatch profile
- **Preconditions**: User has existing profile
- **Steps**:
  1. Navigate to `/apps/supportmatch/profile`
  2. Modify profile fields
  3. Submit form
- **Expected**: Profile updated, `updatedAt` timestamp changed
- **Acceptance Criteria**:
  - ✅ Partial updates allowed (not all fields required)
  - ✅ `updatedAt` timestamp updated
  - ✅ Validation still enforced
  - ✅ Changes reflected immediately in UI

**TC-SM-003: Profile Deletion with Cascade**
- **Description**: Delete SupportMatch profile and anonymize related data
- **Preconditions**: User has profile with related data (partnerships, messages)
- **Steps**:
  1. Navigate to profile page
  2. Click "Delete Profile" button
  3. Confirm deletion in dialog
  4. Optional: Provide reason
- **Expected**: Profile deleted, related data anonymized
- **Acceptance Criteria**:
  - ✅ Profile removed from `supportmatch_profiles`
  - ✅ Related partnerships anonymized (userId → `deleted_user_[random]`)
  - ✅ Messages anonymized
  - ✅ Exclusion records anonymized
  - ✅ Report records anonymized
  - ✅ Deletion logged in `profile_deletions` table
  - ✅ User redirected to dashboard

**TC-SM-004: Matching Algorithm**
- **Description**: Verify matching algorithm returns compatible partners
- **Preconditions**: Multiple users with profiles and preferences
- **Steps**:
  1. Navigate to dashboard
  2. View potential matches
  3. Verify match compatibility
- **Expected**: Matches respect user preferences, exclusions, availability
- **Acceptance Criteria**:
  - ✅ Excluded users not shown
  - ✅ Inactive/incomplete profiles excluded
  - ✅ Preferences matched (timezone, availability, etc.)
  - ✅ Matches ordered by compatibility score

**TC-SM-005: Partnership Management**
- **Description**: Create, view, and manage partnerships
- **Steps**:
  1. Request partnership from match
  2. Accept partnership request
  3. View partnership details
  4. End partnership
- **Expected**: Partnership lifecycle works correctly
- **Acceptance Criteria**:
  - ✅ Partnership requests created
  - ✅ Status transitions (pending → active → ended)
  - ✅ Both users can view partnership
  - ✅ Ending partnership updates status and timestamp

**TC-SM-006: Messaging System**
- **Description**: Send and receive messages within partnerships
- **Steps**:
  1. Open partnership conversation
  2. Send message
  3. Verify message appears for recipient
- **Expected**: Messages delivered, stored, and displayed correctly
- **Acceptance Criteria**:
  - ✅ Messages stored in `supportmatch_messages` table
  - ✅ Messages only visible to partnership participants
  - ✅ Timestamps accurate
  - ✅ Real-time updates (if WebSocket implemented)

**TC-SM-007: Safety Features**
- **Description**: Test exclusions, reporting, and block functionality
- **Test Cases**:
  - **TC-SM-007a**: Add user to exclusions list
  - **TC-SM-007b**: Report user (creates report record)
  - **TC-SM-007c**: Verify excluded users don't appear in matches
  - **TC-SM-007d**: Verify reports visible to admins
- **Acceptance Criteria**:
  - ✅ Exclusions prevent matching
  - ✅ Reports stored with all metadata
  - ✅ Admin can view and act on reports
  - ✅ Safety features accessible from multiple entry points

#### LightHouse

**TC-LH-001: Dual Role System**
- **Description**: User can be both seeker and host
- **Steps**:
  1. Create seeker profile
  2. Create host profile
  3. Verify dashboard shows both roles
- **Expected**: Dashboard conditionally shows seeker/host content
- **Acceptance Criteria**:
  - ✅ Seeker profile and host profile can coexist
  - ✅ Dashboard shows appropriate content based on roles
  - ✅ Navigation adjusts based on active role

**TC-LH-002: Property Management**
- **Description**: Host can create, update, and delete properties
- **Steps**:
  1. Navigate to "My Properties"
  2. Create new property listing
  3. Update property details
  4. Delete property
- **Expected**: Property CRUD operations work correctly
- **Acceptance Criteria**:
  - ✅ Properties stored with correct host association
  - ✅ Required fields validated
  - ✅ Images/attachments handled (if applicable)
  - ✅ Property visibility settings work

**TC-LH-003: Match Requests**
- **Description**: Seeker can request match with property, host can accept/decline
- **Steps**:
  1. Seeker browses properties
  2. Request match with property
  3. Host views request
  4. Host accepts/declines
- **Expected**: Match request flow works end-to-end
- **Acceptance Criteria**:
  - ✅ Match requests created with correct associations
  - ✅ Status transitions work (pending → accepted/declined)
  - ✅ Notifications (if implemented)
  - ✅ Seeker can view request status

#### SocketRelay

**TC-SR-001: Request/Fulfillment Flow**
- **Description**: User creates request, another user fulfills it
- **Steps**:
  1. Create request (public or private)
  2. Another user views request
  3. Fulfill request
  4. Verify status update
- **Expected**: Request lifecycle completes successfully
- **Acceptance Criteria**:
  - ✅ Requests stored with correct privacy settings
  - ✅ Public requests visible on public list
  - ✅ Fulfillment updates request status
  - ✅ Messaging available between requester and fulfiller

#### Directory

**TC-DIR-001: Public/Private Profiles**
- **Description**: Users can toggle profile visibility
- **Steps**:
  1. Create directory profile
  2. Toggle public/private setting
  3. Verify public list reflects setting
- **Expected**: Privacy settings respected
- **Acceptance Criteria**:
  - ✅ Private profiles not shown in public list
  - ✅ Public profiles visible with correct data
  - ✅ Privacy toggle updates immediately

#### ChatGroups

**TC-CG-001: Group Management**
- **Description**: Admin can manage Signal group links
- **Steps**:
  1. Admin creates group entry
  2. Sets active/inactive status
  3. Public list shows active groups
- **Expected**: Group management works correctly
- **Acceptance Criteria**:
  - ✅ Groups created/updated/deleted
  - ✅ Active groups appear in public list
  - ✅ External links use confirmation dialog
  - ✅ Group metadata stored correctly

### 1.3 Admin Functionality

**TC-ADMIN-001: User Management**
- **Description**: Admin can view, manage, and moderate users
- **Steps**:
  1. Navigate to admin dashboard
  2. View user list
  3. View user details
  4. Perform admin action (ban, verify, etc.)
- **Expected**: Admin actions execute and log correctly
- **Acceptance Criteria**:
  - ✅ User list displays all users
  - ✅ User details complete
  - ✅ Admin actions update user state
  - ✅ Actions logged in `admin_action_logs`

**TC-ADMIN-002: Moderation Tools**
- **Description**: Admin can moderate content and partnerships
- **Test Cases**:
  - View reports
  - Moderate partnerships (suspend, approve)
  - Moderate user-generated content
  - View activity logs
- **Acceptance Criteria**:
  - ✅ Reports accessible and actionable
  - ✅ Moderation actions take effect immediately
  - ✅ All actions logged with metadata

**TC-ADMIN-003: Anti-Scraping Monitoring**
- **Description**: Admin can view suspicious activity patterns
- **Steps**:
  1. Navigate to anti-scraping patterns endpoint
  2. View patterns by IP
  3. Clear patterns if needed
- **Expected**: Monitoring data accessible and accurate
- **Acceptance Criteria**:
  - ✅ Patterns display correctly
  - ✅ Filtering by IP works
  - ✅ Clearing patterns works
  - ✅ Data refreshed in real-time

### 1.4 Data Validation

**TC-VAL-001: Zod Schema Validation**
- **Description**: All API endpoints validate input with Zod
- **Test Cases**:
  - Submit invalid data types
  - Submit missing required fields
  - Submit data exceeding max length
  - Submit invalid enum values
- **Expected**: Validation errors returned with clear messages
- **Acceptance Criteria**:
  - ✅ 400 status code for invalid input
  - ✅ Error message describes validation failure
  - ✅ No database writes on validation failure
  - ✅ Frontend forms show validation errors

**TC-VAL-002: SQL Injection Prevention**
- **Description**: Verify Drizzle ORM prevents SQL injection
- **Steps**:
  1. Attempt SQL injection via form inputs
  2. Attempt SQL injection via URL parameters
  3. Attempt SQL injection via API body
- **Expected**: Injection attempts fail safely
- **Acceptance Criteria**:
  - ✅ All queries use parameterized statements
  - ✅ No raw SQL strings with user input
  - ✅ Injection attempts return validation errors, not SQL errors

**TC-VAL-003: XSS Prevention**
- **Description**: User input sanitized to prevent XSS
- **Steps**:
  1. Submit script tags in text fields
  2. Submit HTML in content fields
  3. Verify output is escaped
- **Expected**: Scripts not executed, HTML escaped
- **Acceptance Criteria**:
  - ✅ React automatically escapes content
  - ✅ No `dangerouslySetInnerHTML` with user content
  - ✅ Rich text editors sanitize input (if used)

### 1.5 Public Endpoints

**TC-PUB-001: Public Listing with Anti-Scraping**
- **Description**: Public endpoints implement rate limiting and obfuscation
- **Test Cases**:
  - **TC-PUB-001a**: Rate limiting enforced (10 req/15min for listings)
  - **TC-PUB-001b**: Display order rotation works (shuffles every 5 min)
  - **TC-PUB-001c**: Bot detection triggers delays
  - **TC-PUB-001d**: Fingerprinting tracks suspicious patterns
- **Expected**: Scraping attempts detected and slowed
- **Acceptance Criteria**:
  - ✅ Rate limiters return 429 when exceeded
  - ✅ Order rotation uses time-based seeding
  - ✅ Bot-like requests receive longer delays
  - ✅ Suspicious patterns logged

---

## 2. Usability Testing

### 2.1 Accessibility (WCAG AAA)

**TC-ACC-001: Keyboard Navigation**
- **Description**: All functionality accessible via keyboard
- **Steps**:
  1. Navigate entire app using only Tab, Enter, Space, Arrow keys
  2. Verify focus indicators visible
  3. Verify skip links work
- **Expected**: No mouse required for any action
- **Acceptance Criteria**:
  - ✅ All interactive elements focusable
  - ✅ Focus order logical and intuitive
  - ✅ Focus indicators meet 3:1 contrast ratio
  - ✅ Skip links present on long pages
  - ✅ Modals/dialogs trap focus

**TC-ACC-002: Screen Reader Compatibility**
- **Description**: App works with screen readers (NVDA, JAWS, VoiceOver)
- **Steps**:
  1. Navigate app with screen reader
  2. Verify all content announced
  3. Verify form labels associated
  4. Verify ARIA labels present where needed
- **Expected**: Screen reader users can complete all tasks
- **Acceptance Criteria**:
  - ✅ All images have alt text
  - ✅ Form inputs have associated labels
  - ✅ ARIA roles and properties used correctly
  - ✅ Dynamic content updates announced
  - ✅ Error messages associated with inputs

**TC-ACC-003: Color Contrast**
- **Description**: All text meets WCAG AAA contrast requirements (7:1)
- **Steps**:
  1. Test all text/background combinations
  2. Verify contrast ratios ≥ 7:1
  3. Test in light and dark modes (if applicable)
- **Expected**: All text readable
- **Acceptance Criteria**:
  - ✅ Primary text: 7:1 contrast minimum
  - ✅ Secondary text: 7:1 contrast minimum
  - ✅ UI components (buttons, inputs): 7:1 contrast
  - ✅ Focus indicators: 3:1 contrast minimum

**TC-ACC-004: Trauma-Informed Design**
- **Description**: Verify no animations, unexpected movements, or triggers
- **Steps**:
  1. Navigate all pages
  2. Verify no parallax, scroll effects, or transitions
  3. Verify no auto-playing media
  4. Verify predictable interactions
- **Expected**: Interface is calm and predictable
- **Acceptance Criteria**:
  - ✅ No CSS animations/transitions
  - ✅ No JavaScript-triggered animations
  - ✅ No parallax or scroll effects
  - ✅ No auto-playing audio/video
  - ✅ All interactions require explicit user action

### 2.2 Navigation & Layout

**TC-NAV-001: Sidebar Navigation**
- **Description**: Sidebar provides clear navigation to all mini-apps
- **Steps**:
  1. Verify all mini-apps listed
  2. Click each link
  3. Verify correct page loads
  4. Verify active state highlights current page
- **Expected**: Navigation intuitive and complete
- **Acceptance Criteria**:
  - ✅ All mini-apps visible
  - ✅ Icons meaningful and recognizable
  - ✅ Active state clearly indicated
  - ✅ Admin section separated (if admin user)
  - ✅ Mobile responsive (if applicable)

**TC-NAV-002: Breadcrumbs & Context**
- **Description**: Users always know where they are
- **Steps**:
  1. Navigate deep into app
  2. Verify breadcrumbs or page titles clear
  3. Verify back navigation available
- **Expected**: Location always clear
- **Acceptance Criteria**:
  - ✅ Page titles descriptive
  - ✅ Breadcrumbs present on nested pages
  - ✅ Browser history works correctly

### 2.3 Form Usability

**TC-FORM-001: Form Feedback**
- **Description**: Forms provide immediate, clear feedback
- **Steps**:
  1. Submit form with errors
  2. Verify errors displayed inline
  3. Correct errors and verify errors clear
  4. Submit valid form and verify success message
- **Expected**: Users understand what to fix
- **Acceptance Criteria**:
  - ✅ Errors shown near relevant fields
  - ✅ Error messages clear and actionable
  - ✅ Success messages confirm completion
  - ✅ Loading states prevent double-submission

**TC-FORM-002: Required Field Indicators**
- **Description**: Required fields clearly marked
- **Steps**:
  1. View any form
  2. Verify required fields indicated
  3. Verify optional fields not confusing
- **Expected**: Required vs optional clear
- **Acceptance Criteria**:
  - ✅ Required fields marked with asterisk or "required"
  - ✅ Visual distinction clear (color, label)
  - ✅ Consistent pattern across all forms

**TC-FORM-003: Country Field Consistency**
- **Description**: Country fields use shared dropdown everywhere
- **Steps**:
  1. Check country field in all profiles
  2. Verify same options list
  3. Verify same ordering
- **Expected**: Consistent UX and data
- **Acceptance Criteria**:
  - ✅ Single source of truth for country list
  - ✅ Identical ordering across all forms
  - ✅ Dropdown component reused

### 2.4 External Link Handling

**TC-LINK-001: External Link Confirmation**
- **Description**: Links opening in new tabs show confirmation dialog
- **Steps**:
  1. Click external link
  2. Verify confirmation dialog appears
  3. Confirm or cancel
- **Expected**: Users aware of leaving site
- **Acceptance Criteria**:
  - ✅ All external links use `useExternalLink` hook
  - ✅ Dialog explains link destination
  - ✅ User can cancel
  - ✅ Dialog accessible via keyboard

---

## 3. Performance Testing

### 3.1 Load Testing

**TC-PERF-001: API Response Times**
- **Description**: Verify API endpoints respond within acceptable time
- **Target Metrics**:
  - List endpoints: < 500ms (p95)
  - Individual item endpoints: < 300ms (p95)
  - Profile operations: < 400ms (p95)
  - Admin endpoints: < 1000ms (p95)
- **Tools**: k6, Artillery, or Apache JMeter
- **Test Scenarios**:
  1. Baseline: 10 concurrent users
  2. Normal load: 50 concurrent users
  3. Peak load: 100 concurrent users
- **Acceptance Criteria**:
  - ✅ 95th percentile response times meet targets
  - ✅ No endpoint exceeds 2s under normal load
  - ✅ Error rate < 1%

**TC-PERF-002: Database Query Performance**
- **Description**: Verify database queries optimized
- **Steps**:
  1. Enable query logging
  2. Run typical user flows
  3. Identify slow queries (> 100ms)
  4. Add indexes where needed
- **Expected**: All queries under 100ms
- **Acceptance Criteria**:
  - ✅ Foreign key columns indexed
  - ✅ Frequently queried columns indexed
  - ✅ No N+1 query problems
  - ✅ Complex queries use EXPLAIN ANALYZE

**TC-PERF-003: Frontend Bundle Size**
- **Description**: Verify frontend loads quickly
- **Target Metrics**:
  - Initial bundle: < 200KB gzipped
  - Time to Interactive (TTI): < 3s on 3G
  - First Contentful Paint (FCP): < 1.5s
- **Tools**: Lighthouse, webpack-bundle-analyzer
- **Acceptance Criteria**:
  - ✅ Code splitting implemented
  - ✅ Lazy loading for routes
  - ✅ Images optimized
  - ✅ Lighthouse performance score ≥ 90

**TC-PERF-004: Concurrent User Sessions**
- **Description**: Verify system handles multiple concurrent sessions
- **Steps**:
  1. Simulate 100 concurrent authenticated users
  2. Each user performs typical actions
  3. Monitor server resources
- **Expected**: System stable, no degradation
- **Acceptance Criteria**:
  - ✅ Session storage scales
  - ✅ Memory usage reasonable
  - ✅ No session collisions
  - ✅ Database connections pooled

### 3.2 Stress Testing

**TC-PERF-005: Rate Limit Handling**
- **Description**: Verify rate limiters prevent abuse without breaking legitimate use
- **Steps**:
  1. Send requests at rate limit threshold
  2. Verify 429 responses when exceeded
  3. Verify legitimate users not affected
- **Expected**: Abuse prevented, legitimate use unaffected
- **Acceptance Criteria**:
  - ✅ Rate limiters enforce limits correctly
  - ✅ 429 responses include Retry-After header
  - ✅ Limits reset correctly
  - ✅ No false positives

**TC-PERF-006: Database Connection Pooling**
- **Description**: Verify connection pooling handles load
- **Steps**:
  1. Configure connection pool (recommend 10-20 connections)
  2. Load test with high concurrency
  3. Monitor connection pool metrics
- **Expected**: Pool handles load without exhaustion
- **Acceptance Criteria**:
  - ✅ Pool size appropriate for load
  - ✅ Connections released promptly
  - ✅ No connection leaks
  - ✅ Timeout errors rare (< 0.1%)

### 3.3 Scalability Testing

**TC-PERF-007: Data Growth Handling**
- **Description**: Verify performance with large datasets
- **Steps**:
  1. Seed database with 10,000+ users, 50,000+ records
  2. Run typical queries
  3. Verify pagination works
- **Expected**: Performance acceptable even with large data
- **Acceptance Criteria**:
  - ✅ List endpoints paginated (default 20-50 items)
  - ✅ Queries use LIMIT/OFFSET or cursors
  - ✅ No full table scans
  - ✅ Indexes support query patterns

---

## 4. Security Testing

### 4.1 Authentication & Authorization

**TC-SEC-001: Session Security**
- **Description**: Verify sessions secure and tamper-proof
- **Test Cases**:
  - **TC-SEC-001a**: Session cookies HTTP-only
  - **TC-SEC-001b**: Session cookies secure (HTTPS only)
  - **TC-SEC-001c**: Session IDs unpredictable
  - **TC-SEC-001d**: Session fixation prevented
  - **TC-SEC-001e**: Session timeout enforced
- **Expected**: Sessions cannot be hijacked or tampered
- **Acceptance Criteria**:
  - ✅ Cookies have `HttpOnly` flag
  - ✅ Cookies have `Secure` flag (production)
  - ✅ Session IDs use cryptographically secure random
  - ✅ New session created on login (prevents fixation)
  - ✅ Sessions expire after inactivity

**TC-SEC-002: Authorization Bypass**
- **Description**: Attempt to access unauthorized resources
- **Test Cases**:
  - **TC-SEC-002a**: Access admin endpoints as regular user
  - **TC-SEC-002b**: Access another user's profile/data
  - **TC-SEC-002c**: Modify another user's data
  - **TC-SEC-002d**: Access resources without authentication
- **Expected**: All unauthorized access blocked
- **Acceptance Criteria**:
  - ✅ API endpoints enforce `isAuthenticated`/`isAdmin`
  - ✅ User can only access own data
  - ✅ IDs in URLs validated (user cannot access other users' data)
  - ✅ Ownership verified before mutations

**TC-SEC-003: OIDC Token Handling**
- **Description**: Verify OIDC tokens handled securely
- **Test Cases**:
  - **TC-SEC-003a**: Tokens not exposed in client-side code
  - **TC-SEC-003b**: Refresh tokens stored securely
  - **TC-SEC-003c**: Token expiration enforced
  - **TC-SEC-003d**: Invalid tokens rejected
- **Expected**: Tokens never exposed, validated correctly
- **Acceptance Criteria**:
  - ✅ Tokens only in HTTP-only cookies or server-side
  - ✅ Token validation on every request
  - ✅ Expired tokens trigger refresh or logout
  - ✅ Token signature verified

### 4.2 Input Validation & Injection

**TC-SEC-004: SQL Injection**
- **Description**: Attempt SQL injection via all input vectors
- **Test Cases**:
  - Submit SQL in form fields
  - Submit SQL in URL parameters
  - Submit SQL in JSON body
  - Submit SQL in headers
- **Expected**: All injection attempts fail safely
- **Acceptance Criteria**:
  - ✅ Drizzle ORM uses parameterized queries
  - ✅ No raw SQL with user input
  - ✅ Error messages don't reveal SQL structure
  - ✅ Database errors logged but not exposed to client

**TC-SEC-005: XSS (Cross-Site Scripting)**
- **Description**: Attempt XSS via user input
- **Test Cases**:
  - Submit `<script>alert('XSS')</script>` in text fields
  - Submit JavaScript in URL parameters
  - Submit HTML in content fields
- **Expected**: Scripts not executed
- **Acceptance Criteria**:
  - ✅ React automatically escapes content
  - ✅ No `dangerouslySetInnerHTML` with user content
  - ✅ URL parameters sanitized
  - ✅ Content Security Policy (CSP) headers set

**TC-SEC-006: CSRF (Cross-Site Request Forgery)**
- **Description**: Verify CSRF protection
- **Steps**:
  1. Create malicious site with form posting to API
  2. Attempt to submit as authenticated user
  3. Verify request rejected
- **Expected**: CSRF attacks prevented
- **Acceptance Criteria**:
  - ✅ SameSite cookie attribute set (Strict or Lax)
  - ✅ State parameter in OAuth flow
  - ✅ Origin/Referer headers validated (if applicable)

**TC-SEC-007: Path Traversal**
- **Description**: Attempt to access files outside web root
- **Steps**:
  1. Request `/api/../../etc/passwd`
  2. Request `/api/../../../.env`
  3. Request files with encoded paths
- **Expected**: All attempts blocked
- **Acceptance Criteria**:
  - ✅ Paths normalized and validated
  - ✅ No file system access outside allowed directories
  - ✅ User input not used directly in file paths

### 4.3 Data Protection

**TC-SEC-008: Sensitive Data Exposure**
- **Description**: Verify sensitive data not exposed
- **Test Cases**:
  - Check API responses for passwords, tokens, secrets
  - Check error messages for sensitive info
  - Check client-side storage for sensitive data
  - Check logs for sensitive data
- **Expected**: No sensitive data exposed
- **Acceptance Criteria**:
  - ✅ Passwords never returned in API responses
  - ✅ Tokens not in client-side code
  - ✅ Error messages don't reveal internal details
  - ✅ Environment variables not exposed
  - ✅ Database credentials not in code/logs

**TC-SEC-009: Profile Deletion Anonymization**
- **Description**: Verify deleted profiles properly anonymized
- **Steps**:
  1. Create profile with related data
  2. Delete profile
  3. Verify related data anonymized
  4. Verify original user ID not recoverable
- **Expected**: Complete anonymization
- **Acceptance Criteria**:
  - ✅ Related records use `deleted_user_[random]` IDs
  - ✅ Random string is cryptographically secure
  - ✅ No traces of original user ID
  - ✅ Deletion logged with timestamp

**TC-SEC-010: Privacy Settings**
- **Description**: Verify privacy settings enforced
- **Test Cases**:
  - Private profiles not in public listings
  - Private data not exposed in API responses
  - Privacy toggles work immediately
- **Expected**: Privacy respected everywhere
- **Acceptance Criteria**:
  - ✅ Public/private flags checked in queries
  - ✅ API responses filtered by privacy settings
  - ✅ Admin override only for moderation

### 4.4 Rate Limiting & DDoS

**TC-SEC-011: Rate Limiting Effectiveness**
- **Description**: Verify rate limiters prevent abuse
- **Steps**:
  1. Send requests at limit threshold
  2. Verify 429 responses
  3. Verify legitimate users unaffected
  4. Verify limits reset correctly
- **Expected**: Abuse prevented, legitimate use protected
- **Acceptance Criteria**:
  - ✅ Limits enforced per IP/user
  - ✅ 429 responses include Retry-After
  - ✅ Limits reset after window
  - ✅ No bypass via header manipulation

**TC-SEC-012: Anti-Scraping Protection**
- **Description**: Verify anti-scraping measures work
- **Test Cases**:
  - Bot detection identifies automated requests
  - Display order rotation prevents systematic scraping
  - Delays slow down scrapers
  - Fingerprinting tracks suspicious patterns
- **Expected**: Scraping significantly hindered
- **Acceptance Criteria**:
  - ✅ Bot detection accurate (> 80% true positives)
  - ✅ Order rotation changes every 5 minutes
  - ✅ Suspicious requests logged
  - ✅ Admin can view patterns

### 4.5 Compliance & Audit

**TC-SEC-013: Admin Action Logging**
- **Description**: Verify all admin actions logged
- **Steps**:
  1. Perform admin actions (ban user, moderate content, etc.)
  2. Verify logs created in `admin_action_logs`
  3. Verify logs include all metadata
- **Expected**: Complete audit trail
- **Acceptance Criteria**:
  - ✅ All admin actions logged
  - ✅ Logs include admin ID, action, target, timestamp
  - ✅ Logs immutable (not deletable by admins)
  - ✅ Logs queryable for audits

**TC-SEC-014: Data Retention & Deletion**
- **Description**: Verify data retention policies enforced
- **Steps**:
  1. Delete user account
  2. Verify data deleted per policy
  3. Verify backups handled (if applicable)
- **Expected**: Deletion complete and compliant
- **Acceptance Criteria**:
  - ✅ User data deleted within retention period
  - ✅ Logs retained per policy
  - ✅ Deletion logged

---

## 5. AI Model Evaluation

**Note**: This section applies if/when AI features are added (e.g., matching algorithms, content generation, recommendations).

### 5.1 Model Accuracy

**TC-AI-001: Matching Algorithm Accuracy**
- **Description**: Verify matching algorithm produces accurate, relevant matches
- **Metrics**:
  - Precision: % of matches that are actually compatible
  - Recall: % of compatible users found
  - F1 Score: Harmonic mean of precision and recall
- **Test Method**:
  1. Create test dataset with known compatibility
  2. Run matching algorithm
  3. Measure precision/recall
- **Expected**: Precision ≥ 80%, Recall ≥ 70%
- **Acceptance Criteria**:
  - ✅ Algorithm considers all preference factors
  - ✅ Exclusions respected
  - ✅ Matches ranked by compatibility
  - ✅ Performance acceptable (< 1s for 1000 users)

**TC-AI-002: Bias Detection**
- **Description**: Verify algorithm doesn't discriminate
- **Test Cases**:
  - Check matches for demographic bias
  - Check for geographic bias
  - Check for temporal bias (new users vs. established)
- **Expected**: No systematic bias
- **Acceptance Criteria**:
  - ✅ Matches diverse across demographics
  - ✅ No protected class discrimination
  - ✅ Fair distribution of matches
  - ✅ Bias metrics logged and monitored

### 5.2 Model Performance

**TC-AI-003: Response Time**
- **Description**: Verify AI features respond quickly
- **Target**: < 2s for matching, < 5s for content generation
- **Acceptance Criteria**:
  - ✅ Responses within SLA
  - ✅ Timeout handling if model slow
  - ✅ Caching used where appropriate

**TC-AI-004: Error Handling**
- **Description**: Verify graceful degradation when AI fails
- **Steps**:
  1. Simulate AI service failure
  2. Verify fallback behavior
  3. Verify error messages user-friendly
- **Expected**: System continues to function
- **Acceptance Criteria**:
  - ✅ Errors logged but not exposed to users
  - ✅ Fallback to non-AI method (if applicable)
  - ✅ User experience not degraded

---

## 6. Regression Testing

### 6.1 Test Suite Structure

**TC-REG-001: Automated Test Coverage**
- **Description**: Maintain automated tests for critical paths
- **Test Categories**:
  1. **Unit Tests**: Storage methods, utilities, validation
  2. **Integration Tests**: API endpoints, database operations
  3. **E2E Tests**: Critical user flows (login, profile creation, matching)
- **Coverage Targets**:
  - Critical paths: 90%+
  - Overall codebase: 70%+
- **Tools**: Vitest (unit/integration), Playwright (E2E)
- **Acceptance Criteria**:
  - ✅ Tests run in CI/CD pipeline
  - ✅ Tests must pass before merge
  - ✅ Coverage reports generated
  - ✅ Tests maintainable and well-documented

**TC-REG-002: Smoke Test Suite**
- **Description**: Quick test suite for every deployment
- **Test Cases** (should complete in < 5 minutes):
  1. Login flow
  2. Profile creation (one mini-app)
  3. Profile update
  4. Admin access
  5. Public endpoint access
- **Acceptance Criteria**:
  - ✅ Smoke tests run automatically on deploy
  - ✅ Deployment blocked if smoke tests fail
  - ✅ Tests cover critical functionality

**TC-REG-003: Regression Test Checklist**
- **Description**: Manual checklist for releases
- **Checklist**:
  - [ ] All mini-apps functional
  - [ ] Authentication works
  - [ ] Admin features work
  - [ ] Profile deletion works
  - [ ] Public endpoints protected
  - [ ] No console errors
  - [ ] Accessibility verified
  - [ ] Performance acceptable
- **Acceptance Criteria**:
  - ✅ Checklist completed before release
  - ✅ Issues documented and tracked
  - ✅ Hot fixes tested before deployment

### 6.2 Version Control Integration

**TC-REG-004: Pre-commit Hooks**
- **Description**: Automated checks before code committed
- **Checks**:
  - TypeScript compilation
  - Linting (ESLint)
  - Formatting (Prettier)
  - Unit tests
- **Acceptance Criteria**:
  - ✅ Hooks prevent bad code from being committed
  - ✅ Hooks fast (< 30s)
  - ✅ Hooks configurable (skip with flag if needed)

**TC-REG-005: Pull Request Testing**
- **Description**: Tests run automatically on PRs
- **Steps**:
  1. Create PR
  2. CI runs full test suite
  3. Coverage diff calculated
  4. PR approved only if tests pass
- **Acceptance Criteria**:
  - ✅ All tests must pass
  - ✅ Coverage cannot decrease
  - ✅ Test results visible in PR

---

## 7. Integration Testing

### 7.1 External Service Integration

**TC-INT-001: Replit Auth (OIDC) Integration**
- **Description**: Verify OIDC authentication flow works
- **Steps**:
  1. Initiate login
  2. Complete OIDC flow
  3. Verify callback handled
  4. Verify user session created
  5. Verify token refresh works
- **Expected**: Seamless authentication
- **Acceptance Criteria**:
  - ✅ Login flow completes successfully
  - ✅ Callback URL correct
  - ✅ Tokens stored securely
  - ✅ Refresh mechanism works
  - ✅ Logout flow completes

**TC-INT-002: Neon Database Integration**
- **Description**: Verify database operations work correctly
- **Test Cases**:
  - Connection pooling
  - Query execution
  - Transaction handling
  - Migration execution
- **Expected**: Database reliable and performant
- **Acceptance Criteria**:
  - ✅ Connections established correctly
  - ✅ Queries execute successfully
  - ✅ Transactions rollback on error
  - ✅ Migrations apply cleanly

- **Acceptance Criteria**:
  - ✅ Embed code correct
  - ✅ Player responsive
  - ✅ Controls functional
  - ✅ Error handling if Wistia unavailable

**TC-INT-004: Signal.org Group Links (ChatGroups)**
- **Description**: Verify external links to Signal groups work
- **Steps**:
  1. Click Signal group link
  2. Verify confirmation dialog
  3. Confirm and verify link opens
- **Expected**: Links open correctly with confirmation
- **Acceptance Criteria**:
  - ✅ Links use `useExternalLink` hook
  - ✅ Confirmation dialog appears
  - ✅ Links valid and accessible

### 7.2 Internal System Integration

**TC-INT-005: Storage Layer Integration**
- **Description**: Verify storage methods integrate with routes correctly
- **Steps**:
  1. Call API endpoint
  2. Verify storage method called
  3. Verify data persisted correctly
  4. Verify response correct
- **Expected**: Storage abstraction works correctly
- **Acceptance Criteria**:
  - ✅ Routes use storage methods (not direct DB access)
  - ✅ Storage methods handle errors
  - ✅ Transactions used where needed

**TC-INT-006: Frontend-Backend Integration**
- **Description**: Verify frontend and backend communicate correctly
- **Test Cases**:
  - API requests use correct endpoints
  - Request/response formats match
  - Error handling consistent
  - Loading states work
- **Expected**: Seamless communication
- **Acceptance Criteria**:
  - ✅ API client configured correctly
  - ✅ CORS headers set (if needed)
  - ✅ Error responses parsed correctly
  - ✅ TanStack Query cache invalidated correctly

**TC-INT-007: Session Management Integration**
- **Description**: Verify session management works across components
- **Steps**:
  1. Login creates session
  2. Session persists across requests
  3. Logout destroys session
  4. Session timeout enforced
- **Expected**: Sessions managed correctly
- **Acceptance Criteria**:
  - ✅ Sessions stored in PostgreSQL
  - ✅ Sessions accessible to Express
  - ✅ Frontend respects session state
  - ✅ Timeout handled gracefully

---

## 8. Test Tools and Frameworks

### 8.1 Recommended Tools

#### Unit & Integration Testing
- **Vitest**: Fast unit test runner for TypeScript
  - Configuration: `vitest.config.ts`
  - Benefits: Fast, TypeScript-native, compatible with Jest API
  - Usage: `npm run test`

#### End-to-End Testing
- **Playwright**: Reliable E2E testing
  - Configuration: `playwright.config.ts`
  - Benefits: Cross-browser, auto-waiting, screenshots
  - Usage: `npm run test:e2e`

#### API Testing
- **k6**: Load and performance testing
  - Benefits: Developer-friendly, good for load testing
  - Alternative: Artillery, Apache JMeter

#### Accessibility Testing
- **axe-core**: Automated accessibility testing
  - Integration: Playwright axe plugin
  - Usage: Run as part of E2E tests

#### Visual Regression Testing
- **Percy** or **Chromatic**: Visual diff testing
  - Benefits: Catch UI regressions
  - Usage: Run on PRs

#### Code Quality
- **ESLint**: Linting
- **Prettier**: Formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks

### 8.2 Test Data Management

**Test Fixtures**:
- Create seed scripts for test data
- Use deterministic data for reproducible tests
- Separate test database (or transactions for isolation)

**Mocking**:
- Mock external services (OIDC, Wistia) in tests
- Use test doubles for database in unit tests
- Integration tests use real database (test instance)

---

## 9. Test Execution Strategy

### 9.1 Test Levels

1. **Unit Tests**: Run on every commit (via pre-commit hook)
2. **Integration Tests**: Run on every PR (via CI)
3. **E2E Tests**: Run on PRs and before releases
4. **Performance Tests**: Run weekly or before major releases
5. **Security Tests**: Run monthly or on security-related changes
6. **Manual Testing**: Before every release (use regression checklist)

### 9.2 CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run linting
      - Run type checking
      - Run unit tests
      - Run integration tests
      - Generate coverage report
      - Upload coverage to codecov
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Start test database
      - Start application
      - Run E2E tests
      - Upload test results
  
  deploy:
    if: branch == 'main' && tests pass
    steps:
      - Run smoke tests
      - Deploy to staging
      - Run smoke tests on staging
      - Deploy to production
```

### 9.3 Test Reporting

- **Coverage Reports**: Generate HTML coverage reports, track trends
- **Test Results**: JUnit XML for CI integration
- **Failure Notifications**: Alert on test failures
- **Metrics Dashboard**: Track test execution time, pass rate, coverage

---

## 10. Test Maintenance

### 10.1 Keeping Tests Updated

- **Review tests with code changes**: Update tests when features change
- **Remove obsolete tests**: Delete tests for removed features
- **Refactor tests**: Keep tests DRY and maintainable
- **Document test purposes**: Clear test names and comments

### 10.2 Test Data Cleanup

- **Clean up test data**: Remove test data after test runs
- **Use transactions**: Rollback test data in integration tests
- **Separate test database**: Isolate test data from development

---

## Conclusion

This comprehensive testing plan ensures the platform is reliable, secure, and user-friendly. Regular execution of these tests, combined with continuous improvement based on findings, will maintain the high quality required for serving vulnerable users.

**Priority**: Focus on security and accessibility testing, as these directly impact user safety and inclusion.

