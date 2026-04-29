export function buildWorkflowCopy(config) {
  const executionWorkflowLine = `- Execution workflow: \`${config.executionWorkflow}\``;
  const workflowToolingRules = config.executionWorkflow === "superpowers"
    ? [
        "- Superpowers skills may load and run normally, but they do not own this repository's documentation structure.",
        "- Before writing any plan, design note, verification note, or task state from a superpowers workflow, map it back to the canonical paths below.",
        "- If an external workflow suggests `docs/superpowers/**` or another generic artifact path, adapt it to this repository's canonical structure instead."
      ].join("\n")
    : [
        "- This repository explicitly opts out of superpowers workflows, even if superpowers is installed locally.",
        "- Do not invoke `using-superpowers`, `brainstorming`, `writing-plans`, or other superpowers workflow skills for this repository unless the user first changes the repository execution workflow to `superpowers`.",
        "- Do not create `docs/superpowers/**` or other superpowers workflow artifact paths.",
        "- Keep execution lightweight and repo-native: use this repository's canonical docs and task records instead."
      ].join("\n");
  const deliveryWorkflow = config.executionWorkflow === "superpowers"
    ? [
        "- Superpowers may load and trigger its skills according to the local agent environment.",
        "- When superpowers is used, map its outputs into this repository's canonical paths instead of creating generic workflow directories.",
        "- Repository documentation ownership stays with `AGENTS.md`, `AI_CONTEXT.md`, and the canonical docs under `docs/`."
      ].join("\n")
    : [
        "- This repository explicitly uses a lightweight repo-native workflow.",
        "- Do not use superpowers workflows for this repository, even if they are installed locally.",
        "- Manage complex work inside the repository by keeping scope, plan, validation, and durable notes in `docs/tasks/<domain>/`, `docs/testing/`, and the canonical context docs.",
        "- Use the repo-native cycle: define scope -> write a short task plan -> implement -> validate -> update affected docs."
      ].join("\n");
  const workflowCompatibilityRules = config.executionWorkflow === "superpowers"
    ? [
        "- Repository-local instructions override generic external workflow defaults.",
        "- `using-superpowers` may be used for complex execution work, but it must adapt to this repository's structure.",
        "- Do not create generic workflow artifact paths such as `docs/superpowers/**` when this repository already defines canonical locations.",
        "- Use this repository's current structure for durable artifacts:",
        "  - stable project context -> `docs/context/`",
        "  - product intent -> `docs/product/`",
        "  - engineering contracts -> `docs/engineering/`",
        "  - task and module working records -> `docs/tasks/`",
        "- When a generic skill suggests a different artifact layout, reinterpret that guidance so outputs land in the canonical paths above."
      ].join("\n")
    : [
        "- Repository-local instructions are the primary workflow source for this project.",
        "- Superpowers is explicitly disabled for this repository unless the user changes the repository execution workflow.",
        "- Manage durable work artifacts directly in the canonical repository paths:",
        "  - stable project context -> `docs/context/`",
        "  - product intent -> `docs/product/`",
        "  - engineering contracts -> `docs/engineering/`",
        "  - task and module working records -> `docs/tasks/`",
        "- For complex work, record the plan, validation, and resulting boundary changes in-repo instead of depending on an external project-management workflow."
      ].join("\n");
  const superpowersArtifactMapping = config.executionWorkflow === "superpowers"
    ? [
        "Superpowers skills may load and run normally. Treat them as execution guidance, not documentation ownership.",
        "",
        "If a complex task uses `using-superpowers` or related skills, map generic outputs into this repository as follows:",
        "",
        "- brainstorming spec or design docs -> the active task record under `docs/tasks/<domain>/` or another canonical project doc if that is the real owner",
        "- writing-plans implementation plans -> the active task record under `docs/tasks/<domain>/` unless a separate repository-level plan doc is intentionally introduced",
        "- verification notes and evidence summaries -> `docs/testing/`",
        "- durable architecture or boundary decisions -> `docs/context/architecture.md`",
        "- durable API and engineering contracts -> `docs/engineering/`",
        "",
        "Do not preserve generic superpowers directory names when they conflict with the repository's canonical layout."
      ].join("\n")
    : [
        "This repository has opted out of superpowers workflows to stay lightweight.",
        "",
        "Even if superpowers is installed locally, do not use `using-superpowers` or write superpowers workflow artifacts for this repository unless the user explicitly changes the execution workflow to `superpowers`.",
        "",
        "Use the repo-native workflow for project management:",
        "",
        "For complex work, keep these artifacts in-repo:",
        "- task scope and short plan -> `docs/tasks/<domain>/`",
        "- validation notes and evidence -> `docs/testing/`",
        "- durable architecture or boundary decisions -> `docs/context/architecture.md`",
        "- durable API and engineering contracts -> `docs/engineering/`",
        "",
        "This keeps project management recoverable from repository docs alone across new AI sessions."
      ].join("\n");
  const repoNativeWorkflowSection = config.executionWorkflow === "repo-native"
    ? [
        "## Repo-Native Workflow",
        "",
        "This repository uses a lightweight native workflow instead of superpowers.",
        "",
        "For every non-trivial task:",
        "",
        "1. Read `AI_CONTEXT.md`.",
        "2. Read the affected `docs/tasks/<module>/INDEX.md` files.",
        "3. Define the scope in the affected module task record before changing code.",
        "4. Implement the smallest structure-aware change.",
        "5. Validate with tests or documented manual checks.",
        "6. Record validation evidence or gaps in `docs/testing/` when it matters beyond one module.",
        "7. Update the affected module `INDEX.md` files before closing the task.",
        "8. Update `docs/context/*` or `docs/engineering/*` only when durable architecture, stack, or contracts changed.",
        "",
        "Do not create external workflow directories. Keep active task state in `docs/tasks/<module>/` and durable project meaning in the canonical docs."
      ].join("\n")
    : [
        "## Repo-Native Workflow",
        "",
        "Repo-native task records still own durable repository state. When superpowers is used, map its outputs back into `docs/tasks/`, `docs/testing/`, `docs/context/`, and `docs/engineering/`."
      ].join("\n");

  return {
    deliveryWorkflow,
    executionWorkflowLine,
    repoNativeWorkflowSection,
    superpowersArtifactMapping,
    workflowCompatibilityRules,
    workflowToolingRules
  };
}
