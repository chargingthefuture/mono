cd /home/z6734067/mono/platform
npx madge platform/client/src/main.tsx

cd /home/z6734067/mono/platfrom
npx madge platform/server/index.ts

cd /home/z6734067/mono/platform
npx madge --image platform-deps.svg platform/client/src/main.tsx



Use `madge` in **small, focused slices** of the `platform` app and generate **Graphviz/SVG graphs** instead of trying to map the entire repo at once.

### Practical steps for your repo

From your workspace root (`/mono`), I’d start with a few targeted graphs:

- **1. High‑level routing / pages**

```bash
cd mono/platform

# Pages & routing graph (client)
npx madge client/src/pages --extensions ts,tsx --ts-config tsconfig.json \
  --image docs/madge-pages.svg
```

- **2. API / server graph**

```bash
# Server graph (routes + storage)
npx madge server --extensions ts,tsx --ts-config tsconfig.json \
  --image docs/madge-server.svg
```

- **3. Shared domain model**

```bash
# Shared schema & types
npx madge shared --extensions ts,tsx --ts-config tsconfig.json \
  --image docs/madge-shared.svg
```

Then open the generated `docs/madge-*.svg` files in your editor or browser.

### Make the graphs usable (not spaghetti)

For each command, you can add filters to keep the graphs readable:

- **Limit depth** when you just want structure:

```bash
npx madge client/src/pages --extensions ts,tsx --ts-config tsconfig.json \
  --image docs/madge-pages-depth2.svg --max-depth 2
```

- **Focus on a mini‑app** (e.g., SupportMatch):

```bash
npx madge client/src/pages/supportmatch --extensions ts,tsx --ts-config tsconfig.json \
  --image docs/madge-supportmatch.svg
```

Same for server routes:

```bash
npx madge server/routes.ts --extensions ts,tsx --ts-config tsconfig.json \
  --image docs/madge-routes.svg
```


- **Start from routes and pages:** open the `madge-routes.svg` and `madge-pages.svg` first; follow edges from top‑level routes/pages into shared utilities and mini‑apps.
- **Drill into one mini‑app at a time:** generate graphs for that mini‑app’s `client/src/pages/{miniapp}` and corresponding server areas (`server/{miniapp}` or relevant storage methods).
- **Cross‑check with existing docs:** you already have `platform/guides/MADGE.md` and `DESIGN.md` open—use them as a reference for any repo‑specific madge config or ignore patterns.





### Focus: Workforce Recruiter mini‑app

Here are concrete `madge` commands you can run from `platform` to see how **Workforce Recruiter** is wired, in small, readable slices.

---

### 1. Client pages & UI flow

**What you see:** how `workforce-recruiter` pages link to each other and shared UI.

```bash
cd mono/platform

npx madge client/src/pages/workforce-recruiter \
  --extensions ts,tsx \
  --ts-config tsconfig.json \
  --image docs/madge-workforce-recruiter-pages.svg \
  --max-depth 3
```

Open `docs/madge-workforce-recruiter-pages.svg` to trace from `dashboard.tsx`, `profile.tsx`, `occupations.tsx`, etc.

---

### 2. API surface (routes)

**What you see:** all HTTP endpoints for this mini‑app and what they import.

```bash
npx madge server/routes/workforce-recruiter.routes.ts \
  --extensions ts,tsx \
  --ts-config tsconfig.json \
  --image docs/madge-workforce-recruiter-routes.svg
```

Follow edges from this file to storage and validation.

---

### 3. Storage layer (business logic)

**What you see:** how Workforce Recruiter talks to DB and shared mini‑app infrastructure.

```bash
npx madge server/storage/mini-apps/workforce-recruiter-storage.ts \
  --extensions ts,tsx \
  --ts-config tsconfig.json \
  --image docs/madge-workforce-recruiter-storage.svg
```

If you want the composed view (how it plugs into the global storage):

```bash
npx madge server/storage/composed/mini-apps/workforce-recruiter-storage-composed.ts \
  --extensions ts,tsx \
  --ts-config tsconfig.json \
  --image docs/madge-workforce-recruiter-storage-composed.svg
```

---

### 4. Domain model (schema)

**What you see:** how Workforce Recruiter tables relate to other shared types.

```bash
npx madge shared/schema/workforcerecruitertracker \
  --extensions ts,tsx \
  --ts-config tsconfig.json \
  --image docs/madge-workforce-recruiter-schema.svg
```

---

### How to “read” this mini‑app

1. **Start with** `madge-workforce-recruiter-routes.svg` ⇒ see all endpoints.
2. **Jump to** `madge-workforce-recruiter-storage.svg` ⇒ see core operations behind each route.
3. **Check** `madge-workforce-recruiter-schema.svg` ⇒ understand tables and types.
4. **Then** `madge-workforce-recruiter-pages.svg` ⇒ see how UI screens sit on top of those APIs.

