const truthy = new Set(["true", "1", "yes", "y"]);
const falsy = new Set(["false", "0", "no", "n"]);

export function parseArgs(argv) {
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

export function normalizeSegment(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeBool(value, fallback) {
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

export function splitCsv(value) {
  if (!value) {
    return [];
  }
  return [...new Set(value.split(",").map(normalizeSegment).filter(Boolean))];
}

export function splitMilestones(value) {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function textOrOpen(value, fallback) {
  const normalized = value?.trim();
  return normalized || fallback;
}

export function splitList(value) {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function requireFullDocsFields(config) {
  if (config.docsMode !== "full-docs") {
    return;
  }
  const required = [
    ["idea", config.idea],
    ["target-users", config.targetUsers],
    ["core-flow", config.coreFlow],
    ["mvp", config.mvp],
    ["non-goals", config.nonGoals],
    ["success-metrics", config.successMetrics],
    ["key-workflows", config.keyWorkflows],
    ["testing-strategy", config.testingStrategy]
  ];
  const missing = required
    .filter(([, value]) => !value || value.includes("TODO:"))
    .map(([key]) => `--${key}`);
  if (missing.length > 0) {
    throw new Error(`full-docs mode requires gathered requirements: ${missing.join(", ")}`);
  }
}
