/**
 * Utility exports for Brief CLI
 */

// Logger
export {
  logger,
  configureLogger,
  getLogLevel,
  isLevelEnabled,
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
  createLogger,
  type LogLevel,
} from "./logger.js";

// File system
export {
  fileSystem,
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
  type FileWriteOptions,
  type FileWriteResult,
  type DirectoryContents,
} from "./file-system.js";

// Template engine
export {
  templateEngine,
  compileTemplate,
  renderTemplate,
  renderTemplateFile,
  parseFrontmatter,
  generateFrontmatter,
  registerPartial,
  registerHelper,
  createTemplateContext,
  type TemplateContext,
  type TemplateFrontmatter,
  type ParsedTemplate,
} from "./template-engine.js";

// Validation
export {
  validation,
  validateConfig,
  validateConfigFile,
  validateTemplate,
  validateProjectDirectory,
  validateGlobPattern,
  formatValidationResult,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from "./validation.js";
