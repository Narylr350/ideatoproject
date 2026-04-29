import fsp from "node:fs/promises";
import path from "node:path";

import { templatesRoot } from "./constants.mjs";

export async function loadText(relativePath) {
  return fsp.readFile(path.join(templatesRoot, relativePath), "utf8");
}

export async function pathExists(targetPath) {
  try {
    await fsp.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath, dryRun) {
  if (dryRun) {
    return;
  }
  await fsp.mkdir(dirPath, { recursive: true });
}

export async function readPackageJson(packageJsonPath) {
  try {
    const raw = await fsp.readFile(packageJsonPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function readReadmeSummary(projectRoot) {
  const candidates = ["README.md", "readme.md", "README.MD"];
  for (const candidate of candidates) {
    const filePath = path.join(projectRoot, candidate);
    if (!(await pathExists(filePath))) {
      continue;
    }
    const content = await fsp.readFile(filePath, "utf8");
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"));
    if (lines.length > 0) {
      return lines[0];
    }
  }
  return null;
}

export async function writeGeneratedText(targetPath, content, { dryRun, overwrite, writes, skips, existingMode }) {
  const exists = await pathExists(targetPath);
  const resolvedMode = existingMode ?? (overwrite ? "overwrite" : "skip");
  if (exists) {
    if (resolvedMode === "skip") {
      skips.push(targetPath);
      return;
    }
    if (resolvedMode === "append") {
      const current = await fsp.readFile(targetPath, "utf8");
      if (current.includes(content)) {
        skips.push(targetPath);
        return;
      }
      writes.push(targetPath);
      if (dryRun) {
        return;
      }
      const separator = current.endsWith("\n") ? "\n" : "\n\n";
      await ensureDir(path.dirname(targetPath), false);
      await fsp.writeFile(
        targetPath,
        `${current}${separator}<!-- idea-to-project-structure appended guidance -->\n\n${content}`,
        "utf8"
      );
      return;
    }
  }
  writes.push(targetPath);
  if (dryRun) {
    return;
  }
  await ensureDir(path.dirname(targetPath), false);
  await fsp.writeFile(targetPath, content, "utf8");
}
