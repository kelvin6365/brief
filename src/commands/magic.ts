/**
 * Magic command implementation
 *
 * Provides `brief magic <kit>` for framework-specific AI configuration
 * on top of an existing project, backed by the detection + generator pipeline.
 */

import { detectProject } from "../detectors/index.js";
import type { FullProjectDetection } from "../detectors/types.js";
import { runGenerators } from "../generators/index.js";
import type { AiInitConfig, AiTool, MagicKit } from "../types/index.js";
import { createLogger } from "../utils/logger.js";
import {
  isAbsolute,
  normalizePath,
  resolvePath,
} from "../utils/file-system.js";
import { getCliVersion } from "../utils/version.js";
import type { MagicOptions, MagicResult } from "./types.js";
import { getMagicKit } from "./magic-registry.js";

const log = createLogger("magic");

/**
 * Entry point for the `brief magic` command.
 */
export async function magicCommand(
  kitId: string,
  options: MagicOptions
): Promise<MagicResult> {
  const kit = getMagicKit(kitId);

  if (!kit) {
    return {
      success: false,
      error: `Unknown magic kit: ${kitId}`,
      message: undefined,
      kitId,
      projectPath: process.cwd(),
    };
  }

  const basePath = normalizePath(options.path ?? process.cwd());
  const targetDir = isAbsolute(basePath)
    ? basePath
    : resolvePath(process.cwd(), basePath);

  log.debug(`Running magic kit '${kit.id}' in ${targetDir}`);

  // Run detection on the existing project to feed into generators
  const detection = await detectProject(targetDir);

  // Build AI init configuration from the kit definition
  const config = await buildAiInitConfigFromKit(kit, detection);

  const generatorResult = await runGenerators({
    projectPath: targetDir,
    detection,
    config,
    dryRun: !!options.dryRun,
    mergeMode: false,
  });

  // Print next steps for the user
  printPostSteps(kit, targetDir);

  return {
    success: generatorResult.success,
    error: generatorResult.success
      ? undefined
      : "Generation completed with errors",
    message: generatorResult.success
      ? `Magic kit '${kit.id}' applied successfully`
      : `Magic kit '${kit.id}' completed with errors`,
    kitId: kit.id,
    projectPath: targetDir,
  };
}

async function buildAiInitConfigFromKit(
  kit: MagicKit,
  _detection: FullProjectDetection
): Promise<AiInitConfig> {
  const tools =
    kit.tools.length > 0
      ? kit.tools
      : (["cursor", "claude", "qoder"] as AiTool[]);

  const version = await getCliVersion();
  return {
    version,
    projectType: "app",
    framework: kit.framework,
    language: kit.language,
    tools,
    templates: kit.templates,
  };
}

function printPostSteps(kit: MagicKit, projectPath: string): void {
  // eslint-disable-next-line no-console
  console.log("\nMagic kit:", kit.name);
  // eslint-disable-next-line no-console
  console.log("Project path:", projectPath);
  // eslint-disable-next-line no-console
  console.log("");
}
