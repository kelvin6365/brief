/**
 * Template output path resolver
 * Resolves output paths for different targets (cursor, qoder, jetbrains, etc.)
 */

import type { TemplateTarget } from "./types.js";

/**
 * Target-specific path configuration
 */
const TARGET_PATHS: Record<string, { dir: string; ext: string }> = {
  cursor: { dir: ".cursor/rules", ext: ".mdc" },
  qoder: { dir: ".qoder/rules", ext: ".md" },
  jetbrains: { dir: ".aiassistant/rules", ext: ".md" },
  claude: { dir: ".claude", ext: ".md" },
};

/**
 * Frontmatter fields that are Cursor-specific and should be removed for other targets
 */
const CURSOR_SPECIFIC_FIELDS = ["globs", "priority", "alwaysApply", "tags"];

/**
 * Resolve output path for a specific target
 *
 * Transforms paths from a generic format to target-specific format:
 * - .cursor/rules/typescript.mdc → .qoder/rules/typescript.md (for qoder)
 * - .cursor/rules/api-design.mdc → .aiassistant/rules/api-design.md (for jetbrains)
 *
 * @param outputPath - Original output path (usually in cursor format)
 * @param target - Target tool to resolve for
 * @returns Resolved output path for the target
 */
export function resolveOutputPath(
  outputPath: string,
  target: TemplateTarget
): string {
  // If target is "shared" or "claude" with special paths, return as-is
  if (target === "shared" || !outputPath.startsWith(".cursor/rules/")) {
    return outputPath;
  }

  const targetConfig = TARGET_PATHS[target];
  if (!targetConfig) {
    return outputPath;
  }

  // Extract filename from .cursor/rules/filename.mdc
  const filename = outputPath.replace(/^\.cursor\/rules\//, "");
  const basename = filename.replace(/\.mdc$/, "");

  // Build new path: .qoder/rules/filename.md
  return `${targetConfig.dir}/${basename}${targetConfig.ext}`;
}

/**
 * Check if a path needs transformation
 *
 * @param outputPath - Output path to check
 * @returns True if path is a common template path that needs transformation
 */
export function isCommonTemplatePath(outputPath: string): boolean {
  return outputPath.startsWith(".cursor/rules/");
}

/**
 * Transform frontmatter for a specific target
 *
 * Removes Cursor-specific fields (globs, priority, alwaysApply, tags) for non-Cursor targets.
 * This allows common templates to be used across different AI tools.
 *
 * @param frontmatter - Original frontmatter object
 * @param target - Target tool to transform for
 * @param isCommonTemplate - Whether this is a common template (needs transformation)
 * @returns Transformed frontmatter for the target
 */
export function transformFrontmatterForTarget(
  frontmatter: Record<string, unknown>,
  target: TemplateTarget,
  isCommonTemplate: boolean
): Record<string, unknown> {
  // Only transform common templates for non-cursor targets
  if (!isCommonTemplate || target === "cursor") {
    return frontmatter;
  }

  // Create a copy without Cursor-specific fields
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(frontmatter)) {
    if (!CURSOR_SPECIFIC_FIELDS.includes(key)) {
      transformed[key] = value;
    }
  }

  return transformed;
}

/**
 * Resolve output paths for a list of templates
 *
 * @param templates - Templates with output paths
 * @param target - Target tool to resolve for
 * @returns Templates with resolved output paths
 */
export function resolveTemplatePaths<T extends { outputPath: string }>(
  templates: T[],
  target: TemplateTarget
): T[] {
  return templates.map((template) => ({
    ...template,
    outputPath: resolveOutputPath(template.outputPath, target),
  }));
}
