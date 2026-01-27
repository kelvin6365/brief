/**
 * Detect command
 * Detect and display project information
 */

import type { DetectOptions, CommandResult } from "./types.js";
import { detectProject, getDetectionSummary } from "../detectors/index.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("detect");

/**
 * Run detect command
 */
export async function detectCommand(options: DetectOptions): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    log.info(`Analyzing project at: ${projectPath}`);
    const detection = await detectProject(projectPath);

    if (options.json) {
      console.log(JSON.stringify(detection, null, 2));
    } else {
      console.log("\n📊 Project Detection Results\n");
      console.log(getDetectionSummary(detection));

      if (options.verbose) {
        console.log("\n📋 Detailed Information\n");

        // Language details
        console.log("Languages:");
        console.log(`  Primary: ${detection.language.primary}`);
        if (detection.language.secondary.length > 0) {
          console.log(`  Secondary: ${detection.language.secondary.join(", ")}`);
        }

        // Framework details
        if (detection.frameworks.length > 0) {
          console.log("\nFrameworks:");
          for (const framework of detection.frameworks) {
            console.log(`  - ${framework.name} v${framework.version || "unknown"} (${framework.category})`);
          }
        }

        // Testing details
        if (detection.testing.length > 0) {
          console.log("\nTesting:");
          console.log(`  Frameworks: ${detection.testing.map(t => t.name).join(", ")}`);
        }

        // Build tools
        if (detection.buildTools.length > 0) {
          console.log("\nBuild Tools:");
          for (const tool of detection.buildTools) {
            console.log(`  - ${tool.name}`);
          }
        }

        // Database
        if (detection.database.length > 0) {
          console.log("\nDatabase:");
          for (const db of detection.database) {
            console.log(`  - ${db.name}${db.orm ? ` (ORM: ${db.orm})` : ""}`);
          }
        }

        // AI Config status
        console.log("\nAI Config Status:");
        console.log(`  Cursor: ${detection.aiConfig.cursor.hasConfig ? "Configured" : "Not configured"}`);
        console.log(`  Claude: ${detection.aiConfig.claude.hasConfig ? "Configured" : "Not configured"}`);
        console.log(`  Copilot: ${detection.aiConfig.copilot.hasInstructions ? "Configured" : "Not configured"}`);
      }

      console.log("");
    }

    return {
      success: true,
      message: "Detection completed successfully",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Detection failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

export default detectCommand;
