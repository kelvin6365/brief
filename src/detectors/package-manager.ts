/**
 * Package manager detection
 */

import type { DetectionContext, PackageManagerInfo } from "./types.js";
import { hasFile } from "./utils.js";

/**
 * Detect the package manager used in the project
 */
export function detectPackageManager(context: DetectionContext): PackageManagerInfo {
  // Bun detection (highest priority for this project)
  if (hasFile(context, "bun.lockb") || hasFile(context, "bun.lock")) {
    return {
      name: "bun",
      lockFile: hasFile(context, "bun.lockb") ? "bun.lockb" : "bun.lock",
      confidence: 100,
    };
  }

  if (hasFile(context, "bunfig.toml")) {
    return {
      name: "bun",
      confidence: 80,
    };
  }

  // pnpm detection
  if (hasFile(context, "pnpm-lock.yaml")) {
    return {
      name: "pnpm",
      lockFile: "pnpm-lock.yaml",
      confidence: 100,
    };
  }

  if (hasFile(context, "pnpm-workspace.yaml")) {
    return {
      name: "pnpm",
      confidence: 80,
    };
  }

  // Yarn detection
  if (hasFile(context, "yarn.lock")) {
    return {
      name: "yarn",
      lockFile: "yarn.lock",
      confidence: 100,
    };
  }

  if (hasFile(context, ".yarnrc.yml") || hasFile(context, ".yarnrc")) {
    return {
      name: "yarn",
      confidence: 80,
    };
  }

  // npm detection
  if (hasFile(context, "package-lock.json")) {
    return {
      name: "npm",
      lockFile: "package-lock.json",
      confidence: 100,
    };
  }

  if (hasFile(context, ".npmrc")) {
    return {
      name: "npm",
      confidence: 60,
    };
  }

  // Default to npm if package.json exists
  if (context.packageJson) {
    return {
      name: "npm",
      confidence: 30,
    };
  }

  return {
    name: "unknown",
    confidence: 0,
  };
}
