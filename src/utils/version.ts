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

    // Try multiple possible locations for package.json
    const possiblePaths = [
      path.join(currentDir, "../..", "package.json"), // src/utils -> root
      path.join(currentDir, "..", "package.json"), // dist/utils -> root
      path.join(currentDir, "package.json"), // bundled in same dir
      path.join(process.cwd(), "package.json"), // current working directory
    ];

    for (const packageJsonPath of possiblePaths) {
      try {
        const pkg = (await fs.readJson(packageJsonPath)) as {
          version?: string;
        };
        if (pkg.version && typeof pkg.version === "string") {
          cachedVersion = pkg.version;
          log.debug(
            "CLI version found at:",
            packageJsonPath,
            "version:",
            cachedVersion
          );
          return cachedVersion;
        }
      } catch (readError) {
        // Continue to next path
        continue;
      }
    }

    // If no package.json found, use fallback
    log.warn("Could not find package.json, using fallback version");
    cachedVersion = "0.0.0";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug("Failed to read CLI version from package.json:", message);
    cachedVersion = "0.0.0";
  }

  log.debug("CLI version:", cachedVersion);
  return cachedVersion;
}
