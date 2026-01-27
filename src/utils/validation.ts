/**
 * Validation utilities for Brief CLI
 * Validates configuration files, templates, and user input
 */

import type { AiInitConfig, AiTool, Language } from "../types/index.js";
import { exists, isDirectory, readJson } from "./file-system.js";
import { parseFrontmatter } from "./template-engine.js";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

const VALID_AI_TOOLS: AiTool[] = ["cursor", "claude", "hybrid"];
const VALID_LANGUAGES: Language[] = ["typescript", "javascript", "python", "go", "rust", "java", "unknown"];
const VALID_PROJECT_TYPES = ["web", "api", "cli", "library", "full-stack", "mobile", "desktop"];

/**
 * Validate an AiInitConfig object
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!config || typeof config !== "object") {
    errors.push({
      field: "config",
      message: "Configuration must be an object",
      value: config,
    });
    return { valid: false, errors, warnings };
  }

  const cfg = config as Record<string, unknown>;

  // Required: version
  if (!cfg.version || typeof cfg.version !== "string") {
    errors.push({
      field: "version",
      message: "Version is required and must be a string",
      value: cfg.version,
    });
  } else if (!/^\d+\.\d+\.\d+$/.test(cfg.version)) {
    warnings.push({
      field: "version",
      message: "Version should follow semver format (x.y.z)",
      suggestion: "Use format like 1.0.0",
    });
  }

  // Required: projectType
  if (!cfg.projectType || typeof cfg.projectType !== "string") {
    errors.push({
      field: "projectType",
      message: "Project type is required and must be a string",
      value: cfg.projectType,
    });
  } else if (!VALID_PROJECT_TYPES.includes(cfg.projectType)) {
    warnings.push({
      field: "projectType",
      message: `Unknown project type: ${cfg.projectType}`,
      suggestion: `Valid types: ${VALID_PROJECT_TYPES.join(", ")}`,
    });
  }

  // Required: language
  if (!cfg.language || typeof cfg.language !== "string") {
    errors.push({
      field: "language",
      message: "Language is required and must be a string",
      value: cfg.language,
    });
  } else if (!VALID_LANGUAGES.includes(cfg.language as Language)) {
    errors.push({
      field: "language",
      message: `Invalid language: ${cfg.language}`,
      value: cfg.language,
    });
  }

  // Required: tools
  if (!cfg.tools || !Array.isArray(cfg.tools)) {
    errors.push({
      field: "tools",
      message: "Tools must be an array",
      value: cfg.tools,
    });
  } else {
    for (const tool of cfg.tools) {
      if (!VALID_AI_TOOLS.includes(tool as AiTool)) {
        errors.push({
          field: "tools",
          message: `Invalid tool: ${tool}`,
          value: tool,
        });
      }
    }
  }

  // Required: templates
  if (!cfg.templates || !Array.isArray(cfg.templates)) {
    errors.push({
      field: "templates",
      message: "Templates must be an array",
      value: cfg.templates,
    });
  } else if (cfg.templates.length === 0) {
    warnings.push({
      field: "templates",
      message: "No templates specified",
      suggestion: "Add at least one template for better AI assistance",
    });
  }

  // Optional: framework
  if (cfg.framework !== undefined && typeof cfg.framework !== "string") {
    errors.push({
      field: "framework",
      message: "Framework must be a string if provided",
      value: cfg.framework,
    });
  }

  // Optional: testing
  if (cfg.testing !== undefined && typeof cfg.testing !== "string") {
    errors.push({
      field: "testing",
      message: "Testing must be a string if provided",
      value: cfg.testing,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a config file path and its contents
 */
export async function validateConfigFile(configPath: string): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check file exists
  if (!(await exists(configPath))) {
    errors.push({
      field: "path",
      message: `Configuration file not found: ${configPath}`,
    });
    return { valid: false, errors, warnings };
  }

  // Try to parse JSON
  const config = await readJson<AiInitConfig>(configPath);
  if (config === null) {
    errors.push({
      field: "format",
      message: "Invalid JSON format in configuration file",
    });
    return { valid: false, errors, warnings };
  }

  // Validate config contents
  const contentValidation = validateConfig(config);
  return {
    valid: contentValidation.valid,
    errors: [...errors, ...contentValidation.errors],
    warnings: [...warnings, ...contentValidation.warnings],
  };
}

/**
 * Validate a template file
 */
export async function validateTemplate(templateContent: string): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!templateContent || templateContent.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Template content is empty",
    });
    return { valid: false, errors, warnings };
  }

  // Try to parse frontmatter
  try {
    const { frontmatter, content } = parseFrontmatter(templateContent);

    // Check for required frontmatter fields (for MDC templates)
    if (templateContent.startsWith("---")) {
      if (!frontmatter.globs && !frontmatter.name) {
        warnings.push({
          field: "frontmatter",
          message: "Template has frontmatter but no globs or name defined",
          suggestion: "Add globs for auto-activation or name for identification",
        });
      }
    }

    // Check for unbalanced Handlebars expressions
    const openBraces = (content.match(/\{\{/g) || []).length;
    const closeBraces = (content.match(/\}\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        field: "syntax",
        message: `Unbalanced Handlebars expressions: ${openBraces} opening, ${closeBraces} closing`,
      });
    }

    // Check for common template issues
    const unclosedBlocks = findUnclosedBlocks(content);
    for (const block of unclosedBlocks) {
      errors.push({
        field: "syntax",
        message: `Unclosed block helper: ${block}`,
      });
    }
  } catch (err) {
    errors.push({
      field: "parse",
      message: `Failed to parse template: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Find unclosed block helpers in Handlebars template
 */
function findUnclosedBlocks(content: string): string[] {
  const blockStack: string[] = [];

  // Match block openers: {{#blockName}} or {{#blockName arg}}
  const blockOpener = /\{\{#(\w+)/g;
  // Match block closers: {{/blockName}}
  const blockCloser = /\{\{\/(\w+)\}\}/g;

  let match: RegExpExecArray | null;

  // Find all block openers
  while ((match = blockOpener.exec(content)) !== null) {
    const blockName = match[1];
    if (blockName) {
      blockStack.push(blockName);
    }
  }

  // Find all block closers and remove from stack
  while ((match = blockCloser.exec(content)) !== null) {
    const blockName = match[1];
    if (blockName) {
      const idx = blockStack.lastIndexOf(blockName);
      if (idx !== -1) {
        blockStack.splice(idx, 1);
      }
    }
  }

  return blockStack;
}

/**
 * Validate project directory structure
 */
export async function validateProjectDirectory(projectPath: string): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!(await exists(projectPath))) {
    errors.push({
      field: "path",
      message: `Project directory not found: ${projectPath}`,
    });
    return { valid: false, errors, warnings };
  }

  if (!(await isDirectory(projectPath))) {
    errors.push({
      field: "path",
      message: `Path is not a directory: ${projectPath}`,
    });
    return { valid: false, errors, warnings };
  }

  // Check for package.json or other project files
  const hasPackageJson = await exists(`${projectPath}/package.json`);
  const hasRequirementsTxt = await exists(`${projectPath}/requirements.txt`);
  const hasGoMod = await exists(`${projectPath}/go.mod`);
  const hasCargoToml = await exists(`${projectPath}/Cargo.toml`);
  const hasPomXml = await exists(`${projectPath}/pom.xml`);

  const hasProjectFile = hasPackageJson || hasRequirementsTxt || hasGoMod || hasCargoToml || hasPomXml;

  if (!hasProjectFile) {
    warnings.push({
      field: "project",
      message: "No recognized project file found",
      suggestion: "Brief works best with projects that have package.json, requirements.txt, go.mod, Cargo.toml, or pom.xml",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate glob pattern syntax
 */
export function validateGlobPattern(pattern: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!pattern || typeof pattern !== "string") {
    errors.push({
      field: "pattern",
      message: "Glob pattern must be a non-empty string",
      value: pattern,
    });
    return { valid: false, errors, warnings };
  }

  // Check for common glob issues
  if (pattern.includes("\\") && process.platform !== "win32") {
    warnings.push({
      field: "pattern",
      message: "Backslashes in glob patterns may not work cross-platform",
      suggestion: "Use forward slashes (/) instead",
    });
  }

  // Check for overly broad patterns
  if (pattern === "*" || pattern === "**" || pattern === "**/*") {
    warnings.push({
      field: "pattern",
      message: "Very broad glob pattern may match too many files",
      suggestion: "Consider using more specific patterns like **/*.ts",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format validation result as string for display
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push("✓ Validation passed");
  } else {
    lines.push("✗ Validation failed");
  }

  if (result.errors.length > 0) {
    lines.push("\nErrors:");
    for (const error of result.errors) {
      lines.push(`  • ${error.field}: ${error.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push("\nWarnings:");
    for (const warning of result.warnings) {
      lines.push(`  ⚠ ${warning.field}: ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`    → ${warning.suggestion}`);
      }
    }
  }

  return lines.join("\n");
}

export const validation = {
  validateConfig,
  validateConfigFile,
  validateTemplate,
  validateProjectDirectory,
  validateGlobPattern,
  formatResult: formatValidationResult,
};

export default validation;
