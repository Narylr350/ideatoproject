import { writeGeneratedText } from "./fs-utils.mjs";

function buildGitignore() {
  const entries = [
    "# OS and editor files",
    ".DS_Store",
    "Thumbs.db",
    ".idea/",
    ".vscode/",
    "",
    "# Local AI tool state",
    ".codex/",
    ".claude/",
    ".gemini/",
    ".cursor/",
    ".continue/",
    ".aider*",
    ".roo/",
    ".windsurf/",
    "",
    "# Generated AI context docs",
    "AGENTS.md",
    "CLAUDE.md",
    "AI_CONTEXT.md",
    "docs/**",
    "",
    "# Local environment",
    ".env",
    ".env.*",
    "!.env.example",
    "",
    "# Logs and test output",
    "logs/",
    "*.log",
    "coverage/",
    "TestResults/",
    "",
    "# Build output",
    "dist/",
    "build/",
    "out/"
  ];

  return `${entries.join("\n")}\n`;
}

export async function writeWorkspaceFile({ file, targetPath, model, writes, skips }) {
  const { config, directories, mode } = model;

  if (file === ".gitignore") {
    await writeGeneratedText(targetPath, buildGitignore(), {
      dryRun: false,
      overwrite: mode === "new" || config.force,
      writes,
      skips
    });
    return true;
  }

  if (file === "package.json") {
    const workspacePatterns = [...directories]
      .filter((dir) => dir.startsWith("apps/") || dir.startsWith("packages/"))
      .map((dir) => dir.split("/").slice(0, 2).join("/"));
    const uniquePatterns = [...new Set(workspacePatterns)];
    const packageJson = {
      name: config.projectSlug,
      private: true,
      packageManager: config.packageManager === "none" ? undefined : config.packageManager,
      workspaces: uniquePatterns.length > 0 ? uniquePatterns : undefined
    };
    await writeGeneratedText(targetPath, `${JSON.stringify(packageJson, null, 2)}\n`, {
      dryRun: false,
      overwrite: mode === "new" || config.force,
      writes,
      skips
    });
    return true;
  }

  if (file === "pnpm-workspace.yaml") {
    const patterns = ["apps/*", "packages/*"];
    await writeGeneratedText(
      targetPath,
      `packages:\n${patterns.map((value) => `  - "${value}"`).join("\n")}\n`,
      {
        dryRun: false,
        overwrite: mode === "new" || config.force,
        writes,
        skips
      }
    );
    return true;
  }

  return false;
}
