/**
 * Add command
 * Add a template to your project
 */

import type { AddOptions, CommandResult } from "./types.js";
import type { AiTool } from "../types/index.js";
import { detectProject } from "../detectors/index.js";
import { runGenerators } from "../generators/index.js";
import { loadProjectConfig, saveProjectConfig } from "./utils.js";
import { createLogger } from "../utils/logger.js";
import { ALL_TEMPLATES } from "../templates/registry.js";

const log = createLogger("add");

/**
 * Get available template names
 */
export function getAvailableTemplates(): string[] {
  return ALL_TEMPLATES.map((t) => t.id);
}

/**
 * Run add command
 */
export async function addCommand(
  templateName: string,
  options: AddOptions
): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    // Validate template exists
    const template = ALL_TEMPLATES.find((t) => t.id === templateName);
    if (!template) {
      const available = getAvailableTemplates();
      return {
        success: false,
        error: `Template "${templateName}" not found. Available templates: ${available.join(", ")}`,
      };
    }

    log.info(`Adding template: ${templateName}`);

    // Load existing config or create new
    let config = await loadProjectConfig(projectPath);

    if (!config) {
      log.info("No existing config found, detecting project...");
      const detection = await detectProject(projectPath);
      config = {
        version: "1.0.0",
        projectType: "app",
        language: detection.language.primary,
        tools: ["hybrid"] as AiTool[],
        templates: [],
      };
    }

    // Check if already added
    if (config.templates.includes(templateName)) {
      if (!options.force) {
        return {
          success: false,
          error: `Template "${templateName}" is already added. Use --force to regenerate.`,
        };
      }
    } else {
      config.templates.push(templateName);
    }

    // Detect project for generation context
    const detection = await detectProject(projectPath);

    // Run generators with updated config
    const results = await runGenerators({
      projectPath,
      detection,
      config,
      dryRun: false,
    });

    if (results.success) {
      // Save updated config
      await saveProjectConfig(projectPath, config);

      const allFiles = results.results.flatMap((r) => r.files);
      log.success(`Added template: ${templateName}`);
      for (const file of allFiles) {
        log.info(`  ${file.action === "created" ? "+" : "~"} ${file.path}`);
      }
      return {
        success: true,
        message: `Template "${templateName}" added successfully`,
      };
    } else {
      const errors = results.results
        .filter((r) => r.error)
        .map((r) => r.error as string);
      return {
        success: false,
        error: errors.join("\n"),
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Add failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

export default addCommand;
