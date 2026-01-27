/**
 * Template type definitions
 */

/** Target tool for template generation */
export type TemplateTarget = "cursor" | "claude" | "qoder" | "shared";

/** Template category */
export type TemplateCategory = "core" | "framework" | "pattern" | "project-type";

/** Template definition */
export interface TemplateDefinition {
  /** Unique template identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what the template provides */
  description: string;
  /** Target tool(s) this template applies to */
  target: TemplateTarget | TemplateTarget[];
  /** Template category */
  category: TemplateCategory;
  /** File path to the template (relative to templates directory) */
  templatePath: string;
  /** Output file path (relative to project root) */
  outputPath: string;
  /** Glob patterns for auto-activation (Cursor MDC format) */
  globs?: string[];
  /** Priority for rule ordering (higher = more important) */
  priority?: number;
  /** Other templates this depends on */
  dependencies?: string[];
  /** Conditions for when this template should be included */
  conditions?: TemplateCondition[];
  /** Tags for filtering */
  tags?: string[];
}

/** Condition for template inclusion */
export interface TemplateCondition {
  /** Type of condition */
  type: "framework" | "language" | "hasFile" | "hasDependency" | "custom";
  /** Value to match */
  value: string;
  /** Whether to negate the condition */
  negate?: boolean;
}

/** Template bundle - a collection of related templates */
export interface TemplateBundle {
  /** Bundle identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Templates included in this bundle */
  templates: string[];
  /** Tags for filtering */
  tags?: string[];
}

/** Resolved template ready for rendering */
export interface ResolvedTemplate {
  /** Template definition */
  definition: TemplateDefinition;
  /** Raw template content */
  content: string;
  /** Parsed frontmatter (if any) */
  frontmatter: Record<string, unknown>;
  /** Template body (without frontmatter) */
  body: string;
}

/** Template rendering options */
export interface TemplateRenderOptions {
  /** Project root path */
  projectPath: string;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Create backups of existing files */
  backup?: boolean;
  /** Dry run - don't write files */
  dryRun?: boolean;
}

/** Result of template rendering */
export interface TemplateRenderResult {
  /** Template that was rendered */
  templateId: string;
  /** Output file path */
  outputPath: string;
  /** Whether the operation succeeded */
  success: boolean;
  /** Action taken */
  action: "created" | "modified" | "skipped" | "error";
  /** Error message if failed */
  error?: string;
  /** Backup path if backup was created */
  backupPath?: string;
}
