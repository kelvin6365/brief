/**
 * Remove command
 * Remove a template from your project
 */

import path from "node:path";
import type { RemoveOptions, CommandResult } from "./types.js";
import { loadProjectConfig, saveProjectConfig } from "./utils.js";
import { createLogger } from "../utils/logger.js";
import { exists, remove } from "../utils/file-system.js";
import { ALL_TEMPLATES } from "../templates/registry.js";

const log = createLogger("remove");

/** Map template IDs to their generated files */
const templateFileMap: Record<string, string[]> = {
  // Core templates
  "cursor-core": [".cursor/rules/core.mdc"],
  "claude-core": ["CLAUDE.md"],

  // Language templates
  typescript: [".cursor/rules/typescript.mdc"],
  javascript: [".cursor/rules/javascript.mdc"],
  python: [".cursor/rules/python.mdc"],

  // Framework templates
  react: [".cursor/rules/react.mdc"],
  nextjs: [".cursor/rules/nextjs.mdc"],
  vue: [".cursor/rules/vue.mdc"],
  express: [".cursor/rules/express.mdc"],
  fastapi: [".cursor/rules/fastapi.mdc"],

  // Pattern templates
  testing: [".cursor/rules/testing.mdc", ".claude/skills/testing-patterns.md"],
  "api-design": [".cursor/rules/api-design.mdc"],
  database: [".cursor/rules/database.mdc"],
  security: [".cursor/rules/security.mdc"],
  performance: [".cursor/rules/performance.mdc"],
  cli: [".cursor/rules/cli.mdc"],
  library: [".cursor/rules/library.mdc"],

  // Claude templates
  "claude-skill-testing": [".claude/skills/testing-patterns.md"],
  "claude-skill-git": [".claude/skills/git-workflow.md"],
  "claude-settings": [".claude/settings.json"],

  // Shared templates
  architecture: ["docs/ARCHITECTURE.md"],
  "tech-stack": ["docs/TECH-STACK.md"],
};

/**
 * Run remove command
 */
export async function removeCommand(
  templateName: string,
  options: RemoveOptions
): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    // Validate template exists
    const template = ALL_TEMPLATES.find((t) => t.id === templateName);
    if (!template) {
      return {
        success: false,
        error: `Template "${templateName}" not found`,
      };
    }

    // Load existing config
    const config = await loadProjectConfig(projectPath);

    if (!config) {
      return {
        success: false,
        error: "No Brief configuration found. Run 'brief init' first.",
      };
    }

    // Check if template is in config
    if (!config.templates.includes(templateName)) {
      return {
        success: false,
        error: `Template "${templateName}" is not currently added to this project`,
      };
    }

    log.info(`Removing template: ${templateName}`);

    // Remove from config
    config.templates = config.templates.filter((t) => t !== templateName);

    // Optionally remove associated files
    if (options.removeFiles) {
      const filesToRemove = templateFileMap[templateName] || [];
      for (const file of filesToRemove) {
        const fullPath = path.join(projectPath, file);
        if (await exists(fullPath)) {
          await remove(fullPath);
          log.info(`  - Removed: ${file}`);
        }
      }
    }

    // Save updated config
    await saveProjectConfig(projectPath, config);

    log.success(`Removed template: ${templateName}`);
    if (!options.removeFiles) {
      log.info("  Note: Generated files were not removed. Use --remove-files to also delete files.");
    }

    return {
      success: true,
      message: `Template "${templateName}" removed successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Remove failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

export default removeCommand;
