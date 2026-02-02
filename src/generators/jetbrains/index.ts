/**
 * JetBrains AI Assistant rules generator
 * Generates .aiassistant/rules/*.md files
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
 * Get JetBrains templates to generate based on detection and config
 */
export function getJetBrainsTemplates(
  options: GeneratorOptions
): TemplateDefinition[] {
  const { detection, config } = options;

  // Start with all JetBrains templates
  let templates = getTemplatesByTarget("jetbrains");

  // Filter by detection conditions (language, framework, etc.)
  templates = filterTemplatesByDetection(templates, detection);

  // If user specified templates, filter to only those (plus core)
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Always include core template
    requestedIds.add("jetbrains-core");

    // Resolve dependencies for requested templates
    const resolvedIds = resolveTemplateDependencies(Array.from(requestedIds));

    templates = templates.filter(
      (t) => resolvedIds.includes(t.id) || t.category === "core"
    );
  }

  // Sort by priority
  templates = sortTemplatesByPriority(templates);

  return templates;
}

/**
 * JetBrains AI Assistant rules generator
 */
export const jetbrainsGenerator: Generator = createGenerator({
  name: "JetBrains AI Assistant Rules Generator",
  target: "jetbrains",
  getTemplates: getJetBrainsTemplates,
});

export default jetbrainsGenerator;
