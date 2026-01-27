/**
 * Template loader - loads and resolves templates
 */

import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { FullProjectDetection } from "../detectors/types.js";
import { exists, readFile } from "../utils/file-system.js";
import { parseFrontmatter } from "../utils/template-engine.js";
import { ALL_TEMPLATES, getTemplate } from "./registry.js";
import type {
  ResolvedTemplate,
  TemplateCondition,
  TemplateDefinition,
} from "./types.js";

// Get the templates directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine templates directory based on environment
let TEMPLATES_DIR: string;

// Search for templates directory in various possible locations
const possiblePaths = [
  // Development: relative to source file
  path.resolve(__dirname, "../../templates"),
  // Production: relative to dist directory (one level up from dist, then templates)
  path.resolve(__dirname, "../templates"),
  // Production: relative to dist directory (two levels up)
  path.resolve(__dirname, "../..", "templates"),
  // Package root: when running from installed package
  path.resolve(process.cwd(), "templates"),
  // Package root: relative to current working directory
  path.resolve("./templates"),
  // When installed globally, check relative to current file
  path.resolve(__dirname, "../../../templates"),
];

// Find the first existing path
const foundPath = possiblePaths.find((p) => existsSync(p));

if (foundPath) {
  TEMPLATES_DIR = foundPath;
} else {
  throw new Error(
    `Templates directory not found. Looked in: ${possiblePaths.join(", ")}`
  );
}

/**
 * Get the full path to a template file
 */
export function getTemplatePath(templatePath: string): string {
  return path.join(TEMPLATES_DIR, templatePath);
}

/**
 * Check if a template file exists
 */
export async function templateExists(templatePath: string): Promise<boolean> {
  return exists(getTemplatePath(templatePath));
}

/**
 * Load a template by ID
 */
export async function loadTemplate(
  id: string
): Promise<ResolvedTemplate | null> {
  const definition = getTemplate(id);
  if (!definition) {
    return null;
  }

  return loadTemplateDefinition(definition);
}

/**
 * Load a template from its definition
 */
export async function loadTemplateDefinition(
  definition: TemplateDefinition
): Promise<ResolvedTemplate | null> {
  const fullPath = getTemplatePath(definition.templatePath);
  const content = await readFile(fullPath);

  if (content === null) {
    return null;
  }

  const { frontmatter, content: body } = parseFrontmatter(content);

  return {
    definition,
    content,
    frontmatter,
    body,
  };
}

/**
 * Load multiple templates by IDs
 */
export async function loadTemplates(
  ids: string[]
): Promise<ResolvedTemplate[]> {
  const results = await Promise.all(ids.map((id) => loadTemplate(id)));
  return results.filter((t): t is ResolvedTemplate => t !== null);
}

/**
 * Check if a condition is met
 */
export function checkCondition(
  condition: TemplateCondition,
  detection: FullProjectDetection
): boolean {
  let result = false;

  switch (condition.type) {
    case "framework":
      result = detection.frameworks.some(
        (f) => f.name.toLowerCase() === condition.value.toLowerCase()
      );
      break;

    case "language":
      result =
        detection.language.primary.toLowerCase() ===
        condition.value.toLowerCase();
      break;

    case "hasFile":
      // This would need additional context - for now, return false
      result = false;
      break;

    case "hasDependency":
      // This would need package.json context - for now, return false
      result = false;
      break;

    case "custom":
      // Custom conditions would be evaluated by external logic
      result = false;
      break;
  }

  return condition.negate ? !result : result;
}

/**
 * Check if all conditions for a template are met
 */
export function checkAllConditions(
  template: TemplateDefinition,
  detection: FullProjectDetection
): boolean {
  if (!template.conditions || template.conditions.length === 0) {
    return true;
  }

  return template.conditions.every((condition) =>
    checkCondition(condition, detection)
  );
}

/**
 * Filter templates based on detection results
 */
export function filterTemplatesByDetection(
  templates: TemplateDefinition[],
  detection: FullProjectDetection
): TemplateDefinition[] {
  return templates.filter((template) =>
    checkAllConditions(template, detection)
  );
}

/**
 * Get templates applicable to a project based on detection
 */
export function getApplicableTemplates(
  detection: FullProjectDetection,
  target?: "cursor" | "claude" | "shared"
): TemplateDefinition[] {
  let templates = ALL_TEMPLATES;

  // Filter by target if specified
  if (target) {
    templates = templates.filter((t) => {
      if (Array.isArray(t.target)) {
        return t.target.includes(target);
      }
      return t.target === target;
    });
  }

  // Filter by conditions
  return filterTemplatesByDetection(templates, detection);
}

/**
 * Sort templates by priority (highest first)
 */
export function sortTemplatesByPriority(
  templates: TemplateDefinition[]
): TemplateDefinition[] {
  return [...templates].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/**
 * Resolve template dependencies
 */
export function resolveTemplateDependencies(templateIds: string[]): string[] {
  const resolved = new Set<string>();
  const queue = [...templateIds];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (resolved.has(id)) continue;

    const template = getTemplate(id);
    if (!template) continue;

    // Add dependencies to queue
    if (template.dependencies) {
      for (const dep of template.dependencies) {
        if (!resolved.has(dep)) {
          queue.push(dep);
        }
      }
    }

    resolved.add(id);
  }

  return Array.from(resolved);
}

/**
 * Get recommended templates for a project
 */
export function getRecommendedTemplates(detection: FullProjectDetection): {
  core: TemplateDefinition[];
  recommended: TemplateDefinition[];
  optional: TemplateDefinition[];
} {
  const applicable = getApplicableTemplates(detection);
  const sorted = sortTemplatesByPriority(applicable);

  const core = sorted.filter((t) => t.category === "core");
  const recommended = sorted.filter(
    (t) => t.category === "framework" || (t.priority ?? 0) >= 700
  );
  const optional = sorted.filter(
    (t) => t.category === "pattern" || t.category === "project-type"
  );

  return { core, recommended, optional };
}

/**
 * Get templates directory path
 */
export function getTemplatesDirectory(): string {
  return TEMPLATES_DIR;
}
