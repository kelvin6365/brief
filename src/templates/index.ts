/**
 * Template module exports
 */

// Types
export type {
  TemplateTarget,
  TemplateCategory,
  TemplateDefinition,
  TemplateCondition,
  TemplateBundle,
  ResolvedTemplate,
  TemplateRenderOptions,
  TemplateRenderResult,
} from "./types.js";

// Registry
export {
  CORE_TEMPLATES,
  LANGUAGE_TEMPLATES,
  FRAMEWORK_TEMPLATES,
  PATTERN_TEMPLATES,
  PROJECT_TYPE_TEMPLATES,
  CLAUDE_TEMPLATES,
  SHARED_TEMPLATES,
  ALL_TEMPLATES,
  TEMPLATE_BUNDLES,
  getTemplate,
  getTemplatesByTarget,
  getTemplatesByCategory,
  getTemplatesByTag,
  getBundle,
  resolveBundleTemplates,
} from "./registry.js";

// Loader
export {
  getTemplatePath,
  templateExists,
  loadTemplate,
  loadTemplateDefinition,
  loadTemplates,
  checkCondition,
  checkAllConditions,
  filterTemplatesByDetection,
  getApplicableTemplates,
  sortTemplatesByPriority,
  resolveTemplateDependencies,
  getRecommendedTemplates,
  getTemplatesDirectory,
} from "./loader.js";
