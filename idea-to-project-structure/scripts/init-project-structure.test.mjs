import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const scriptPath = path.join(path.dirname(__filename), "init-project-structure.mjs");
const skillRoot = path.resolve(path.dirname(__filename), "..");

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
