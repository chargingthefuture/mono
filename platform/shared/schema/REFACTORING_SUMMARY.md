# Schema Refactoring Summary

## Status: In Progress

The `schema.ts` file (2,952 lines) is being split into domain-specific schema modules.

## Structure Created

```
shared/schema/
├── index.ts                    # Re-exports all schemas (to be created)
├── validation/
│   └── common.ts               # ✅ Common validation schemas
├── core/
│   ├── users.ts               # ✅ User and auth tables
│   ├── payments.ts            # TODO: Payments and pricing tiers
│   └── admin.ts               # TODO: Admin logs and NPS
└── [mini-app directories]/    # TODO: Mini-app schemas
```

## Next Steps

1. Extract payments and pricing tiers to `core/payments.ts`
2. Extract admin logs and NPS to `core/admin.ts`
3. Extract each mini-app schema to its own directory
4. Create `index.ts` that re-exports everything
5. Update all imports across the codebase

## Mini-App Schemas to Extract

- SupportMatch
- Directory
- Lighthouse
- TrustTransport
- MechanicMatch
- Research
- GentlePulse
- Blog
- LostMail
- Chyme
- Workforce Recruiter
- Default Alive or Dead
- ChatGroups
- SocketRelay

