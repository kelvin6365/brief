/**
 * CLI version utilities.
 *
 * Provides a single place to resolve the current Brief CLI version from
 * package.json so templates can display an accurate version.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { createLogger } from "./logger.js";

const log = createLogger("version");

let cachedVersion: string | null = null;

/**
 * Get the current Brief CLI version from the nearest package.json.
 */
export async function getCliVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;

  try {
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    // From src/utils or dist/utils back to project root
    const rootDir = path.resolve(currentDir, "..", "..");
    const packageJsonPath = path.join(rootDir, "package.json");
    const pkg = (await fs.readJson(packageJsonPath)) as { version?: string };

    if (pkg.version && typeof pkg.version === "string") {
      cachedVersion = pkg.version;
    } else {
      cachedVersion = "0.0.0";
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug("Failed to read CLI version from package.json:", message);
    cachedVersion = "0.0.0";
  }
  log.debug("CLI version:", cachedVersion);
  return cachedVersion;
}
