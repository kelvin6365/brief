/**
 * Shared utilities for project detection
 */

import * as fs from "fs-extra";
import * as path from "path";
import { globby } from "globby";
import type { DetectionContext, PackageJson } from "./types.js";

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

  const [packageJson, pythonRequirements, goMod, cargoToml] = await Promise.all([
    readPackageJson(projectPath),
    readPythonRequirements(projectPath),
    fileExists(projectPath, "go.mod"),
    fileExists(projectPath, "Cargo.toml"),
  ]);

  return {
    projectPath,
    files,
    packageJson,
    pythonRequirements,
    goMod,
    cargoToml,
  };
}
