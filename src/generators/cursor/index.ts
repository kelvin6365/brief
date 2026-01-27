/**
 * Cursor rules generator
 * Generates .cursor/rules/*.mdc files
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

const log = createLogger("cursor-gen");

/**
 * Get Cursor templates to generate based on detection and config
 */
export function getCursorTemplates(options: GeneratorOptions): TemplateDefinition[] {
  const { detection, config } = options;

  // Start with all Cursor templates
  let templates = getTemplatesByTarget("cursor");

  // Filter by detection conditions (language, framework, etc.)
  templates = filterTemplatesByDetection(templates, detection);

  // If user specified templates, filter to only those (plus core)
  if (config.templates.length > 0) {
    const requestedIds = new Set(config.templates);

    // Always include core template
    requestedIds.add("cursor-core");

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
 * Cursor rules generator
 */
export const cursorGenerator: Generator = {
  name: "Cursor Rules Generator",
  target: "cursor",

  async generate(options: GeneratorOptions): Promise<GeneratorResult> {
    log.debug("Starting Cursor rules generation");

    try {
      // Get templates to generate
      const templates = getCursorTemplates(options);

      if (templates.length === 0) {
        log.warn("No Cursor templates selected for generation");
        return {
          success: true,
          target: "cursor",
          files: [],
        };
      }

      log.debug(`Generating ${templates.length} Cursor templates`);

      // Create context
      const context = createGeneratorContext(options);

      // Generate files
      const files = await generateFromTemplates(templates, context, options);

      // Check for errors
      const summary = summarizeResults(files);
      const hasErrors = summary.errors > 0;

      if (hasErrors) {
        log.warn(`Cursor generation completed with ${summary.errors} error(s)`);
      } else {
        log.debug(`Cursor generation completed: ${summary.created} created, ${summary.modified} modified, ${summary.skipped} skipped`);
      }

      return {
        success: !hasErrors,
        target: "cursor",
        files,
        error: hasErrors ? `${summary.errors} file(s) failed to generate` : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error("Cursor generation failed:", message);
      return {
        success: false,
        target: "cursor",
        files: [],
        error: message,
      };
    }
  },
};

export default cursorGenerator;
