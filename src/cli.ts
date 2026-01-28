#!/usr/bin/env bun
/**
 * Brief CLI
 * AI-optimized configuration generator for Cursor IDE and Claude Code
 */

// Workaround for Bun's UTF-8 stdout encoding bug
// Bun corrupts UTF-8 characters when writing to stdout, so we intercept console.log
// and write directly to stdout with explicit UTF-8 encoding
const originalLog = console.log;
const originalError = console.error;

console.log = (...args: unknown[]) => {
  const text = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  const buffer = Buffer.from(text + '\n', 'utf8');
  process.stdout.write(buffer);
};

console.error = (...args: unknown[]) => {
  const text = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  const buffer = Buffer.from(text + '\n', 'utf8');
  process.stderr.write(buffer);
};

import { Command } from "commander";
import {
  initCommand,
  detectCommand,
  addCommand,
  removeCommand,
  syncCommand,
  validateCommand,
  getAvailableTemplates,
  parseTool,
} from "./commands/index.js";
import type { AiTool } from "./types/index.js";

const program = new Command();

program
  .name("brief")
  .description("AI-optimized configuration generator for Cursor IDE, Claude Code, and Qoder")
  .version("0.1.0");

// Init command
program
  .command("init")
  .description("Initialize AI configuration for your project")
  .option("-t, --tool <tool>", "Target tool (cursor, claude, qoder, hybrid, all)", "hybrid")
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-d, --dry-run", "Preview changes without writing files")
  .option("--templates <templates>", "Comma-separated list of templates")
  .option("-m, --merge", "Smart merge with existing files")
  .option("--auto-merge-threshold <threshold>", "Similarity threshold for auto-merge (0-1)", "0.95")
  .action(async (options: {
    tool: string;
    yes: boolean;
    path: string;
    dryRun: boolean;
    templates?: string;
    merge?: boolean;
    autoMergeThreshold?: string;
  }): Promise<void> => {
    try {
      const tool = parseTool(options.tool) as AiTool;
      const templates = options.templates?.split(",").map(t => t.trim()) || [];
      const autoMergeThreshold = options.autoMergeThreshold
        ? parseFloat(options.autoMergeThreshold)
        : undefined;

      const result = await initCommand({
        tool,
        yes: options.yes,
        path: options.path,
        dryRun: options.dryRun,
        templates,
        merge: options.merge,
        autoMergeThreshold,
      });

      if (!result.success) {
        console.error(result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Detect command
program
  .command("detect")
  .description("Detect and display project information")
  .option("-j, --json", "Output as JSON")
  .option("-p, --path <path>", "Project path to analyze", process.cwd())
  .option("-v, --verbose", "Show detailed output")
  .action(async (options: {
    json: boolean;
    path: string;
    verbose: boolean;
  }): Promise<void> => {
    try {
      const result = await detectCommand({
        json: options.json,
        path: options.path,
        verbose: options.verbose,
      });

      if (!result.success) {
        console.error(result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Add command
program
  .command("add <template>")
  .description("Add a template to your project")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --force", "Force overwrite if already exists")
  .action(async (template: string, options: {
    path: string;
    force: boolean;
  }): Promise<void> => {
    try {
      const result = await addCommand(template, {
        path: options.path,
        force: options.force,
      });

      if (!result.success) {
        console.error(result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Remove command
program
  .command("remove <template>")
  .description("Remove a template from your project")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("--remove-files", "Also remove generated files")
  .action(async (template: string, options: {
    path: string;
    removeFiles: boolean;
  }): Promise<void> => {
    try {
      const result = await removeCommand(template, {
        path: options.path,
        removeFiles: options.removeFiles,
      });

      if (!result.success) {
        console.error(result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Sync command
program
  .command("sync")
  .description("Re-detect project and sync configuration")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --force", "Force regeneration")
  .option("-d, --dry-run", "Preview changes without writing files")
  .action(async (options: {
    path: string;
    force: boolean;
    dryRun: boolean;
  }): Promise<void> => {
    try {
      const result = await syncCommand({
        path: options.path,
        force: options.force,
        dryRun: options.dryRun,
      });

      if (!result.success) {
        console.error(result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Validate command
program
  .command("validate")
  .description("Validate current configuration")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --fix", "Fix issues automatically")
  .option("-v, --verbose", "Show detailed output")
  .action(async (options: {
    path: string;
    fix: boolean;
    verbose: boolean;
  }): Promise<void> => {
    try {
      const result = await validateCommand({
        path: options.path,
        fix: options.fix,
        verbose: options.verbose,
      });

      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List templates command
program
  .command("templates")
  .description("List available templates")
  .action((): void => {
    const templates = getAvailableTemplates();
    console.log("\nAvailable templates:\n");
    for (const template of templates) {
      console.log(`  - ${template}`);
    }
    console.log("");
  });

program.parse();
