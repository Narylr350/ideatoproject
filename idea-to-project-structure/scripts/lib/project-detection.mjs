import fsp from "node:fs/promises";
import path from "node:path";

import { normalizeSegment } from "./args.mjs";
import { fileNamesToIgnore } from "./constants.mjs";
import { appRole } from "./formatters.mjs";
import { pathExists } from "./fs-utils.mjs";

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

export function inferShapeFromApps(apps) {
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

export async function detectTopLevelDirs(projectRoot) {
  const entries = await fsp.readdir(projectRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !fileNamesToIgnore.has(name));
}

export async function detectProjectApps(projectRoot, topLevelDirs) {
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

  const hasPrimarySurface = apps.some((app) => ["app", "web", "api", "mobile"].includes(app.id));
  if (!hasPrimarySurface) {
    const sourceDir = topLevelDirs.find((dirName) =>
      ["src", "app", "lib"].includes(normalizeSegment(dirName))
    );
    if (sourceDir) {
      apps.unshift({ id: "app", path: sourceDir, label: "Primary application code" });
    }
  }

  return apps;
}

export async function detectDomains(projectRoot) {
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

export async function detectCanonicalDocs(projectRoot) {
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
