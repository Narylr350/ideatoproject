---
name: idea-to-project-structure
description: Use when a user has a rough product idea and wants a practical project structure instead of a long PRD. This skill asks a small number of targeted requirement questions, chooses a suitable system shape and stack, then proposes or scaffolds a repo structure with a bundled Node.js script.
---

# Idea to Project Structure

## Overview

Turn an idea into a concrete repo structure without dragging the user through a full PRD or GSD workflow.

This skill borrows the lightweight clarification style from `product-requirements` and the docs/context skeleton philosophy from `LoopNova`, but it does not copy LoopNova's business modules or force a fixed tech stack.

The generated repo should support low-token project bootstrapping for future AI sessions: root `AGENTS.md` or `CLAUDE.md` should point to `AI_CONTEXT.md`, and `AI_CONTEXT.md` should point to the canonical context layers.

It should also define how generic execution workflows such as `using-superpowers` map their artifacts into the repository's own canonical layout instead of creating generic `docs/superpowers/**` paths.

If the user wants delivery guidance beyond structure, the workflow should also support an optional goal roadmap and phase milestones written into the generated docs.

Before finalizing the structure, explicitly ask whether the user wants `using-superpowers` as the complex-task execution workflow. This is useful for code execution discipline, but it can be counterproductive for exploratory or divergent product work.

If the user does not want `using-superpowers`, internalize project-management discipline into the repository itself through `docs/context/`, `docs/tasks/`, `docs/testing/`, and optional roadmap docs so the project remains manageable across future AI sessions.

If the user does want `using-superpowers` and the environment does not already have the relevant skill installed, help them install it before relying on it.

## Use This Skill When

- The user says they have an idea and want a project structure, repo layout, or scaffold.
- The user wants the language and framework chosen from requirements rather than from a fixed template.
- The user wants a LoopNova-style docs/context skeleton with dynamic app structure.
- The user asks for a monorepo, `web + api + admin`, `mobile + api`, or `AI worker` style structure.

## Do Not Use This Skill When

- The user wants a long PRD, roadmap, or delivery phases.
- The user wants implementation inside an existing codebase rather than new-project structure.
- The user already has a fixed repository and only wants a small feature added.

## Workflow

### Mode Selection

Pick one of these modes first:

- `structure-only`: the user mainly wants repo structure, app layout, module boundaries, and scaffold
- `full-docs`: the user wants the repo scaffold plus the core project docs materially written in the same step
- `retrofit-existing-project`: the user already has a repository and wants an AI-friendly project structure layered onto or reconciled with the existing codebase

Default to `structure-only` for simple or narrowly scoped ideas.

Use `full-docs` when the user wants things like:

- complete target route or milestone planning
- concrete `docs/context/*` content instead of placeholders
- technology-stack decisions written down now
- architecture and API starter docs written now

Use `retrofit-existing-project` when the user wants things like:

- an old project to be easier for AI to understand in new conversations
- a root `AGENTS.md` / `CLAUDE.md` / `AI_CONTEXT.md` bootstrap chain added to an existing repo
- `docs/context/`, `docs/engineering/`, and `docs/tasks/` layered onto an older codebase
- current modules and app boundaries mapped into a clearer AI-friendly structure

Do not push the user into `full-docs` for very simple ideas. If the idea is small, local, or obviously low-complexity, keep the interaction lightweight unless the user explicitly asks for full documentation.

Examples that should usually stay `structure-only` unless the user asks otherwise:

- a simple single-page tool
- a personal utility app
- a small script-based product idea
- a focused MVP with one user type and one main flow
- a lightweight internal dashboard with minimal workflow complexity

Signals that `full-docs` is justified:

- multiple user roles or surfaces
- meaningful backend, admin, worker, or mobile boundaries
- obvious phased delivery or milestone planning needs
- enough product ambiguity that writing the docs now will prevent churn later

Signals that `retrofit-existing-project` is justified:

- the project already exists on disk
- new AI sessions spend too many tokens rediscovering the repo
- the repository lacks stable context docs or has scattered docs
- the user wants structure improvement without rebuilding from scratch

### 1. Clarify In The Right Depth

For `structure-only`, ask only what changes structure.

For `full-docs`, switch to a fuller requirement discussion inspired by `product-requirements`, but stop short of producing a giant PRD unless the user explicitly wants one.

For `retrofit-existing-project`, explore the current repository first, then ask only the questions needed to decide how invasive the retrofit should be.

In `full-docs`, gather enough detail to write:

- `docs/context/project-overview.md`
- `docs/context/development-roadmap.md` when roadmap is requested
- `docs/context/architecture.md`
- `docs/context/tech-stack.md`
- `docs/product/idea.md`
- `docs/engineering/api.md`

In `retrofit-existing-project`, gather enough detail to decide:

- current app and module boundaries
- whether the retrofit is `overlay-only` or `overlay-and-restructure`
- which existing docs are canonical, obsolete, or missing
- what the new bootstrap chain should point to

This does not mean every document must be filled to the same depth. Fill docs dynamically based on the project idea and system shape.

- Always write the bootstrap and core context docs.
- Write API and engineering docs deeply only when the project actually has those boundaries.
- If a document is conditionally relevant, either keep it brief and explicit about current applicability or avoid generating the deeper content until the project actually needs it.

Use this fixed question checklist for `full-docs`, adapted from `product-requirements` but trimmed for structure and repo bootstrap work:

1. `产品目标`
   Ask what problem the project solves, for whom, and what the core value is.
   Write mainly into:
   - `docs/context/project-overview.md`
   - `docs/product/idea.md`

2. `用户与场景`
   Ask who the primary users are and what the main usage scenes look like.
   Write mainly into:
   - `docs/context/project-overview.md`
   - `docs/product/idea.md`

3. `核心流程`
   Ask for the main user flow from entering the system to achieving the core outcome.
   Write mainly into:
   - `docs/context/project-overview.md`
   - `docs/context/architecture.md`

4. `MVP 与非目标`
   Ask what must be in the first usable version and what is explicitly out of scope.
   Write mainly into:
   - `docs/context/project-overview.md`
   - `docs/context/development-roadmap.md` when roadmap is enabled

5. `系统形态`
   Ask whether the product should be one app, multi-app, user plus admin, mobile plus backend, or include workers and async processing.
   Write mainly into:
   - `docs/context/architecture.md`
   - `AI_CONTEXT.md`

6. `技术约束与技术栈`
   Ask for language and framework preferences, team constraints, deployment expectations, and whether speed or long-term rigidity matters more.
   Write mainly into:
   - `docs/context/tech-stack.md`
   - `docs/context/architecture.md`
   - `docs/engineering/api.md` when there is a real API boundary

7. `目标路线与阶段里程碑`
   Ask whether the user wants milestone planning, and if yes, what the delivery stages should be.
   Write mainly into:
   - `docs/context/development-roadmap.md`

For these sections, prefer targeted batches of 2-3 questions at a time rather than one giant questionnaire.

Use this fixed decision checklist for `retrofit-existing-project`:

1. `当前结构`
   Explore the repository and identify current apps, services, packages, and major module folders.
   Write mainly into:
   - `AI_CONTEXT.md`
   - `docs/context/project-overview.md`

2. `上下文现状`
   Identify whether README files, architecture docs, API docs, or ad hoc notes already exist and which ones should remain canonical.
   Write mainly into:
   - `AI_CONTEXT.md`
   - `docs/context/project-overview.md`

3. `改造深度`
   Ask whether the user wants:
   - `overlay-only`: add AI-friendly docs and bootstrap files without moving code
   - `overlay-and-restructure`: add the docs layer and also perform limited structural cleanup
   Write mainly into:
   - `docs/context/architecture.md`
   - `docs/tasks/`

4. `目标启动链`
   Define the future AI reading chain:
   `AGENTS.md / CLAUDE.md -> AI_CONTEXT.md -> docs/context/* -> docs/engineering/* -> docs/tasks/*`
   Write mainly into:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `AI_CONTEXT.md`

5. `保留与映射`
   Decide which existing files stay in place, which files become references, and which concepts should be summarized into the new docs layer.
   Write mainly into:
   - `AI_CONTEXT.md`
   - `docs/context/project-overview.md`
   - `docs/context/architecture.md`

Default to `overlay-only` unless the user explicitly wants structural cleanup beyond documentation and bootstrap layering.

Ask only the questions needed to decide structure. Prefer 1-2 questions at a time. Stop once the structure is defensible.

Minimum information to collect:

- product goal
- target users
- client surfaces
- whether a backend is required
- whether an admin or operator surface is required
- whether background jobs / AI workers are required
- stack preference or hard constraints
- whether complex coding execution should use `using-superpowers` or stay repo-native
- whether the user wants a full goal roadmap and milestone plan in the generated docs

Additional information for `retrofit-existing-project` mode:

- current repo root or app roots
- whether code movement is allowed
- whether the project already has canonical docs worth preserving
- whether existing `AGENTS.md` / `CLAUDE.md` should be kept, appended to, or overwritten
- whether task/module tracking should start now or later

Additional information for `full-docs` mode:

- must-have user flows
- MVP boundary
- non-goals
- operational surfaces such as admin or back office
- stack tradeoff preference
- milestone sequence or delivery stages
- likely API groups and domain boundaries

In `full-docs`, keep the order above. It is the default interview sequence unless the user already answered a section well enough.

Good question themes:

- "Is this one app, or do you expect separate user, admin, and API surfaces?"
- "Do you want fast iteration with a JS stack, or a more enterprise backend like Spring Boot?"
- "Will the product need async jobs, AI orchestration, or queue workers?"
- "Do you want me to just propose the structure, or scaffold it on disk too?"
- "Do you also want a full goal roadmap with milestones, or only the project structure?"

Useful `retrofit-existing-project` examples:

- "Should I only add the AI-friendly docs layer, or also reorganize some existing directories?"
- "Which current docs do you already trust as canonical, and which ones are stale?"
- "Do you want me to keep the source tree untouched and only add `AGENTS.md`, `CLAUDE.md`, `AI_CONTEXT.md`, and `docs/`?"
- "If `AGENTS.md` or `CLAUDE.md` already exist, should I keep them as-is, append repository bootstrap guidance, or overwrite them?"

Useful `full-docs` examples by section:

- `产品目标`: "What is the main problem this project solves, and why would users choose it over the current alternative?"
- `用户与场景`: "Who are the primary users, and what is the most common real usage scene?"
- `核心流程`: "What is the shortest successful path from entering the product to achieving the core outcome?"
- `MVP 与非目标`: "What must be in version one, and what should we explicitly not build yet?"
- `系统形态`: "Does this need separate user, admin, API, or worker surfaces?"
- `技术约束与技术栈`: "Do you care more about fast delivery, team familiarity, or strong backend structure?"
- `目标路线与阶段里程碑`: "Do you want phased milestones written now, or should the docs stay focused on the immediate MVP?"

Avoid:

- long PRD-style questionnaires
- KPI and ROI discussions unless they directly change architecture
- implementation detail questions that do not affect repo shape

In `full-docs` mode, it is acceptable to ask more because the goal is to fill the generated docs with meaningful content, not placeholders.

Do not force every possible doc section to look equally complete. Prefer accurate, shape-aware docs over padded docs.

### 2. Collapse Requirements Into Structure Decisions

Convert the answers into these decisions:

- `mode`
- `shape`
- `frontend`
- `backend`
- `mobile`
- `with_admin`
- `with_worker`
- `package_manager`
- `execution_workflow`
- `domains`
- `with_roadmap`
- `milestones`
- `retrofit_depth`
- `existing_canonical_docs`

Use these shape defaults:

- `single-app`: one main app root for simple products or fullstack starters
- `frontend-backend`: separate user app and API, optional admin
- `monorepo-web-api-admin`: user web + API + admin with shared packages
- `mobile-api-admin`: mobile client + API + admin
- `ai-service-app`: user app + API + worker for background or AI-heavy flows

Use these retrofit defaults:

- `overlay-only`: add the AI-friendly docs and bootstrap layer without moving source directories
- `overlay-and-restructure`: add the docs/bootstrap layer and perform limited approved structural cleanup

### 3. Present The Recommendation First

Before scaffolding, present a short structure proposal in this format:

1. `需求摘要`
2. `推荐系统形态`
3. `推荐技术栈`
4. `模块边界`
5. `目录结构树`
6. `为什么这样划分`

Keep it concise. This skill is for structure, not for writing a product novel.

If the user chose `full-docs`, also summarize:

7. `目标路线与阶段`
8. `MVP 与非目标`
9. `复杂任务执行方式`

If the user chose `retrofit-existing-project`, summarize instead:

7. `当前结构诊断`
8. `改造方式`
9. `保留与新增`
10. `复杂任务执行方式`

### 4. Scaffold Only When The User Wants Files Created

When the user wants the structure created on disk, run the bundled Node.js script:

```bash
node scripts/init-project-structure.mjs \
  --root "D:\\Narylr" \
  --name "Campus Skill Swap" \
  --shape "monorepo-web-api-admin" \
  --frontend "vue" \
  --backend "spring-boot" \
  --package-manager "pnpm" \
  --with-admin "true" \
  --with-roadmap "true" \
  --roadmap-goal "Launch a usable campus skill-exchange MVP, then expand trust and operations depth." \
  --milestones "Milestone 1: MVP exchange loop|Milestone 2: trust and moderation|Milestone 3: operator tooling" \
  --domains "auth,listing,order,admin"
```

The script creates:

- dynamic app folders based on shape
- root `AGENTS.md` and `CLAUDE.md` that route new AI sessions into the bootstrap flow
- LoopNova-inspired docs/context skeleton
- a meaningful `AI_CONTEXT.md` that acts as the compressed project bootstrap index
- an optional `docs/context/development-roadmap.md` for target route and milestones
- app-level README placeholders
- task/module doc folders for the chosen domains
- optional JS workspace metadata when a JS package manager is selected

Use `--execution-workflow superpowers|repo-native` to decide whether the generated docs assume `using-superpowers` for complex coding execution or a repository-native workflow.

In `full-docs` mode, do not stop after running the script if the generated docs still contain placeholders. Fill the core docs in the same turn using the clarified requirements.

However, fill them proportionally:

- if there is no standalone backend, do not fabricate a rich API spec
- if roadmap planning was not requested, do not invent milestone detail
- if stack choices are still partially open, record the confirmed decisions and open questions instead of pretending everything is settled

In `retrofit-existing-project` mode:

- explore the repository before proposing changes
- default to `overlay-only`
- do not move code directories by default
- add the bootstrap chain and canonical docs layer first
- if `AGENTS.md` or `CLAUDE.md` already exist, confirm whether they should be `keep`, `append`, or `overwrite` before writing
- only perform structural cleanup after presenting the mapping and getting user approval for invasive changes

If the user chooses `using-superpowers` for complex execution:

- confirm that the environment has the skill available
- if not, help install it before relying on it, using the local skill installation workflow instead of only describing it
- still keep repository-local artifact mapping rules so generic outputs land in canonical repo paths

If the user chooses repo-native execution instead:

- do not push `using-superpowers`
- treat `docs/tasks/<domain>/`, `docs/testing/`, and context docs as the durable project-management layer
- make sure task templates support plan, implementation log, validation, and doc updates

Typical retrofit outputs:

- new root `AGENTS.md`
- new root `CLAUDE.md`
- new root `AI_CONTEXT.md`
- `docs/context/retrofit-mapping.md`
- `docs/context/`
- `docs/engineering/`
- `docs/tasks/`
- a concise mapping from old structure to new canonical understanding

### 5. Prefer Sensible Defaults

If the user has no hard stack preference, use pragmatic defaults:

- simple web product: `frontend-backend` or `single-app`
- user web + admin + separate API: `monorepo-web-api-admin`
- mobile-first with operations: `mobile-api-admin`
- AI or queue-heavy product: `ai-service-app`

Recommended stacks when the user has no strong opinion:

- fast iteration: `Next.js` or `React/Vue + NestJS/FastAPI`
- Java-style backend: `Vue/React + Spring Boot`
- mobile-first: `Flutter + API + admin web`

If the user chooses `full-docs`, default to writing concrete stack rationale in `docs/context/tech-stack.md` instead of leaving only minimal placeholders.

If the user chooses `retrofit-existing-project`, default to preserving existing runtime choices and documenting them before proposing any stack migration.

### 6. Keep LoopNova As A Skeleton, Not A Template Prison

Reuse the structure pattern:

- `AGENTS.md`
- `CLAUDE.md`
- `AI_CONTEXT.md`
- `docs/context/`
- `docs/product/`
- `docs/engineering/`
- `docs/tasks/`

Do not copy LoopNova's specific apps, modules, or domain names unless the user's idea actually calls for them.

## Notes For Scaffolding

- Default scaffold root can be any user-provided directory. Do not assume `D:\\Narylr` unless that is what the user asked for.
- If the target folder already exists, do not overwrite it unless the user explicitly approves that or the command uses `--force`.
- In `retrofit-existing-project` mode, default to leaving existing `AGENTS.md` and `CLAUDE.md` untouched unless the user explicitly chooses append or overwrite behavior.
- For `retrofit-existing-project`, use `--instruction-file-mode skip|append|overwrite` to control how existing `AGENTS.md` and `CLAUDE.md` are handled.
- Use `--execution-workflow superpowers|repo-native` to control the complex-task execution model written into the generated docs.
- If the user only wants planning output, do not run the script.
- If the user wants a custom shape beyond the built-ins, propose the shape first, then either adapt the closest built-in or extend the script.
