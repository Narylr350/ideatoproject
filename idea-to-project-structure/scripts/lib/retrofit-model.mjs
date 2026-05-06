import fs from "node:fs";
import path from "node:path";

import { normalizeBool, normalizeSegment, requireFullDocsFields, splitCsv } from "./args.mjs";
import { usage } from "./constants.mjs";
import { discoverExistingProject } from "./discovery.mjs";
import { pathExists } from "./fs-utils.mjs";

export async function buildRetrofitModel(args, manifest) {
  if (!args["project-root"]) {
    throw new Error(usage.trim());
  }
  const projectRoot = path.resolve(args["project-root"]);
  if (!(await pathExists(projectRoot))) {
    throw new Error(`Project root does not exist: ${projectRoot}`);
  }

  const docsMode = args["docs-mode"] ?? "loopnova";
  if (!["loopnova", "full-docs", "none"].includes(docsMode)) {
    throw new Error(`Unsupported docs mode: ${docsMode}`);
  }
  const executionWorkflow = args["execution-workflow"] ?? "repo-native";
  if (!["superpowers", "repo-native"].includes(executionWorkflow)) {
    throw new Error(`Unsupported execution workflow: ${executionWorkflow}`);
  }

  const discovered = await discoverExistingProject(projectRoot, args, manifest);
  const retrofitDepth = args["retrofit-depth"] ?? "overlay-only";
  if (!["overlay-only"].includes(retrofitDepth)) {
    throw new Error(`Unsupported retrofit depth: ${retrofitDepth}`);
  }
  const instructionFileMode = args["instruction-file-mode"] ?? "skip";
  if (!["skip", "append", "overwrite"].includes(instructionFileMode)) {
    throw new Error(`Unsupported instruction file mode: ${instructionFileMode}`);
  }
  const existingInstructionFiles = ["AGENTS.md", "CLAUDE.md"].filter((file) =>
    fs.existsSync(path.join(projectRoot, file))
  );

  const config = {
    projectName: args.name?.trim() || path.basename(projectRoot),
    projectSlug: normalizeSegment(args.name?.trim() || path.basename(projectRoot)),
    shape: discovered.shape,
    platform: args.platform ?? "none",
    runtime: args.runtime ?? "none",
    ui: args.ui ?? "none",
    frontend: discovered.frontend,
    backend: discovered.backend,
    mobile: discovered.mobile,
    packageManager: args["package-manager"] ?? discovered.packageManager,
    executionWorkflow,
    withAdmin: discovered.withAdmin,
    withWorker: discovered.withWorker,
    withRoadmap: normalizeBool(args["with-roadmap"], false),
    docsMode,
    idea: discovered.idea,
    targetUsers: discovered.targetUsers,
    coreFlow: discovered.coreFlow,
    mvp: args.mvp ?? "TODO: define the first useful release scope.",
    nonGoals: args["non-goals"] ?? "TODO: define explicit v1 exclusions.",
    successMetrics: args["success-metrics"] ?? "",
    keyWorkflows: args["key-workflows"] ?? "",
    integrations: args.integrations ?? "No external integrations are confirmed yet.",
    testingStrategy: args["testing-strategy"] ?? "TODO: define the validation approach.",
    apiScope: args["api-scope"] ?? "No concrete API scope has been confirmed yet.",
    risks: args.risks ?? "",
    openQuestions: args["open-questions"] ?? "",
    roadmapGoal: args["roadmap-goal"] ?? "TODO: define the retrofit delivery route and milestone sequence if roadmap planning is desired.",
    engineeringDocs: splitCsv(args["engineering-docs"]),
    dryRun: Boolean(args["dry-run"]),
    force: Boolean(args.force),
    retrofitDepth,
    instructionFileMode
  };

  const apps = discovered.apps;
  const domains = discovered.domains;
  config.hasApiBoundary = apps.some((app) => app.id === "api") || config.backend !== "none";
  requireFullDocsFields(config);

  const directories = new Set([
    "docs/archive",
    "docs/context",
    "docs/product",
    "docs/engineering",
    "docs/tasks",
    "docs/testing"
  ]);
  const files = new Set([
    "AGENTS.md",
    "CLAUDE.md",
    "AI_CONTEXT.md",
    "docs/context/project-overview.md",
    "docs/context/retrofit-mapping.md",
    "docs/context/architecture.md",
    "docs/context/tech-stack.md",
    "docs/product/idea.md",
    "docs/tasks/TEMPLATE.md",
    "docs/testing/README.md"
  ]);
  if (config.hasApiBoundary || config.engineeringDocs.includes("api")) {
    files.add("docs/engineering/api.md");
  }
  if (config.withRoadmap) {
    files.add("docs/context/development-roadmap.md");
  }
  for (const engineeringDoc of config.engineeringDocs) {
    files.add(`docs/engineering/${engineeringDoc}.md`);
  }
  for (const domain of domains) {
    directories.add(`docs/tasks/${domain}`);
    files.add(`docs/tasks/${domain}/INDEX.md`);
  }

  const retrofitNotes = [
    `Retrofit mode: \`${retrofitDepth}\``,
    "Source directories are preserved by default.",
    `Instruction file handling: \`${instructionFileMode}\``,
    existingInstructionFiles.length > 0
      ? `Existing instruction files detected: ${existingInstructionFiles.join(", ")}`
      : "No existing AGENTS.md or CLAUDE.md detected.",
    discovered.canonicalDocs.length > 0
      ? `Existing canonical docs detected: ${discovered.canonicalDocs.join(", ")}`
      : "No strong canonical docs were detected automatically."
  ];
  const retrofitCanonicalDocs = discovered.canonicalDocs;
  const retrofitSourceRoots = [...new Set(apps.map((app) => app.path))];
  let retrofitPreserveItems = [
    ...retrofitSourceRoots.map((entry) => `Keep \`${entry}\` in place during the initial retrofit.`),
    ...retrofitCanonicalDocs.map((entry) => `Preserve existing canonical doc \`${entry}\` unless there is an explicit overwrite decision.`)
  ];
  if (retrofitPreserveItems.length === 0) {
    retrofitPreserveItems = ["Keep the current source tree in place during the initial retrofit."];
  }
  const retrofitFollowUpItems = [
    "Keep this retrofit limited to bootstrap files, canonical docs, and project-structure mapping.",
    "If repeated work still causes confusion, propose a separate, explicit code-refactor effort instead of treating it as part of this skill.",
    "Promote durable legacy notes into canonical docs only after the team confirms they are still accurate."
  ];

  return {
    mode: "retrofit",
    projectRoot,
    config,
    apps,
    domains,
    directories,
    files,
    sharedEntries: [],
    retrofitNotes,
    retrofitCanonicalDocs,
    retrofitSourceRoots,
    retrofitPreserveItems,
    retrofitFollowUpItems,
    existingInstructionFiles
  };
}
