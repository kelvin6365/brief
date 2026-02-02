/**
 * Qoder generator
 * Generates best_practices.md, AGENTS.md, and .ai_config.toml files
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

  // Sort by priority
  templates = sortTemplatesByPriority(templates);

  return templates;
}

/**
 * Qoder generator
 */
export const qoderGenerator: Generator = createGenerator({
  name: "Qoder Generator",
  target: "qoder",
  getTemplates: getQoderTemplates,
});

export default qoderGenerator;
