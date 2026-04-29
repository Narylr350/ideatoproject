---
name: idea-to-project-structure
description: Use when a user explicitly asks for project structure, repo layout, scaffolding, AI-friendly bootstrap/docs, full-docs output, or retrofit/restructure of an existing repository; Chinese triggers include 项目结构, 仓库结构, 脚手架, AI友好文档, 重构这个仓库. Do not trigger only because the user mentions a generic app or management software idea.
---

# Idea to Project Structure

## Overview

Turn an idea or existing repository into a practical, AI-friendly project structure without dragging the user into a heavy PRD or GSD workflow.

This skill:

- absorbs the core requirements-discovery discipline from `product-requirements`
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

## Capability Contract

- `structure-only`: start from an idea, ask lightweight structure-changing questions, then produce a suitable project skeleton.
- `full-docs`: produce structure plus core docs in the repository. Adapt the useful requirements-discovery discipline from `product-requirements` into this skill's structure/docs workflow: check whether the canonical docs can be written concretely, ask targeted gaps, then map answers into `AI_CONTEXT.md` and `docs/*`. Do not generate a standalone PRD unless the user explicitly asks for one.
- `retrofit-existing-project`: add an AI-friendly bootstrap/docs layer to an existing repository without moving source code by default.

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
- `full-docs`: gather enough product, workflow, MVP, non-goal, success metric, risk, testing, integration, and API-boundary detail to write core docs before running the script
- `retrofit-existing-project`: inspect the repo first, then ask only what is needed for structure/bootstrap overlay decisions

For `full-docs`, confirming execution workflow, tech stack, and whether to create files is not enough. Treat this as a canonical-doc readiness pass, not a copied PRD workflow:

1. Check whether each target doc has enough concrete inputs to be written.
2. Ask targeted questions in batches of 2-3, focusing on the missing doc sections.
3. Continue until the docs can be materially written, not merely scaffolded.
4. Do not use PRD-only artifacts, persona theater, or a generic requirements document unless the user asks for those explicitly.
5. Do not run the script until product goal, target users, core flow, MVP scope, non-goals, success metrics, key workflows, testing strategy, and API/integration boundaries are known or explicitly marked as open questions.

Full-docs should proceed one checkpoint at a time:

- Do not ask for workflow, target path, stack, and MVP in the same message.
- Prefer this order when values are missing: execution workflow -> target path/project name -> stack constraints or recommendation -> product/MVP discovery -> field package approval -> scaffold.
- Each message should ask for the next missing decision, or present the next recommendation checkpoint for approval.
- Avoid answer templates that encourage the user to provide all remaining decisions in one sentence.
- MVP should be discovered progressively from concrete use: first identify the primary object being managed, then the first successful user action, then required read-only operations, then explicit non-goals.
- If the user says "按你的 MVP 推荐", propose the MVP field package for approval; do not treat that sentence as the user's final MVP definition.

Full-docs has a recommendation path:

- If the user says "你推荐", "帮我推荐", "按你的建议", or gives equivalent permission for missing product details, do not ask those details again one by one.
- Instead, propose a complete full-docs field package covering `--mvp`, `--non-goals`, `--success-metrics`, `--key-workflows`, `--integrations`, `--testing-strategy`, `--api-scope`, `--risks`, `--open-questions`, roadmap choice, domains, shape, and stack.
- The recommendation must be concrete enough to write the target markdown files. Avoid vague lines such as "后续补充测试策略" unless they are intentionally listed under `--open-questions`.
- `按你的推荐` 不等于批准落盘. It only authorizes the assistant to draft recommended values.
- Ask the user for explicit confirmation of the whole field package, not just the directory tree. Accept clear confirmations such as "确认", "批准", "按这个生成", or "可以落盘".
- If the user explicitly confirms the field package and the target path is already known, run the scaffold script in the same turn.
- If the target path is missing, ask only for the target root/path; do not restart requirements discovery.
- Ask for target project name/path in the initial setup batch whenever the user has already selected `full-docs`, so approval is not followed by an avoidable extra path question.

Do not confuse two workflows:

- The selected generated-repository execution workflow (`superpowers` or `repo-native`) is content that will be written into the generated docs.
- It is not, by itself, permission to replace this skill's full-docs readiness flow with a generic brainstorming or PRD workflow.
- If the local agent environment requires process skills, keep their output mapped into this skill's canonical recommendation and generated docs; do not create generic workflow artifacts.

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
- `full_docs_fields` when mode is `full-docs`: MVP, non-goals, success metrics, key workflows, integrations, testing strategy, API scope, risks, open questions
- `target_root` and `project_name` when files will be created

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

- for `full-docs`: `目标路线与阶段`, `MVP 与非目标`, `成功指标`, `核心流程`, `集成/API 边界`, `测试策略`, `风险与开放问题`, `复杂任务执行方式`, `落盘位置`
- for `retrofit-existing-project`: `当前结构诊断`, `改造方式`, `保留与新增`, `复杂任务执行方式`

For `full-docs`, the recommendation is not complete unless it can be directly translated into the script flags listed below. If the user asked you to recommend missing pieces, include your recommended values explicitly.

### 6. Scaffold Only When The User Wants Files

Run the bundled script when the selected mode implies files should be created:

- `structure-only`: run it only after the user asks to create files or approves scaffolding.
- `full-docs`: treat the mode itself as intent to eventually create the scaffold and write core docs, unless the user explicitly says "只输出文档", "只给内容", "不要落盘", or "先不要创建文件". Still require explicit confirmation of the full-docs field package before running the script.
- `retrofit-existing-project`: treat the mode itself as permission to add the bootstrap/docs overlay to the named or current repository, while preserving source code and existing instruction files according to the chosen mode.

Do not ask a `full-docs` user whether they want "only output docs" versus "create project skeleton and docs". They already selected the docs-writing mode. Instead, ask only for missing decisions that affect the generated docs and target path/name when needed.

Do not run the script immediately after the user answers only execution workflow, stack, and target-path choices. For `full-docs`, first gather the minimum content needed to write meaningful docs.

```bash
node scripts/init-project-structure.mjs ...
```

Script responsibilities:

- create shape-driven app folders
- create `AGENTS.md`, `CLAUDE.md`, and `AI_CONTEXT.md`
- create canonical docs under `docs/context/`, `docs/product/`, `docs/engineering/`, `docs/tasks/`, `docs/testing/`, and `docs/archive/`
- in `--docs-mode full-docs`, write gathered requirements into the core docs instead of leaving generic placeholders
- create module task-state files under `docs/tasks/<module>/INDEX.md`
- optionally write roadmap docs

Important flags:

- `--execution-workflow superpowers|repo-native`
- `--docs-mode loopnova|full-docs|none`
- `--mvp`, `--non-goals`, `--success-metrics`, `--key-workflows`, `--integrations`, `--testing-strategy`, `--api-scope`, `--risks`, `--open-questions`
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
