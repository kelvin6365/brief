/**
 * Base generator utilities
 */

import path from "path";
import type {
  GeneratorOptions,
  GeneratorContext,
  GeneratedFile,
  ConflictInfo,
  ConflictResolution,
} from "./types.js";
import type { TemplateDefinition } from "../templates/types.js";
import { loadTemplateDefinition } from "../templates/loader.js";
import { renderTemplate, generateFrontmatter } from "../utils/template-engine.js";
import {
  writeFileSafe,
  exists,
  joinPath,
  readFile,
  createBackup,
  calculateSimilarity,
  computeDiff,
  attemptMerge,
} from "../utils/file-system.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("generator");

/**
 * Create a generator context from options
 */
export function createGeneratorContext(options: GeneratorOptions): GeneratorContext {
  const { detection, config } = options;

  // Get project name from package.json or directory name
  const projectName = detection.packageManager.name !== "unknown"
    ? path.basename(options.projectPath)
    : path.basename(options.projectPath);

  // Get primary framework
  const primaryFramework = detection.frameworks[0];

  // Get testing framework (first one)
  const testingFramework = detection.testing[0]?.name;

  // Get database (first one)
  const database = detection.database[0]?.name;

  // Get build tool (first one)
  const buildTool = detection.buildTools[0]?.name;

  // Get styling (first one)
  const styling = detection.styling[0]?.name;

  return {
    project: {
      name: projectName,
      type: config.projectType,
      language: detection.language.primary,
      framework: primaryFramework?.name,
      version: primaryFramework?.version,
    },
    detection: {
      frameworks: detection.frameworks.map((f) => ({
        name: f.name,
        version: f.version,
        confidence: f.confidence,
      })),
      testing: testingFramework,
      database,
      buildTool,
      styling,
      packageManager: detection.packageManager.name,
    },
    config: {
      tools: config.tools,
      templates: config.templates,
    },
    generated: {
      date: new Date().toISOString(),
      version: config.version,
    },
  };
}

/**
 * Render a template with the generator context
 */
export async function renderTemplateWithContext(
  template: TemplateDefinition,
  context: GeneratorContext
): Promise<{ content: string; frontmatter: Record<string, unknown> } | null> {
  const resolved = await loadTemplateDefinition(template);
  if (!resolved) {
    log.warn(`Template not found: ${template.templatePath}`);
    return null;
  }

  try {
    // Render the body
    const renderedBody = renderTemplate(resolved.body, context as unknown as Record<string, unknown>);

    // Render frontmatter values that contain template expressions
    const renderedFrontmatter: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(resolved.frontmatter)) {
      if (typeof value === "string" && value.includes("{{")) {
        renderedFrontmatter[key] = renderTemplate(value, context as unknown as Record<string, unknown>);
      } else {
        renderedFrontmatter[key] = value;
      }
    }

    // Combine frontmatter and body
    const frontmatterStr = generateFrontmatter(renderedFrontmatter);
    const content = frontmatterStr + renderedBody;

    return { content, frontmatter: renderedFrontmatter };
  } catch (error) {
    log.error(`Failed to render template ${template.id}:`, error);
    return null;
  }
}

/**
 * Write a generated file
 */
export async function writeGeneratedFile(
  projectPath: string,
  relativePath: string,
  content: string,
  options: {
    dryRun?: boolean;
    overwrite?: boolean;
    backup?: boolean;
    templateId?: string;
  } = {}
): Promise<GeneratedFile> {
  const absolutePath = joinPath(projectPath, relativePath);
  const { dryRun = false, overwrite = false, backup = false, templateId } = options;

  // Check if file exists
  const fileExists = await exists(absolutePath);

  // Skip if exists and not overwriting
  if (fileExists && !overwrite) {
    log.debug(`Skipping existing file: ${relativePath}`);
    return {
      path: relativePath,
      absolutePath,
      action: "skipped",
      templateId,
    };
  }

  // Write the file
  const result = await writeFileSafe(absolutePath, content, {
    dryRun,
    backup,
    createDirs: true,
  });

  if (!result.success) {
    return {
      path: relativePath,
      absolutePath,
      action: "error",
      templateId,
      error: result.error,
    };
  }

  return {
    path: relativePath,
    absolutePath,
    action: result.action === "created" ? "created" : "modified",
    templateId,
    backupPath: result.backupPath,
  };
}

/**
 * Write a generated file with smart merge support
 * Handles existing files by comparing similarity and optionally prompting for resolution
 */
export async function writeGeneratedFileWithMerge(
  projectPath: string,
  relativePath: string,
  incomingContent: string,
  options: {
    dryRun?: boolean;
    backup?: boolean;
    templateId?: string;
    autoMergeThreshold?: number;
    onConflict?: (conflict: ConflictInfo) => Promise<ConflictResolution>;
  } = {}
): Promise<GeneratedFile> {
  const absolutePath = joinPath(projectPath, relativePath);
  const {
    dryRun = false,
    backup = true,
    templateId,
    autoMergeThreshold = 0.95,
    onConflict,
  } = options;

  // Check if file exists
  const fileExists = await exists(absolutePath);

  // If file doesn't exist, just create it
  if (!fileExists) {
    const result = await writeFileSafe(absolutePath, incomingContent, {
      dryRun,
      createDirs: true,
    });

    return {
      path: relativePath,
      absolutePath,
      action: result.success ? "created" : "error",
      templateId,
      error: result.error,
    };
  }

  // Read existing content
  const originalContent = await readFile(absolutePath);
  if (originalContent === null) {
    return {
      path: relativePath,
      absolutePath,
      action: "error",
      templateId,
      error: "Failed to read existing file",
    };
  }

  // Calculate similarity
  const similarityScore = calculateSimilarity(originalContent, incomingContent);
  log.debug(`File ${relativePath}: similarity = ${(similarityScore * 100).toFixed(1)}%`);

  // High similarity (>=95%): auto-merge (use incoming)
  if (similarityScore >= autoMergeThreshold) {
    if (dryRun) {
      return {
        path: relativePath,
        absolutePath,
        action: "merged",
        templateId,
        mergeInfo: {
          autoMerged: true,
          similarityScore,
          hadConflicts: false,
        },
      };
    }

    // Backup and write
    let backupPath: string | undefined;
    if (backup) {
      backupPath = (await createBackup(absolutePath)) ?? undefined;
    }

    const result = await writeFileSafe(absolutePath, incomingContent, {
      dryRun: false,
      createDirs: true,
    });

    return {
      path: relativePath,
      absolutePath,
      action: result.success ? "merged" : "error",
      templateId,
      backupPath,
      mergeInfo: {
        autoMerged: true,
        similarityScore,
        hadConflicts: false,
      },
      error: result.error,
    };
  }

  // Low similarity (<70%): warn and require explicit action
  if (similarityScore < 0.7) {
    log.warn(`File ${relativePath}: low similarity (${(similarityScore * 100).toFixed(1)}%), requires manual review`);

    // If no conflict handler, skip the file
    if (!onConflict) {
      return {
        path: relativePath,
        absolutePath,
        action: "skipped",
        templateId,
        mergeInfo: {
          autoMerged: false,
          similarityScore,
          hadConflicts: true,
        },
      };
    }

    // Show conflict to user
    const diff = computeDiff(originalContent, incomingContent);
    const conflict: ConflictInfo = {
      filePath: absolutePath,
      relativePath,
      originalContent,
      incomingContent,
      diff,
    };

    const resolution = await onConflict(conflict);
    return handleConflictResolution(
      absolutePath,
      relativePath,
      originalContent,
      incomingContent,
      resolution,
      { dryRun, backup, templateId, similarityScore }
    );
  }

  // Moderate similarity (70-95%): show diff and prompt for resolution
  if (onConflict) {
    const diff = computeDiff(originalContent, incomingContent);
    const conflict: ConflictInfo = {
      filePath: absolutePath,
      relativePath,
      originalContent,
      incomingContent,
      diff,
    };

    const resolution = await onConflict(conflict);
    return handleConflictResolution(
      absolutePath,
      relativePath,
      originalContent,
      incomingContent,
      resolution,
      { dryRun, backup, templateId, similarityScore }
    );
  }

  // No conflict handler and moderate similarity - try smart merge
  const mergeResult = attemptMerge(originalContent, incomingContent, { autoMergeThreshold });

  if (mergeResult.success) {
    if (dryRun) {
      return {
        path: relativePath,
        absolutePath,
        action: "merged",
        templateId,
        mergeInfo: {
          autoMerged: mergeResult.autoMerged,
          similarityScore,
          hadConflicts: mergeResult.hadConflicts,
        },
      };
    }

    let backupPath: string | undefined;
    if (backup) {
      backupPath = (await createBackup(absolutePath)) ?? undefined;
    }

    const result = await writeFileSafe(absolutePath, mergeResult.content, {
      dryRun: false,
      createDirs: true,
    });

    return {
      path: relativePath,
      absolutePath,
      action: result.success ? "merged" : "error",
      templateId,
      backupPath,
      mergeInfo: {
        autoMerged: mergeResult.autoMerged,
        similarityScore,
        hadConflicts: mergeResult.hadConflicts,
      },
      error: result.error,
    };
  }

  // Merge failed, skip file
  return {
    path: relativePath,
    absolutePath,
    action: "skipped",
    templateId,
    mergeInfo: {
      autoMerged: false,
      similarityScore,
      hadConflicts: true,
    },
  };
}

/**
 * Handle conflict resolution from user
 */
async function handleConflictResolution(
  absolutePath: string,
  relativePath: string,
  _originalContent: string,
  incomingContent: string,
  resolution: ConflictResolution,
  options: {
    dryRun: boolean;
    backup: boolean;
    templateId?: string;
    similarityScore: number;
  }
): Promise<GeneratedFile> {
  const { dryRun, backup, templateId, similarityScore } = options;

  if (resolution.action === "keep-original") {
    return {
      path: relativePath,
      absolutePath,
      action: "skipped",
      templateId,
      mergeInfo: {
        autoMerged: false,
        similarityScore,
        hadConflicts: true,
        resolution: "keep-original",
      },
    };
  }

  const contentToWrite = resolution.action === "accept-incoming"
    ? incomingContent
    : resolution.content;

  if (dryRun) {
    return {
      path: relativePath,
      absolutePath,
      action: "merged",
      templateId,
      mergeInfo: {
        autoMerged: false,
        similarityScore,
        hadConflicts: true,
        resolution: resolution.action === "accept-incoming" ? "accept-incoming" : "manual",
      },
    };
  }

  let backupPath: string | undefined;
  if (backup) {
    backupPath = (await createBackup(absolutePath)) ?? undefined;
  }

  const result = await writeFileSafe(absolutePath, contentToWrite, {
    dryRun: false,
    createDirs: true,
  });

  return {
    path: relativePath,
    absolutePath,
    action: result.success ? "merged" : "error",
    templateId,
    backupPath,
    mergeInfo: {
      autoMerged: false,
      similarityScore,
      hadConflicts: true,
      resolution: resolution.action === "accept-incoming" ? "accept-incoming" : "manual",
    },
    error: result.error,
  };
}

/**
 * Generate files from a list of templates
 */
export async function generateFromTemplates(
  templates: TemplateDefinition[],
  context: GeneratorContext,
  options: GeneratorOptions
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  for (const template of templates) {
    const rendered = await renderTemplateWithContext(template, context);
    if (!rendered) {
      files.push({
        path: template.outputPath,
        absolutePath: joinPath(options.projectPath, template.outputPath),
        action: "error",
        templateId: template.id,
        error: "Failed to render template",
      });
      continue;
    }

    let result: GeneratedFile;

    // Use merge mode if enabled
    if (options.mergeMode) {
      result = await writeGeneratedFileWithMerge(
        options.projectPath,
        template.outputPath,
        rendered.content,
        {
          dryRun: options.dryRun,
          backup: options.backup ?? true,
          templateId: template.id,
          autoMergeThreshold: options.autoMergeThreshold,
          onConflict: options.onConflict,
        }
      );
    } else {
      result = await writeGeneratedFile(
        options.projectPath,
        template.outputPath,
        rendered.content,
        {
          dryRun: options.dryRun,
          overwrite: options.overwrite,
          backup: options.backup,
          templateId: template.id,
        }
      );
    }

    files.push(result);
  }

  return files;
}

/**
 * Summarize generation results
 */
export function summarizeResults(files: GeneratedFile[]): {
  created: number;
  modified: number;
  merged: number;
  skipped: number;
  errors: number;
} {
  return {
    created: files.filter((f) => f.action === "created").length,
    modified: files.filter((f) => f.action === "modified").length,
    merged: files.filter((f) => f.action === "merged").length,
    skipped: files.filter((f) => f.action === "skipped").length,
    errors: files.filter((f) => f.action === "error").length,
  };
}
