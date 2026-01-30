/**
 * Generator module exports
 */

// Types
export type {
  FullGeneratorResult,
  GeneratedFile,
  Generator,
  GeneratorContext,
  GeneratorOptions,
  GeneratorResult,
} from "./types.js";

// Base utilities
export {
  createGeneratorContext,
  generateFromTemplates,
  renderTemplateWithContext,
  summarizeResults,
  writeGeneratedFile,
} from "./base.js";

// Individual generators
export { claudeGenerator, getClaudeTemplates } from "./claude/index.js";
export { cursorGenerator, getCursorTemplates } from "./cursor/index.js";
export {
  getJetBrainsTemplates,
  jetbrainsGenerator,
} from "./jetbrains/index.js";
export { getQoderTemplates, qoderGenerator } from "./qoder/index.js";
export { getSharedTemplates, sharedGenerator } from "./shared/index.js";

// Orchestrator
export {
  getGeneratorsForConfig,
  previewGeneration,
  runGenerator,
  runGenerators,
} from "./orchestrator.js";
