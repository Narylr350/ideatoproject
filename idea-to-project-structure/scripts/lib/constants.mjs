import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scriptsRoot = path.resolve(__dirname, "..");
export const skillRoot = path.resolve(scriptsRoot, "..");
export const templatesRoot = path.join(skillRoot, "assets", "templates");
export const manifestPath = path.join(templatesRoot, "shapes", "manifest.json");

export const usage = `
Usage:
  New project:
    node scripts/init-project-structure.mjs --mode new --root <dir> --name <project-name> --shape <shape> [options]

  Retrofit existing project:
    node scripts/init-project-structure.mjs --mode retrofit --project-root <dir> [options]

Shapes:
  single-app
  desktop-app
  frontend-backend
  monorepo-web-api-admin
  mobile-api-admin
  ai-service-app

Options:
  --platform <value>        windows-desktop | macos-desktop | linux-desktop | desktop | web | mobile | none
  --runtime <value>         dotnet | rust | node | python | go | java | none
  --ui <value>              wpf | winui | avalonia | tauri | electron | native | webview | none
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
  --docs-mode <value>       loopnova | full-docs | none
  --mvp <text>              first useful release scope for full-docs mode
  --non-goals <text>        explicit v1 exclusions for full-docs mode
  --success-metrics <text>  success metrics separated by |
  --key-workflows <text>    core workflows separated by |
  --integrations <text>     integration needs or constraints
  --testing-strategy <text> validation approach for docs/testing/README.md
  --api-scope <text>        API boundary description when an API exists
  --engineering-docs <csv>  AI-selected engineering boundary docs, e.g. clipboard,packaging,provider-boundary
  --risks <text>            notable risks separated by |
  --open-questions <text>   unresolved questions separated by |
  --retrofit-depth <value>  overlay-only
  --instruction-file-mode <value> skip | append | overwrite
  --project-root <dir>      existing repository root for retrofit mode
  --dry-run                 print plan only
  --force                   allow writing into an existing project folder
`;

export const jsManagers = new Set(["pnpm", "npm", "yarn", "bun"]);

export const fileNamesToIgnore = new Set([
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
