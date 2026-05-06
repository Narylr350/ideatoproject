import { splitList } from "./args.mjs";

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");
}

export function formatBullets(values) {
  return values.map((value) => `- ${value}`).join("\n");
}

export function formatList(value, fallback) {
  const values = Array.isArray(value) ? value : splitList(value);
  if (values.length === 0) {
    return `- ${fallback}`;
  }
  return formatBullets(values);
}

export function buildStructureTree(projectSlug, directories, files) {
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

export function appStack(appId, config) {
  if (appId === "desktop") {
    return [config.platform, config.runtime, config.ui]
      .filter((value) => value && value !== "none")
      .join(" + ") || "desktop runtime undecided";
  }
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

export function appRole(appId) {
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
    case "desktop":
      return "Desktop application shell and local user interaction boundary.";
    case "app":
      return "Primary application root for the product.";
    default:
      return "Application surface.";
  }
}

export function buildApiGroups(domains, withAdmin) {
  const groups = domains.length > 0 ? domains : ["core"];
  const values = groups.map((domain) => `- \`/api/${domain}/*\``);
  if (withAdmin) {
    values.push("- `/api/admin/*`");
  }
  return values.join("\n");
}

export function buildTechStackFit(config) {
  const parts = [];
  if (config.platform !== "none") {
    parts.push(`Platform work is expected on \`${config.platform}\`.`);
  }
  if (config.runtime !== "none") {
    parts.push(`Runtime work is expected in \`${config.runtime}\`.`);
  }
  if (config.ui !== "none") {
    parts.push(`UI work is expected in \`${config.ui}\`.`);
  }
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

export function buildSelectedStackBullets(config) {
  const stack = [
    ["Platform", config.platform],
    ["Runtime", config.runtime],
    ["UI", config.ui],
    ["Frontend", config.frontend],
    ["Backend", config.backend],
    ["Mobile", config.mobile],
    ["Package manager", config.packageManager]
  ].filter(([, value]) => value && value !== "none");

  if (stack.length === 0) {
    return "- Stack choices are not locked yet.";
  }

  return formatBullets(stack.map(([label, value]) => `${label}: \`${value}\``));
}

export function buildBoundaryRules(config) {
  if (config.shape === "desktop-app" || config.platform !== "none") {
    return formatBullets([
      "Keep operating-system integrations behind documented adapters.",
      "Keep product rules outside UI event handlers where practical.",
      "Document local storage, permissions, and lifecycle behavior before implementation depends on them.",
      "Keep docs synchronized when structure or boundaries change."
    ]);
  }

  return formatBullets([
    "Keep business rules inside the app or service that owns them.",
    "Prefer shared packages for stable contracts, types, or utilities.",
    "Do not create a new app unless the user-facing or operational boundary is real.",
    "Keep docs synchronized when structure or boundaries change."
  ]);
}
