/**
 * Shared utilities for project detection
 */

import * as fs from "fs-extra";
import * as path from "path";
import { globby } from "globby";
import type { DetectionContext, PackageJson, PomXmlInfo, MavenDependency } from "./types.js";

/**
 * Read and parse package.json from a directory
 */
export async function readPackageJson(projectPath: string): Promise<PackageJson | null> {
  const packageJsonPath = path.join(projectPath, "package.json");
  try {
    if (await fs.pathExists(packageJsonPath)) {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      return JSON.parse(content) as PackageJson;
    }
  } catch {
    // Invalid JSON or read error
  }
  return null;
}

/**
 * Read Python requirements.txt and return package names
 */
export async function readPythonRequirements(projectPath: string): Promise<string[]> {
  const requirementsPath = path.join(projectPath, "requirements.txt");
  try {
    if (await fs.pathExists(requirementsPath)) {
      const content = await fs.readFile(requirementsPath, "utf-8");
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          // Extract package name from lines like "django>=3.0" or "flask==2.0.1"
          const match = line.match(/^([a-zA-Z0-9_-]+)/);
          return match?.[1]?.toLowerCase() ?? "";
        })
        .filter(Boolean);
    }
  } catch {
    // Read error
  }
  return [];
}

/**
 * Read and parse Maven pom.xml file
 * Uses simple regex parsing to avoid XML parser dependency
 */
export async function readPomXml(projectPath: string): Promise<PomXmlInfo | null> {
  const pomPath = path.join(projectPath, "pom.xml");
  try {
    if (await fs.pathExists(pomPath)) {
      const content = await fs.readFile(pomPath, "utf-8");
      return parsePomXml(content);
    }
  } catch {
    // Read or parse error
  }
  return null;
}

/**
 * Parse pom.xml content using regex (simple parser without XML dependency)
 */
function parsePomXml(content: string): PomXmlInfo {
  const dependencies: MavenDependency[] = [];

  // Extract parent info
  const parentMatch = content.match(/<parent>([\s\S]*?)<\/parent>/);
  let parent: PomXmlInfo["parent"] | undefined;
  if (parentMatch) {
    const parentContent = parentMatch[1];
    if (parentContent) {
      const parentGroupId = parentContent.match(/<groupId>([^<]+)<\/groupId>/)?.[1];
      const parentArtifactId = parentContent.match(/<artifactId>([^<]+)<\/artifactId>/)?.[1];
      const parentVersion = parentContent.match(/<version>([^<]+)<\/version>/)?.[1];
      if (parentGroupId && parentArtifactId) {
        parent = { groupId: parentGroupId, artifactId: parentArtifactId, version: parentVersion };
      }
    }
  }

  // Extract project-level groupId, artifactId, version (outside of parent and dependencies)
  // Remove parent section first to avoid matching parent values
  const contentWithoutParent = content.replace(/<parent>[\s\S]*?<\/parent>/, "");
  const projectGroupId = contentWithoutParent.match(/<groupId>([^<]+)<\/groupId>/)?.[1];
  const projectArtifactId = contentWithoutParent.match(/<artifactId>([^<]+)<\/artifactId>/)?.[1];
  const projectVersion = contentWithoutParent.match(/<version>([^<]+)<\/version>/)?.[1];

  // Extract dependencies
  const dependenciesMatch = content.match(/<dependencies>([\s\S]*?)<\/dependencies>/);
  if (dependenciesMatch) {
    const depsContent = dependenciesMatch[1];
    if (depsContent) {
      const depMatches = depsContent.matchAll(/<dependency>([\s\S]*?)<\/dependency>/g);
      for (const match of depMatches) {
        const depContent = match[1];
        if (!depContent) continue;
        const groupId = depContent.match(/<groupId>([^<]+)<\/groupId>/)?.[1];
        const artifactId = depContent.match(/<artifactId>([^<]+)<\/artifactId>/)?.[1];
        const version = depContent.match(/<version>([^<]+)<\/version>/)?.[1];
        if (groupId && artifactId) {
          dependencies.push({ groupId, artifactId, version });
        }
      }
    }
  }

  return {
    groupId: projectGroupId,
    artifactId: projectArtifactId,
    version: projectVersion,
    parent,
    dependencies,
  };
}

/**
 * Read build.gradle or build.gradle.kts content
 */
export async function readBuildGradle(projectPath: string): Promise<string | null> {
  const gradlePath = path.join(projectPath, "build.gradle");
  const gradleKtsPath = path.join(projectPath, "build.gradle.kts");
  try {
    if (await fs.pathExists(gradlePath)) {
      return await fs.readFile(gradlePath, "utf-8");
    }
    if (await fs.pathExists(gradleKtsPath)) {
      return await fs.readFile(gradleKtsPath, "utf-8");
    }
  } catch {
    // Read error
  }
  return null;
}

/**
 * Check if a file exists in the project
 */
export async function fileExists(projectPath: string, fileName: string): Promise<boolean> {
  const filePath = path.join(projectPath, fileName);
  return fs.pathExists(filePath);
}

/**
 * Check if any file matching a pattern exists in the context
 */
export function hasFile(context: DetectionContext, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return context.files.some((file) => file === pattern || file.endsWith(`/${pattern}`));
  }
  return context.files.some((file) => pattern.test(file));
}

/**
 * Check if a dependency exists in package.json
 */
export function hasDependency(context: DetectionContext, name: string): boolean {
  if (!context.packageJson) return false;

  const { dependencies = {}, devDependencies = {}, peerDependencies = {} } = context.packageJson;

  return name in dependencies || name in devDependencies || name in peerDependencies;
}

/**
 * Get dependency version from package.json
 */
export function getDependencyVersion(context: DetectionContext, name: string): string | undefined {
  if (!context.packageJson) return undefined;

  const { dependencies = {}, devDependencies = {}, peerDependencies = {} } = context.packageJson;

  return dependencies[name] || devDependencies[name] || peerDependencies[name];
}

/**
 * Check if a Python package is in requirements
 */
export function hasPythonPackage(context: DetectionContext, name: string): boolean {
  return context.pythonRequirements.includes(name.toLowerCase());
}

/**
 * Check if a Maven dependency exists in pom.xml
 * Matches by artifactId (and optionally groupId)
 */
export function hasMavenDependency(
  context: DetectionContext,
  artifactId: string,
  groupId?: string
): boolean {
  if (!context.pomXml) return false;

  // Check in dependencies
  const found = context.pomXml.dependencies.some((dep) => {
    if (groupId) {
      return dep.artifactId === artifactId && dep.groupId === groupId;
    }
    return dep.artifactId === artifactId || dep.artifactId.includes(artifactId);
  });

  if (found) return true;

  // Check in parent (for Spring Boot starter parent)
  if (context.pomXml.parent) {
    if (groupId) {
      return (
        context.pomXml.parent.artifactId === artifactId &&
        context.pomXml.parent.groupId === groupId
      );
    }
    return (
      context.pomXml.parent.artifactId === artifactId ||
      context.pomXml.parent.artifactId.includes(artifactId)
    );
  }

  return false;
}

/**
 * Check if build.gradle contains a specific pattern (for Spring Boot plugin/dependency)
 */
export function hasGradleDependency(context: DetectionContext, pattern: string): boolean {
  if (!context.buildGradleContent) return false;
  return context.buildGradleContent.includes(pattern);
}

/**
 * Count files matching a pattern
 */
export function countFiles(context: DetectionContext, pattern: RegExp): number {
  return context.files.filter((file) => pattern.test(file)).length;
}

/**
 * Build the detection context by scanning the project
 */
export async function buildDetectionContext(projectPath: string): Promise<DetectionContext> {
  // Get all files in the project (excluding node_modules, .git, etc.)
  const files = await globby(["**/*"], {
    cwd: projectPath,
    gitignore: true,
    ignore: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/__pycache__/**",
      "**/.venv/**",
      "**/venv/**",
      "**/target/**",
    ],
    onlyFiles: true,
    dot: true,
  });

  const [packageJson, pythonRequirements, goMod, cargoToml, pomXml, buildGradleContent] =
    await Promise.all([
      readPackageJson(projectPath),
      readPythonRequirements(projectPath),
      fileExists(projectPath, "go.mod"),
      fileExists(projectPath, "Cargo.toml"),
      readPomXml(projectPath),
      readBuildGradle(projectPath),
    ]);

  return {
    projectPath,
    files,
    packageJson,
    pythonRequirements,
    goMod,
    cargoToml,
    pomXml,
    buildGradle: buildGradleContent !== null,
    buildGradleContent,
  };
}
