/**
 * Sync command
 * Re-detect project and sync configuration
 */

import type { SyncOptions, CommandResult } from "./types.js";
import { detectProject } from "../detectors/index.js";
import { runGenerators } from "../generators/index.js";
import { loadProjectConfig, saveProjectConfig } from "./utils.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("sync");

/**
 * Run sync command
 */
export async function syncCommand(options: SyncOptions): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    // Load existing config
    const config = await loadProjectConfig(projectPath);

    if (!config) {
      return {
        success: false,
        error: "No Brief configuration found. Run 'brief init' first.",
      };
    }

    log.info("Re-detecting project configuration...");
    const detection = await detectProject(projectPath);

    // Update language if changed
    const oldLanguage = config.language;
    const newLanguage = detection.language.primary;

    if (oldLanguage !== newLanguage) {
      log.info(`Language changed: ${oldLanguage} -> ${newLanguage}`);
      config.language = newLanguage;
    }

    // Check for new frameworks
    const detectedFrameworks = detection.frameworks.map((f) => f.name.toLowerCase());
    log.info(`Detected frameworks: ${detectedFrameworks.join(", ") || "none"}`);

    if (options.dryRun) {
      log.info("Dry run - no files will be modified");
    }

    // Regenerate configuration
    log.info("Regenerating configuration files...");
    const results = await runGenerators({
      projectPath,
      detection,
      config,
      dryRun: options.dryRun,
    });

    if (results.success) {
      // Save updated config (unless dry run)
      if (!options.dryRun) {
        await saveProjectConfig(projectPath, config);
      }

      const allFiles = results.results.flatMap((r) => r.files);
      const action = options.dryRun ? "Would generate" : "Updated";
      log.success(`${action} ${allFiles.length} files`);

      for (const file of allFiles) {
        const prefix = file.action === "created" ? "+" : "~";
        log.info(`  ${prefix} ${file.path}`);
      }

      return {
        success: true,
        message: options.dryRun
          ? `Would update ${allFiles.length} files`
          : `Synced ${allFiles.length} configuration files`,
      };
    } else {
      log.error("Sync failed");
      const errors = results.results
        .filter((r) => r.error)
        .map((r) => r.error as string);
      for (const error of errors) {
        log.error(`  ${error}`);
      }
      return {
        success: false,
        error: errors.join("\n"),
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Sync failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

export default syncCommand;
