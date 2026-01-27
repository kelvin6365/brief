/**
 * Qoder generator
 * Generates best_practices.md, AGENTS.md, and .ai_config.toml files
 */

import type { GeneratorOptions, GeneratorResult, Generator } from "../types.js";
import { createGeneratorContext, generateFromTemplates, summarizeResults } from "../base.js";
import {
  getTemplatesByTarget,
  sortTemplatesByPriority,
} from "../../templates/index.js";
import type { TemplateDefinition } from "../../templates/types.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("qoder-gen");

/**
 * Get Qoder templates to generate based on detection and config
 */
export function getQoderTemplates(options: GeneratorOptions): TemplateDefinition[] {
  const { config } = options;

  // Start with all Qoder templates
  let templates = getTemplatesByTarget("qoder");

  // If user specified templates, filter to only those (plus core)
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Always include core Qoder templates
    requestedIds.add("qoder-best-practices");

    templates = templates.filter(
      (t) => requestedIds.has(t.id) || t.category === "core"
    );
  }

  // Sort by priority
  templates = sortTemplatesByPriority(templates);

  return templates;
}

/**
 * Qoder generator
 */
export const qoderGenerator: Generator = {
  name: "Qoder Generator",
  target: "qoder",

  async generate(options: GeneratorOptions): Promise<GeneratorResult> {
    log.debug("Starting Qoder generation");

    try {
      // Get templates to generate
      const templates = getQoderTemplates(options);

      if (templates.length === 0) {
        log.warn("No Qoder templates selected for generation");
        return {
          success: true,
          target: "qoder",
          files: [],
        };
      }

      log.debug(`Generating ${templates.length} Qoder templates`);

      // Create context
      const context = createGeneratorContext(options);

      // Generate files
      const files = await generateFromTemplates(templates, context, options);

      // Check for errors
      const summary = summarizeResults(files);
      const hasErrors = summary.errors > 0;

      if (hasErrors) {
        log.warn(`Qoder generation completed with ${summary.errors} error(s)`);
      } else {
        log.debug(`Qoder generation completed: ${summary.created} created, ${summary.modified} modified, ${summary.skipped} skipped`);
      }

      return {
        success: !hasErrors,
        target: "qoder",
        files,
        error: hasErrors ? `${summary.errors} file(s) failed to generate` : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error("Qoder generation failed:", message);
      return {
        success: false,
        target: "qoder",
        files: [],
        error: message,
      };
    }
  },
};

export default qoderGenerator;
