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
import { createLogger } from "../../utils/logger.js";
import {
  createGeneratorContext,
  generateFromTemplates,
  summarizeResults,
} from "../base.js";
import type { Generator, GeneratorOptions, GeneratorResult } from "../types.js";

const log = createLogger("jetbrains-gen");

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
export const jetbrainsGenerator: Generator = {
  name: "JetBrains AI Assistant Rules Generator",
  target: "jetbrains",

  async generate(options: GeneratorOptions): Promise<GeneratorResult> {
    log.debug("Starting JetBrains AI Assistant rules generation");

    try {
      // Get templates to generate
      const templates = getJetBrainsTemplates(options);

      if (templates.length === 0) {
        log.warn("No JetBrains templates selected for generation");
        return {
          success: true,
          target: "jetbrains",
          files: [],
        };
      }

      log.debug(`Generating ${templates.length} JetBrains templates`);

      // Create context
      const context = createGeneratorContext(options);

      // Generate files
      const files = await generateFromTemplates(templates, context, options);

      // Check for errors
      const summary = summarizeResults(files);
      const hasErrors = summary.errors > 0;

      if (hasErrors) {
        log.warn(
          `JetBrains generation completed with ${summary.errors} error(s)`
        );
      } else {
        log.debug(
          `JetBrains generation completed: ${summary.created} created, ${summary.modified} modified, ${summary.skipped} skipped`
        );
      }

      return {
        success: !hasErrors,
        target: "jetbrains",
        files,
        error: hasErrors
          ? `${summary.errors} file(s) failed to generate`
          : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error("JetBrains generation failed:", message);
      return {
        success: false,
        target: "jetbrains",
        files: [],
        error: message,
      };
    }
  },
};

export default jetbrainsGenerator;
