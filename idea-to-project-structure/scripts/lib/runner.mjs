import fsp from "node:fs/promises";

import { manifestPath } from "./constants.mjs";
import { parseArgs } from "./args.mjs";
import { buildScaffoldModel } from "./scaffold-model.mjs";
import { buildTemplateContext } from "./template-model.mjs";
import { writeScaffold } from "./writer.mjs";

export async function runInitProjectStructure(argv, output = console.log) {
  const args = parseArgs(argv);
  const manifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  const model = await buildScaffoldModel(args, manifest);
  const { templateVars, plan } = buildTemplateContext(model, args);

  if (model.config.dryRun) {
    output(JSON.stringify(plan, null, 2));
    return;
  }

  const { skips } = await writeScaffold(model, templateVars);

  if (model.mode === "retrofit") {
    output(`Retrofitted AI-friendly docs layer at ${model.projectRoot}`);
    if (skips.length > 0) {
      output(`Skipped existing files: ${skips.length}`);
    }
    return;
  }

  output(`Created project structure at ${model.projectRoot}`);
}
