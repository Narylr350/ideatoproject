import path from "node:path";

import { pathExists, readPackageJson } from "./fs-utils.mjs";

export async function detectPackageManager(projectRoot) {
  const checks = [
    ["pnpm-lock.yaml", "pnpm"],
    ["package-lock.json", "npm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["mvnw", "maven"],
    ["mvnw.cmd", "maven"],
    ["pom.xml", "maven"],
    ["build.gradle", "gradle"],
    ["build.gradle.kts", "gradle"]
  ];
  for (const [fileName, value] of checks) {
    if (await pathExists(path.join(projectRoot, fileName))) {
      return value;
    }
  }
  return "none";
}

export async function detectStacks(projectRoot, apps) {
  const result = { frontend: "none", backend: "none", mobile: "none" };
  const packageJsons = [];
  const rootPackageJson = await readPackageJson(path.join(projectRoot, "package.json"));
  if (rootPackageJson) {
    packageJsons.push(rootPackageJson);
  }
  for (const app of apps) {
    const appPackageJson = await readPackageJson(path.join(projectRoot, app.path, "package.json"));
    if (appPackageJson) {
      packageJsons.push(appPackageJson);
    }
  }

  const deps = packageJsons.flatMap((pkg) =>
    Object.keys({ ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) })
  );

  if (deps.includes("next")) {
    result.frontend = "nextjs";
  } else if (deps.includes("nuxt")) {
    result.frontend = "nuxt";
  } else if (deps.includes("vue")) {
    result.frontend = "vue";
  } else if (deps.includes("react")) {
    result.frontend = "react";
  }

  if (deps.includes("@nestjs/core")) {
    result.backend = "nestjs";
  } else if (deps.includes("express")) {
    result.backend = "express";
  }

  if (deps.includes("react-native")) {
    result.mobile = "react-native";
  }

  if (await pathExists(path.join(projectRoot, "pom.xml"))) {
    result.backend = "spring-boot";
  }
  if ((await pathExists(path.join(projectRoot, "pyproject.toml"))) || (await pathExists(path.join(projectRoot, "requirements.txt")))) {
    if (result.backend === "none") {
      result.backend = "fastapi";
    }
  }
  if (await pathExists(path.join(projectRoot, "pubspec.yaml"))) {
    result.mobile = "flutter";
  }

  return result;
}
