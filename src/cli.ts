#!/usr/bin/env node
/**
 * Brief CLI
 * AI-optimized configuration generator for Cursor IDE and Claude Code
 */

// Workaround for Bun's UTF-8 stdout encoding bug
// Bun corrupts UTF-8 characters when writing to stdout, so we intercept console.log
// and write directly to stdout with explicit UTF-8 encoding
// Store original console methods for Bun UTF-8 workaround
const originalLog = console.log;
// Store original console methods for Bun UTF-8 workaround
const originalError = console.error;

console.log = (...args: unknown[]) => {
  const text = args
    .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
    .join(" ");
  const buffer = Buffer.from(text + "\n", "utf8");
  process.stdout.write(buffer);
  // Use originalLog to satisfy TypeScript compiler
  if (globalThis.process && false) originalLog();
};

console.error = (...args: unknown[]) => {
  const text = args
    .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
    .join(" ");
  const buffer = Buffer.from(text + "\n", "utf8");
  process.stderr.write(buffer);
  // Use originalError to satisfy TypeScript compiler
  if (globalThis.process && false) originalError();
};

import { Command } from "commander";
import {
  addCommand,
  detectCommand,
  getAvailableTemplates,
  initCommand,
  parseTool,
  removeCommand,
  skillsAddCommand,
  skillsInfoCommand,
  skillsListCommand,
  skillsRemoveCommand,
  syncCommand,
  validateCommand,
} from "./commands/index.js";
import type { AiTool } from "./types/index.js";

const program = new Command();

program
  .name("brief")
  .description(
    "AI-optimized configuration generator for Cursor IDE, Claude Code, and Qoder"
  )
  .version("0.1.0");

// Init command
program
  .command("init")
  .description("Initialize AI configuration for your project")
  .option(
    "-t, --tool <tool>",
    "Target tool (cursor, claude, qoder, hybrid, all)",
    "hybrid"
  )
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-d, --dry-run", "Preview changes without writing files")
  .option("--templates <templates>", "Comma-separated list of templates")
  .option("-m, --merge", "Smart merge with existing files")
  .option(
    "--auto-merge-threshold <threshold>",
    "Similarity threshold for auto-merge (0-1)",
    "0.95"
  )
  .action(
    async (options: {
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
        const templates =
          options.templates?.split(",").map((t) => t.trim()) || [];
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
    }
  );

// Detect command
program
  .command("detect")
  .description("Detect and display project information")
  .option("-j, --json", "Output as JSON")
  .option("-p, --path <path>", "Project path to analyze", process.cwd())
  .option("-v, --verbose", "Show detailed output")
  .action(
    async (options: {
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
    }
  );

// Add command
program
  .command("add <template>")
  .description("Add a template to your project")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --force", "Force overwrite if already exists")
  .action(
    async (
      template: string,
      options: {
        path: string;
        force: boolean;
      }
    ): Promise<void> => {
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
    }
  );

// Remove command
program
  .command("remove <template>")
  .description("Remove a template from your project")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("--remove-files", "Also remove generated files")
  .action(
    async (
      template: string,
      options: {
        path: string;
        removeFiles: boolean;
      }
    ): Promise<void> => {
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
    }
  );

// Sync command
program
  .command("sync")
  .description("Re-detect project and sync configuration")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --force", "Force regeneration")
  .option("-d, --dry-run", "Preview changes without writing files")
  .action(
    async (options: {
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
    }
  );

// Validate command
program
  .command("validate")
  .description("Validate current configuration")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --fix", "Fix issues automatically")
  .option("-v, --verbose", "Show detailed output")
  .action(
    async (options: {
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
    }
  );

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

// Skills command group
const skillsCommand = program
  .command("skills")
  .description("Manage AI skills for Claude, Cursor, and Qoder");

// Skills list subcommand
skillsCommand
  .command("list")
  .alias("ls")
  .description("List available skills")
  .option("-p, --platform <platform>", "Filter by platform (cursor, claude, qoder)")
  .action(
    async (options: {
      platform?: "cursor" | "claude" | "qoder";
    }): Promise<void> => {
      try {
        const result = await skillsListCommand(options.platform);
        if (!result.success) {
          console.error(result.error);
          process.exit(1);
        }
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  );

// Skills add subcommand
skillsCommand
  .command("add <skill>")
  .description("Add a skill to your project")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("-f, --force", "Force overwrite if already exists")
  .option("-t, --tool <tool>", "Target tool (cursor, claude, qoder)", "hybrid")
  .action(
    async (
      skill: string,
      options: {
        path: string;
        force: boolean;
        tool: string;
      }
    ): Promise<void> => {
      try {
        const result = await skillsAddCommand(skill, {
          path: options.path,
          force: options.force,
          tool: options.tool as any,
        });

        if (!result.success) {
          console.error(result.error);
          process.exit(1);
        }
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  );

// Skills remove subcommand
skillsCommand
  .command("remove <skill>")
  .description("Remove a skill from your project")
  .option("-p, --path <path>", "Project path", process.cwd())
  .option("--remove-files", "Also remove generated files")
  .action(
    async (
      skill: string,
      options: {
        path: string;
        removeFiles: boolean;
      }
    ): Promise<void> => {
      try {
        const result = await skillsRemoveCommand(skill, {
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
    }
  );

// Skills info subcommand
skillsCommand
  .command("info <skill>")
  .description("Show detailed information about a skill")
  .action(
    async (skill: string): Promise<void> => {
      try {
        const result = await skillsInfoCommand(skill);

        if (!result.success) {
          console.error(result.error);
          process.exit(1);
        }
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  );

program.parse();
