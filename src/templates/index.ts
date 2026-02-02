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
  getBundle,
  getTemplate,
  getTemplatesByCategory,
  getTemplatesByTag,
  getTemplatesByTarget,
  LANGUAGE_TEMPLATES,
  PATTERN_TEMPLATES,
  PROJECT_TYPE_TEMPLATES,
  resolveBundleTemplates,
  SHARED_TEMPLATES,
  TEMPLATE_BUNDLES,
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
  transformFrontmatterForTarget,
} from "./path-resolver.js";
