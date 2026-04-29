# Scripts

This directory contains the project-structure generator used by the
`idea-to-project-structure` skill.

The CLI entrypoint is intentionally thin:

- `init-project-structure.mjs`: parses `process.argv`, calls the runner, and handles fatal errors.
- `init-project-structure.test.mjs`: end-to-end and structure tests for the generator.

## Runtime Flow

```text
init-project-structure.mjs
  -> lib/runner.mjs
  -> lib/scaffold-model.mjs
  -> lib/template-model.mjs
  -> lib/writer.mjs
```

`runner.mjs` owns the high-level orchestration:

1. parse CLI args
2. load the shape manifest
3. build the scaffold model
4. build template variables and dry-run plan
5. either print the dry-run plan or write files

## Module Boundaries

- `lib/args.mjs`: CLI parsing, boolean/list normalization, slug normalization, and full-docs required-field checks.
- `lib/constants.mjs`: shared paths, usage text, package-manager sets, and ignored directory names.
- `lib/docs-layer.mjs`: shared docs directory/file additions used by new project scaffolds.
- `lib/discovery.mjs`: retrofit discovery orchestration; combines lower-level project and stack detection.
- `lib/formatters.mjs`: template rendering, bullets, structure trees, app labels, and stack-fit summaries.
- `lib/fs-utils.mjs`: filesystem helpers, template loading, package/README reads, and generated-file writing.
- `lib/new-project-model.mjs`: converts new-project args and shape manifest data into a scaffold model.
- `lib/project-detection.mjs`: detects existing app roots, domains, canonical docs, and inferred shape.
- `lib/retrofit-model.mjs`: converts existing-project discovery into a retrofit scaffold model.
- `lib/runner.mjs`: public orchestration entrypoint used by the CLI and tests.
- `lib/scaffold-model.mjs`: mode router for `new` and `retrofit` model builders.
- `lib/stack-detection.mjs`: detects package manager and frontend/backend/mobile stack hints.
- `lib/template-model.mjs`: converts a scaffold model into template variables and dry-run plan JSON.
- `lib/workflow-copy.mjs`: repo-native and superpowers workflow copy used in generated docs.
- `lib/workspace-files.mjs`: generated non-template workspace files such as `.gitignore`, `package.json`, and `pnpm-workspace.yaml`.
- `lib/writer.mjs`: writes template-backed files, module indexes, workspace files, and app README files.

## Maintenance Rules

- Keep `init-project-structure.mjs` as a thin CLI wrapper.
- Add detection logic to `project-detection.mjs` or `stack-detection.mjs`, not to `discovery.mjs`.
- Add new scaffold-mode construction logic to a dedicated model file, then route it through `scaffold-model.mjs`.
- Add generated documentation wording to templates or `workflow-copy.mjs`, not to the runner.
- Add generated non-template files to `workspace-files.mjs`, not to `writer.mjs`.
- Keep `writer.mjs` focused on write orchestration.

## Verification

Run the full generator test suite:

```bash
node --test idea-to-project-structure/scripts/init-project-structure.test.mjs
```

Run a syntax check for all script modules:

```powershell
Get-ChildItem -LiteralPath 'idea-to-project-structure\scripts' -Recurse -Filter '*.mjs' |
  ForEach-Object { node --check $_.FullName }
```
