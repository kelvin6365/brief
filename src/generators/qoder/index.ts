/**
 * Qoder generator
 * Generates .qoder/rules/*.md files and .qoder/settings.json
 */

import {
  filterTemplatesByDetection,
  getTemplatesByTarget,
  resolveTemplateDependencies,
  sortTemplatesByPriority,
} from "../../templates/index.js";
import type { TemplateDefinition } from "../../templates/types.js";
import { createGenerator } from "../base.js";
import type { Generator, GeneratorOptions } from "../types.js";

/**
 * Get Qoder templates to generate based on detection and config
 * 
 * This function selects templates for Qoder by:
 * 1. Starting with all templates that target "qoder"
 * 2. If user specified templates: include those + essential core templates
 * 3. Otherwise: use detection-based filtering (auto-select based on tech stack)
 * 4. Resolve dependencies (e.g., Angular requires TypeScript)
 * 5. Sort by priority (higher number = generated first)
 * 
 * Core templates always included:
 * - qoder-core (coding standards)
 * - qoder-quick-reference (how to use @ references)
 * - qoder-requirements-spec (Quest Mode standards)
 * - qoder-settings (settings.json configuration)
 * 
 * @param options - Generator options with detection and config
 * @returns Array of template definitions to generate
 * 
 * @example
 * ```typescript
 * const templates = getQoderTemplates({
 *   detection: projectDetection,
 *   config: { templates: ['typescript', 'react'] },
 *   projectPath: '/path/to/project'
 * });
 * // Returns: [qoder-core, qoder-settings, typescript, react, ...]
 * ```
 */
export function getQoderTemplates(
  options: GeneratorOptions
): TemplateDefinition[] {
  const { detection, config } = options;

  // Start with all Qoder templates
  let templates = getTemplatesByTarget("qoder");

  // If user specified templates, include those explicitly
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Always include essential core Qoder templates
    requestedIds.add("qoder-core");
    requestedIds.add("qoder-quick-reference");
    requestedIds.add("qoder-settings");

    // Resolve dependencies for requested templates
    const resolvedIds = resolveTemplateDependencies(Array.from(requestedIds));

    // Include explicitly requested templates (bypass condition check) + all core templates
    templates = templates.filter(
      (t) => resolvedIds.includes(t.id) || t.category === "core"
    );
  } else {
    // No specific templates requested, use detection-based filtering
    templates = filterTemplatesByDetection(templates, detection);
  }

  // Sort by priority (higher priority first)
  templates = sortTemplatesByPriority(templates);

  return templates;
}

/**
 * Qoder generator instance
 * 
 * Generates configuration files for Qoder (The Agentic Coding Platform):
 * - .qoder/rules/*.md - Rule files with manual/always_on triggers
 * - .qoder/settings.json - Memory, Quest Mode, and agent configuration
 * 
 * Key features:
 * - Uses @ reference system (manual rule activation)
 * - Integrates with Qoder's 4-category memory system
 * - Enforces complete code in Quest Mode (no TODO/placeholders)
 * - Supports framework/language-specific rules via shared templates
 * 
 * @see {@link getQoderTemplates} for template selection logic
 */
export const qoderGenerator: Generator = createGenerator({
  name: "Qoder Generator",
  target: "qoder",
  getTemplates: getQoderTemplates,
});

export default qoderGenerator;
