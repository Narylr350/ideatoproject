export function addDocsLayer({ config, domains, directories, files }) {
  [
    "docs/archive",
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
  files.add("docs/testing/README.md");
  for (const domain of domains) {
    directories.add(`docs/tasks/${domain}`);
    files.add(`docs/tasks/${domain}/INDEX.md`);
  }
}
