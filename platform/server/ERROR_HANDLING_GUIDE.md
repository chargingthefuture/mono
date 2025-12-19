# Error Handling Guide

This guide outlines the standardized error handling patterns for all API endpoints in the platform.

## Core Principles

1. **Always use AppError subclasses** - Never throw generic `Error` objects
2. **Use asyncHandler wrapper** - All async route handlers must be wrapped with `asyncHandler`
3. **Let errors propagate** - Don't catch errors unless you need to transform them
4. **Use logError for logging** - Never use `console.error` directly
5. **Normalize all errors** - The errorHandler middleware will normalize errors automatically

## Error Classes

Use the appropriate error class from `./errors`:

- `ValidationError` (400) - Invalid input data
- `UnauthorizedError` (401) - Authentication required
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict (e.g., duplicate)
- `RateLimitError` (429) - Rate limit exceeded
- `DatabaseError` (500) - Database operation failed
- `ExternalServiceError` (502/503) - External service unavailable
- `AppError` (500) - Generic application error

## Route Handler Pattern

```typescript
import { asyncHandler } from './errorHandler';
import { NotFoundError, ValidationError } from './errors';
import { withDatabaseErrorHandling } from './databaseErrorHandler';

// ✅ CORRECT: Use asyncHandler wrapper
app.get('/api/users/:id', asyncHandler(async (req, res, next) => {
  const user = await withDatabaseErrorHandling(
    () => storage.getUser(req.params.id),
    'getUser'
  );
  
  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }
  
  res.json(user);
}));

// ❌ WRONG: Missing asyncHandler
app.get('/api/users/:id', async (req, res, next) => {
  // Errors won't be caught properly
});

// ❌ WRONG: Manual try-catch in route handler
app.get('/api/users/:id', asyncHandler(async (req, res, next) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error); // ❌ Don't use console.error
    return res.status(500).json({ error: 'Internal error' });
  }
}));
```

## Database Operations

Always wrap database operations with `withDatabaseErrorHandling`:

```typescript
import { withDatabaseErrorHandling } from './databaseErrorHandler';

// ✅ CORRECT
const user = await withDatabaseErrorHandling(
  () => storage.getUser(userId),
  'getUser'
);

// ❌ WRONG: Direct database call without error handling
const user = await storage.getUser(userId);
```

## Error Logging

Use `logError` from `./errorLogger` instead of `console.error`:

```typescript
import { logError } from './errorLogger';
import { normalizeError } from './errors';

// ✅ CORRECT: In catch blocks where you need to log before re-throwing
try {
  await someOperation();
} catch (error) {
  const normalized = normalizeError(error);
  logError(normalized, req); // Include request context if available
  throw normalized; // Re-throw normalized error
}

// ❌ WRONG: Direct console.error
try {
  await someOperation();
} catch (error) {
  console.error('Error:', error); // ❌ Don't use console.error
  throw error;
}
```

## Error Transformation

If you need to transform an error, normalize it first:

```typescript
import { normalizeError, NotFoundError } from './errors';

try {
  await someOperation();
} catch (error) {
  const normalized = normalizeError(error);
  
  // Transform to a more specific error if needed
  if (normalized.code === 'RESOURCE_NOT_FOUND') {
    throw new NotFoundError('Resource', id);
  }
  
  // Otherwise, re-throw the normalized error
  throw normalized;
}
```

## Middleware Error Handling

Middleware should use `next(error)` to pass errors to the error handler:

```typescript
import { UnauthorizedError } from './errors';

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  if (!req.auth?.userId) {
    throw new UnauthorizedError('Authentication required');
    // The errorHandler middleware will catch this automatically
  }
  next();
});
```

## Storage Layer Error Handling

Storage methods should throw AppError subclasses directly:

```typescript
import { NotFoundError, ValidationError } from './errors';
import { withDatabaseErrorHandling } from './databaseErrorHandling';

async getUser(id: string): Promise<User> {
  const user = await withDatabaseErrorHandling(
    () => db.select().from(users).where(eq(users.id, id)).limit(1),
    'getUser'
  );
  
  if (!user) {
    throw new NotFoundError('User', id);
  }
  
  return user;
}
```

## Common Patterns

### Pattern 1: Simple Route Handler
```typescript
app.get('/api/resource/:id', asyncHandler(async (req, res) => {
  const resource = await withDatabaseErrorHandling(
    () => storage.getResource(req.params.id),
    'getResource'
  );
  
  if (!resource) {
    throw new NotFoundError('Resource', req.params.id);
  }
  
  res.json(resource);
}));
```

### Pattern 2: Route Handler with Validation
```typescript
import { z } from 'zod';
import { ValidationError } from './errors';

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.post('/api/users', asyncHandler(async (req, res) => {
  const validated = createSchema.safeParse(req.body);
  if (!validated.success) {
    throw new ValidationError('Invalid input', { issues: validated.error.issues });
  }
  
  const user = await withDatabaseErrorHandling(
    () => storage.createUser(validated.data),
    'createUser'
  );
  
  res.status(201).json(user);
}));
```

### Pattern 3: Route Handler with Authorization
```typescript
app.delete('/api/users/:id', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
  await withDatabaseErrorHandling(
    () => storage.deleteUser(req.params.id),
    'deleteUser'
  );
  
  res.status(204).send();
}));
```

## Anti-Patterns to Avoid

1. ❌ **Don't use console.error** - Use `logError` instead
2. ❌ **Don't catch and swallow errors** - Let them propagate to errorHandler
3. ❌ **Don't return error responses manually** - Throw errors instead
4. ❌ **Don't use try-catch in route handlers** - Use asyncHandler instead
5. ❌ **Don't throw generic Error** - Use AppError subclasses
6. ❌ **Don't call database methods directly** - Use withDatabaseErrorHandling
7. ❌ **Don't manually set status codes** - Let errorHandler do it

## Error Response Format

All errors are automatically formatted by the errorHandler middleware:

```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": { /* optional, only in development or for operational errors */ }
  }
}
```

## Testing Error Handling

When testing endpoints, ensure errors are properly formatted:

```typescript
const response = await request(app)
  .get('/api/users/invalid-id')
  .expect(404);

expect(response.body).toMatchObject({
  error: {
    message: expect.any(String),
    code: 'NOT_FOUND',
  },
});
```

