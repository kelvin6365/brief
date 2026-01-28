/**
 * Template engine for Brief CLI
 * Wraps Handlebars with custom helpers and template management
 */

import Handlebars from "handlebars";
import yaml from "yaml";
import { readFile } from "./file-system.js";
import { createLogger } from "./logger.js";

const log = createLogger("template");

export interface TemplateContext {
  project: {
    name: string;
    type: string;
    language: string;
    framework?: string;
    version?: string;
  };
  detection: {
    frameworks: Array<{ name: string; version?: string; confidence: number }>;
    testing?: string;
    database?: string;
    buildTool?: string;
    styling?: string;
    packageManager: string;
  };
  config: {
    tools: string[];
    templates: string[];
  };
  generated: {
    date: string;
    version: string;
  };
  [key: string]: unknown;
}

export interface TemplateFrontmatter {
  name?: string;
  description?: string;
  globs?: string[];
  priority?: number;
  dependencies?: string[];
  auto_invoke?: boolean;
  [key: string]: unknown;
}

export interface ParsedTemplate {
  frontmatter: TemplateFrontmatter;
  content: string;
}

/**
 * Register custom Handlebars helpers
 */
function registerHelpers(): void {
  // Conditional equality
  Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
  Handlebars.registerHelper("neq", (a: unknown, b: unknown) => a !== b);

  // Comparison helpers
  Handlebars.registerHelper("gt", (a: number, b: number) => a > b);
  Handlebars.registerHelper("gte", (a: number, b: number) => a >= b);
  Handlebars.registerHelper("lt", (a: number, b: number) => a < b);
  Handlebars.registerHelper("lte", (a: number, b: number) => a <= b);

  // Logical operators
  Handlebars.registerHelper("and", (...args: unknown[]) => {
    // Remove the Handlebars options object (last argument)
    const values = args.slice(0, -1);
    return values.every(Boolean);
  });

  Handlebars.registerHelper("or", (...args: unknown[]) => {
    const values = args.slice(0, -1);
    return values.some(Boolean);
  });

  Handlebars.registerHelper("not", (value: unknown) => !value);

  // Array helpers
  Handlebars.registerHelper("includes", (array: unknown[], value: unknown) => {
    return Array.isArray(array) && array.includes(value);
  });

  // String contains helper (for checking if a string contains a substring)
  Handlebars.registerHelper("contains", (str: unknown, substring: unknown) => {
    if (typeof str !== "string" || typeof substring !== "string") return false;
    return str.includes(substring);
  });

  Handlebars.registerHelper("join", (array: unknown[], separator: string) => {
    if (!Array.isArray(array)) return "";
    const sep = typeof separator === "string" ? separator : ", ";
    return array.join(sep);
  });

  Handlebars.registerHelper("first", (array: unknown[]) => {
    return Array.isArray(array) ? array[0] : undefined;
  });

  Handlebars.registerHelper("last", (array: unknown[]) => {
    return Array.isArray(array) ? array[array.length - 1] : undefined;
  });

  Handlebars.registerHelper("length", (array: unknown[]) => {
    return Array.isArray(array) ? array.length : 0;
  });

  // String helpers
  Handlebars.registerHelper("lowercase", (str: string) => {
    return typeof str === "string" ? str.toLowerCase() : str;
  });

  Handlebars.registerHelper("uppercase", (str: string) => {
    return typeof str === "string" ? str.toUpperCase() : str;
  });

  Handlebars.registerHelper("capitalize", (str: string) => {
    if (typeof str !== "string") return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Handlebars.registerHelper("kebabCase", (str: string) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  });

  Handlebars.registerHelper("camelCase", (str: string) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toLowerCase());
  });

  Handlebars.registerHelper("pascalCase", (str: string) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toUpperCase());
  });

  // Date helpers
  Handlebars.registerHelper("now", () => new Date().toISOString());
  Handlebars.registerHelper("date", (format: string) => {
    const now = new Date();
    if (format === "iso") return now.toISOString();
    if (format === "date") return now.toISOString().split("T")[0];
    if (format === "year") return now.getFullYear().toString();
    return now.toISOString();
  });

  // JSON helper
  Handlebars.registerHelper("json", (obj: unknown, indent?: number) => {
    const spaces = typeof indent === "number" ? indent : 2;
    return JSON.stringify(obj, null, spaces);
  });

  // YAML helper
  Handlebars.registerHelper("yaml", (obj: unknown) => {
    return yaml.stringify(obj);
  });

  // Conditional block helper for matching values
  Handlebars.registerHelper("is", function (this: unknown, value: unknown, match: unknown, options: Handlebars.HelperOptions) {
    if (value === match) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  // Framework-specific helpers
  Handlebars.registerHelper("hasFramework", (detection: TemplateContext["detection"], name: string) => {
    return detection?.frameworks?.some((f) => f.name.toLowerCase() === name.toLowerCase()) ?? false;
  });

  Handlebars.registerHelper("getFrameworkVersion", (detection: TemplateContext["detection"], name: string) => {
    const framework = detection?.frameworks?.find((f) => f.name.toLowerCase() === name.toLowerCase());
    return framework?.version ?? "latest";
  });

  // Indentation helper
  Handlebars.registerHelper("indent", (text: string, spaces: number) => {
    if (typeof text !== "string") return text;
    const indent = " ".repeat(typeof spaces === "number" ? spaces : 2);
    return text
      .split("\n")
      .map((line) => indent + line)
      .join("\n");
  });

  // Raw block helper (no escaping)
  Handlebars.registerHelper("raw", function (this: unknown, options: Handlebars.HelperOptions) {
    return options.fn(this);
  });
}

// Register helpers on module load
registerHelpers();

/**
 * Parse template frontmatter (YAML between --- markers)
 */
export function parseFrontmatter(content: string): ParsedTemplate {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {},
      content: content.trim(),
    };
  }

  try {
    const frontmatterYaml = match[1] ?? "";
    const bodyContent = match[2] ?? "";
    const frontmatter = yaml.parse(frontmatterYaml) as TemplateFrontmatter;
    return {
      frontmatter: frontmatter || {},
      content: bodyContent.trim(),
    };
  } catch (err) {
    log.warn(`Failed to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`);
    return {
      frontmatter: {},
      content: content.trim(),
    };
  }
}

/**
 * Generate frontmatter string from object
 */
export function generateFrontmatter(data: TemplateFrontmatter): string {
  if (Object.keys(data).length === 0) {
    return "";
  }
  return `---\n${yaml.stringify(data)}---\n\n`;
}

/**
 * Compile a template string
 */
export function compileTemplate(template: string): Handlebars.TemplateDelegate {
  return Handlebars.compile(template, {
    noEscape: true, // Don't escape HTML entities
    strict: false, // Don't throw on missing variables
  });
}

/**
 * Render a template string with context
 */
export function renderTemplate(template: string, context: Partial<TemplateContext>): string {
  try {
    const compiled = compileTemplate(template);
    return compiled(context);
  } catch (err) {
    log.error(`Template rendering failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

/**
 * Render a template file with context
 */
export async function renderTemplateFile(templatePath: string, context: Partial<TemplateContext>): Promise<string> {
  const content = await readFile(templatePath);
  if (content === null) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  const { frontmatter, content: templateContent } = parseFrontmatter(content);
  const renderedContent = renderTemplate(templateContent, context);

  // If there's frontmatter, render it too and prepend
  if (Object.keys(frontmatter).length > 0) {
    const renderedFrontmatter: TemplateFrontmatter = {};
    for (const [key, value] of Object.entries(frontmatter)) {
      if (typeof value === "string" && value.includes("{{")) {
        renderedFrontmatter[key] = renderTemplate(value, context);
      } else {
        renderedFrontmatter[key] = value;
      }
    }
    return generateFrontmatter(renderedFrontmatter) + renderedContent;
  }

  return renderedContent;
}

/**
 * Register a partial template
 */
export function registerPartial(name: string, template: string): void {
  Handlebars.registerPartial(name, template);
}

/**
 * Register a custom helper
 */
export function registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
  Handlebars.registerHelper(name, fn);
}

/**
 * Create a default template context from detection results
 */
export function createTemplateContext(
  projectName: string,
  detection: TemplateContext["detection"],
  config: TemplateContext["config"],
  version = "1.0.0"
): TemplateContext {
  const primaryFramework = detection.frameworks[0];

  return {
    project: {
      name: projectName,
      type: config.templates.includes("cli") ? "cli" : "app",
      language: detection.frameworks.some((f) => f.name.toLowerCase().includes("typescript")) ? "typescript" : "javascript",
      framework: primaryFramework?.name,
      version: primaryFramework?.version,
    },
    detection,
    config,
    generated: {
      date: new Date().toISOString(),
      version,
    },
  };
}

export const templateEngine = {
  compile: compileTemplate,
  render: renderTemplate,
  renderFile: renderTemplateFile,
  parseFrontmatter,
  generateFrontmatter,
  registerPartial,
  registerHelper,
  createContext: createTemplateContext,
};

export default templateEngine;
