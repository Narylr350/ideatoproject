#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, "..");
const templatesRoot = path.join(skillRoot, "assets", "templates");
const manifestPath = path.join(templatesRoot, "shapes", "manifest.json");

const usage = `
Usage:
  New project:
    node scripts/init-project-structure.mjs --mode new --root <dir> --name <project-name> --shape <shape> [options]

  Retrofit existing project:
    node scripts/init-project-structure.mjs --mode retrofit --project-root <dir> [options]

Shapes:
  single-app
  frontend-backend
  monorepo-web-api-admin
  mobile-api-admin
  ai-service-app

Options:
  --frontend <value>        react | nextjs | vue | nuxt | svelte | none
  --backend <value>         fastapi | nestjs | spring-boot | express | go | none
  --mobile <value>          flutter | react-native | none
  --package-manager <value> pnpm | npm | yarn | bun | maven | gradle | none
  --execution-workflow <value> superpowers | repo-native
  --with-admin <bool>       true | false
  --with-worker <bool>      true | false
  --with-roadmap <bool>     true | false
  --domains <csv>           auth,listing,order,admin
  --idea <text>             short product summary
  --target-users <text>     short target-user summary
  --core-flow <text>        short core loop summary
  --roadmap-goal <text>     high-level target route for the project
  --milestones <text>       milestone list separated by |
  --docs-mode <value>       loopnova | none
  --retrofit-depth <value>  overlay-only | overlay-and-restructure
  --instruction-file-mode <value> skip | append | overwrite
  --project-root <dir>      existing repository root for retrofit mode
  --dry-run                 print plan only
  --force                   allow writing into an existing project folder
`;

const truthy = new Set(["true", "1", "yes", "y"]);
const falsy = new Set(["false", "0", "no", "n"]);
const jsManagers = new Set(["pnpm", "npm", "yarn", "bun"]);
const fileNamesToIgnore = new Set([
  ".git",
  ".idea",
  ".vscode",
  ".claude",
  ".codex-tmp",
  ".codex-logs",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "logs",
  "tmp",
  "temp"
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    if (key === "dry-run" || key === "force") {
      args[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function normalizeSegment(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeBool(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (truthy.has(normalized)) {
    return true;
  }
  if (falsy.has(normalized)) {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
}

function splitCsv(value) {
  if (!value) {
    return [];
  }
  return [...new Set(value.split(",").map(normalizeSegment).filter(Boolean))];
}

function splitMilestones(value) {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");
}

function formatBullets(values) {
  return values.map((value) => `- ${value}`).join("\n");
}

function buildStructureTree(projectSlug, directories, files) {
  const lines = [`${projectSlug}/`];
  const topLevel = new Map();

  for (const entry of [...directories, ...files]) {
    const parts = entry.split("/").filter(Boolean);
    if (parts.length === 0) {
      continue;
    }
    const head = parts[0];
    if (!topLevel.has(head)) {
      topLevel.set(head, new Set());
    }
    if (parts.length > 1) {
      topLevel.get(head).add(parts[1]);
    }
  }

  const topEntries = [...topLevel.keys()].sort();
  topEntries.forEach((head, index) => {
    const isLastHead = index === topEntries.length - 1;
    const headPrefix = isLastHead ? "└─ " : "├─ ";
    const children = [...topLevel.get(head)].sort();
    if (children.length === 0) {
      const isFile = files.some((entry) => entry === head);
      lines.push(`${headPrefix}${head}${isFile ? "" : "/"}`);
      return;
    }

    lines.push(`${headPrefix}${head}/`);
    children.forEach((child, childIndex) => {
      const childPrefix = isLastHead ? "   " : "│  ";
      const childConnector = childIndex === children.length - 1 ? "└─ " : "├─ ";
      const childIsFile = files.some((entry) => entry === `${head}/${child}`);
      lines.push(`${childPrefix}${childConnector}${child}${childIsFile ? "" : "/"}`);
    });
  });

  return lines.join("\n");
}

function appStack(appId, config) {
  if (appId === "api") {
    return config.backend;
  }
  if (appId === "mobile") {
    return config.mobile;
  }
  if (appId === "worker") {
    return config.backend === "none" ? "node-or-python-worker" : `${config.backend} worker`;
  }
  if (appId === "app") {
    if (config.frontend !== "none" && config.backend !== "none") {
      return `${config.frontend} + ${config.backend}`;
    }
    return config.frontend !== "none" ? config.frontend : config.backend;
  }
  return config.frontend;
}

function appRole(appId) {
  switch (appId) {
    case "web":
      return "User-facing product surface.";
    case "api":
      return "Backend API and business orchestration boundary.";
    case "admin":
      return "Admin or operator-facing surface.";
    case "mobile":
      return "Mobile client for end users.";
    case "worker":
      return "Background jobs, queue consumers, or AI workloads.";
    case "app":
      return "Primary application root for the product.";
    default:
      return "Application surface.";
  }
}

function buildApiGroups(domains, withAdmin) {
  const groups = domains.length > 0 ? domains : ["core"];
  const values = groups.map((domain) => `- \`/api/${domain}/*\``);
  if (withAdmin) {
    values.push("- `/api/admin/*`");
  }
  return values.join("\n");
}

function buildTechStackFit(config) {
  const parts = [];
  if (config.frontend !== "none") {
    parts.push(`Frontend work is expected in \`${config.frontend}\`.`);
  }
  if (config.backend !== "none") {
    parts.push(`Backend work is expected in \`${config.backend}\`.`);
  } else {
    parts.push("There is no standalone backend boundary in the current structure.");
  }
  if (config.mobile !== "none") {
    parts.push(`Mobile work is expected in \`${config.mobile}\`.`);
  }
  if (config.withWorker) {
    parts.push("A worker boundary is present for asynchronous or background execution.");
  }
  return parts.join(" ");
}

async function loadText(relativePath) {
  return fsp.readFile(path.join(templatesRoot, relativePath), "utf8");
}

async function pathExists(targetPath) {
  try {
    await fsp.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath, dryRun) {
  if (dryRun) {
    return;
  }
  await fsp.mkdir(dirPath, { recursive: true });
}

async function writeText(targetPath, content, dryRun) {
  if (dryRun) {
    return;
  }
  await ensureDir(path.dirname(targetPath), false);
  await fsp.writeFile(targetPath, content, "utf8");
}

async function readPackageJson(packageJsonPath) {
  try {
    const raw = await fsp.readFile(packageJsonPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readReadmeSummary(projectRoot) {
  const candidates = ["README.md", "readme.md", "README.MD"];
  for (const candidate of candidates) {
    const filePath = path.join(projectRoot, candidate);
    if (!(await pathExists(filePath))) {
      continue;
    }
    const content = await fsp.readFile(filePath, "utf8");
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"));
    if (lines.length > 0) {
      return lines[0];
    }
  }
  return null;
}

async function writeGeneratedText(targetPath, content, { dryRun, overwrite, writes, skips, existingMode }) {
  const exists = await pathExists(targetPath);
  const resolvedMode = existingMode ?? (overwrite ? "overwrite" : "skip");
  if (exists) {
    if (resolvedMode === "skip") {
      skips.push(targetPath);
      return;
    }
    if (resolvedMode === "append") {
      const current = await fsp.readFile(targetPath, "utf8");
      if (current.includes(content)) {
        skips.push(targetPath);
        return;
      }
      writes.push(targetPath);
      if (dryRun) {
        return;
      }
      const separator = current.endsWith("\n") ? "\n" : "\n\n";
      await ensureDir(path.dirname(targetPath), false);
      await fsp.writeFile(
        targetPath,
        `${current}${separator}<!-- idea-to-project-structure appended guidance -->\n\n${content}`,
        "utf8"
      );
      return;
    }
  }
  writes.push(targetPath);
  if (dryRun) {
    return;
  }
  await ensureDir(path.dirname(targetPath), false);
  await fsp.writeFile(targetPath, content, "utf8");
}

function topLevelDirsToAppEntries(dirNames) {
  const apps = [];
  const add = (id, dir, label) => {
    if (!apps.some((entry) => entry.path === dir)) {
      apps.push({ id, path: dir, label });
    }
  };

  for (const dirName of dirNames) {
    const normalized = normalizeSegment(dirName);
    if (["web", "frontend", "client", "site"].includes(normalized)) {
      add("web", dirName, "User-facing web app");
      continue;
    }
    if (["api", "backend", "server"].includes(normalized)) {
      add("api", dirName, "Backend API");
      continue;
    }
    if (["admin", "manager", "console"].includes(normalized)) {
      add("admin", dirName, "Admin app");
      continue;
    }
    if (["worker", "jobs", "queue"].includes(normalized)) {
      add("worker", dirName, "Worker service");
      continue;
    }
    if (["mobile", "android", "ios"].includes(normalized)) {
      add("mobile", dirName, "Mobile client");
      continue;
    }
    if (["src", "app", "lib"].includes(normalized)) {
      add("app", dirName, "Primary application code");
    }
  }

  return apps;
}

function inferShapeFromApps(apps) {
  const ids = new Set(apps.map((app) => app.id));
  if (ids.has("mobile")) {
    return "mobile-api-admin";
  }
  if (ids.has("worker")) {
    return "ai-service-app";
  }
  if (ids.has("web") && ids.has("api") && ids.has("admin")) {
    return "monorepo-web-api-admin";
  }
  if (ids.has("web") && ids.has("api")) {
    return "frontend-backend";
  }
  return "single-app";
}

async function detectPackageManager(projectRoot) {
  const checks = [
    ["pnpm-lock.yaml", "pnpm"],
    ["package-lock.json", "npm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["mvnw", "maven"],
    ["mvnw.cmd", "maven"],
    ["pom.xml", "maven"],
    ["build.gradle", "gradle"],
    ["build.gradle.kts", "gradle"]
  ];
  for (const [fileName, value] of checks) {
    if (await pathExists(path.join(projectRoot, fileName))) {
      return value;
    }
  }
  return "none";
}

async function detectDomains(projectRoot) {
  const candidates = [];
  const docsTasksPath = path.join(projectRoot, "docs", "tasks");
  if (await pathExists(docsTasksPath)) {
    const taskEntries = await fsp.readdir(docsTasksPath, { withFileTypes: true });
    for (const entry of taskEntries) {
      if (entry.isDirectory()) {
        candidates.push(normalizeSegment(entry.name));
      }
    }
  }

  const moduleRoots = [
    path.join(projectRoot, "src", "modules"),
    path.join(projectRoot, "app", "modules"),
    path.join(projectRoot, "apps", "web", "src", "modules"),
    path.join(projectRoot, "apps", "admin", "src", "modules"),
    path.join(projectRoot, "apps", "api", "src", "modules")
  ];
  for (const moduleRoot of moduleRoots) {
    if (!(await pathExists(moduleRoot))) {
      continue;
    }
    const moduleEntries = await fsp.readdir(moduleRoot, { withFileTypes: true });
    for (const entry of moduleEntries) {
      if (entry.isDirectory()) {
        candidates.push(normalizeSegment(entry.name));
      }
    }
  }

  return [...new Set(["platform", ...candidates.filter(Boolean)])];
}

async function detectCanonicalDocs(projectRoot) {
  const docs = [];
  const candidates = [
    "README.md",
    "docs/context/project-overview.md",
    "docs/context/architecture.md",
    "docs/context/tech-stack.md",
    "docs/engineering/api.md"
  ];
  for (const candidate of candidates) {
    if (await pathExists(path.join(projectRoot, candidate))) {
      docs.push(candidate);
    }
  }
  return docs;
}

async function detectStacks(projectRoot, apps) {
  const result = { frontend: "none", backend: "none", mobile: "none" };
  const packageJsons = [];
  const rootPackageJson = await readPackageJson(path.join(projectRoot, "package.json"));
  if (rootPackageJson) {
    packageJsons.push(rootPackageJson);
  }
  for (const app of apps) {
    const appPackageJson = await readPackageJson(path.join(projectRoot, app.path, "package.json"));
    if (appPackageJson) {
      packageJsons.push(appPackageJson);
    }
  }

  const deps = packageJsons.flatMap((pkg) =>
    Object.keys({ ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) })
  );

  if (deps.includes("next")) {
    result.frontend = "nextjs";
  } else if (deps.includes("nuxt")) {
    result.frontend = "nuxt";
  } else if (deps.includes("vue")) {
    result.frontend = "vue";
  } else if (deps.includes("react")) {
    result.frontend = "react";
  }

  if (deps.includes("@nestjs/core")) {
    result.backend = "nestjs";
  } else if (deps.includes("express")) {
    result.backend = "express";
  }

  if (deps.includes("react-native")) {
    result.mobile = "react-native";
  }

  if (await pathExists(path.join(projectRoot, "pom.xml"))) {
    result.backend = "spring-boot";
  }
  if ((await pathExists(path.join(projectRoot, "pyproject.toml"))) || (await pathExists(path.join(projectRoot, "requirements.txt")))) {
    if (result.backend === "none") {
      result.backend = "fastapi";
    }
  }
  if (await pathExists(path.join(projectRoot, "pubspec.yaml"))) {
    result.mobile = "flutter";
  }

  return result;
}

async function discoverExistingProject(projectRoot, args, manifest) {
  const entries = await fsp.readdir(projectRoot, { withFileTypes: true });
  const topLevelDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !fileNamesToIgnore.has(name));

  let apps = [];
  if (topLevelDirs.includes("apps")) {
    const appEntries = await fsp.readdir(path.join(projectRoot, "apps"), { withFileTypes: true });
    apps = appEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const normalized = normalizeSegment(entry.name);
        const id =
          normalized === "admin" ? "admin" :
          normalized === "api" ? "api" :
          normalized === "worker" ? "worker" :
          normalized === "mobile" ? "mobile" :
          normalized === "web" ? "web" : "app";
        return { id, path: `apps/${entry.name}`, label: appRole(id) };
      });
  } else {
    apps = topLevelDirsToAppEntries(topLevelDirs);
  }

  if (apps.length === 0) {
    apps = [{ id: "app", path: "app", label: "Primary application root" }];
  }

  const detectedStacks = await detectStacks(projectRoot, apps);
  const hasPrimarySurface = apps.some((app) => ["app", "web", "api", "mobile"].includes(app.id));
  if (!hasPrimarySurface) {
    const sourceDir = topLevelDirs.find((dirName) =>
      ["src", "app", "lib"].includes(normalizeSegment(dirName))
    );
    if (sourceDir) {
      apps.unshift({ id: "app", path: sourceDir, label: "Primary application code" });
    }
  }
  return {
    shape: args.shape && manifest.shapes[args.shape] ? args.shape : inferShapeFromApps(apps),
    apps,
    packageManager: await detectPackageManager(projectRoot),
    frontend: args.frontend ?? detectedStacks.frontend,
    backend: args.backend ?? detectedStacks.backend,
    mobile: args.mobile ?? detectedStacks.mobile,
    withAdmin: args["with-admin"] !== undefined ? normalizeBool(args["with-admin"], false) : apps.some((app) => app.id === "admin"),
    withWorker: args["with-worker"] !== undefined ? normalizeBool(args["with-worker"], false) : apps.some((app) => app.id === "worker"),
    domains: await detectDomains(projectRoot),
    idea: args.idea ?? (await readReadmeSummary(projectRoot)) ?? "TODO: summarize the existing project's product goal.",
    targetUsers: args["target-users"] ?? "TODO: define the primary users of the existing project.",
    coreFlow: args["core-flow"] ?? "TODO: describe the main existing product flow.",
    canonicalDocs: await detectCanonicalDocs(projectRoot)
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode = args.mode ?? "new";
  if (!["new", "retrofit"].includes(mode)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }
  const manifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  let projectRoot;
  let config;
  let apps;
  let domains;
  let directories;
  let files;
  let sharedEntries = [];
  let retrofitNotes = [];
  let retrofitCanonicalDocs = [];
  let retrofitSourceRoots = [];
  let retrofitPreserveItems = [];
  let retrofitFollowUpItems = [];
  let existingInstructionFiles = [];

  if (mode === "retrofit") {
    if (!args["project-root"]) {
      throw new Error(usage.trim());
    }
    projectRoot = path.resolve(args["project-root"]);
    if (!(await pathExists(projectRoot))) {
      throw new Error(`Project root does not exist: ${projectRoot}`);
    }

    const docsMode = args["docs-mode"] ?? "loopnova";
    if (!["loopnova", "none"].includes(docsMode)) {
      throw new Error(`Unsupported docs mode: ${docsMode}`);
    }
    const executionWorkflow = args["execution-workflow"] ?? "repo-native";
    if (!["superpowers", "repo-native"].includes(executionWorkflow)) {
      throw new Error(`Unsupported execution workflow: ${executionWorkflow}`);
    }

    const discovered = await discoverExistingProject(projectRoot, args, manifest);
    const retrofitDepth = args["retrofit-depth"] ?? "overlay-only";
    if (!["overlay-only", "overlay-and-restructure"].includes(retrofitDepth)) {
      throw new Error(`Unsupported retrofit depth: ${retrofitDepth}`);
    }
    const instructionFileMode = args["instruction-file-mode"] ?? "skip";
    if (!["skip", "append", "overwrite"].includes(instructionFileMode)) {
      throw new Error(`Unsupported instruction file mode: ${instructionFileMode}`);
    }
    existingInstructionFiles = [
      "AGENTS.md",
      "CLAUDE.md"
    ].filter((file) => fs.existsSync(path.join(projectRoot, file)));

    config = {
      projectName: args.name?.trim() || path.basename(projectRoot),
      projectSlug: normalizeSegment(args.name?.trim() || path.basename(projectRoot)),
      shape: discovered.shape,
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
      roadmapGoal: args["roadmap-goal"] ?? "TODO: define the retrofit delivery route and milestone sequence if roadmap planning is desired.",
      dryRun: Boolean(args["dry-run"]),
      force: Boolean(args.force),
      retrofitDepth,
      instructionFileMode
    };

    apps = discovered.apps;
    domains = discovered.domains;
    directories = new Set([
      "docs/context",
      "docs/product",
      "docs/engineering",
      "docs/tasks",
      "docs/testing"
    ]);
    files = new Set([
      "AGENTS.md",
      "CLAUDE.md",
      "AI_CONTEXT.md",
      "docs/context/project-overview.md",
      "docs/context/retrofit-mapping.md",
      "docs/context/architecture.md",
      "docs/context/tech-stack.md",
      "docs/product/idea.md",
      "docs/engineering/api.md",
      "docs/tasks/TEMPLATE.md"
    ]);
    if (config.withRoadmap) {
      files.add("docs/context/development-roadmap.md");
    }
    for (const domain of domains) {
      directories.add(`docs/tasks/${domain}`);
      directories.add(`docs/tasks/${domain}/history`);
      files.add(`docs/tasks/${domain}/INDEX.md`);
    }
    retrofitNotes = [
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
    retrofitCanonicalDocs = discovered.canonicalDocs;
    retrofitSourceRoots = [...new Set(apps.map((app) => app.path))];
    retrofitPreserveItems = [
      ...retrofitSourceRoots.map((entry) => `Keep \`${entry}\` in place during the initial retrofit.`),
      ...retrofitCanonicalDocs.map((entry) => `Preserve existing canonical doc \`${entry}\` unless there is an explicit overwrite decision.`)
    ];
    if (retrofitPreserveItems.length === 0) {
      retrofitPreserveItems = [
        "Keep the current source tree in place during the initial retrofit."
      ];
    }
    retrofitFollowUpItems = retrofitDepth === "overlay-and-restructure"
      ? [
          "Promote the most stable app boundaries into a clearer top-level layout such as `apps/` and `packages/` where justified.",
          "Move scattered durable docs into `docs/context/`, `docs/engineering/`, and `docs/product/` once ownership is clear.",
          "Reduce ambiguous module roots by introducing clearer domain ownership and task records under `docs/tasks/`."
        ]
      : [
          "Keep this first retrofit documentation-only and use it to validate canonical ownership before moving code.",
          "If repeated work still causes confusion, plan a second pass to consolidate source roots and shared packages.",
          "Promote durable legacy notes into canonical docs only after the team confirms they are still accurate."
        ];
  } else {
    if (!args.root || !args.name || !args.shape) {
      throw new Error(usage.trim());
    }
    const shapeConfig = manifest.shapes[args.shape];
    if (!shapeConfig) {
      throw new Error(`Unknown shape: ${args.shape}`);
    }

    const projectName = args.name.trim();
    const projectSlug = normalizeSegment(projectName);
    projectRoot = path.resolve(args.root, projectSlug);
    const docsMode = args["docs-mode"] ?? "loopnova";
    if (!["loopnova", "none"].includes(docsMode)) {
      throw new Error(`Unsupported docs mode: ${docsMode}`);
    }
    const executionWorkflow = args["execution-workflow"] ?? "repo-native";
    if (!["superpowers", "repo-native"].includes(executionWorkflow)) {
      throw new Error(`Unsupported execution workflow: ${executionWorkflow}`);
    }
    if (fs.existsSync(projectRoot) && !args.force) {
      throw new Error(`Target already exists: ${projectRoot}. Use --force to continue.`);
    }

    config = {
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
      roadmapGoal: args["roadmap-goal"] ?? "TODO: define the target route from MVP to later milestones.",
      dryRun: Boolean(args["dry-run"]),
      force: Boolean(args.force)
    };

    domains = [...new Set(["platform", ...splitCsv(args.domains)])];
    apps = [...shapeConfig.apps];
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

    directories = new Set();
    files = new Set();
    sharedEntries = [...(shapeConfig.packages ?? []), ...(shapeConfig.tools ?? [])];
    for (const app of apps) {
      directories.add(app.path);
    }
    for (const entry of sharedEntries) {
      directories.add(entry);
    }
    if (config.docsMode === "loopnova") {
      [
        "docs/context",
        "docs/product",
        "docs/engineering",
        "docs/tasks",
        "docs/testing"
      ].forEach((dir) => directories.add(dir));
      files.add("AI_CONTEXT.md");
      files.add("docs/context/project-overview.md");
      if (config.withRoadmap) {
        files.add("docs/context/development-roadmap.md");
      }
      files.add("docs/context/architecture.md");
      files.add("docs/context/tech-stack.md");
      files.add("docs/product/idea.md");
      files.add("docs/engineering/api.md");
      files.add("docs/tasks/TEMPLATE.md");
      for (const domain of domains) {
        directories.add(`docs/tasks/${domain}`);
        directories.add(`docs/tasks/${domain}/history`);
        files.add(`docs/tasks/${domain}/INDEX.md`);
      }
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
  }

  const milestones = splitMilestones(args.milestones);
  const structureTree = buildStructureTree(config.projectSlug, [...directories], [...files]);
  const appBullets = formatBullets(apps.map((app) => `\`${app.path}\`: ${app.label}`));
  const domainBullets = formatBullets(domains.map((domain) => `\`${domain}\``));
  const appBoundaries = formatBullets(
    apps.map((app) => `\`${app.path}\` owns the ${app.label.toLowerCase()} boundary.`)
  );
  const sharedBullets =
    sharedEntries.length > 0
      ? formatBullets(sharedEntries.map((entry) => `\`${entry}\``))
      : "- No dedicated shared directories yet.";
  const apiBullets = buildApiGroups(domains, config.withAdmin);
  const hasApiBoundary = apps.some((app) => app.id === "api") || config.backend !== "none";
  const apiApplicabilityHeading = hasApiBoundary ? "## Suggested API Groups" : "## Applicability";
  const apiApplicabilityBody = hasApiBoundary
    ? apiBullets
    : "This project does not currently have a standalone API boundary, so this document remains a light placeholder until an API surface is introduced.";
  const milestoneValues =
    milestones.length > 0
      ? milestones
      : [
          "Milestone 1: define the first usable MVP loop",
          "Milestone 2: stabilize the core flows and contracts",
          "Milestone 3: extend operational depth and non-core capabilities"
        ];
  const milestoneBullets = formatBullets(milestoneValues);
  const retrofitReadNote = mode === "retrofit" ? "" : " (when present)";
  const retrofitOwnershipNote = mode === "retrofit" ? "" : " (when present)";
  const roadmapReadNote = config.withRoadmap ? "" : " (read when present)";
  const roadmapOwnershipNote = config.withRoadmap ? "" : " (when present)";
  const roadmapSection = config.withRoadmap
    ? "## Delivery Direction\n\nThe canonical delivery direction lives in `docs/context/development-roadmap.md`.\n"
    : "";
  const retrofitSection = mode === "retrofit"
    ? "## Retrofit Mapping\n\nThe legacy-to-canonical structure map lives in `docs/context/retrofit-mapping.md`.\n"
    : "";
  const roadmapEntry = config.withRoadmap ? "- `docs/context/development-roadmap.md`" : "";
  const executionWorkflowLine = `- Execution workflow: \`${config.executionWorkflow}\``;
  const deliveryWorkflow = config.executionWorkflow === "superpowers"
    ? [
        "- Complex coding execution may use `using-superpowers` when the task needs multi-step implementation, substantial debugging, or plan -> implement -> verify.",
        "- Simple tasks should still run directly without superpowers overhead.",
        "- When superpowers is used, map its outputs into this repository's canonical paths instead of creating generic workflow directories."
      ].join("\n")
    : [
        "- Do not assume `using-superpowers` is available or required for this repository.",
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
        "- Do not assume `using-superpowers` is the default execution path for this repository.",
        "- Manage durable work artifacts directly in the canonical repository paths:",
        "  - stable project context -> `docs/context/`",
        "  - product intent -> `docs/product/`",
        "  - engineering contracts -> `docs/engineering/`",
        "  - task and module working records -> `docs/tasks/`",
        "- For complex work, record the plan, validation, and resulting boundary changes in-repo instead of depending on an external project-management workflow."
      ].join("\n");
  const superpowersArtifactMapping = config.executionWorkflow === "superpowers"
    ? [
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
        "This repository uses a repo-native workflow instead of depending on `using-superpowers` for project management.",
        "",
        "For complex work, keep these artifacts in-repo:",
        "- task scope and short plan -> `docs/tasks/<domain>/`",
        "- validation notes and evidence -> `docs/testing/`",
        "- durable architecture or boundary decisions -> `docs/context/architecture.md`",
        "- durable API and engineering contracts -> `docs/engineering/`",
        "",
        "This keeps project management recoverable from repository docs alone across new AI sessions."
      ].join("\n");
  const skillRouting = config.executionWorkflow === "superpowers"
    ? [
        "- Do not treat `using-superpowers` as the default entrypoint for every conversation.",
        "- Use `using-superpowers` only for complex coding execution tasks.",
        "- A task counts as complex when it involves at least one of:",
        "  - multi-step implementation or refactor",
        "  - non-trivial debugging or test-failure investigation",
        "  - coordinated code changes across multiple files, modules, or systems",
        "  - feature delivery that requires plan -> implement -> verify",
        "- For simple tasks, direct execution is preferred without superpowers workflow overhead.",
        "- For meta discussion, policy discussion, small Q&A, and other non-implementation work, reason directly from the conversation and project docs."
      ].join("\n")
    : [
        "- Do not route work through `using-superpowers` by default.",
        "- For simple tasks, execute directly.",
        "- For complex tasks, use the repo-native cycle: create or update the task record, write a short plan, implement, validate, and update affected context docs.",
        "- Only opt into `using-superpowers` later if the team explicitly decides the extra execution tooling is worth it."
      ].join("\n");
  const retrofitSourceBullets = mode === "retrofit"
    ? formatBullets(retrofitSourceRoots.map((entry) => `\`${entry}\``))
    : "- Not applicable for a new scaffold.";
  const existingCanonicalDocsBullets = mode === "retrofit" && retrofitCanonicalDocs.length > 0
    ? formatBullets(retrofitCanonicalDocs.map((entry) => `\`${entry}\``))
    : "- None detected yet.";
  const retrofitPreserveBullets = mode === "retrofit"
    ? formatBullets(retrofitPreserveItems)
    : "- Not applicable for a new scaffold.";
  const retrofitFollowUpBullets = mode === "retrofit"
    ? formatBullets(retrofitFollowUpItems)
    : "- Not applicable for a new scaffold.";
  const techStackFit = buildTechStackFit(config);

  const templateVars = {
    projectName: config.projectName,
    projectSlug: config.projectSlug,
    shape: config.shape,
    frontend: config.frontend,
    backend: config.backend,
    mobile: config.mobile,
    withAdmin: String(config.withAdmin),
    withWorker: String(config.withWorker),
    packageManager: config.packageManager,
    executionWorkflow: config.executionWorkflow,
    idea: config.idea,
    targetUsers: config.targetUsers,
    coreFlow: config.coreFlow,
    roadmapGoal: config.roadmapGoal,
    milestoneBullets,
    retrofitReadNote,
    retrofitOwnershipNote,
    roadmapReadNote,
    roadmapOwnershipNote,
    retrofitSection,
    roadmapSection,
    roadmapEntry,
    executionWorkflowLine,
    deliveryWorkflow,
    workflowCompatibilityRules,
    superpowersArtifactMapping,
    skillRouting,
    techStackFit,
    appBullets,
    domainBullets,
    appBoundaries,
    sharedBullets,
    apiBullets,
    apiApplicabilityHeading,
    apiApplicabilityBody,
    retrofitSourceBullets,
    existingCanonicalDocsBullets,
    retrofitPreserveBullets,
    retrofitFollowUpBullets,
    structureTree
  };

  const plan = {
    mode,
    projectRoot,
    shape: config.shape,
    retrofitDepth: config.retrofitDepth ?? null,
    instructionFileMode: config.instructionFileMode ?? null,
    existingInstructionFiles,
    apps: apps.map((app) => app.path),
    canonicalDocs: retrofitCanonicalDocs,
    directories: [...directories].sort(),
    files: [...files].sort(),
    notes: retrofitNotes
  };

  if (config.dryRun) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  await ensureDir(projectRoot, false);
  for (const dir of directories) {
    await ensureDir(path.join(projectRoot, dir), false);
  }

  const templates = {
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
    "docs/tasks/TEMPLATE.md": await loadText("docs/task-template.md.tmpl"),
    "app-readme": await loadText("docs/app-readme.md.tmpl"),
    "module-index": await loadText("docs/module-index.md.tmpl")
  };

  const writes = [];
  const skips = [];

  for (const file of files) {
    const targetPath = path.join(projectRoot, file);
    if (file.endsWith("/INDEX.md")) {
      const moduleName = file.split("/").slice(-2, -1)[0];
      const content = renderTemplate(templates["module-index"], {
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

    if (file === ".gitignore") {
      await writeGeneratedText(
        targetPath,
        "node_modules/\ndist/\nbuild/\ncoverage/\n.env\n.DS_Store\n.idea/\n.vscode/\n",
        {
          dryRun: false,
          overwrite: mode === "new" || config.force,
          writes,
          skips
        }
      );
      continue;
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
      continue;
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

  if (mode === "retrofit") {
    console.log(`Retrofitted AI-friendly docs layer at ${projectRoot}`);
    if (skips.length > 0) {
      console.log(`Skipped existing files: ${skips.length}`);
    }
    return;
  }

  console.log(`Created project structure at ${projectRoot}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
