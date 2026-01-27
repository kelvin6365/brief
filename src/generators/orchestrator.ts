/**
 * Generator orchestrator
 * Coordinates all generators based on configuration
 */

import type {
  GeneratorOptions,
  GeneratorResult,
  FullGeneratorResult,
  Generator,
} from "./types.js";
import { summarizeResults } from "./base.js";
import { cursorGenerator } from "./cursor/index.js";
import { claudeGenerator } from "./claude/index.js";
import { qoderGenerator } from "./qoder/index.js";
import { sharedGenerator } from "./shared/index.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("orchestrator");

/** All available generators */
const GENERATORS: Generator[] = [
  cursorGenerator,
  claudeGenerator,
  qoderGenerator,
  sharedGenerator,
];

/**
 * Get generators to run based on config
 */
export function getGeneratorsForConfig(tools: string[]): Generator[] {
  const generators: Generator[] = [];

  // Check which tools are enabled
  const enableAll = tools.includes("all");
  const enableCursor = enableAll || tools.includes("cursor") || tools.includes("hybrid");
  const enableClaude = enableAll || tools.includes("claude") || tools.includes("hybrid");
  const enableQoder = enableAll || tools.includes("qoder");

  if (enableCursor) {
    generators.push(cursorGenerator);
  }

  if (enableClaude) {
    generators.push(claudeGenerator);
  }

  if (enableQoder) {
    generators.push(qoderGenerator);
  }

  // Shared documentation is always included
  generators.push(sharedGenerator);

  return generators;
}

/**
 * Run all applicable generators
 */
export async function runGenerators(options: GeneratorOptions): Promise<FullGeneratorResult> {
  const { config, dryRun } = options;

  log.debug(`Starting generation for tools: ${config.tools.join(", ")}`);

  // Get applicable generators
  const generators = getGeneratorsForConfig(config.tools);

  if (generators.length === 0) {
    log.warn("No generators selected");
    return {
      success: true,
      results: [],
      summary: { created: 0, modified: 0, skipped: 0, errors: 0 },
    };
  }

  log.debug(`Running ${generators.length} generator(s)`);

  // Run generators
  const results: GeneratorResult[] = [];
  let allSuccess = true;

  for (const generator of generators) {
    log.debug(`Running ${generator.name}`);

    try {
      const result = await generator.generate(options);
      results.push(result);

      if (!result.success) {
        allSuccess = false;
        log.warn(`${generator.name} completed with errors`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`${generator.name} failed:`, message);

      results.push({
        success: false,
        target: generator.target,
        files: [],
        error: message,
      });

      allSuccess = false;
    }
  }

  // Calculate summary across all generators
  const allFiles = results.flatMap((r) => r.files);
  const summary = summarizeResults(allFiles);

  if (dryRun) {
    log.debug("Dry run completed - no files were written");
  }

  log.debug(`Generation complete: ${summary.created} created, ${summary.modified} modified, ${summary.skipped} skipped, ${summary.errors} errors`);

  return {
    success: allSuccess,
    results,
    summary,
  };
}

/**
 * Run a single generator by target
 */
export async function runGenerator(
  target: "cursor" | "claude" | "qoder" | "shared",
  options: GeneratorOptions
): Promise<GeneratorResult> {
  const generator = GENERATORS.find((g) => g.target === target);

  if (!generator) {
    return {
      success: false,
      target,
      files: [],
      error: `Unknown generator target: ${target}`,
    };
  }

  return generator.generate(options);
}

/**
 * Preview what would be generated (dry run)
 */
export async function previewGeneration(options: GeneratorOptions): Promise<FullGeneratorResult> {
  return runGenerators({ ...options, dryRun: true });
}
