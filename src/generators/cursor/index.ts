/**
 * Cursor rules generator
 * Generates .cursor/rules/*.mdc files
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
 * Get Cursor templates to generate based on detection and config
 */
export function getCursorTemplates(
  options: GeneratorOptions
): TemplateDefinition[] {
  const { detection, config } = options;

  // Start with all Cursor templates
  let templates = getTemplatesByTarget("cursor");

  // If user specified templates, include those explicitly (bypass condition check)
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Always include core template
    requestedIds.add("cursor-core");

    // Resolve dependencies for requested templates
    const resolvedIds = resolveTemplateDependencies(Array.from(requestedIds));

    // Include explicitly requested templates + all core templates
    templates = templates.filter(
      (t) => resolvedIds.includes(t.id) || t.category === "core"
    );
  } else {
    // No specific templates requested, use detection-based filtering
    templates = filterTemplatesByDetection(templates, detection);
  }

  // Sort by priority
  templates = sortTemplatesByPriority(templates);

  return templates;
}

/**
 * Cursor rules generator
 */
export const cursorGenerator: Generator = createGenerator({
  name: "Cursor Rules Generator",
  target: "cursor",
  getTemplates: getCursorTemplates,
});

export default cursorGenerator;
