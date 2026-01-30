/**
 * Generator type definitions
 */

import type { FullProjectDetection } from "../detectors/types.js";
import type { AiInitConfig } from "../types/index.js";
import type { DiffResult } from "../utils/file-system.js";

/** Options for running a generator */
export interface GeneratorOptions {
  /** Project root path */
  projectPath: string;
  /** Detection results */
  detection: FullProjectDetection;
  /** User configuration */
  config: AiInitConfig;
  /** Dry run - don't write files */
  dryRun?: boolean;
  /** Overwrite existing files */
  overwrite?: boolean;
  /** Create backups before overwriting */
  backup?: boolean;
  /** Verbose output */
  verbose?: boolean;
  /** Enable smart merge mode for existing files */
  mergeMode?: boolean;
  /** Similarity threshold for auto-merge (default 0.95) */
  autoMergeThreshold?: number;
  /** Callback for conflict resolution */
  onConflict?: (conflict: ConflictInfo) => Promise<ConflictResolution>;
}

/** Result of a single file generation */
export interface GeneratedFile {
  /** Relative path from project root */
  path: string;
  /** Absolute path */
  absolutePath: string;
  /** Action taken */
  action: "created" | "modified" | "skipped" | "error" | "merged";
  /** Template ID that generated this file */
  templateId?: string;
  /** Error message if action is "error" */
  error?: string;
  /** Backup path if file was backed up */
  backupPath?: string;
  /** Merge information if merge mode was used */
  mergeInfo?: MergeInfo;
}

/** Information about merge operation for a file */
export interface MergeInfo {
  /** Whether merge was automatic (high similarity) */
  autoMerged: boolean;
  /** Similarity score between original and incoming (0-1) */
  similarityScore: number;
  /** Whether there were conflicts that required resolution */
  hadConflicts: boolean;
  /** User's resolution choice if there was a conflict */
  resolution?: "accept-incoming" | "keep-original" | "manual";
}

/** Information about a conflict for user resolution */
export interface ConflictInfo {
  /** Path to the conflicting file */
  filePath: string;
  /** Relative path from project root */
  relativePath: string;
  /** Original content of the existing file */
  originalContent: string;
  /** Incoming content from template */
  incomingContent: string;
  /** Diff between original and incoming */
  diff: DiffResult;
}

/** User's resolution for a conflict */
export type ConflictResolution =
  | { action: "accept-incoming" }
  | { action: "keep-original" }
  | { action: "manual"; content: string };

/** Result of running a generator */
export interface GeneratorResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Target that was generated */
  target: "cursor" | "claude" | "qoder" | "jetbrains" | "shared";
  /** Files that were generated */
  files: GeneratedFile[];
  /** Error message if failed */
  error?: string;
}

/** Combined result of all generators */
export interface FullGeneratorResult {
  /** Overall success */
  success: boolean;
  /** Results by target */
  results: GeneratorResult[];
  /** Summary statistics */
  summary: {
    created: number;
    modified: number;
    skipped: number;
    errors: number;
  };
}

/** Template context for rendering */
export interface GeneratorContext {
  project: {
    name: string;
    type: string;
    language: string;
    framework?: string;
    version?: string;
    description?: string;
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
}

/** Generator interface */
export interface Generator {
  /** Generator name */
  name: string;
  /** Target this generator produces */
  target: "cursor" | "claude" | "qoder" | "jetbrains" | "shared";
  /** Generate files */
  generate(options: GeneratorOptions): Promise<GeneratorResult>;
}
