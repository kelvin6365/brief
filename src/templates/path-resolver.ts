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
