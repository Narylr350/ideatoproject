import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const scriptPath = path.join(path.dirname(__filename), "init-project-structure.mjs");
const runnerPath = path.join(path.dirname(__filename), "lib", "runner.mjs");
const workflowCopyPath = path.join(path.dirname(__filename), "lib", "workflow-copy.mjs");
const newProjectModelPath = path.join(path.dirname(__filename), "lib", "new-project-model.mjs");
const retrofitModelPath = path.join(path.dirname(__filename), "lib", "retrofit-model.mjs");
const stackDetectionPath = path.join(path.dirname(__filename), "lib", "stack-detection.mjs");
const projectDetectionPath = path.join(path.dirname(__filename), "lib", "project-detection.mjs");
const workspaceFilesPath = path.join(path.dirname(__filename), "lib", "workspace-files.mjs");
const skillRoot = path.resolve(path.dirname(__filename), "..");

async function pathExists(targetPath) {
  try {
    await fsp.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

test("CLI implementation is split behind an importable runner", async () => {
  const runner = await import(pathToFileURL(runnerPath));

  assert.equal(typeof runner.runInitProjectStructure, "function");
});

test("workflow copy is isolated behind pure helpers", async () => {
  const workflowCopy = await import(pathToFileURL(workflowCopyPath));

  assert.equal(typeof workflowCopy.buildWorkflowCopy, "function");
});

test("new and retrofit scaffold model builders are isolated", async () => {
  const newProjectModel = await import(pathToFileURL(newProjectModelPath));
  const retrofitModel = await import(pathToFileURL(retrofitModelPath));

  assert.equal(typeof newProjectModel.buildNewProjectModel, "function");
  assert.equal(typeof retrofitModel.buildRetrofitModel, "function");
});

test("retrofit detection helpers are split by concern", async () => {
  const stackDetection = await import(pathToFileURL(stackDetectionPath));
  const projectDetection = await import(pathToFileURL(projectDetectionPath));

  assert.equal(typeof stackDetection.detectPackageManager, "function");
  assert.equal(typeof stackDetection.detectStacks, "function");
  assert.equal(typeof projectDetection.detectProjectApps, "function");
  assert.equal(typeof projectDetection.detectDomains, "function");
  assert.equal(typeof projectDetection.detectCanonicalDocs, "function");
});

test("workspace special files are isolated from template writer", async () => {
  const workspaceFiles = await import(pathToFileURL(workspaceFilesPath));

  assert.equal(typeof workspaceFiles.writeWorkspaceFile, "function");
});

test("full-docs mode writes gathered requirements into core docs", async () => {
  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "itps-full-docs-"));
  try {
    await execFileAsync(process.execPath, [
      scriptPath,
      "--mode",
      "new",
      "--root",
      tempRoot,
      "--name",
      "Clinic Ops",
      "--shape",
      "frontend-backend",
      "--frontend",
      "react",
      "--backend",
      "fastapi",
      "--package-manager",
      "pnpm",
      "--execution-workflow",
      "repo-native",
      "--docs-mode",
      "full-docs",
      "--with-roadmap",
      "true",
      "--domains",
      "patients,appointments,billing",
      "--idea",
      "Help small clinics manage appointments, patient check-ins, and payment follow-up.",
      "--target-users",
      "Front desk staff, clinic managers, and part-time practitioners.",
      "--core-flow",
      "Staff schedules a visit, checks the patient in, records payment status, and reviews follow-up tasks.",
      "--mvp",
      "Appointment calendar, patient check-in queue, payment status tracking, and daily operations dashboard.",
      "--non-goals",
      "Insurance claims automation and clinical diagnosis workflows are out of scope for v1.",
      "--success-metrics",
      "Reduce missed follow-ups by 30%; complete check-in in under two minutes.",
      "--key-workflows",
      "Create appointment | Check patient in | Mark payment status | Review daily follow-ups",
      "--integrations",
      "CSV import for existing patient lists; optional SMS provider later.",
      "--testing-strategy",
      "Unit-test scheduling rules; manually verify check-in and payment-status flows before release.",
      "--api-scope",
      "REST endpoints for appointments, patients, billing status, and dashboard summaries.",
      "--risks",
      "Patient data privacy; staff adoption during busy clinic hours.",
      "--open-questions",
      "Which SMS provider should be used after MVP?",
      "--milestones",
      "MVP: scheduling and check-in | Beta: billing follow-up | Later: SMS reminders"
    ]);

    const projectRoot = path.join(tempRoot, "clinic-ops");
    const overview = await fsp.readFile(path.join(projectRoot, "docs/context/project-overview.md"), "utf8");
    const idea = await fsp.readFile(path.join(projectRoot, "docs/product/idea.md"), "utf8");
    const architecture = await fsp.readFile(path.join(projectRoot, "docs/context/architecture.md"), "utf8");
    const techStack = await fsp.readFile(path.join(projectRoot, "docs/context/tech-stack.md"), "utf8");
    const roadmap = await fsp.readFile(path.join(projectRoot, "docs/context/development-roadmap.md"), "utf8");
    const api = await fsp.readFile(path.join(projectRoot, "docs/engineering/api.md"), "utf8");
    const testing = await fsp.readFile(path.join(projectRoot, "docs/testing/README.md"), "utf8");
    const platformIndex = await fsp.readFile(path.join(projectRoot, "docs/tasks/platform/INDEX.md"), "utf8");

    assert.match(overview, /Appointment calendar, patient check-in queue/);
    assert.match(overview, /Insurance claims automation/);
    assert.match(idea, /Reduce missed follow-ups by 30%/);
    assert.match(architecture, /Create appointment/);
    assert.match(techStack, /CSV import/);
    assert.match(roadmap, /MVP: scheduling and check-in/);
    assert.match(api, /REST endpoints for appointments/);
    assert.match(testing, /Unit-test scheduling rules/);
    assert.match(platformIndex, /Appointment calendar, patient check-in queue/);
    assert.doesNotMatch(testing, /TODO:/);
    assert.doesNotMatch(platformIndex, /TODO:/);
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test("full-docs supports desktop platform slots and AI-selected engineering docs", async () => {
  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "itps-desktop-docs-"));
  try {
    await execFileAsync(process.execPath, [
      scriptPath,
      "--mode",
      "new",
      "--root",
      tempRoot,
      "--name",
      "Capture Desk",
      "--shape",
      "desktop-app",
      "--platform",
      "windows-desktop",
      "--runtime",
      "dotnet",
      "--ui",
      "wpf",
      "--execution-workflow",
      "repo-native",
      "--docs-mode",
      "full-docs",
      "--domains",
      "capture,ocr,clipboard,settings",
      "--engineering-docs",
      "file-watcher,ocr-provider,clipboard,settings-storage,packaging,performance",
      "--idea",
      "Turn desktop screenshots into searchable text snippets without leaving the keyboard.",
      "--target-users",
      "Windows power users who frequently capture, OCR, and reuse text from screenshots.",
      "--core-flow",
      "User captures a region, OCR runs locally or through a provider, the text is reviewed, and the chosen text is copied.",
      "--mvp",
      "Tray app, capture intake, OCR provider boundary, clipboard write confirmation, local settings, and packaging notes.",
      "--non-goals",
      "No cloud account, no image library, no multi-user sync, and no screenshot editor in v1.",
      "--success-metrics",
      "Copy OCR text in under five seconds | Keep idle memory below an agreed desktop budget",
      "--key-workflows",
      "Capture screenshot | Run OCR | Review text | Copy result | Adjust provider settings",
      "--integrations",
      "Windows clipboard, local file system, optional OCR provider, and installer packaging.",
      "--testing-strategy",
      "Unit-test provider adapters; manually verify tray lifecycle, clipboard behavior, and packaging smoke install.",
      "--api-scope",
      "No standalone API boundary; provider adapters are local integration contracts.",
      "--risks",
      "Clipboard overwrite surprises | OCR provider latency | Windows tray lifecycle edge cases",
      "--open-questions",
      "Which OCR provider ships first?"
    ]);

    const projectRoot = path.join(tempRoot, "capture-desk");
    const techStack = await fsp.readFile(path.join(projectRoot, "docs/context/tech-stack.md"), "utf8");
    const architecture = await fsp.readFile(path.join(projectRoot, "docs/context/architecture.md"), "utf8");
    const readme = await fsp.readFile(path.join(projectRoot, "README.md"), "utf8");
    const appReadme = await fsp.readFile(path.join(projectRoot, "src/App/README.md"), "utf8");
    const gitignore = await fsp.readFile(path.join(projectRoot, ".gitignore"), "utf8");
    const watcherDoc = await fsp.readFile(path.join(projectRoot, "docs/engineering/file-watcher.md"), "utf8");
    const clipboardDoc = await fsp.readFile(path.join(projectRoot, "docs/engineering/clipboard.md"), "utf8");
    const packagingDoc = await fsp.readFile(path.join(projectRoot, "docs/engineering/packaging.md"), "utf8");
    const ocrIndex = await fsp.readFile(path.join(projectRoot, "docs/tasks/ocr/INDEX.md"), "utf8");

    assert.equal(await pathExists(path.join(projectRoot, "docs/engineering/api.md")), false);
    assert.match(techStack, /Platform: `windows-desktop`/);
    assert.match(techStack, /Runtime: `dotnet`/);
    assert.match(techStack, /UI: `wpf`/);
    assert.doesNotMatch(techStack, /Frontend: `none`/);
    assert.match(readme, /Platform: `windows-desktop`/);
    assert.match(appReadme, /Desktop application shell/);
    assert.match(gitignore, /^\.codex\/$/m);
    assert.match(gitignore, /^\.claude\/$/m);
    assert.match(gitignore, /^\.gemini\/$/m);
    assert.match(gitignore, /^\.cursor\/$/m);
    assert.match(gitignore, /^AGENTS\.md$/m);
    assert.match(gitignore, /^CLAUDE\.md$/m);
    assert.match(gitignore, /^AI_CONTEXT\.md$/m);
    assert.match(gitignore, /^docs\/\*\*$/m);
    assert.match(architecture, /Keep operating-system integrations behind documented adapters/);
    assert.doesNotMatch(architecture, /Prefer shared packages/);
    assert.match(watcherDoc, /# Engineering Boundary: file-watcher/);
    assert.match(watcherDoc, /Capture screenshot/);
    assert.match(clipboardDoc, /Windows clipboard/);
    assert.match(packagingDoc, /installer packaging/);
    assert.match(ocrIndex, /ocr/);
    assert.match(ocrIndex, /Run OCR/);
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test("new project dry-run prints scaffold plan without creating files", async () => {
  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "itps-dry-run-new-"));
  try {
    const { stdout } = await execFileAsync(process.execPath, [
      scriptPath,
      "--mode",
      "new",
      "--root",
      tempRoot,
      "--name",
      "Dry Run Shop",
      "--shape",
      "single-app",
      "--execution-workflow",
      "repo-native",
      "--docs-mode",
      "none",
      "--dry-run"
    ]);

    const plan = JSON.parse(stdout);
    assert.equal(plan.mode, "new");
    assert.equal(plan.shape, "single-app");
    assert.deepEqual(plan.apps, ["app"]);
    assert.match(plan.projectRoot, /dry-run-shop$/);
    assert.ok(plan.files.includes("AGENTS.md"));
    assert.ok(plan.files.includes("README.md"));
    assert.equal(await pathExists(path.join(tempRoot, "dry-run-shop")), false);
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test("retrofit dry-run detects existing app roots and canonical docs", async () => {
  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "itps-dry-run-retrofit-"));
  try {
    await fsp.mkdir(path.join(tempRoot, "apps", "web"), { recursive: true });
    await fsp.mkdir(path.join(tempRoot, "apps", "api"), { recursive: true });
    await fsp.mkdir(path.join(tempRoot, "docs", "context"), { recursive: true });
    await fsp.writeFile(path.join(tempRoot, "README.md"), "# Existing App\n\nExisting summary.\n", "utf8");
    await fsp.writeFile(
      path.join(tempRoot, "apps", "web", "package.json"),
      JSON.stringify({ dependencies: { react: "latest" } }),
      "utf8"
    );
    await fsp.writeFile(
      path.join(tempRoot, "apps", "api", "package.json"),
      JSON.stringify({ dependencies: { express: "latest" } }),
      "utf8"
    );

    const { stdout } = await execFileAsync(process.execPath, [
      scriptPath,
      "--mode",
      "retrofit",
      "--project-root",
      tempRoot,
      "--execution-workflow",
      "repo-native",
      "--docs-mode",
      "none",
      "--dry-run"
    ]);

    const plan = JSON.parse(stdout);
    assert.equal(plan.mode, "retrofit");
    assert.equal(plan.shape, "frontend-backend");
    assert.deepEqual([...plan.apps].sort(), ["apps/api", "apps/web"]);
    assert.deepEqual(plan.canonicalDocs, ["README.md"]);
    assert.ok(plan.files.includes("docs/context/retrofit-mapping.md"));
    assert.ok(plan.notes.some((note) => note.includes("Existing canonical docs detected: README.md")));
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test("full-docs recommendation is not scaffold approval", async () => {
  const skill = await fsp.readFile(path.join(skillRoot, "SKILL.md"), "utf8");
  const fullDocsReference = await fsp.readFile(path.join(skillRoot, "references/full-docs-mode.md"), "utf8");

  assert.match(skill, /按你的推荐.*不等于.*批准.*落盘/s);
  assert.match(skill, /explicit confirmation/i);
  assert.match(fullDocsReference, /recommendation.*not.*approval.*scaffold/i);
});

test("full-docs interview stays stepwise", async () => {
  const skill = await fsp.readFile(path.join(skillRoot, "SKILL.md"), "utf8");
  const fullDocsReference = await fsp.readFile(path.join(skillRoot, "references/full-docs-mode.md"), "utf8");

  assert.match(skill, /one checkpoint at a time/i);
  assert.match(skill, /Do not ask.*workflow.*target.*stack.*MVP.*same message/s);
  assert.match(fullDocsReference, /MVP.*discovered progressively/i);
});

test("skill documents how agents should use the bundled script", async () => {
  const skill = await fsp.readFile(path.join(skillRoot, "SKILL.md"), "utf8");

  assert.match(skill, /scripts\/init-project-structure\.mjs/);
  assert.match(skill, /Do not hand-write generated scaffold files/i);
  assert.match(skill, /scripts\/README\.md/);
  assert.match(skill, /--engineering-docs/);
  assert.match(skill, /--platform/);
});

test("Claude and generic agent instruction templates keep the same core content", async () => {
  const agents = await fsp.readFile(
    path.join(skillRoot, "assets/templates/docs/AGENTS.md.tmpl"),
    "utf8"
  );
  const claude = await fsp.readFile(
    path.join(skillRoot, "assets/templates/docs/CLAUDE.md.tmpl"),
    "utf8"
  );

  const normalizeEntrypoint = (content) =>
    content
      .replace(/\r\n/g, "\n")
      .replace(/^# (AGENTS|CLAUDE)\.md/m, "# INSTRUCTION.md")
      .replace(/`(AGENTS|CLAUDE)\.md`/g, "`INSTRUCTION.md`");

  assert.equal(normalizeEntrypoint(claude), normalizeEntrypoint(agents));
});
