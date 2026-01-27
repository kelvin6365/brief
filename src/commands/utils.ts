/**
 * Command utilities
 * Shared functions for commands
 */

import path from "node:path";
import type { AiInitConfig } from "../types/index.js";
import { exists, readFile, writeFileSafe } from "../utils/file-system.js";

/** Config file name */
const CONFIG_FILE = ".brief.json";

/**
 * Load project config from .ai-init.json
 */
export async function loadProjectConfig(
  projectPath: string
): Promise<AiInitConfig | null> {
  const configPath = path.join(projectPath, CONFIG_FILE);

  if (!(await exists(configPath))) {
    return null;
  }

  try {
    const content = await readFile(configPath);
    if (!content) {
      return null;
    }
    return JSON.parse(content) as AiInitConfig;
  } catch {
    return null;
  }
}

/**
 * Save project config to .ai-init.json
 */
export async function saveProjectConfig(
  projectPath: string,
  config: AiInitConfig
): Promise<void> {
  const configPath = path.join(projectPath, CONFIG_FILE);
  const content = JSON.stringify(config, null, 2);
  await writeFileSafe(configPath, content);
}

/**
 * Check if Brief is initialized in a project
 */
export async function isInitialized(projectPath: string): Promise<boolean> {
  return (await loadProjectConfig(projectPath)) !== null;
}

/**
 * Format file size for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Parse tool argument (cursor, claude, qoder, hybrid, all)
 */
export function parseTool(tool: string): "cursor" | "claude" | "qoder" | "hybrid" | "all" {
  const normalized = tool.toLowerCase().trim();
  if (
    normalized === "cursor" ||
    normalized === "claude" ||
    normalized === "qoder" ||
    normalized === "hybrid" ||
    normalized === "all"
  ) {
    return normalized;
  }
  throw new Error(`Invalid tool: ${tool}. Must be cursor, claude, qoder, hybrid, or all.`);
}
