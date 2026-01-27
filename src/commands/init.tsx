/**
 * Init command
 * Initialize AI configuration for a project
 */

import { render } from "ink";
import type { InitOptions, CommandResult } from "./types.js";
import type { AiTool, AiInitConfig } from "../types/index.js";
import { Wizard } from "../components/Wizard.js";
import { detectProject } from "../detectors/index.js";
import { runGenerators } from "../generators/index.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("init");

/**
 * Get display symbol for file action
 */
function getActionSymbol(action: string): string {
  switch (action) {
    case "created":
      return "+";
    case "modified":
      return "~";
    case "merged":
      return "M";
    case "skipped":
      return "-";
    case "error":
      return "!";
    default:
      return "?";
  }
}

/**
 * Run init command in interactive mode
 */
export async function runInitInteractive(options: InitOptions): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  return new Promise((resolve) => {
    const handleComplete = (success: boolean): void => {
      resolve({
        success,
        message: success ? "Configuration generated successfully" : "Generation failed",
      });
    };

    const { waitUntilExit } = render(
      <Wizard
        projectPath={projectPath}
        skipPrompts={false}
        tools={options.tool ? [options.tool] : undefined}
        templates={options.templates}
        dryRun={options.dryRun}
        mergeMode={options.merge}
        autoMergeThreshold={options.autoMergeThreshold}
        onComplete={handleComplete}
      />
    );

    waitUntilExit().catch((err: Error) => {
      resolve({
        success: false,
        error: err.message,
      });
    });
  });
}

/**
 * Run init command in non-interactive mode
 */
export async function runInitNonInteractive(options: InitOptions): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    log.info("Detecting project configuration...");
    const detection = await detectProject(projectPath);

    log.info(`Detected: ${detection.language.primary} project`);
    if (detection.frameworks.length > 0) {
      log.info(`Frameworks: ${detection.frameworks.map(f => f.name).join(", ")}`);
    }

    // Determine tools to use
    const tools: AiTool[] = options.tool ? [options.tool] : ["hybrid"];

    // Create config
    const config: AiInitConfig = {
      version: "1.0.0",
      projectType: "app",
      language: detection.language.primary,
      tools,
      templates: options.templates || [],
    };

    if (options.merge) {
      log.info("Generating configuration files (merge mode)...");
    } else {
      log.info("Generating configuration files...");
    }
    const results = await runGenerators({
      projectPath,
      detection,
      config,
      dryRun: options.dryRun,
      mergeMode: options.merge,
      autoMergeThreshold: options.autoMergeThreshold,
      backup: options.merge, // Always backup in merge mode
    });

    if (results.success) {
      // Count generated files from all results
      const allFiles = results.results.flatMap(r => r.files);
      log.success(`Generated ${allFiles.length} files`);
      for (const file of allFiles) {
        const actionSymbol = getActionSymbol(file.action);
        const mergeInfo = file.mergeInfo
          ? ` (${Math.round(file.mergeInfo.similarityScore * 100)}% similar)`
          : "";
        log.info(`  ${actionSymbol} ${file.path}${mergeInfo}`);
      }
      return {
        success: true,
        message: `Generated ${allFiles.length} configuration files`,
      };
    } else {
      log.error("Generation failed");
      const errors = results.results
        .filter(r => r.error)
        .map(r => r.error as string);
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
    log.error(`Init failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Main init command handler
 */
export async function initCommand(options: InitOptions): Promise<CommandResult> {
  if (options.yes) {
    return runInitNonInteractive(options);
  }
  return runInitInteractive(options);
}

export default initCommand;
