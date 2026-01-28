/**
 * Init command
 * Initialize AI configuration for a project
 */

import { render } from "ink";
import chalk from "chalk";
import { PassThrough } from "stream";
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
 * Show post-generation usage guide for Qoder
 */
function showQoderUsageGuide(): void {

  console.log("");
  console.log(chalk.cyan.bold("━".repeat(60)));
  console.log(chalk.cyan.bold("  🎉 Qoder Rules Generated Successfully!"));
  console.log(chalk.cyan.bold("━".repeat(60)));
  console.log("");
  console.log(chalk.white("📖 How to Use These Rules:"));
  console.log("");
  console.log(chalk.gray("  Rules use ") + chalk.yellow("trigger: manual") + chalk.gray(" - reference them with ") + chalk.green("@rule-name.md"));
  console.log("");
  console.log(chalk.white("💡 Quick Start:"));
  console.log("");
  console.log(chalk.gray("  1. ") + chalk.green("@quick-reference.md") + chalk.gray(" - Start here! Complete usage guide"));
  console.log(chalk.gray("  2. ") + chalk.green("@requirements-spec.md") + chalk.gray(" - Critical for Quest Mode (no TODOs!)"));
  console.log(chalk.gray("  3. ") + chalk.green("@security.md") + chalk.gray(" - When handling auth, validation, APIs"));
  console.log(chalk.gray("  4. ") + chalk.green("@api-design.md") + chalk.gray(" - When creating API endpoints"));
  console.log(chalk.gray("  5. ") + chalk.green("@testing.md") + chalk.gray(" - When writing tests"));
  console.log("");
  console.log(chalk.white("🚀 Example Usage:"));
  console.log("");
  console.log(chalk.gray('  "Implement login endpoint ') + chalk.green("@requirements-spec.md @security.md @api-design.md") + chalk.gray('"'));
  console.log(chalk.gray('  "Write tests for UserService ') + chalk.green("@testing.md @core.md") + chalk.gray('"'));
  console.log(chalk.gray('  "Commit changes ') + chalk.green("@git-workflow.md") + chalk.gray('"'));
  console.log("");
  console.log(chalk.white("📚 Common Combinations:"));
  console.log("");
  console.log(chalk.gray("  • API Development: ") + chalk.green("@api-design.md @security.md @error-handling.md"));
  console.log(chalk.gray("  • New Features: ") + chalk.green("@requirements-spec.md @core.md @security.md"));
  console.log(chalk.gray("  • Architecture: ") + chalk.green("@architecture.md @core.md"));
  console.log("");
  console.log(chalk.yellow("⚠️  Important: ") + chalk.gray("Always reference ") + chalk.green("@requirements-spec.md") + chalk.gray(" for new features"));
  console.log(chalk.gray("   to ensure complete, runnable code with no TODOs/placeholders!"));
  console.log("");
  console.log(chalk.white("📖 Read the full guide: ") + chalk.cyan(".qoder/rules/quick-reference.md"));
  console.log("");
  console.log(chalk.cyan.bold("━".repeat(60)));
  console.log("");
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

    try {
      // Always use process.stdin as-is, and let Ink detect raw mode support
      const isRawModeSupported = process.stdin.isTTY ?? false;

      const { waitUntilExit } = render(
        <Wizard
          projectPath={projectPath}
          skipPrompts={false}
          tools={options.tool ? [options.tool] : undefined}
          templates={options.templates}
          dryRun={options.dryRun}
          mergeMode={options.merge}
          autoMergeThreshold={options.autoMergeThreshold}
          isRawModeSupported={isRawModeSupported}
          onComplete={handleComplete}
        />
      );

      waitUntilExit()
        .then(() => {
          // Ink will handle stdin cleanup automatically
        })
        .catch((err: Error) => {
          resolve({
            success: false,
            error: err.message,
          });
        });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      resolve({
        success: false,
        error: `Failed to initialize wizard: ${message}`,
      });
    }
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

      // Show Qoder-specific usage guide if generating for Qoder
      if (tools.includes("qoder") && !options.dryRun) {
        showQoderUsageGuide();
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
