# Retrofit Mode

Use this reference only when the user chooses `retrofit-existing-project`.

## Hard Boundary

This mode is for project-structure retrofit only:

- bootstrap files
- canonical docs
- project-level mapping
- module task-state conventions

It is not for:

- source refactors
- module rewrites
- behavior changes
- "cleaning up the project" in the application-code sense

## Decision Checklist

1. `当前结构`
   Explore current apps, services, packages, and major module folders.
   Main doc targets:
   - `AI_CONTEXT.md`
   - `docs/context/project-overview.md`

2. `上下文现状`
   Identify existing README files, architecture docs, API docs, and notes that should remain canonical.
   Main doc targets:
   - `AI_CONTEXT.md`
   - `docs/context/project-overview.md`

3. `改造方式`
   Keep it conservative:
   - `overlay-only`: add AI-friendly bootstrap and canonical docs without moving code

4. `目标启动链`
   Define:
   - `AGENTS.md` or `CLAUDE.md`
   - `AI_CONTEXT.md`
   - `docs/context/*`
   - `docs/engineering/*`
   - `docs/tasks/*`

5. `保留与映射`
   Decide which files stay canonical, which remain references, and which concepts should be summarized into the new docs layer.

## Instruction Files

If `AGENTS.md` or `CLAUDE.md` already exist, confirm one of:

- `skip`
- `append`
- `overwrite`

Default to `skip`.

## Expected Outputs

- root `AGENTS.md`
- root `CLAUDE.md`
- root `AI_CONTEXT.md`
- `docs/context/retrofit-mapping.md`
- `docs/context/`
- `docs/engineering/`
- `docs/tasks/`
- `docs/testing/`
- `docs/archive/`

## Superpowers Rule

If the user chooses `superpowers` for later complex execution:

- treat it as execution discipline only
- map outputs back into repo-native docs
- do not recreate `docs/superpowers/**`

The durable task-state files remain:

- `docs/tasks/<module>/INDEX.md`

Prefer single-module tasks whenever practical.
