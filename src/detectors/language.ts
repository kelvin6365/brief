/**
 * Language detection
 */

import type { Language } from "../types/index.js";
import type { DetectionContext, LanguageInfo } from "./types.js";
import { countFiles, hasDependency } from "./utils.js";

/**
 * Detect the primary programming language of the project
 */
export function detectLanguage(context: DetectionContext): LanguageInfo {
  const scores: Record<Language, number> = {
    typescript: 0,
    javascript: 0,
    python: 0,
    go: 0,
    rust: 0,
    java: 0,
    unknown: 0,
  };

  const sources: Record<Language, string[]> = {
    typescript: [],
    javascript: [],
    python: [],
    go: [],
    rust: [],
    java: [],
    unknown: [],
  };

  // TypeScript detection
  const tsConfigExists = context.files.some((f) => f === "tsconfig.json" || f.endsWith("/tsconfig.json"));
  const tsFileCount = countFiles(context, /\.tsx?$/);
  const hasTypescriptDep = hasDependency(context, "typescript");

  if (tsConfigExists) {
    scores.typescript += 40;
    sources.typescript.push("tsconfig.json");
  }
  if (hasTypescriptDep) {
    scores.typescript += 30;
    sources.typescript.push("typescript dependency");
  }
  if (tsFileCount > 0) {
    scores.typescript += Math.min(30, tsFileCount * 2);
    sources.typescript.push(`${tsFileCount} .ts/.tsx files`);
  }

  // JavaScript detection
  const jsFileCount = countFiles(context, /\.jsx?$/);
  const hasPackageJson = context.packageJson !== null;

  if (jsFileCount > 0) {
    scores.javascript += Math.min(30, jsFileCount * 2);
    sources.javascript.push(`${jsFileCount} .js/.jsx files`);
  }
  if (hasPackageJson && scores.typescript === 0) {
    scores.javascript += 20;
    sources.javascript.push("package.json");
  }

  // Python detection
  const pyFileCount = countFiles(context, /\.py$/);
  const hasPyprojectToml = context.files.some((f) => f === "pyproject.toml");
  const hasSetupPy = context.files.some((f) => f === "setup.py");
  const hasRequirementsTxt = context.pythonRequirements.length > 0;

  if (pyFileCount > 0) {
    scores.python += Math.min(30, pyFileCount * 2);
    sources.python.push(`${pyFileCount} .py files`);
  }
  if (hasPyprojectToml) {
    scores.python += 35;
    sources.python.push("pyproject.toml");
  }
  if (hasSetupPy) {
    scores.python += 30;
    sources.python.push("setup.py");
  }
  if (hasRequirementsTxt) {
    scores.python += 25;
    sources.python.push("requirements.txt");
  }

  // Go detection
  const goFileCount = countFiles(context, /\.go$/);

  if (context.goMod) {
    scores.go += 50;
    sources.go.push("go.mod");
  }
  if (goFileCount > 0) {
    scores.go += Math.min(30, goFileCount * 2);
    sources.go.push(`${goFileCount} .go files`);
  }

  // Rust detection
  const rsFileCount = countFiles(context, /\.rs$/);

  if (context.cargoToml) {
    scores.rust += 50;
    sources.rust.push("Cargo.toml");
  }
  if (rsFileCount > 0) {
    scores.rust += Math.min(30, rsFileCount * 2);
    sources.rust.push(`${rsFileCount} .rs files`);
  }

  // Java detection
  const javaFileCount = countFiles(context, /\.java$/);
  const hasPomXml = context.files.some((f) => f === "pom.xml");
  const hasBuildGradle = context.files.some((f) => f === "build.gradle" || f === "build.gradle.kts");

  if (javaFileCount > 0) {
    scores.java += Math.min(30, javaFileCount * 2);
    sources.java.push(`${javaFileCount} .java files`);
  }
  if (hasPomXml) {
    scores.java += 40;
    sources.java.push("pom.xml");
  }
  if (hasBuildGradle) {
    scores.java += 40;
    sources.java.push("build.gradle");
  }

  // Find primary language
  const sortedLanguages = (Object.entries(scores) as [Language, number][])
    .filter(([lang]) => lang !== "unknown")
    .sort((a, b) => b[1] - a[1]);

  const topLanguage = sortedLanguages[0];
  const primary: Language = topLanguage && topLanguage[1] > 0 ? topLanguage[0] : "unknown";
  const primaryScore = topLanguage?.[1] ?? 0;

  // Find secondary languages (score > 20)
  const secondary: Language[] = sortedLanguages
    .slice(1)
    .filter(([, score]) => score > 20)
    .map(([lang]) => lang);

  // Calculate confidence (0-100)
  const maxPossibleScore = 100;
  const confidence = Math.min(100, Math.round((primaryScore / maxPossibleScore) * 100));

  return {
    primary,
    secondary,
    confidence,
    source: sources[primary].join(", ") || "no indicators found",
  };
}
