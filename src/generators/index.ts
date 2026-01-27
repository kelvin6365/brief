/**
 * Generator module exports
 */

// Types
export type {
  GeneratorOptions,
  GeneratedFile,
  GeneratorResult,
  FullGeneratorResult,
  GeneratorContext,
  Generator,
} from "./types.js";

// Base utilities
export {
  createGeneratorContext,
  renderTemplateWithContext,
  writeGeneratedFile,
  generateFromTemplates,
  summarizeResults,
} from "./base.js";

// Individual generators
export { cursorGenerator, getCursorTemplates } from "./cursor/index.js";
export { claudeGenerator, getClaudeTemplates } from "./claude/index.js";
export { qoderGenerator, getQoderTemplates } from "./qoder/index.js";
export { sharedGenerator, getSharedTemplates } from "./shared/index.js";

// Orchestrator
export {
  getGeneratorsForConfig,
  runGenerators,
  runGenerator,
  previewGeneration,
} from "./orchestrator.js";
