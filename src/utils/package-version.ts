/**
 * Package version resolution utilities for magic scaffolding.
 */

import { execSync } from "node:child_process";
import type { MagicDependency } from "../types/index.js";
import { createLogger } from "./logger.js";

const log = createLogger("pkg-version");

/**
 * Resolve a list of MagicDependency entries into a package.json dependency map.
 */
export async function resolveDependencies(
  deps: MagicDependency[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  for (const dep of deps) {
    const version = await getLatestPackageVersion(dep.name, dep.version);
    // Use caret range by default so installs pick up compatible patch/minor updates
    result[dep.name] =
      version.startsWith("^") || version === "latest" ? version : `^${version}`;
  }

  return result;
}

/**
 * Get the latest version for a package from the npm registry.
 * Falls back to the provided default or "latest" when lookup fails.
 */
export async function getLatestPackageVersion(
  packageName: string,
  fallback?: string
): Promise<string> {
  try {
    const output = execSync(`npm view ${packageName} version`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    if (!output) {
      return fallback ?? "latest";
    }

    return output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug(
      `Failed to resolve latest version for ${packageName}: ${message}`
    );
    return fallback ?? "latest";
  }
}
