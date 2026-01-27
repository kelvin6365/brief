/**
 * Validate command
 * Validate current configuration
 */

import path from "node:path";
import type { ValidateOptions, CommandResult } from "./types.js";
import { loadProjectConfig } from "./utils.js";
import { createLogger } from "../utils/logger.js";
import { exists } from "../utils/file-system.js";
import { validateConfig } from "../utils/validation.js";
import { detectProject } from "../detectors/index.js";

const log = createLogger("validate");

interface ValidationIssue {
  type: "error" | "warning";
  file: string;
  message: string;
}

/**
 * Run validate command
 */
export async function validateCommand(options: ValidateOptions): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();
  const issues: ValidationIssue[] = [];

  try {
    log.info("Validating Brief configuration...");

    // Check for config file
    const config = await loadProjectConfig(projectPath);

    if (!config) {
      issues.push({
        type: "error",
        file: ".brief.json",
        message: "Configuration file not found. Run 'brief init' first.",
      });
    } else {
      // Validate config structure
      const configValidation = validateConfig(config);
      if (!configValidation.valid) {
        for (const error of configValidation.errors) {
          issues.push({
            type: "error",
            file: ".brief.json",
            message: error.message,
          });
        }
      }

      if (options.verbose) {
        log.info("Config file is valid");
      }
    }

    // Check for expected files based on tools
    const tools = config?.tools || [];

    if (tools.includes("cursor") || tools.includes("hybrid")) {
      // Check Cursor files
      const cursorRulesDir = path.join(projectPath, ".cursor", "rules");
      if (!(await exists(cursorRulesDir))) {
        issues.push({
          type: "warning",
          file: ".cursor/rules/",
          message: "Cursor rules directory not found",
        });
      } else {
        const coreRule = path.join(cursorRulesDir, "core.mdc");
        if (!(await exists(coreRule))) {
          issues.push({
            type: "warning",
            file: ".cursor/rules/core.mdc",
            message: "Core cursor rule not found",
          });
        }
      }
    }

    if (tools.includes("claude") || tools.includes("hybrid")) {
      // Check Claude files
      const claudeMd = path.join(projectPath, "CLAUDE.md");
      if (!(await exists(claudeMd))) {
        issues.push({
          type: "warning",
          file: "CLAUDE.md",
          message: "CLAUDE.md not found",
        });
      }

      const claudeSettings = path.join(projectPath, ".claude", "settings.json");
      if (!(await exists(claudeSettings))) {
        issues.push({
          type: "warning",
          file: ".claude/settings.json",
          message: "Claude settings file not found",
        });
      }
    }

    // Check shared docs
    const architectureMd = path.join(projectPath, "docs", "ARCHITECTURE.md");
    if (!(await exists(architectureMd))) {
      issues.push({
        type: "warning",
        file: "docs/ARCHITECTURE.md",
        message: "Architecture documentation not found",
      });
    }

    const techStackMd = path.join(projectPath, "docs", "TECH-STACK.md");
    if (!(await exists(techStackMd))) {
      issues.push({
        type: "warning",
        file: "docs/TECH-STACK.md",
        message: "Tech stack documentation not found",
      });
    }

    // Validate against current detection
    if (config && options.verbose) {
      log.info("Checking configuration against current project state...");
      const detection = await detectProject(projectPath);

      if (config.language !== detection.language.primary) {
        issues.push({
          type: "warning",
          file: ".brief.json",
          message: `Language mismatch: config says "${config.language}" but detected "${detection.language.primary}"`,
        });
      }
    }

    // Report results
    const errors = issues.filter((i) => i.type === "error");
    const warnings = issues.filter((i) => i.type === "warning");

    if (errors.length > 0) {
      log.error(`Found ${errors.length} error(s):`);
      for (const issue of errors) {
        log.error(`  ✗ ${issue.file}: ${issue.message}`);
      }
    }

    if (warnings.length > 0) {
      log.warn(`Found ${warnings.length} warning(s):`);
      for (const issue of warnings) {
        log.warn(`  ⚠ ${issue.file}: ${issue.message}`);
      }
    }

    if (errors.length === 0 && warnings.length === 0) {
      log.success("Configuration is valid!");
      return {
        success: true,
        message: "Configuration is valid",
      };
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Validation failed with ${errors.length} error(s) and ${warnings.length} warning(s)`,
      };
    }

    return {
      success: true,
      message: `Validation passed with ${warnings.length} warning(s)`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Validation failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

export default validateCommand;
