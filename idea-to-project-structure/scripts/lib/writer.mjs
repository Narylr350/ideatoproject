import path from "node:path";

import { appRole, appStack, renderTemplate } from "./formatters.mjs";
import { ensureDir, loadText, writeGeneratedText } from "./fs-utils.mjs";
import { writeWorkspaceFile } from "./workspace-files.mjs";

async function loadTemplates() {
  return {
    "README.md": await loadText("docs/README.md.tmpl"),
    "AGENTS.md": await loadText("docs/AGENTS.md.tmpl"),
    "CLAUDE.md": await loadText("docs/CLAUDE.md.tmpl"),
    "AI_CONTEXT.md": await loadText("docs/AI_CONTEXT.md.tmpl"),
    "docs/context/project-overview.md": await loadText("docs/project-overview.md.tmpl"),
    "docs/context/retrofit-mapping.md": await loadText("docs/retrofit-mapping.md.tmpl"),
    "docs/context/development-roadmap.md": await loadText("docs/development-roadmap.md.tmpl"),
    "docs/context/architecture.md": await loadText("docs/architecture.md.tmpl"),
    "docs/context/tech-stack.md": await loadText("docs/tech-stack.md.tmpl"),
    "docs/product/idea.md": await loadText("docs/idea.md.tmpl"),
    "docs/engineering/api.md": await loadText("docs/api.md.tmpl"),
    "engineering-boundary": await loadText("docs/engineering-boundary.md.tmpl"),
    "docs/tasks/TEMPLATE.md": await loadText("docs/task-template.md.tmpl"),
    "docs/testing/README.md": await loadText("docs/testing-readme.md.tmpl"),
    "app-readme": await loadText("docs/app-readme.md.tmpl"),
    "module-index": await loadText("docs/module-index.md.tmpl")
  };
}

export async function writeScaffold(model, templateVars) {
  const { apps, config, directories, files, mode, projectRoot } = model;
  await ensureDir(projectRoot, false);
  for (const dir of directories) {
    await ensureDir(path.join(projectRoot, dir), false);
  }

  const templates = await loadTemplates();
  const writes = [];
  const skips = [];

  for (const file of files) {
    const targetPath = path.join(projectRoot, file);
    if (file.endsWith("/INDEX.md")) {
      const moduleName = file.split("/").slice(-2, -1)[0];
      const content = renderTemplate(templates["module-index"], {
        ...templateVars,
        moduleName
      });
      await writeGeneratedText(targetPath, content, {
        dryRun: false,
        overwrite: mode === "new" || config.force,
        writes,
        skips
      });
      continue;
    }

    if (file.startsWith("docs/engineering/") && !templates[file]) {
      const engineeringDocName = path.basename(file, ".md");
      const content = renderTemplate(templates["engineering-boundary"], {
        ...templateVars,
        engineeringDocName
      });
      await writeGeneratedText(targetPath, content, {
        dryRun: false,
        overwrite: mode === "new" || config.force,
        writes,
        skips
      });
      continue;
    }

    if (templates[file]) {
      const isInstructionFile = mode === "retrofit" && ["AGENTS.md", "CLAUDE.md"].includes(file);
      await writeGeneratedText(targetPath, renderTemplate(templates[file], templateVars), {
        dryRun: false,
        overwrite: mode === "new" || config.force,
        existingMode: isInstructionFile ? config.instructionFileMode : undefined,
        writes,
        skips
      });
      continue;
    }

    if (await writeWorkspaceFile({ file, targetPath, model, writes, skips })) {
      continue;
    }
  }

  if (mode === "new") {
    for (const app of apps) {
      const targetPath = path.join(projectRoot, app.path, "README.md");
      const content = renderTemplate(templates["app-readme"], {
        appLabel: app.label,
        appRole: appRole(app.id),
        appStack: appStack(app.id, config)
      });
      await writeGeneratedText(targetPath, content, {
        dryRun: false,
        overwrite: true,
        writes,
        skips
      });
    }
  }

  return { writes, skips };
}
