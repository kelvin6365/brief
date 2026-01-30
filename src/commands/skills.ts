/**
 * Skills command
 * Manage AI skills for Claude, Cursor, and Qoder
 */

import { detectProject } from "../detectors/index.js";
import { runGenerators } from "../generators/index.js";
import {
    ALL_TEMPLATES,
    getTemplatesByTag,
    getTemplatesByTarget
} from "../templates/registry.js";
import type { AiTool } from "../types/index.js";
import { createLogger } from "../utils/logger.js";
import type { CommandResult } from "./types.js";
import { loadProjectConfig, saveProjectConfig } from "./utils.js";

const log = createLogger("skills");

/**
 * Get available skills
 */
export function getAvailableSkills(): string[] {
  const skills = getTemplatesByTag("skill");
  return skills.map((t) => t.id);
}

/**
 * Get skills by platform
 */
export function getSkillsByPlatform(platform: "cursor" | "claude" | "qoder"): string[] {
  const skills = getTemplatesByTarget(platform).filter(t => t.tags?.includes("skill"));
  return skills.map((t) => t.id);
}

/**
 * Get skill information
 */
export function getSkillInfo(skillName: string) {
  const template = ALL_TEMPLATES.find((t) => t.id === skillName);
  if (!template || !template.tags?.includes("skill")) {
    return null;
  }

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    target: template.target,
    category: template.category,
    templatePath: template.templatePath,
    outputPath: template.outputPath,
    globs: template.globs,
    priority: template.priority,
    dependencies: template.dependencies,
    tags: template.tags,
  };
}

/**
 * Run skills list command
 */
export async function skillsListCommand(platform?: "cursor" | "claude" | "qoder"): Promise<CommandResult> {
  try {
    log.info("Available skills:");
    
    if (platform) {
      const skills = getSkillsByPlatform(platform);
      if (skills.length === 0) {
        log.info(`No skills found for ${platform}`);
        return { success: true, message: `No skills available for ${platform}` };
      }
      
      log.info(`${platform.toUpperCase()} skills:`);
      for (const skill of skills) {
        const skillInfo = getSkillInfo(skill);
        if (skillInfo) {
          console.log(`  - ${skill}: ${skillInfo.description}`);
        }
      }
    } else {
      const allSkills = getAvailableSkills();
      if (allSkills.length === 0) {
        log.info("No skills found in registry");
        return { success: true, message: "No skills available" };
      }
      
      const claudeSkills = getSkillsByPlatform("claude");
      const cursorSkills = getSkillsByPlatform("cursor");
      const qoderSkills = getSkillsByPlatform("qoder");
      
      if (claudeSkills.length > 0) {
        log.info("Claude skills:");
        for (const skill of claudeSkills) {
          const skillInfo = getSkillInfo(skill);
          if (skillInfo) {
            console.log(`  - ${skill}: ${skillInfo.description}`);
          }
        }
      }
      
      if (cursorSkills.length > 0) {
        log.info("Cursor skills:");
        for (const skill of cursorSkills) {
          const skillInfo = getSkillInfo(skill);
          if (skillInfo) {
            console.log(`  - ${skill}: ${skillInfo.description}`);
          }
        }
      }
      
      if (qoderSkills.length > 0) {
        log.info("Qoder skills:");
        for (const skill of qoderSkills) {
          const skillInfo = getSkillInfo(skill);
          if (skillInfo) {
            console.log(`  - ${skill}: ${skillInfo.description}`);
          }
        }
      }
      
      if (allSkills.length === 0) {
        log.info("No skills found in registry");
      }
    }
    
    return { success: true, message: "Skills listed successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Skills list failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Run skills add command
 */
export async function skillsAddCommand(
  skillName: string,
  options: { path?: string; force?: boolean; tool?: AiTool } = {}
): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    // Validate skill exists
    const template = ALL_TEMPLATES.find((t) => t.id === skillName && t.tags?.includes("skill"));
    if (!template) {
      const available = getAvailableSkills();
      return {
        success: false,
        error: `Skill "${skillName}" not found. Available skills: ${available.join(", ")}`,
      };
    }

    log.info(`Adding skill: ${skillName}`);

    // Load existing config or create new
    let config = await loadProjectConfig(projectPath);

    if (!config) {
      log.info("No existing config found, detecting project...");
      const detection = await detectProject(projectPath);
      config = {
        version: "1.0.0",
        projectType: "app",
        language: detection.language.primary,
        tools: [options.tool || "hybrid"] as AiTool[],
        templates: [],
      };
    }

    // Check if already added
    if (config.templates.includes(skillName)) {
      if (!options.force) {
        return {
          success: false,
          error: `Skill "${skillName}" is already added. Use --force to regenerate.`,
        };
      }
    } else {
      config.templates.push(skillName);
    }

    // Detect project for generation context
    const detection = await detectProject(projectPath);

    // Run generators with updated config
    const results = await runGenerators({
      projectPath,
      detection,
      config,
      dryRun: false,
    });

    if (results.success) {
      // Save updated config
      await saveProjectConfig(projectPath, config);

      const allFiles = results.results.flatMap((r) => r.files);
      log.success(`Added skill: ${skillName}`);
      for (const file of allFiles) {
        log.info(`  ${file.action === "created" ? "+" : "~"} ${file.path}`);
      }
      return {
        success: true,
        message: `Skill "${skillName}" added successfully`,
      };
    } else {
      const errors = results.results
        .filter((r) => r.error)
        .map((r) => r.error as string);
      return {
        success: false,
        error: errors.join("\n"),
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Skills add failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Run skills remove command
 */
export async function skillsRemoveCommand(
  skillName: string,
  options: { path?: string; removeFiles?: boolean } = {}
): Promise<CommandResult> {
  const projectPath = options.path || process.cwd();

  try {
    // Validate skill exists
    const template = ALL_TEMPLATES.find((t) => t.id === skillName && t.tags?.includes("skill"));
    if (!template) {
      const available = getAvailableSkills();
      return {
        success: false,
        error: `Skill "${skillName}" not found. Available skills: ${available.join(", ")}`,
      };
    }

    log.info(`Removing skill: ${skillName}`);

    // Load existing config
    const config = await loadProjectConfig(projectPath);
    if (!config) {
      return {
        success: false,
        error: "No Brief configuration found. Run 'brief init' first.",
      };
    }

    // Check if skill is in the config
    const skillIndex = config.templates.indexOf(skillName);
    if (skillIndex === -1) {
      return {
        success: false,
        error: `Skill "${skillName}" is not currently added to your project.`,
      };
    }

    // Remove from config
    config.templates.splice(skillIndex, 1);

    // Optionally remove generated files
    if (options.removeFiles) {
      log.info(`Removing generated files for skill: ${skillName}`);
      // Note: We don't have a direct way to remove specific files without recreating the entire generator logic
      // This would typically involve checking what files were generated for this specific template
      // For now, we'll just log the intended removal
      log.info(`Would remove: ${template.outputPath}`);
    }

    // Save updated config
    await saveProjectConfig(projectPath, config);

    log.success(`Removed skill: ${skillName}`);
    return {
      success: true,
      message: `Skill "${skillName}" removed successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Skills remove failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Run skills info command
 */
export async function skillsInfoCommand(skillName: string): Promise<CommandResult> {
  try {
    const skillInfo = getSkillInfo(skillName);
    if (!skillInfo) {
      const available = getAvailableSkills();
      return {
        success: false,
        error: `Skill "${skillName}" not found. Available skills: ${available.join(", ")}`,
      };
    }

    console.log(`\nSkill: ${skillInfo.name} (${skillInfo.id})`);
    console.log(`Description: ${skillInfo.description}`);
    console.log(`Target: ${Array.isArray(skillInfo.target) ? skillInfo.target.join(", ") : skillInfo.target}`);
    console.log(`Category: ${skillInfo.category}`);
    if (skillInfo.globs) {
      console.log(`Globs: ${skillInfo.globs.join(", ")}`);
    }
    if (skillInfo.dependencies) {
      console.log(`Dependencies: ${skillInfo.dependencies.join(", ")}`);
    }
    console.log(`Tags: ${skillInfo.tags?.join(", ") || "none"}`);
    console.log(`Template Path: ${skillInfo.templatePath}`);
    console.log(`Output Path: ${skillInfo.outputPath}`);
    console.log(`Priority: ${skillInfo.priority || "default"}`);
    
    return { success: true, message: "Skill info displayed successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Skills info failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

export default {
  skillsListCommand,
  skillsAddCommand,
  skillsRemoveCommand,
  skillsInfoCommand,
  getAvailableSkills,
  getSkillsByPlatform,
  getSkillInfo,
};