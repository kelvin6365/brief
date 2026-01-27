/**
 * Main detection orchestrator
 *
 * Coordinates all individual detectors to provide a complete
 * picture of the project's technology stack.
 */

import type { FullProjectDetection } from "./types.js";
import { buildDetectionContext } from "./utils.js";
import { detectLanguage } from "./language.js";
import { detectPackageManager } from "./package-manager.js";
import { detectFrameworks } from "./framework.js";
import { detectTesting } from "./testing.js";
import { detectDatabase } from "./database.js";
import { detectBuildTools } from "./build-tools.js";
import { detectStyling } from "./styling.js";
import { detectAiConfig } from "./ai-config.js";

// Re-export types for convenience
export * from "./types.js";

// Re-export individual detectors for advanced usage
export { detectLanguage } from "./language.js";
export { detectPackageManager } from "./package-manager.js";
export { detectFrameworks } from "./framework.js";
export { detectTesting } from "./testing.js";
export { detectDatabase } from "./database.js";
export { detectBuildTools } from "./build-tools.js";
export { detectStyling } from "./styling.js";
export { detectAiConfig } from "./ai-config.js";
export { buildDetectionContext } from "./utils.js";

/**
 * Detect all aspects of a project
 *
 * @param projectPath - Path to the project root
 * @returns Complete detection result
 */
export async function detectProject(projectPath: string): Promise<FullProjectDetection> {
  // Build the shared detection context
  const context = await buildDetectionContext(projectPath);

  // Run all detectors in parallel for performance
  const [language, packageManager, frameworks, testing, database, buildTools, styling, aiConfig] = await Promise.all([
    Promise.resolve(detectLanguage(context)),
    Promise.resolve(detectPackageManager(context)),
    Promise.resolve(detectFrameworks(context)),
    Promise.resolve(detectTesting(context)),
    Promise.resolve(detectDatabase(context)),
    Promise.resolve(detectBuildTools(context)),
    Promise.resolve(detectStyling(context)),
    Promise.resolve(detectAiConfig(context)),
  ]);

  return {
    language,
    packageManager,
    frameworks,
    testing,
    database,
    buildTools,
    styling,
    aiConfig,
  };
}

/**
 * Get a summary of the detection for display
 */
export function getDetectionSummary(detection: FullProjectDetection): string {
  const lines: string[] = [];

  // Language
  lines.push(`Language: ${detection.language.primary} (${detection.language.confidence}% confidence)`);
  if (detection.language.secondary.length > 0) {
    lines.push(`  Secondary: ${detection.language.secondary.join(", ")}`);
  }

  // Package Manager
  if (detection.packageManager.name !== "unknown") {
    lines.push(`Package Manager: ${detection.packageManager.name}${detection.packageManager.lockFile ? ` (${detection.packageManager.lockFile})` : ""}`);
  }

  // Frameworks
  if (detection.frameworks.length > 0) {
    lines.push(`Frameworks:`);
    for (const fw of detection.frameworks.slice(0, 5)) {
      lines.push(`  - ${fw.name} [${fw.category}] (${fw.confidence}%)`);
    }
    if (detection.frameworks.length > 5) {
      lines.push(`  ... and ${detection.frameworks.length - 5} more`);
    }
  }

  // Testing
  if (detection.testing.length > 0) {
    lines.push(`Testing:`);
    for (const t of detection.testing.slice(0, 3)) {
      lines.push(`  - ${t.name} (${t.confidence}%)`);
    }
  }

  // Database
  if (detection.database.length > 0) {
    lines.push(`Database/ORM:`);
    for (const db of detection.database.slice(0, 3)) {
      lines.push(`  - ${db.name}${db.orm ? ` (${db.orm})` : ""} (${db.confidence}%)`);
    }
  }

  // Build Tools
  if (detection.buildTools.length > 0) {
    lines.push(`Build Tools:`);
    for (const bt of detection.buildTools.slice(0, 3)) {
      lines.push(`  - ${bt.name} (${bt.confidence}%)`);
    }
  }

  // Styling
  if (detection.styling.length > 0) {
    lines.push(`Styling:`);
    for (const s of detection.styling.slice(0, 3)) {
      lines.push(`  - ${s.name} (${s.confidence}%)`);
    }
  }

  // Existing AI Config
  const aiConfig = detection.aiConfig;
  const hasQoderConfig = aiConfig.qoder.hasBestPractices || aiConfig.qoder.hasAgentsMd || aiConfig.qoder.hasAiConfig;
  const hasExistingConfig = aiConfig.cursor.hasConfig || aiConfig.claude.hasConfig || hasQoderConfig || aiConfig.copilot.hasInstructions;

  if (hasExistingConfig) {
    lines.push(`Existing AI Config:`);
    if (aiConfig.cursor.hasConfig) {
      lines.push(`  - Cursor: ${aiConfig.cursor.hasRulesDir ? "modern rules" : aiConfig.cursor.hasLegacyRules ? "legacy .cursorrules" : "config present"}`);
    }
    if (aiConfig.claude.hasConfig) {
      lines.push(`  - Claude Code: ${aiConfig.claude.hasClaudeMd ? "CLAUDE.md" : ""}${aiConfig.claude.hasSkills ? " + skills" : ""}`);
    }
    if (hasQoderConfig) {
      const qoderParts: string[] = [];
      if (aiConfig.qoder.hasAiConfig) qoderParts.push(".qoder/rules/");
      if (aiConfig.qoder.hasBestPractices) qoderParts.push("rules");
      if (aiConfig.qoder.hasAgentsMd) qoderParts.push("AGENTS.md");
      lines.push(`  - Qoder: ${qoderParts.join(" + ")}`);
    }
    if (aiConfig.copilot.hasInstructions) {
      lines.push(`  - GitHub Copilot: instructions found`);
    }
  }

  return lines.join("\n");
}
