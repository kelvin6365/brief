/**
 * Qoder rule file validation utilities
 */

import * as fs from "fs-extra";
import * as yaml from "yaml";
import { createLogger } from "./logger.js";

const log = createLogger("qoder-validation");

/**
 * Validation result for a Qoder rule file
 */
export interface QoderRuleValidationResult {
  /** Whether the rule file is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Parsed frontmatter (if valid) */
  frontmatter?: QoderRuleFrontmatter;
  /** Rule file metadata */
  metadata?: {
    hasContent: boolean;
    lineCount: number;
    hasFrontmatter: boolean;
  };
}

/**
 * Expected frontmatter structure for Qoder rules
 */
export interface QoderRuleFrontmatter {
  /** Trigger mode: manual (default) or always_on */
  trigger?: "manual" | "always_on";
  /** Whether this rule is always applied (for always_on trigger) */
  alwaysApply?: boolean;
  /** Human-readable description */
  description?: string;
  /** Related rules that work well with this one */
  related?: string[];
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Valid trigger modes for Qoder rules
 */
const VALID_TRIGGERS = ["manual", "always_on"];

/**
 * Extract YAML frontmatter from markdown content
 * 
 * @param content - Full file content
 * @returns Parsed frontmatter or null if not found/invalid
 */
function extractFrontmatter(content: string): {
  frontmatter: Record<string, unknown> | null;
  error?: string;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    return { frontmatter: null };
  }

  try {
    const yamlContent = frontmatterMatch[1];
    if (!yamlContent) {
      return { frontmatter: null, error: "Empty frontmatter" };
    }
    const parsed = yaml.parse(yamlContent);
    return { frontmatter: parsed as Record<string, unknown> };
  } catch (error) {
    return {
      frontmatter: null,
      error: error instanceof Error ? error.message : "Invalid YAML",
    };
  }
}

/**
 * Validate a Qoder rule file
 * 
 * @param filePath - Path to the rule file (.md)
 * @returns Validation result with errors and warnings
 * 
 * @example
 * ```typescript
 * const result = await validateQoderRule('.qoder/rules/core.md');
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export async function validateQoderRule(
  filePath: string
): Promise<QoderRuleValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file exists
  if (!(await fs.pathExists(filePath))) {
    return {
      valid: false,
      errors: ["File does not exist"],
      warnings: [],
    };
  }

  // Read file content
  let content: string;
  try {
    content = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`],
      warnings: [],
    };
  }

  // Check file is not empty
  if (content.trim().length === 0) {
    errors.push("File is empty");
  }

  const lineCount = content.split("\n").length;

  // Extract and validate frontmatter
  const { frontmatter, error: frontmatterError } = extractFrontmatter(content);

  if (frontmatterError) {
    errors.push(`Invalid frontmatter YAML: ${frontmatterError}`);
  }

  if (!frontmatter) {
    warnings.push("No frontmatter found (optional but recommended)");
  }

  let validatedFrontmatter: QoderRuleFrontmatter | undefined;

  if (frontmatter) {
    // Validate trigger field
    if (frontmatter.trigger) {
      if (typeof frontmatter.trigger !== "string") {
        errors.push("Frontmatter 'trigger' must be a string");
      } else if (!VALID_TRIGGERS.includes(frontmatter.trigger)) {
        errors.push(
          `Invalid trigger value '${frontmatter.trigger}'. Must be one of: ${VALID_TRIGGERS.join(", ")}`
        );
      }
    }

    // Validate alwaysApply field
    if (frontmatter.alwaysApply !== undefined) {
      if (typeof frontmatter.alwaysApply !== "boolean") {
        errors.push("Frontmatter 'alwaysApply' must be a boolean");
      }
      if (frontmatter.alwaysApply && frontmatter.trigger !== "always_on") {
        warnings.push(
          "alwaysApply is true but trigger is not 'always_on'. Consider using trigger: always_on"
        );
      }
    }

    // Validate description
    if (frontmatter.description && typeof frontmatter.description !== "string") {
      errors.push("Frontmatter 'description' must be a string");
    }

    // Validate related field
    if (frontmatter.related) {
      if (!Array.isArray(frontmatter.related)) {
        errors.push("Frontmatter 'related' must be an array of strings");
      } else if (
        !frontmatter.related.every((r: unknown) => typeof r === "string")
      ) {
        errors.push("All items in 'related' must be strings");
      }
    }

    // Validate tags field
    if (frontmatter.tags) {
      if (!Array.isArray(frontmatter.tags)) {
        errors.push("Frontmatter 'tags' must be an array of strings");
      } else if (!frontmatter.tags.every((t: unknown) => typeof t === "string")) {
        errors.push("All items in 'tags' must be strings");
      }
    }

    // Check for Cursor-specific fields that shouldn't be in Qoder rules
    const cursorFields = ["globs", "priority"];
    const foundCursorFields = cursorFields.filter((field) => field in frontmatter);
    if (foundCursorFields.length > 0) {
      warnings.push(
        `Found Cursor-specific fields that are ignored by Qoder: ${foundCursorFields.join(", ")}`
      );
    }

    validatedFrontmatter = frontmatter as QoderRuleFrontmatter;
  }

  // Check for content after frontmatter
  const contentAfterFrontmatter = content
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .trim();
  const hasContent = contentAfterFrontmatter.length > 0;

  if (!hasContent) {
    errors.push("No content found after frontmatter");
  }

  // Additional warnings for best practices
  if (lineCount < 10 && hasContent) {
    warnings.push(
      "Rule file is very short. Consider adding more context and examples."
    );
  }

  if (
    hasContent &&
    !contentAfterFrontmatter.includes("```") &&
    lineCount > 20
  ) {
    warnings.push(
      "Consider adding code examples to illustrate the rules (using markdown code blocks)"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    frontmatter: validatedFrontmatter,
    metadata: {
      hasContent,
      lineCount,
      hasFrontmatter: frontmatter !== null,
    },
  };
}

/**
 * Validate all rule files in a Qoder rules directory
 * 
 * @param rulesDir - Path to .qoder/rules directory
 * @returns Map of file paths to validation results
 */
export async function validateQoderRulesDirectory(
  rulesDir: string
): Promise<Map<string, QoderRuleValidationResult>> {
  const results = new Map<string, QoderRuleValidationResult>();

  if (!(await fs.pathExists(rulesDir))) {
    log.warn(`Rules directory does not exist: ${rulesDir}`);
    return results;
  }

  const files = await fs.readdir(rulesDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  log.debug(`Validating ${mdFiles.length} rule files in ${rulesDir}`);

  for (const file of mdFiles) {
    const filePath = `${rulesDir}/${file}`;
    const result = await validateQoderRule(filePath);
    results.set(filePath, result);

    if (!result.valid) {
      log.warn(`Validation failed for ${file}:`, result.errors);
    } else if (result.warnings.length > 0) {
      log.debug(`Validation warnings for ${file}:`, result.warnings);
    }
  }

  return results;
}

/**
 * Calculate total character count for Qoder rule files
 * 
 * @param filePaths - Array of file paths to .qoder/rules/*.md files
 * @returns Total character count across all files
 */
export async function calculateRuleCharacters(filePaths: string[]): Promise<number> {
  let totalChars = 0;
  
  for (const filePath of filePaths) {
    try {
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, "utf-8");
        totalChars += content.length;
      }
    } catch (error) {
      log.warn(`Failed to read ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  
  return totalChars;
}

/**
 * Validate character limit for Qoder rules
 * Qoder has a 100,000 character limit across all active rules
 * 
 * @param rulesDir - Path to .qoder/rules directory
 * @returns Validation result with character count and warnings
 */
export async function validateCharacterLimit(rulesDir: string): Promise<{
  totalChars: number;
  exceedsLimit: boolean;
  withinLimit: boolean;
  warnings: string[];
}> {
  const warnings: string[] = [];
  
  if (!(await fs.pathExists(rulesDir))) {
    return {
      totalChars: 0,
      exceedsLimit: false,
      withinLimit: true,
      warnings: ["Rules directory does not exist"],
    };
  }
  
  const files = await fs.readdir(rulesDir);
  const mdFiles = files
    .filter((f) => f.endsWith(".md"))
    .map((f) => `${rulesDir}/${f}`);
  
  const totalChars = await calculateRuleCharacters(mdFiles);
  const LIMIT = 100000;
  const exceedsLimit = totalChars > LIMIT;
  const withinLimit = totalChars <= LIMIT;
  
  if (exceedsLimit) {
    const overage = totalChars - LIMIT;
    warnings.push(`Total character count (${totalChars}) exceeds Qoder's 100,000 limit by ${overage} characters`);
    warnings.push("Use 'Apply Manually' activation mode for most rules to stay within limit");
    warnings.push("Only set critical rules (like requirements-spec.md) to 'Always Apply'");
  } else if (totalChars > LIMIT * 0.8) {
    warnings.push(`Total character count (${totalChars}) is approaching the 100,000 limit`);
    warnings.push("Consider using 'Apply Manually' or 'Model Decision' for less critical rules");
  }
  
  return {
    totalChars,
    exceedsLimit,
    withinLimit,
    warnings,
  };
}

  const lines: string[] = [];
  const totalFiles = results.size;
  const validFiles = Array.from(results.values()).filter((r) => r.valid).length;
  const invalidFiles = totalFiles - validFiles;

  lines.push(`\n📊 Qoder Rules Validation Report`);
  lines.push(`${"=".repeat(50)}`);
  lines.push(`Total files: ${totalFiles}`);
  lines.push(`Valid: ${validFiles} ✅`);
  lines.push(`Invalid: ${invalidFiles} ❌`);
  lines.push("");

  if (invalidFiles > 0) {
    lines.push(`❌ Invalid Files:\n`);
    for (const [filePath, result] of results) {
      if (!result.valid) {
        lines.push(`  ${filePath}`);
        for (const error of result.errors) {
          lines.push(`    - ${error}`);
        }
      }
    }
    lines.push("");
  }

  // Show warnings
  const filesWithWarnings = Array.from(results.entries()).filter(
    ([, r]) => r.warnings.length > 0
  );
  if (filesWithWarnings.length > 0) {
    lines.push(`⚠️  Warnings:\n`);
    for (const [filePath, result] of filesWithWarnings) {
      lines.push(`  ${filePath}`);
      for (const warning of result.warnings) {
        lines.push(`    - ${warning}`);
      }
    }
  }

  return lines.join("\n");
}
