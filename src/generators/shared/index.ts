/**
 * Shared documentation generator
 * Generates docs/ARCHITECTURE.md, docs/TECH-STACK.md, etc.
 */

import {
  getTemplatesByTarget,
  sortTemplatesByPriority,
} from "../../templates/index.js";
import type { TemplateDefinition } from "../../templates/types.js";
import { createGenerator } from "../base.js";
import type { Generator, GeneratorOptions } from "../types.js";

/**
 * Get shared templates to generate
 */
export function getSharedTemplates(
  options: GeneratorOptions
): TemplateDefinition[] {
  const { config } = options;

  // Get all shared templates
  let templates = getTemplatesByTarget("shared");

  // If user specified templates, filter to only those
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Check if any shared templates were requested
    const hasSharedRequest = templates.some((t) => requestedIds.has(t.id));

    // If specific shared templates requested, use those
    // Otherwise, include all shared templates by default
    if (hasSharedRequest) {
      templates = templates.filter((t) => requestedIds.has(t.id));
    }
  }

  // Sort by priority
  templates = sortTemplatesByPriority(templates);

  return templates;
}

/**
 * Shared documentation generator
 */
export const sharedGenerator: Generator = createGenerator({
  name: "Shared Documentation Generator",
  target: "shared",
  getTemplates: getSharedTemplates,
  emptyTemplatesLogLevel: "debug", // Use debug for shared (not a warning)
});

export default sharedGenerator;
