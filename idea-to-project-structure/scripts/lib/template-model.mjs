import { splitMilestones, textOrOpen } from "./args.mjs";
import {
  buildApiGroups,
  buildBoundaryRules,
  buildSelectedStackBullets,
  buildStructureTree,
  buildTechStackFit,
  formatBullets,
  formatList
} from "./formatters.mjs";
import { buildWorkflowCopy } from "./workflow-copy.mjs";

export function buildTemplateContext(model, args) {
  const {
    mode,
    projectRoot,
    config,
    apps,
    domains,
    directories,
    files,
    sharedEntries,
    retrofitNotes,
    retrofitCanonicalDocs,
    retrofitSourceRoots,
    retrofitPreserveItems,
    retrofitFollowUpItems,
    existingInstructionFiles
  } = model;

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
  const selectedStackBullets = buildSelectedStackBullets(config);
  const boundaryRules = buildBoundaryRules(config);
  const engineeringDocsBullets =
    config.engineeringDocs?.length > 0
      ? formatBullets(config.engineeringDocs.map((entry) => `docs/engineering/${entry}.md`))
      : "- No extra engineering boundary docs were requested for the initial scaffold.";
  const mvpScope = textOrOpen(config.mvp, "Open question: define the first useful release scope.");
  const nonGoals = textOrOpen(config.nonGoals, "Open question: define explicit v1 exclusions.");
  const integrations = textOrOpen(config.integrations, "No external integrations are confirmed yet.");
  const testingStrategy = textOrOpen(config.testingStrategy, "Define the validation approach before implementation.");
  const apiScope = textOrOpen(config.apiScope, "No concrete API scope has been confirmed yet.");
  const successMetricsBullets = formatList(
    config.successMetrics,
    "Define measurable success metrics before implementation."
  );
  const keyWorkflowsBullets = formatList(
    config.keyWorkflows,
    "Define the core user workflows before implementation."
  );
  const risksBullets = formatList(
    config.risks,
    "No major risks have been confirmed yet."
  );
  const openQuestionsBullets = formatList(
    config.openQuestions,
    "No open questions have been recorded yet."
  );
  const primaryTaskStatePath = `docs/tasks/${domains[0] ?? "platform"}/INDEX.md`;
  const apiBullets = buildApiGroups(domains, config.withAdmin);
  const hasApiBoundary = Boolean(config.hasApiBoundary);
  const apiApplicabilityHeading = hasApiBoundary ? "## Suggested API Groups" : "## Applicability";
  const apiApplicabilityBody = hasApiBoundary
    ? [
        `Confirmed API scope: ${apiScope}`,
        "",
        "Suggested route groups:",
        apiBullets,
        "",
        `Integration context: ${integrations}`
      ].join("\n")
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
  const workflowCopy = buildWorkflowCopy(config);
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
    platform: config.platform,
    runtime: config.runtime,
    ui: config.ui,
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
    mvpScope,
    nonGoals,
    successMetricsBullets,
    keyWorkflowsBullets,
    integrations,
    testingStrategy,
    apiScope,
    risksBullets,
    openQuestionsBullets,
    primaryTaskStatePath,
    roadmapGoal: config.roadmapGoal,
    milestoneBullets,
    retrofitReadNote,
    retrofitOwnershipNote,
    roadmapReadNote,
    roadmapOwnershipNote,
    retrofitSection,
    roadmapSection,
    roadmapEntry,
    ...workflowCopy,
    techStackFit,
    selectedStackBullets,
    boundaryRules,
    engineeringDocsBullets,
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
    platform: config.platform,
    runtime: config.runtime,
    ui: config.ui,
    engineeringDocs: config.engineeringDocs ?? [],
    notes: retrofitNotes
  };

  return { templateVars, plan };
}
