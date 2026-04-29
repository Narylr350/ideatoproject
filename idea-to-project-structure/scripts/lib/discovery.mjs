import { normalizeBool, normalizeSegment } from "./args.mjs";
import {
  detectCanonicalDocs,
  detectDomains,
  detectProjectApps,
  detectTopLevelDirs,
  inferShapeFromApps
} from "./project-detection.mjs";
import { detectPackageManager, detectStacks } from "./stack-detection.mjs";
import { readReadmeSummary } from "./fs-utils.mjs";

export async function discoverExistingProject(projectRoot, args, manifest) {
  const topLevelDirs = await detectTopLevelDirs(projectRoot);
  const apps = await detectProjectApps(projectRoot, topLevelDirs);
  const detectedStacks = await detectStacks(projectRoot, apps);
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
