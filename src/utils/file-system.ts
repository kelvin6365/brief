/**
 * File system utilities for Brief CLI
 * Provides safe file operations with backup, atomic writes, and merge detection
 */

import fs from "fs-extra";
import path from "path";
import { globby } from "globby";
import { createLogger } from "./logger.js";

const log = createLogger("fs");

export interface FileWriteOptions {
  /** Create backup before overwriting */
  backup?: boolean;
  /** Create parent directories if they don't exist */
  createDirs?: boolean;
  /** Only write if file doesn't exist */
  skipExisting?: boolean;
  /** Dry run - don't actually write */
  dryRun?: boolean;
}

export interface FileWriteResult {
  success: boolean;
  action: "created" | "modified" | "skipped" | "backup";
  path: string;
  backupPath?: string;
  error?: string;
}

export interface DirectoryContents {
  files: string[];
  directories: string[];
}

/**
 * Check if a path exists
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory
 */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a path is a file
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Read a file as string, returns null if doesn't exist
 */
export async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Read a JSON file, returns null if doesn't exist or invalid
 */
export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Generate a backup file path with timestamp
 */
export function getBackupPath(filePath: string): string {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(dir, `${base}.backup-${timestamp}${ext}`);
}

/**
 * Create a backup of a file
 */
export async function createBackup(filePath: string): Promise<string | null> {
  if (!(await exists(filePath))) {
    return null;
  }

  const backupPath = getBackupPath(filePath);
  await fs.copy(filePath, backupPath);
  log.debug(`Created backup: ${backupPath}`);
  return backupPath;
}

/**
 * Write a file atomically (write to temp, then rename)
 */
export async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.${path.basename(filePath)}.tmp`);

  await fs.ensureDir(dir);
  await fs.writeFile(tempPath, content, "utf-8");
  await fs.rename(tempPath, filePath);
}

/**
 * Write a file with safety options
 */
export async function writeFileSafe(
  filePath: string,
  content: string,
  options: FileWriteOptions = {}
): Promise<FileWriteResult> {
  const { backup = false, createDirs = true, skipExisting = false, dryRun = false } = options;

  const fileExists = await exists(filePath);

  // Skip if file exists and skipExisting is true
  if (fileExists && skipExisting) {
    log.debug(`Skipping existing file: ${filePath}`);
    return {
      success: true,
      action: "skipped",
      path: filePath,
    };
  }

  // Dry run - just report what would happen
  if (dryRun) {
    return {
      success: true,
      action: fileExists ? "modified" : "created",
      path: filePath,
    };
  }

  try {
    let backupPath: string | undefined;

    // Create backup if file exists and backup is requested
    if (fileExists && backup) {
      backupPath = await createBackup(filePath) ?? undefined;
    }

    // Ensure parent directory exists
    if (createDirs) {
      await fs.ensureDir(path.dirname(filePath));
    }

    // Write file atomically
    await writeFileAtomic(filePath, content);

    return {
      success: true,
      action: fileExists ? "modified" : "created",
      path: filePath,
      backupPath,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log.error(`Failed to write file: ${filePath}`, errorMessage);
    return {
      success: false,
      action: fileExists ? "modified" : "created",
      path: filePath,
      error: errorMessage,
    };
  }
}

/**
 * Write a JSON file with formatting
 */
export async function writeJsonSafe(
  filePath: string,
  data: unknown,
  options: FileWriteOptions = {}
): Promise<FileWriteResult> {
  const content = JSON.stringify(data, null, 2) + "\n";
  return writeFileSafe(filePath, content, options);
}

/**
 * Ensure a directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Remove a file or directory
 */
export async function remove(filePath: string): Promise<boolean> {
  try {
    await fs.remove(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy a file or directory
 */
export async function copy(src: string, dest: string, options: FileWriteOptions = {}): Promise<FileWriteResult> {
  const { backup = false, dryRun = false } = options;

  const destExists = await exists(dest);

  if (dryRun) {
    return {
      success: true,
      action: destExists ? "modified" : "created",
      path: dest,
    };
  }

  try {
    let backupPath: string | undefined;

    if (destExists && backup) {
      backupPath = await createBackup(dest) ?? undefined;
    }

    await fs.copy(src, dest);

    return {
      success: true,
      action: destExists ? "modified" : "created",
      path: dest,
      backupPath,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      action: destExists ? "modified" : "created",
      path: dest,
      error: errorMessage,
    };
  }
}

/**
 * List files matching a glob pattern
 */
export async function glob(patterns: string | string[], options: { cwd?: string; absolute?: boolean } = {}): Promise<string[]> {
  const { cwd = process.cwd(), absolute = false } = options;
  return globby(patterns, { cwd, absolute, dot: true });
}

/**
 * List contents of a directory
 */
export async function listDirectory(dirPath: string): Promise<DirectoryContents> {
  const files: string[] = [];
  const directories: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        directories.push(entry.name);
      } else if (entry.isFile()) {
        files.push(entry.name);
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return { files, directories };
}

/**
 * Get relative path from a base directory
 */
export function relativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * Resolve to absolute path
 */
export function resolvePath(...segments: string[]): string {
  return path.resolve(...segments);
}

/**
 * Get directory name from path
 */
export function dirname(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Get file name from path
 */
export function basename(filePath: string, ext?: string): string {
  return ext !== undefined ? path.basename(filePath, ext) : path.basename(filePath);
}

/**
 * Get file extension
 */
export function extname(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Check if path is absolute
 */
export function isAbsolute(filePath: string): boolean {
  return path.isAbsolute(filePath);
}

/**
 * Normalize a path (resolve . and ..)
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

// ============================================================================
// Diff and Merge Utilities
// ============================================================================

/** Single line in a diff */
export interface DiffLine {
  type: "unchanged" | "added" | "removed";
  content: string;
  originalLine?: number;
  modifiedLine?: number;
}

/** A hunk of changes in a diff */
export interface DiffHunk {
  originalStart: number;
  originalCount: number;
  modifiedStart: number;
  modifiedCount: number;
  lines: DiffLine[];
}

/** Result of computing a diff between two strings */
export interface DiffResult {
  original: string;
  modified: string;
  hunks: DiffHunk[];
  similarityScore: number;
}

/** Result of attempting to merge two files */
export interface MergeResult {
  success: boolean;
  content: string;
  autoMerged: boolean;
  similarityScore: number;
  hadConflicts: boolean;
  conflictCount: number;
}

/** Extracted frontmatter and body from a file */
export interface FrontmatterResult {
  frontmatter: string | null;
  frontmatterObject: Record<string, unknown> | null;
  body: string;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  // Normalize strings - trim whitespace and normalize line endings
  const a = str1.trim().replace(/\r\n/g, "\n");
  const b = str2.trim().replace(/\r\n/g, "\n");

  if (a === b) return 1;

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  // For very long strings, use line-based comparison for performance
  if (longer.length > 10000) {
    return calculateLineSimilarity(a, b);
  }

  const longerLength = longer.length;
  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / longerLength;
}

/**
 * Calculate similarity based on matching lines (faster for large files)
 */
function calculateLineSimilarity(str1: string, str2: string): number {
  const lines1 = str1.split("\n");
  const lines2 = str2.split("\n");
  const set1 = new Set(lines1);
  const set2 = new Set(lines2);

  let matchingLines = 0;
  for (const line of set1) {
    if (set2.has(line)) {
      matchingLines++;
    }
  }

  const totalUnique = set1.size + set2.size - matchingLines;
  return totalUnique === 0 ? 1 : matchingLines / totalUnique;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Use two-row optimization for memory efficiency
  let prevRow = new Array<number>(n + 1);
  let currRow = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        (prevRow[j] ?? 0) + 1,      // deletion
        (currRow[j - 1] ?? 0) + 1,   // insertion
        (prevRow[j - 1] ?? 0) + cost // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[n] ?? 0;
}

/**
 * Compute a diff between original and modified content
 */
export function computeDiff(original: string, modified: string): DiffResult {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  // Use LCS-based diff algorithm
  const lcs = longestCommonSubsequence(originalLines, modifiedLines);
  const hunks = buildHunksFromLCS(originalLines, modifiedLines, lcs);
  const similarityScore = calculateSimilarity(original, modified);

  return {
    original,
    modified,
    hunks,
    similarityScore,
  };
}

/**
 * Build LCS table for diff computation
 */
function longestCommonSubsequence(
  a: string[],
  b: string[]
): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const dpRow = dp[i];
      const dpPrevRow = dp[i - 1];
      if (dpRow && dpPrevRow) {
        if (a[i - 1] === b[j - 1]) {
          dpRow[j] = (dpPrevRow[j - 1] ?? 0) + 1;
        } else {
          dpRow[j] = Math.max(dpPrevRow[j] ?? 0, dpRow[j - 1] ?? 0);
        }
      }
    }
  }

  return dp;
}

/**
 * Build hunks from LCS table
 */
function buildHunksFromLCS(
  originalLines: string[],
  modifiedLines: string[],
  lcsTable: number[][]
): DiffHunk[] {
  let i = originalLines.length;
  let j = modifiedLines.length;
  let origLineNum = originalLines.length;
  let modLineNum = modifiedLines.length;

  // Backtrack through LCS table
  const tempLines: DiffLine[] = [];
  while (i > 0 || j > 0) {
    const origContent = originalLines[i - 1];
    const modContent = modifiedLines[j - 1];
    const lcsRow = lcsTable[i];
    const lcsPrevRow = lcsTable[i - 1];

    if (i > 0 && j > 0 && origContent === modContent) {
      tempLines.unshift({
        type: "unchanged",
        content: origContent ?? "",
        originalLine: origLineNum,
        modifiedLine: modLineNum,
      });
      i--;
      j--;
      origLineNum--;
      modLineNum--;
    } else if (j > 0 && (i === 0 || (lcsRow?.[j - 1] ?? 0) >= (lcsPrevRow?.[j] ?? 0))) {
      tempLines.unshift({
        type: "added",
        content: modContent ?? "",
        modifiedLine: modLineNum,
      });
      j--;
      modLineNum--;
    } else if (i > 0) {
      tempLines.unshift({
        type: "removed",
        content: origContent ?? "",
        originalLine: origLineNum,
      });
      i--;
      origLineNum--;
    }
  }

  // Group into hunks (consecutive changes with context)
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  const contextLines = 3;

  for (let idx = 0; idx < tempLines.length; idx++) {
    const line = tempLines[idx];
    if (!line) continue;

    const isChange = line.type !== "unchanged";

    if (isChange) {
      if (!currentHunk) {
        // Start a new hunk
        const startIdx = Math.max(0, idx - contextLines);
        currentHunk = {
          originalStart: tempLines[startIdx]?.originalLine ?? 1,
          originalCount: 0,
          modifiedStart: tempLines[startIdx]?.modifiedLine ?? 1,
          modifiedCount: 0,
          lines: [],
        };
        // Add leading context
        for (let k = startIdx; k < idx; k++) {
          const contextLine = tempLines[k];
          if (contextLine) currentHunk.lines.push(contextLine);
        }
      }
      currentHunk.lines.push(line);
    } else if (currentHunk) {
      // Check if we should close the hunk
      let lookAhead = 0;
      for (let k = idx + 1; k < tempLines.length && k <= idx + contextLines * 2; k++) {
        const futureLineCheck = tempLines[k];
        if (futureLineCheck && futureLineCheck.type !== "unchanged") {
          lookAhead = k - idx;
          break;
        }
      }

      if (lookAhead > 0 && lookAhead <= contextLines * 2) {
        // More changes coming, keep hunk open
        currentHunk.lines.push(line);
      } else if (currentHunk.lines.length > 0) {
        // Add trailing context and close hunk
        const endIdx = Math.min(tempLines.length - 1, idx + contextLines - 1);
        for (let k = idx; k <= endIdx; k++) {
          const trailingLine = tempLines[k];
          if (trailingLine) currentHunk.lines.push(trailingLine);
        }
        // Calculate counts
        currentHunk.originalCount = currentHunk.lines.filter(
          (l) => l.type === "unchanged" || l.type === "removed"
        ).length;
        currentHunk.modifiedCount = currentHunk.lines.filter(
          (l) => l.type === "unchanged" || l.type === "added"
        ).length;
        hunks.push(currentHunk);
        currentHunk = null;
      }
    }
  }

  // Close any remaining hunk
  if (currentHunk && currentHunk.lines.length > 0) {
    currentHunk.originalCount = currentHunk.lines.filter(
      (l) => l.type === "unchanged" || l.type === "removed"
    ).length;
    currentHunk.modifiedCount = currentHunk.lines.filter(
      (l) => l.type === "unchanged" || l.type === "added"
    ).length;
    hunks.push(currentHunk);
  }

  return hunks;
}

/**
 * Extract YAML frontmatter from content
 */
export function extractFrontmatter(content: string): FrontmatterResult {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  const fullMatch = match?.[0];
  const frontmatterContent = match?.[1];

  if (!match || !fullMatch || !frontmatterContent) {
    return {
      frontmatter: null,
      frontmatterObject: null,
      body: content,
    };
  }

  const frontmatter = frontmatterContent;
  const body = content.slice(fullMatch.length);

  // Simple YAML parsing (key: value format)
  const frontmatterObject: Record<string, unknown> = {};
  const lines = frontmatter.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // Parse simple values
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value)) && value !== "") value = Number(value);
      else if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        // Simple array parsing
        value = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }

      frontmatterObject[key] = value;
    }
  }

  return {
    frontmatter,
    frontmatterObject,
    body,
  };
}

/**
 * Attempt to merge original and incoming content
 * Uses three-way merge concepts when possible
 */
export function attemptMerge(
  original: string,
  incoming: string,
  options: { autoMergeThreshold?: number } = {}
): MergeResult {
  const { autoMergeThreshold = 0.95 } = options;
  const similarityScore = calculateSimilarity(original, incoming);

  // If very similar or identical, just use incoming
  if (similarityScore >= autoMergeThreshold) {
    return {
      success: true,
      content: incoming,
      autoMerged: true,
      similarityScore,
      hadConflicts: false,
      conflictCount: 0,
    };
  }

  // Try smart merge for frontmatter + body files (like .mdc)
  const originalParts = extractFrontmatter(original);
  const incomingParts = extractFrontmatter(incoming);

  // If both have frontmatter, try to merge intelligently
  if (originalParts.frontmatter && incomingParts.frontmatter) {
    // Merge frontmatter objects (incoming takes precedence)
    const mergedFm = {
      ...originalParts.frontmatterObject,
      ...incomingParts.frontmatterObject,
    };

    // Check if bodies are similar enough
    const bodySimilarity = calculateSimilarity(originalParts.body, incomingParts.body);

    if (bodySimilarity >= 0.7) {
      // Use incoming body with merged frontmatter
      const fmYaml = Object.entries(mergedFm)
        .map(([k, v]) => {
          if (Array.isArray(v)) {
            return `${k}: [${v.map((i) => `"${i}"`).join(", ")}]`;
          }
          return `${k}: ${v}`;
        })
        .join("\n");

      const mergedContent = `---\n${fmYaml}\n---\n${incomingParts.body}`;

      return {
        success: true,
        content: mergedContent,
        autoMerged: true,
        similarityScore,
        hadConflicts: false,
        conflictCount: 0,
      };
    }
  }

  // If similarity is too low, indicate conflict
  if (similarityScore < 0.7) {
    return {
      success: false,
      content: incoming,
      autoMerged: false,
      similarityScore,
      hadConflicts: true,
      conflictCount: 1,
    };
  }

  // For moderate similarity, use incoming but flag it
  return {
    success: true,
    content: incoming,
    autoMerged: false,
    similarityScore,
    hadConflicts: false,
    conflictCount: 0,
  };
}

export const fileSystem = {
  exists,
  isDirectory,
  isFile,
  readFile,
  readJson,
  writeFileSafe,
  writeJsonSafe,
  writeFileAtomic,
  createBackup,
  getBackupPath,
  ensureDir,
  remove,
  copy,
  glob,
  listDirectory,
  relativePath,
  joinPath,
  resolvePath,
  dirname,
  basename,
  extname,
  isAbsolute,
  normalizePath,
  // Diff and merge utilities
  calculateSimilarity,
  computeDiff,
  extractFrontmatter,
  attemptMerge,
};

export default fileSystem;
