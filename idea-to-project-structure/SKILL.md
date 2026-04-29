---
name: idea-to-project-structure
description: Use when a user explicitly asks for project structure, repo layout, scaffolding, AI-friendly bootstrap/docs, full-docs output, or retrofit/restructure of an existing repository; Chinese triggers include 项目结构, 仓库结构, 脚手架, AI友好文档, 重构这个仓库. Do not trigger only because the user mentions a generic app or management software idea.
---

# Idea to Project Structure

## Overview

Turn an idea or existing repository into a practical, AI-friendly project structure without dragging the user into a heavy PRD or GSD workflow.

This skill:

- borrows lightweight clarification from `product-requirements`
- borrows the docs/context skeleton philosophy from `LoopNova`
- does not force a fixed tech stack
- does not copy LoopNova's business modules

The generated repository should support low-token project bootstrapping:

- `AGENTS.md` or `CLAUDE.md` -> `AI_CONTEXT.md`
- `AI_CONTEXT.md` -> canonical docs under `docs/context/`, `docs/engineering/`, and `docs/tasks/`

Treat module task-state as durable context:

- each module owns `docs/tasks/<module>/INDEX.md`
- after each completed task, write back affected module indexes
- keep single tasks inside one module whenever practical
- if a task genuinely crosses modules, update every affected module index

Treat `repo-native` as a real lightweight workflow, not just "no superpowers":

- read `AI_CONTEXT.md` and affected module indexes before non-trivial work
- define scope in `docs/tasks/<module>/` before implementation
- validate with tests or documented manual checks
- record cross-module validation evidence or gaps in `docs/testing/`
- update affected module indexes before closing the task
- update `docs/context/*` or `docs/engineering/*` only when durable meaning or contracts changed

Treat `superpowers` as optional execution discipline only:

- always ask whether the user wants `superpowers` or `repo-native`; installed superpowers is not a reason to enable it automatically
- if the user chooses `repo-native`, generate markdown that explicitly forbids superpowers workflows for that repository to keep it lightweight
- if the user chooses `superpowers`, map outputs into repo-native canonical paths
- do not recreate `docs/superpowers/**`
- internalize useful execution discipline; do not imitate its document tree

For old repositories, retrofit mode is limited to project structure, bootstrap files, canonical docs, and mapping docs. It does not include source refactors or behavior changes.

## Use This Skill When

- The user has a product idea and wants repo structure, app layout, or module boundaries.
- The user wants language or framework choices driven by requirements.
- The user wants an AI-friendly bootstrap/doc skeleton.
- The user wants to layer that skeleton onto an existing repository.
- The user says "重构这个仓库" or "改造当前仓库" in the sense of repository structure, bootstrap docs, or AI handoff docs.

## Do Not Use This Skill When

- The user wants a long PRD as the primary deliverable.
- The user wants implementation inside an existing codebase rather than structure work.
- The user only wants a small feature added to an existing repository.
- The user says "重构" but means code refactoring, behavior changes, performance work, or source cleanup rather than repository/docs structure. Ask once if the intent is ambiguous.

## Workflow

### 1. Pick A Mode

Choose one mode first:

- `structure-only`: lightweight structure proposal and optional scaffold
- `full-docs`: structure plus materially written core docs
- `retrofit-existing-project`: layer AI-friendly bootstrap/docs onto an existing repository

Mode triggers:

- `structure-only`: default when the user invokes this skill and does not name another mode.
- `full-docs`: use when the user says `full-docs`, "完整文档", "完整文档模式", "核心文档一起生成", or "结构和文档一起落盘".
- `retrofit-existing-project`: use when the user says `retrofit`, `retrofit-existing-project`, "重构仓库", "重构这个仓库", "旧项目改造", "现有仓库", "当前仓库", or provides an existing project path to add an AI-friendly docs/bootstrap layer.

Do not infer `full-docs` from ambition, complexity, or what you think the user probably wants. If no mode is named, use `structure-only`.

### 2. Confirm Complex-Task Workflow

Before finalizing any new scaffold, full-docs output, or retrofit, ask whether project execution workflow should use:

- `superpowers`
- `repo-native`

Guidance:

- explain that both choices keep durable project context in repository docs
- choose based on whether the repository should allow local superpowers skills to guide execution workflow
- never infer the answer from whether superpowers is installed locally
- if the user chooses `repo-native`, generated `AGENTS.md`, `CLAUDE.md`, and `AI_CONTEXT.md` must opt out of superpowers workflows even when the local machine has superpowers installed
- if the user chooses `superpowers` and it is missing, help install it before relying on it

When asking, use this distinction:

- `repo-native`: lightweight execution; do not use superpowers workflow skills; keep plans, validation, and state in repository docs.
- `superpowers`: allow superpowers workflow skills for execution discipline; still keep plans, validation, and durable state in repository docs.

Do not describe `superpowers` as taking documentation out of the repository or making project memory less portable. The tradeoff is workflow weight and local skill dependency, not documentation ownership.

### 3. Clarify Only What Changes Structure

Always collect the minimum defensible information:

- product goal
- target users
- core flow
- client surfaces
- whether backend is needed
- whether admin/operator surface is needed
- whether workers or async processing are needed
- stack constraints or preferences
- whether roadmap docs are wanted

Mode-specific depth:

- `structure-only`: ask only structure-changing questions
- `full-docs`: also gather enough detail to write core docs
- `retrofit-existing-project`: inspect the repo first, then ask only what is needed for structure/bootstrap overlay decisions

Load extra guidance only when needed:

- `references/full-docs-mode.md`
- `references/retrofit-mode.md`
- `references/shape-and-stack-guidance.md`

### 4. Collapse Answers Into Decisions

Convert the discussion into:

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
- `existing_canonical_docs`

Supported shapes are defined in `assets/templates/shapes/manifest.json`.

If stack or shape is unclear, load `references/shape-and-stack-guidance.md`.

### 5. Present The Recommendation First

Before scaffolding, present a concise proposal in this format:

1. `需求摘要`
2. `推荐系统形态`
3. `推荐技术栈`
4. `模块边界`
5. `目录结构树`
6. `为什么这样划分`

Add only when relevant:

- for `full-docs`: `目标路线与阶段`, `MVP 与非目标`, `复杂任务执行方式`
- for `retrofit-existing-project`: `当前结构诊断`, `改造方式`, `保留与新增`, `复杂任务执行方式`

### 6. Scaffold Only When The User Wants Files

Run the bundled script only when the user wants files created:

```bash
node scripts/init-project-structure.mjs ...
```

Script responsibilities:

- create shape-driven app folders
- create `AGENTS.md`, `CLAUDE.md`, and `AI_CONTEXT.md`
- create canonical docs under `docs/context/`, `docs/product/`, `docs/engineering/`, `docs/tasks/`, `docs/testing/`, and `docs/archive/`
- create module task-state files under `docs/tasks/<module>/INDEX.md`
- optionally write roadmap docs

Important flags:

- `--execution-workflow superpowers|repo-native`
- `--instruction-file-mode skip|append|overwrite`
- `--retrofit-depth overlay-only`

### 7. Fill Docs Proportionally

If the user chose `full-docs`, do not stop at placeholders. Fill the core docs in the same turn.

But fill docs proportionally:

- do not fabricate a rich API doc when there is no real API boundary
- do not invent milestones when roadmap planning was not requested
- if stack choices are still partly open, record confirmed decisions and open questions

If the user chose `retrofit-existing-project`:

- preserve source roots by default
- keep the retrofit limited to structure/bootstrap/docs work
- if `AGENTS.md` or `CLAUDE.md` already exist, confirm `skip`, `append`, or `overwrite`
- add `docs/context/retrofit-mapping.md`

## Reference Files

Load these only when relevant:

- `references/full-docs-mode.md`
  Full-docs interview checklist, doc targets, and example prompts.

- `references/retrofit-mode.md`
  Retrofit interview checklist, hard boundaries, mapping outputs, and instruction-file handling.

- `references/shape-and-stack-guidance.md`
  Shape defaults, stack defaults, and recommendation heuristics.

## Notes

- Do not assume a default root such as `D:\Narylr`; use the user-provided path.
- Do not overwrite an existing target folder unless the user explicitly wants that or uses `--force`.
- In retrofit mode, default to leaving existing `AGENTS.md` and `CLAUDE.md` untouched unless the user chooses append or overwrite.
- The canonical task-state files are `docs/tasks/<module>/INDEX.md`, not a single global task index.
- Prefer work decomposition that keeps a task inside one module.
