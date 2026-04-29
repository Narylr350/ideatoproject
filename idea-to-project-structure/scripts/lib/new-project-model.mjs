import fs from "node:fs";
import path from "node:path";

import { normalizeBool, normalizeSegment, requireFullDocsFields, splitCsv } from "./args.mjs";
import { jsManagers, usage } from "./constants.mjs";
import { addDocsLayer } from "./docs-layer.mjs";

export function buildNewProjectModel(args, manifest) {
  if (!args.root || !args.name || !args.shape) {
    throw new Error(usage.trim());
  }
  const shapeConfig = manifest.shapes[args.shape];
  if (!shapeConfig) {
    throw new Error(`Unknown shape: ${args.shape}`);
  }

  const projectName = args.name.trim();
  const projectSlug = normalizeSegment(projectName);
  const projectRoot = path.resolve(args.root, projectSlug);
  const docsMode = args["docs-mode"] ?? "loopnova";
  if (!["loopnova", "full-docs", "none"].includes(docsMode)) {
    throw new Error(`Unsupported docs mode: ${docsMode}`);
  }
  const executionWorkflow = args["execution-workflow"] ?? "repo-native";
  if (!["superpowers", "repo-native"].includes(executionWorkflow)) {
    throw new Error(`Unsupported execution workflow: ${executionWorkflow}`);
  }
  if (fs.existsSync(projectRoot) && !args.force) {
    throw new Error(`Target already exists: ${projectRoot}. Use --force to continue.`);
  }

  const config = {
    projectName,
    projectSlug,
    shape: args.shape,
    frontend: args.frontend ?? "none",
    backend: args.backend ?? "none",
    mobile: args.mobile ?? "none",
    packageManager: args["package-manager"] ?? "none",
    executionWorkflow,
    withAdmin: normalizeBool(args["with-admin"], shapeConfig.defaultWithAdmin),
    withWorker: normalizeBool(args["with-worker"], shapeConfig.defaultWithWorker),
    withRoadmap: normalizeBool(args["with-roadmap"], false),
    docsMode,
    idea: args.idea ?? "TODO: summarize the product idea.",
    targetUsers: args["target-users"] ?? "TODO: define the primary target users.",
    coreFlow: args["core-flow"] ?? "TODO: define the primary product loop.",
    mvp: args.mvp ?? "TODO: define the first useful release scope.",
    nonGoals: args["non-goals"] ?? "TODO: define explicit v1 exclusions.",
    successMetrics: args["success-metrics"] ?? "",
    keyWorkflows: args["key-workflows"] ?? "",
    integrations: args.integrations ?? "No external integrations are confirmed yet.",
    testingStrategy: args["testing-strategy"] ?? "TODO: define the validation approach.",
    apiScope: args["api-scope"] ?? "No concrete API scope has been confirmed yet.",
    risks: args.risks ?? "",
    openQuestions: args["open-questions"] ?? "",
    roadmapGoal: args["roadmap-goal"] ?? "TODO: define the target route from MVP to later milestones.",
    dryRun: Boolean(args["dry-run"]),
    force: Boolean(args.force)
  };

  const domains = [...new Set(["platform", ...splitCsv(args.domains)])];
  const apps = [...shapeConfig.apps];
  const optionalApps = shapeConfig.optionalApps ?? [];
  for (const optionalApp of optionalApps) {
    if (optionalApp.id === "admin" && config.withAdmin) {
      apps.push(optionalApp);
    }
    if (optionalApp.id === "worker" && config.withWorker) {
      apps.push(optionalApp);
    }
  }
  if (config.withWorker && !apps.some((app) => app.id === "worker")) {
    apps.push({ id: "worker", path: "apps/worker", label: "Worker service" });
  }

  const directories = new Set();
  const files = new Set();
  const sharedEntries = [...(shapeConfig.packages ?? []), ...(shapeConfig.tools ?? [])];
  for (const app of apps) {
    directories.add(app.path);
  }
  for (const entry of sharedEntries) {
    directories.add(entry);
  }
  requireFullDocsFields(config);

  if (config.docsMode !== "none") {
    addDocsLayer({ config, domains, directories, files });
  }
  files.add("README.md");
  files.add("AGENTS.md");
  files.add("CLAUDE.md");
  files.add(".gitignore");

  const createWorkspace =
    jsManagers.has(config.packageManager) &&
    [...directories].some((dir) => dir.startsWith("apps/") || dir.startsWith("packages/"));
  if (createWorkspace) {
    files.add("package.json");
    if (config.packageManager === "pnpm") {
      files.add("pnpm-workspace.yaml");
    }
  }

  return {
    mode: "new",
    projectRoot,
    config,
    apps,
    domains,
    directories,
    files,
    sharedEntries,
    retrofitNotes: [],
    retrofitCanonicalDocs: [],
    retrofitSourceRoots: [],
    retrofitPreserveItems: [],
    retrofitFollowUpItems: [],
    existingInstructionFiles: []
  };
}
