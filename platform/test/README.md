# Testing Guide

This directory contains comprehensive tests for the application following the testing plan in `TESTING_PLAN.md`.

## Test Structure

```
test/
├── api/              # API endpoint tests (Vitest)
├── client/           # Frontend component tests (Vitest + React Testing Library)
├── e2e/              # End-to-end tests (Playwright)
├── integration/      # Integration tests (Vitest)
├── security/         # Security-specific tests
├── fixtures/         # Test data and helpers
└── setup.ts          # Test setup and configuration
```

## Running Tests

### Install Dependencies

First, install all dependencies including testing packages:

```bash
npm install
```

### Unit and Integration Tests

Run all unit and integration tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test -- --watch
```

Run tests with UI:

```bash
npm run test:ui
```

Generate coverage report:

```bash
npm run test:coverage
```

Run tests once (for CI):

```bash
npm run test:run
```

### End-to-End Tests

Run E2E tests:

```bash
npm run test:e2e
```

Run E2E tests with UI:

```bash
npm run test:e2e:ui
```

### Running Specific Tests

Run tests matching a pattern:

```bash
npm run test -- auth
npm run test -- storage
npm run test -- security
```

## Test Categories

### Unit Tests
- **Location**: `test/integration/`
- **Purpose**: Test individual functions and methods
- **Example**: Storage layer operations, utility functions

### Integration Tests
- **Location**: `test/integration/`
- **Purpose**: Test interactions between components
- **Example**: Database operations, API routes

### Component Tests
- **Location**: `test/client/`
- **Purpose**: Test React components in isolation
- **Example**: Form validation, component rendering

### E2E Tests
- **Location**: `test/e2e/`
- **Purpose**: Test complete user flows
- **Example**: Profile creation flow, authentication flow

### Security Tests
- **Location**: `test/security/`
- **Purpose**: Test security vulnerabilities
- **Example**: SQL injection, XSS, authorization bypass

## Writing Tests

### Test Naming

- Test files: `*.test.ts` or `*.spec.ts`
- Test descriptions: `should [expected behavior]`
- Group related tests with `describe` blocks

### Example Test

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should perform expected behavior', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await functionToTest(input);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Using Test Fixtures

```typescript
import { createTestUser, generateTestUserId } from '../fixtures/testData';

describe('User Operations', () => {
  it('should create user', async () => {
    const userId = generateTestUserId();
    const user = createTestUser({ id: userId });
    // ... test logic
  });
});
```

## Coverage Requirements

- **Critical paths**: 90%+ coverage
  - Authentication/authorization
  - Profile CRUD operations
  - Admin actions
  - Profile deletion
  - Public endpoint protection

- **Overall codebase**: 70%+ coverage

## CI/CD Integration

Tests run automatically on:
- Pre-commit hooks (unit tests only)
- Pull requests (all tests)
- Before deployment (smoke tests)

## Troubleshooting

### Tests failing with database connection errors

Ensure `DATABASE_URL` is set in your environment for integration tests.

### Tests failing with auth errors

Mock authentication in tests using `createMockRequest()` from fixtures.

### E2E tests timing out

Ensure the dev server is running on `http://localhost:5000` or update `PLAYWRIGHT_TEST_BASE_URL`.

## Adding New Tests

When adding a new feature:

1. Create unit tests for storage methods
2. Create integration tests for API endpoints
3. Create component tests for UI
4. Add E2E tests for critical flows
5. Add security tests for user input

See `TESTING_PLAN.md` for detailed requirements.

