---
name: idea-to-project-structure
description: Use when a user has a rough product idea and wants a practical project structure, repo layout, or AI-friendly bootstrap/docs scaffold instead of a long PRD.
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

Treat `superpowers` as optional execution discipline only:

- ask whether the user wants `superpowers` or `repo-native` for complex coding execution
- if the user chooses `superpowers`, map outputs into repo-native canonical paths
- do not recreate `docs/superpowers/**`
- internalize useful execution discipline; do not imitate its document tree

For old repositories, retrofit mode is limited to project structure, bootstrap files, canonical docs, and mapping docs. It does not include source refactors or behavior changes.

## Use This Skill When

- The user has a product idea and wants repo structure, app layout, or module boundaries.
- The user wants language or framework choices driven by requirements.
- The user wants an AI-friendly bootstrap/doc skeleton.
- The user wants to layer that skeleton onto an existing repository.

## Do Not Use This Skill When

- The user wants a long PRD as the primary deliverable.
- The user wants implementation inside an existing codebase rather than structure work.
- The user only wants a small feature added to an existing repository.

## Workflow

### 1. Pick A Mode

Choose one mode first:

- `structure-only`: lightweight structure proposal and optional scaffold
- `full-docs`: structure plus materially written core docs
- `retrofit-existing-project`: layer AI-friendly bootstrap/docs onto an existing repository

Defaults:

- prefer `structure-only` for simple ideas
- use `full-docs` only when the user wants meaningful docs now
- use `retrofit-existing-project` only when the repository already exists

Do not push simple ideas into `full-docs`.

### 2. Confirm Complex-Task Workflow

Before finalizing structure, ask whether complex coding execution should use:

- `superpowers`
- `repo-native`

Guidance:

- choose `repo-native` for idea exploration, structure work, and lighter projects
- choose `superpowers` for clearly execution-heavy coding work
- if the user chooses `superpowers` and it is missing, help install it before relying on it

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
