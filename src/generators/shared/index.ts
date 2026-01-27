/**
 * Shared documentation generator
 * Generates docs/ARCHITECTURE.md, docs/TECH-STACK.md, etc.
 */

import type { GeneratorOptions, GeneratorResult, Generator } from "../types.js";
import { createGeneratorContext, generateFromTemplates, summarizeResults } from "../base.js";
import {
  getTemplatesByTarget,
  sortTemplatesByPriority,
} from "../../templates/index.js";
import type { TemplateDefinition } from "../../templates/types.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("shared-gen");

/**
 * Get shared templates to generate
 */
export function getSharedTemplates(options: GeneratorOptions): TemplateDefinition[] {
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
export const sharedGenerator: Generator = {
  name: "Shared Documentation Generator",
  target: "shared",

  async generate(options: GeneratorOptions): Promise<GeneratorResult> {
    log.debug("Starting shared documentation generation");

    try {
      // Get templates to generate
      const templates = getSharedTemplates(options);

      if (templates.length === 0) {
        log.debug("No shared templates selected for generation");
        return {
          success: true,
          target: "shared",
          files: [],
        };
      }

      log.debug(`Generating ${templates.length} shared templates`);

      // Create context
      const context = createGeneratorContext(options);

      // Generate files
      const files = await generateFromTemplates(templates, context, options);

      // Check for errors
      const summary = summarizeResults(files);
      const hasErrors = summary.errors > 0;

      if (hasErrors) {
        log.warn(`Shared generation completed with ${summary.errors} error(s)`);
      } else {
        log.debug(`Shared generation completed: ${summary.created} created, ${summary.modified} modified, ${summary.skipped} skipped`);
      }

      return {
        success: !hasErrors,
        target: "shared",
        files,
        error: hasErrors ? `${summary.errors} file(s) failed to generate` : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error("Shared generation failed:", message);
      return {
        success: false,
        target: "shared",
        files: [],
        error: message,
      };
    }
  },
};

export default sharedGenerator;
