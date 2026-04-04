# Shape And Stack Guidance

Use this reference only when the user has not already fixed the shape or stack.

## Shape Defaults

- `single-app`
  One main app root for simple tools, focused MVPs, or small fullstack starters.

- `frontend-backend`
  Separate user app and API. Good default for modest web products that need a real backend boundary.

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

## Selection Questions

- "Is this one app, or do you expect separate user, admin, and API surfaces?"
- "Will the product need async jobs, AI orchestration, or queue workers?"
- "Do you care more about fast delivery, team familiarity, or long-term backend rigidity?"

## Recommendation Rule

Prefer the simplest defensible shape:

- do not introduce admin, worker, or multi-app structure unless the requirements actually need it
- if the user has no hard stack preference, recommend the most pragmatic stack for the chosen shape
