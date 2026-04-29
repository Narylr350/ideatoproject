# Full Docs Mode

Use this reference only when the user chooses `full-docs`.

## Goal

Gather enough information to generate structure and materially write the core docs in one pass, without drifting into a giant PRD.

`full-docs` means the user wants generated docs, not just a structure discussion. Do not ask whether to "only output docs" or "create skeleton and docs" after this mode is selected. Ask for the target path/name only if files will be created and the path/name is missing.

Do not treat execution workflow, stack choice, and target path as requirements discovery. Those are setup choices. Before scaffolding, ask at least one focused requirements batch unless the user has already answered the product/content questions below.

## Required Interview Areas

Ask in small batches. Two or three focused questions at a time is enough.

Minimum first batch after setup choices:

1. What is the first useful MVP outcome?
2. Which project/file types must be recognized first?
3. What should the app deliberately not do in v1?

1. `产品目标`
   Clarify the problem, target users, and core value.
   Main doc targets:
   - `docs/context/project-overview.md`
   - `docs/product/idea.md`

2. `用户与场景`
   Clarify the primary users and main usage scenes.
   Main doc targets:
   - `docs/context/project-overview.md`
   - `docs/product/idea.md`

3. `核心流程`
   Clarify the shortest path from entering the product to achieving the core outcome.
   Main doc targets:
   - `docs/context/project-overview.md`
   - `docs/context/architecture.md`

4. `MVP 与非目标`
   Clarify what must be in the first useful version and what is explicitly out of scope.
   Main doc targets:
   - `docs/context/project-overview.md`
   - `docs/context/development-roadmap.md` when roadmap is enabled

5. `系统形态`
   Clarify whether the product needs one app, multi-app, admin, mobile, or worker boundaries.
   Main doc targets:
   - `docs/context/architecture.md`
   - `AI_CONTEXT.md`

6. `技术约束与技术栈`
   Clarify language, framework, deployment, team familiarity, and speed-versus-rigidity tradeoffs.
   Main doc targets:
   - `docs/context/tech-stack.md`
   - `docs/context/architecture.md`
   - `docs/engineering/api.md` when there is a real API boundary

7. `目标路线与阶段里程碑`
   Clarify whether the user wants milestones and, if yes, what the stages should be.
   Main doc targets:
   - `docs/context/development-roadmap.md`

## Output Rule

Write docs dynamically:

- always write bootstrap and core context docs
- write engineering/API docs deeply only when those boundaries exist
- if a section is not yet settled, record confirmed decisions and open questions instead of padding
- do not downgrade to `structure-only` or ask whether to create docs after the user has said `full-docs` / `完整文档模式`
- do not run the scaffold script before asking at least one requirements batch, unless the initial user message already contains enough detail for product goal, target users, core flow, MVP scope, and non-goals

## Example Prompts

- "What problem does this project solve, and who feels that pain most directly?"
- "What is the shortest successful path from opening the product to achieving the main outcome?"
- "Does this need separate user, admin, API, or worker surfaces?"
- "Do you want milestone planning written now, or should the docs stay focused on MVP?"
