/**
 * Commands module exports
 */

// Types
export type {
  InitOptions,
  DetectOptions,
  AddOptions,
  RemoveOptions,
  SyncOptions,
  ValidateOptions,
  CommandResult,
} from "./types.js";

// Commands
export { initCommand, runInitInteractive, runInitNonInteractive } from "./init.js";
export { detectCommand } from "./detect.js";
export { addCommand, getAvailableTemplates } from "./add.js";
export { removeCommand } from "./remove.js";
export { syncCommand } from "./sync.js";
export { validateCommand } from "./validate.js";

// Utilities
export {
  loadProjectConfig,
  saveProjectConfig,
  isInitialized,
  formatBytes,
  formatDuration,
  parseTool,
} from "./utils.js";
