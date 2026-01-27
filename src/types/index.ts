/**
 * Core type definitions for Brief CLI
 */

/** Supported AI tools */
export type AiTool = "cursor" | "claude" | "qoder" | "hybrid" | "all";

/** Detected project language */
export type Language = "typescript" | "javascript" | "python" | "go" | "rust" | "java" | "unknown";

/** Detected framework */
export interface DetectedFramework {
  name: string;
  version?: string;
  confidence: number;
}

/** Build tool types */
export type BuildTool = "vite" | "webpack" | "esbuild" | "rollup" | "parcel" | "turbopack" | "turborepo" | "tsup" | "swc" | "bun" | "nx";

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
