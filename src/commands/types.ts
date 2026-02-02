/**
 * Command type definitions
 */

import type { AiTool } from "../types/index.js";

/** Options for init command */
export interface InitOptions {
  /** Target tool (cursor, claude, hybrid) */
  tool?: AiTool;
  /** Skip prompts and use defaults */
  yes?: boolean;
  /** Project path */
  path?: string;
  /** Dry run (preview only) */
  dryRun?: boolean;
  /** Templates to include */
  templates?: string[];
  /** Enable smart merge mode for existing files */
  merge?: boolean;
  /** Similarity threshold for auto-merge (0-1, default 0.95) */
  autoMergeThreshold?: number;
}

/** Options for detect command */
export interface DetectOptions {
  /** Output as JSON */
  json?: boolean;
  /** Project path */
  path?: string;
  /** Show verbose output */
  verbose?: boolean;
}

/** Options for add command */
export interface AddOptions {
  /** Project path */
  path?: string;
  /** Force overwrite */
  force?: boolean;
}

/** Options for remove command */
export interface RemoveOptions {
  /** Project path */
  path?: string;
  /** Remove associated files */
  removeFiles?: boolean;
}

/** Options for sync command */
export interface SyncOptions {
  /** Project path */
  path?: string;
  /** Force regeneration */
  force?: boolean;
  /** Dry run (preview only) */
  dryRun?: boolean;
}

/** Options for validate command */
export interface ValidateOptions {
  /** Project path */
  path?: string;
  /** Fix issues automatically */
  fix?: boolean;
  /** Show verbose output */
  verbose?: boolean;
}

/** Command result */
export interface CommandResult {
  success: boolean;
  message?: string;
  error?: string;
}

/** Options for magic command */
export interface MagicOptions {
  /** Project path (parent directory to create project in or exact path) */
  path?: string;
  /** Optional project name (defaults to kit id when omitted) */
  name?: string;
  /** Package manager to use for generated instructions */
  packageManager?: "bun" | "npm" | "pnpm" | "yarn";
  /** Dry run (preview only, no files written) */
  dryRun?: boolean;
}

/** Result for magic command */
export interface MagicResult extends CommandResult {
  /** Magic kit identifier that was executed */
  kitId: string;
  /** Absolute path to the generated project */
  projectPath: string;
}
