# Shape And Stack Guidance

Use this reference only when the user has not already fixed the shape or stack.

## Shape Defaults

- `single-app`
  One main app root for simple tools, focused MVPs, or small fullstack starters.

- `frontend-backend`
  Separate user app and API. Good default for modest web products that need a real backend boundary.

- `desktop-app`
  Local desktop application or utility. Use when the primary surface is a native desktop shell, local files, clipboard, tray lifecycle, installer packaging, device access, or other OS integration.

- `monorepo-web-api-admin`
  User web, API, and admin with shared packages. Use when user and operator surfaces are clearly separate.

- `mobile-api-admin`
  Mobile client, API, and admin. Use for mobile-first products with operations needs.

- `ai-service-app`
  User app, API, and worker. Use when async jobs, orchestration, or AI-heavy flows are central.

## Stack Heuristics

- fast iteration:
  `Next.js`, or `React/Vue + NestJS/FastAPI`

- stronger Java backend preference:
  `Vue/React + Spring Boot`

- mobile-first:
  `Flutter + API + admin web`

- desktop utility:
  choose `--shape desktop-app`, then record `--platform`, `--runtime`, and `--ui` instead of forcing the project into frontend/backend/mobile fields

- domain-specific engineering concerns:
  pass AI-selected docs through `--engineering-docs`, for example `provider-boundary,clipboard,packaging,performance`; do not maintain a static checklist for every platform or industry

## Selection Questions

- "Is this one app, or do you expect separate user, admin, and API surfaces?"
- "Will the product need async jobs, AI orchestration, or queue workers?"
- "Do you care more about fast delivery, team familiarity, or long-term backend rigidity?"
- "Is the important technical work a frontend/backend boundary, or local platform boundaries such as files, clipboard, tray lifecycle, packaging, providers, or settings?"

## Recommendation Rule

Prefer the simplest defensible shape:

- do not introduce admin, worker, or multi-app structure unless the requirements actually need it
- do not force local desktop utilities into Web/monorepo shapes just because they have a UI
- generate engineering boundary docs from the actual product context, not from a hardcoded industry checklist
- if the user has no hard stack preference, recommend the most pragmatic stack for the chosen shape
