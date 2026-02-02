/**
 * Core type definitions for Brief CLI
 */

/** Supported AI tools */
export type AiTool = "cursor" | "claude" | "qoder" | "hybrid" | "all";

/** Detected project language */
export type Language =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "unknown";

/** Detected framework */
export interface DetectedFramework {
  name: string;
  version?: string;
  confidence: number;
}

/** Build tool types */
export type BuildTool =
  | "vite"
  | "webpack"
  | "esbuild"
  | "rollup"
  | "parcel"
  | "turbopack"
  | "turborepo"
  | "tsup"
  | "swc"
  | "bun"
  | "nx";

/** Styling framework types */
export type StylingFramework =
  | "tailwind"
  | "css-modules"
  | "styled-components"
  | "emotion"
  | "sass"
  | "less"
  | "postcss"
  | "vanilla-extract"
  | "panda-css"
  | "unocss"
  | "plain-css";

/** Existing AI configuration status */
export interface ExistingAiConfigStatus {
  cursor: {
    hasConfig: boolean;
    hasRulesDir: boolean;
    hasLegacyRules: boolean;
  };
  claude: {
    hasConfig: boolean;
    hasClaudeMd: boolean;
    hasSkills: boolean;
  };
  qoder: {
    hasBestPractices: boolean;
    hasAgentsMd: boolean;
    hasAiConfig: boolean;
  };
  copilot: {
    hasInstructions: boolean;
  };
}

/** Project detection result (simple version for backward compatibility) */
export interface ProjectDetection {
  language: Language;
  frameworks: DetectedFramework[];
  testing?: string;
  database?: string;
  packageManager: "bun" | "npm" | "yarn" | "pnpm" | "unknown";
}

/** User configuration stored in .ai-init.json */
export interface AiInitConfig {
  version: string;
  projectType: string;
  framework?: string;
  language: Language;
  testing?: string;
  tools: AiTool[];
  templates: string[];
}

/** Template metadata */
export interface TemplateMetadata {
  name: string;
  description: string;
  globs?: string[];
  priority?: number;
  dependencies?: string[];
}

/** Generator options */
export interface GeneratorOptions {
  tool: AiTool;
  projectPath: string;
  detection: ProjectDetection;
  config: AiInitConfig;
  dryRun?: boolean;
  verbose?: boolean;
}

/** Generation result */
export interface GenerationResult {
  success: boolean;
  filesCreated: string[];
  filesModified: string[];
  errors: string[];
}

/** Dependency definition for magic scaffolding kits */
export interface MagicDependency {
  /** Package name, e.g. `next` */
  name: string;
  /** Whether this should be installed as a devDependency */
  dev?: boolean;
  /** Version resolution strategy (for future use) */
  strategy?: "latest" | "fixed";
  /** Optional explicit version when using fixed strategy */
  version?: string;
}

/** Framework-specific magic scaffolding kit */
export interface MagicKit {
  /** Unique kit identifier, e.g. `nextjs` or `spring` */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short description shown in help/UX */
  description: string;
  /** Primary framework this kit targets, e.g. `nextjs`, `spring` */
  framework: string;
  /** Primary language used by the project */
  language: Language;
  /** AI tools to generate configuration for */
  tools: AiTool[];
  /** Runtime dependencies to add to the scaffolded project */
  dependencies: MagicDependency[];
  /** Development-time dependencies to add to the scaffolded project */
  devDependencies: MagicDependency[];
  /** Template IDs to feed into the generator pipeline */
  templates: string[];
  /** Optional human-readable next-step instructions */
  postSteps?: string[];
}
