#!/usr/bin/env node

import { runInitProjectStructure } from "./lib/runner.mjs";

runInitProjectStructure(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
