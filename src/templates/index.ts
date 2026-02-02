/**
 * Template module exports
 */

// Types
export type {
  ResolvedTemplate,
  TemplateBundle,
  TemplateCategory,
  TemplateCondition,
  TemplateDefinition,
  TemplateRenderOptions,
  TemplateRenderResult,
  TemplateTarget,
} from "./types.js";

// Registry
export {
  ALL_TEMPLATES,
  CLAUDE_TEMPLATES,
  CORE_TEMPLATES,
  FRAMEWORK_TEMPLATES,
  LANGUAGE_TEMPLATES,
  PATTERN_TEMPLATES,
  PROJECT_TYPE_TEMPLATES,
  SHARED_TEMPLATES,
  TEMPLATE_BUNDLES,
  getBundle,
  getTemplate,
  getTemplatesByCategory,
  getTemplatesByTag,
  getTemplatesByTarget,
  resolveBundleTemplates,
} from "./registry.js";

// Loader
export {
  checkAllConditions,
  checkCondition,
  filterTemplatesByDetection,
  getApplicableTemplates,
  getRecommendedTemplates,
  getTemplatePath,
  getTemplatesDirectory,
  loadTemplate,
  loadTemplateDefinition,
  loadTemplates,
  resolveTemplateDependencies,
  sortTemplatesByPriority,
  templateExists,
} from "./loader.js";

// Path Resolver
export {
  isCommonTemplatePath,
  resolveOutputPath,
  resolveTemplatePaths,
} from "./path-resolver.js";
