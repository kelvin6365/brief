/**
 * Existing AI configuration detection
 */

import type { DetectionContext, ExistingAiConfig } from "./types.js";
import { hasFile } from "./utils.js";

/**
 * Detect existing AI tool configurations
 */
export function detectAiConfig(context: DetectionContext): ExistingAiConfig {
  return {
    cursor: detectCursorConfig(context),
    claude: detectClaudeConfig(context),
    qoder: detectQoderConfig(context),
    copilot: detectCopilotConfig(context),
  };
}

/**
 * Detect Cursor IDE configuration
 */
function detectCursorConfig(context: DetectionContext): ExistingAiConfig["cursor"] {
  // Check for modern .cursor directory structure
  const hasRulesDir = context.files.some((f) => f.startsWith(".cursor/rules/"));

  // Check for .cursor/settings.json or similar
  const hasCursorDir = context.files.some((f) => f.startsWith(".cursor/"));

  // Check for legacy .cursorrules file
  const hasLegacyRules = hasFile(context, ".cursorrules");

  return {
    hasConfig: hasCursorDir || hasLegacyRules,
    hasRulesDir,
    hasLegacyRules,
  };
}

/**
 * Detect Claude Code configuration
 */
function detectClaudeConfig(context: DetectionContext): ExistingAiConfig["claude"] {
  // Check for CLAUDE.md at root
  const hasClaudeMd = hasFile(context, "CLAUDE.md");

  // Check for .claude directory
  const hasClaudeDir = context.files.some((f) => f.startsWith(".claude/"));

  // Check for skills directory within .claude
  const hasSkills = context.files.some((f) => f.startsWith(".claude/skills/"));

  return {
    hasConfig: hasClaudeDir || hasClaudeMd,
    hasClaudeMd,
    hasSkills,
  };
}

/**
 * Detect Qoder (The Agentic Coding Platform) configuration
 */
function detectQoderConfig(context: DetectionContext): ExistingAiConfig["qoder"] {
  // Check for .qoder/rules directory
  const hasRulesDir = context.files.some((f) => f.startsWith(".qoder/rules/"));

  // Check for AGENTS.md at root (also supported by Qoder)
  const hasAgentsMd = hasFile(context, "AGENTS.md");

  // Check for any rules files in .qoder/rules
  const hasRules = context.files.some(
    (f) => f.startsWith(".qoder/rules/") && f.endsWith(".md")
  );

  return {
    hasBestPractices: hasRules,
    hasAgentsMd,
    hasAiConfig: hasRulesDir,
  };
}

/**
 * Detect GitHub Copilot configuration
 */
function detectCopilotConfig(context: DetectionContext): ExistingAiConfig["copilot"] {
  // Check for Copilot instructions file
  const hasInstructions = hasFile(context, ".github/copilot-instructions.md");

  return {
    hasInstructions,
  };
}
