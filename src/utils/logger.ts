/**
 * Logger utility for Brief CLI
 * Provides consistent, colorized logging with levels
 */

import chalk from "chalk";
import { getTerminalChars } from "./terminal.js";

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

let currentLevel: LogLevel = "info";
let currentPrefix = "";

/**
 * Configure the logger
 */
export function configureLogger(options: Partial<LoggerOptions>): void {
  if (options.level !== undefined) {
    currentLevel = options.level;
  }
  if (options.prefix !== undefined) {
    currentPrefix = options.prefix;
  }
}

/**
 * Get the current log level
 */
export function getLogLevel(): LogLevel {
  return currentLevel;
}

/**
 * Check if a log level is enabled
 */
export function isLevelEnabled(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Format a message with optional prefix
 */
function formatMessage(message: string): string {
  return currentPrefix ? `${currentPrefix} ${message}` : message;
}

/**
 * Debug level logging - only shown when verbose
 */
export function debug(message: string, ...args: unknown[]): void {
  if (!isLevelEnabled("debug")) return;
  console.log(chalk.gray(formatMessage(`[debug] ${message}`)), ...args);
}

/**
 * Info level logging - general information
 */
export function info(message: string, ...args: unknown[]): void {
  if (!isLevelEnabled("info")) return;
  console.log(formatMessage(message), ...args);
}

/**
 * Success message - green checkmark
 */
export function success(message: string, ...args: unknown[]): void {
  if (!isLevelEnabled("info")) return;
  const chars = getTerminalChars();
  console.log(chalk.green(formatMessage(`${chars.check} ${message}`)), ...args);
}

/**
 * Warning level logging - yellow
 */
export function warn(message: string, ...args: unknown[]): void {
  if (!isLevelEnabled("warn")) return;
  const chars = getTerminalChars();
  console.log(chalk.yellow(formatMessage(`${chars.warning} ${message}`)), ...args);
}

/**
 * Error level logging - red
 */
export function error(message: string, ...args: unknown[]): void {
  if (!isLevelEnabled("error")) return;
  const chars = getTerminalChars();
  console.error(chalk.red(formatMessage(`${chars.cross} ${message}`)), ...args);
}

/**
 * Print a blank line
 */
export function newline(): void {
  if (!isLevelEnabled("info")) return;
  console.log();
}

/**
 * Print a header/section title
 */
export function header(message: string): void {
  if (!isLevelEnabled("info")) return;
  console.log();
  console.log(chalk.bold.cyan(formatMessage(message)));
  console.log(chalk.cyan("─".repeat(message.length)));
}

/**
 * Print a list item
 */
export function listItem(message: string, indent = 0): void {
  if (!isLevelEnabled("info")) return;
  const chars = getTerminalChars();
  const padding = "  ".repeat(indent);
  console.log(formatMessage(`${padding}${chars.bullet} ${message}`));
}

/**
 * Print a key-value pair
 */
export function keyValue(key: string, value: string, indent = 0): void {
  if (!isLevelEnabled("info")) return;
  const padding = "  ".repeat(indent);
  console.log(formatMessage(`${padding}${chalk.dim(key)}: ${value}`));
}

/**
 * Print a file path (styled)
 */
export function filePath(path: string, action: "created" | "modified" | "deleted" | "skipped" = "created"): void {
  if (!isLevelEnabled("info")) return;
  const colors = {
    created: chalk.green,
    modified: chalk.yellow,
    deleted: chalk.red,
    skipped: chalk.gray,
  };
  const symbols = {
    created: "+",
    modified: "~",
    deleted: "-",
    skipped: "○",
  };
  console.log(formatMessage(`  ${colors[action](symbols[action])} ${path}`));
}

/**
 * Create a scoped logger with a prefix
 */
export function createLogger(prefix: string): {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  success: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
} {
  const scopedPrefix = chalk.dim(`[${prefix}]`);

  return {
    debug: (message: string, ...args: unknown[]) => {
      if (!isLevelEnabled("debug")) return;
      console.log(chalk.gray(`${scopedPrefix} [debug] ${message}`), ...args);
    },
    info: (message: string, ...args: unknown[]) => {
      if (!isLevelEnabled("info")) return;
      console.log(`${scopedPrefix} ${message}`, ...args);
    },
    success: (message: string, ...args: unknown[]) => {
      if (!isLevelEnabled("info")) return;
      const chars = getTerminalChars();
      console.log(chalk.green(`${scopedPrefix} ${chars.check} ${message}`), ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      if (!isLevelEnabled("warn")) return;
      const chars = getTerminalChars();
      console.log(chalk.yellow(`${scopedPrefix} ${chars.warning} ${message}`), ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      if (!isLevelEnabled("error")) return;
      const chars = getTerminalChars();
      console.error(chalk.red(`${scopedPrefix} ${chars.cross} ${message}`), ...args);
    },
  };
}

export const logger = {
  debug,
  info,
  success,
  warn,
  error,
  newline,
  header,
  listItem,
  keyValue,
  filePath,
  configure: configureLogger,
  getLevel: getLogLevel,
  isLevelEnabled,
  createLogger,
};

export default logger;
