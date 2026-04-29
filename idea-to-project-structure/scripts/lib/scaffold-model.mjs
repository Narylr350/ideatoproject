import { buildNewProjectModel } from "./new-project-model.mjs";
import { buildRetrofitModel } from "./retrofit-model.mjs";

export async function buildScaffoldModel(args, manifest) {
  const mode = args.mode ?? "new";
  if (!["new", "retrofit"].includes(mode)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }
  if (mode === "retrofit") {
    return buildRetrofitModel(args, manifest);
  }
  return buildNewProjectModel(args, manifest);
}
