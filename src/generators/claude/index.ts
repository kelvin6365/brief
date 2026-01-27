/**
 * Claude Code generator
 * Generates CLAUDE.md, .claude/settings.json, .claude/skills/*.md
 */

import type { GeneratorOptions, GeneratorResult, Generator } from "../types.js";
import { createGeneratorContext, generateFromTemplates, summarizeResults } from "../base.js";
import {
  getTemplatesByTarget,
  filterTemplatesByDetection,
  sortTemplatesByPriority,
  resolveTemplateDependencies,
} from "../../templates/index.js";
import type { TemplateDefinition } from "../../templates/types.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("claude-gen");

/**
 * Get Claude templates to generate based on detection and config
 */
export function getClaudeTemplates(options: GeneratorOptions): TemplateDefinition[] {
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
export const claudeGenerator: Generator = {
  name: "Claude Code Generator",
  target: "claude",

  async generate(options: GeneratorOptions): Promise<GeneratorResult> {
    log.debug("Starting Claude Code generation");

    try {
      // Get templates to generate
      const templates = getClaudeTemplates(options);

      if (templates.length === 0) {
        log.warn("No Claude templates selected for generation");
        return {
          success: true,
          target: "claude",
          files: [],
        };
      }

      log.debug(`Generating ${templates.length} Claude templates`);

      // Create context
      const context = createGeneratorContext(options);

      // Generate files
      const files = await generateFromTemplates(templates, context, options);

      // Check for errors
      const summary = summarizeResults(files);
      const hasErrors = summary.errors > 0;

      if (hasErrors) {
        log.warn(`Claude generation completed with ${summary.errors} error(s)`);
      } else {
        log.debug(`Claude generation completed: ${summary.created} created, ${summary.modified} modified, ${summary.skipped} skipped`);
      }

      return {
        success: !hasErrors,
        target: "claude",
        files,
        error: hasErrors ? `${summary.errors} file(s) failed to generate` : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error("Claude generation failed:", message);
      return {
        success: false,
        target: "claude",
        files: [],
        error: message,
      };
    }
  },
};

export default claudeGenerator;
