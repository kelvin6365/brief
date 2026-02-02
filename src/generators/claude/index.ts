/**
 * Claude Code generator
 * Generates CLAUDE.md, .claude/settings.json, .claude/skills/*.md
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
 * Get Claude templates to generate based on detection and config
 */
export function getClaudeTemplates(
  options: GeneratorOptions
): TemplateDefinition[] {
  const { detection, config } = options;

  // Start with all Claude templates
  let templates = getTemplatesByTarget("claude");

  // Filter by detection conditions
  templates = filterTemplatesByDetection(templates, detection);

  // If user specified templates, filter to only those (plus core)
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Always include core templates for Claude
    requestedIds.add("claude-core");
    requestedIds.add("claude-settings");

    // Resolve dependencies
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
 * Claude Code generator
 */
export const claudeGenerator: Generator = createGenerator({
  name: "Claude Code Generator",
  target: "claude",
  getTemplates: getClaudeTemplates,
});

export default claudeGenerator;
