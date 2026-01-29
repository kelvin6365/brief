/**
 * Detection-specific type definitions
 */

import type { Language } from "../types/index.js";

/** Package.json structure (partial) */
export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/** Maven pom.xml dependency info */
export interface MavenDependency {
  groupId: string;
  artifactId: string;
  version?: string;
}

/** Parsed pom.xml info */
export interface PomXmlInfo {
  groupId?: string;
  artifactId?: string;
  version?: string;
  parent?: {
    groupId: string;
    artifactId: string;
    version?: string;
  };
  dependencies: MavenDependency[];
}

/** Detection context shared across all detectors */
export interface DetectionContext {
  projectPath: string;
  files: string[];
  packageJson: PackageJson | null;
  pythonRequirements: string[];
  goMod: boolean;
  cargoToml: boolean;
  /** Parsed Maven pom.xml info */
  pomXml: PomXmlInfo | null;
  /** Whether build.gradle or build.gradle.kts exists */
  buildGradle: boolean;
  /** Content of build.gradle for dependency checking */
  buildGradleContent: string | null;
}

/** Generic detector result with confidence score */
export interface DetectorResult<T> {
  detected: T;
  confidence: number;
  source: string;
}

/** Framework category */
export type FrameworkCategory = "frontend" | "backend" | "fullstack" | "mobile" | "library";

/** Framework information */
export interface FrameworkInfo {
  name: string;
  version?: string;
  confidence: number;
  category: FrameworkCategory;
  source: string;
}

/** Testing framework information */
export interface TestingInfo {
  name: string;
  confidence: number;
  configFile?: string;
  source: string;
}

/** Database information */
export interface DatabaseInfo {
  name: string;
  confidence: number;
  orm?: string;
  source: string;
}

/** Build tool information */
export interface BuildToolInfo {
  name: string;
  confidence: number;
  configFile?: string;
  source: string;
}

/** Styling solution information */
export interface StylingInfo {
  name: string;
  confidence: number;
  configFile?: string;
  source: string;
}

/** Existing AI configuration */
export interface ExistingAiConfig {
  cursor: {
    hasConfig: boolean;
    hasRulesDir: boolean;
    hasLegacyRules: boolean;
  };
  claude: {
    hasConfig: boolean;
    hasClaudeMd: boolean;
    hasSkills: boolean;
  };
  qoder: {
    hasBestPractices: boolean;
    hasAgentsMd: boolean;
    hasAiConfig: boolean;
  };
  copilot: {
    hasInstructions: boolean;
  };
}

/** Package manager detection result */
export interface PackageManagerInfo {
  name: "bun" | "npm" | "yarn" | "pnpm" | "unknown";
  lockFile?: string;
  confidence: number;
}

/** Language detection result */
export interface LanguageInfo {
  primary: Language;
  secondary: Language[];
  confidence: number;
  source: string;
}

/** Complete project detection result */
export interface FullProjectDetection {
  language: LanguageInfo;
  packageManager: PackageManagerInfo;
  frameworks: FrameworkInfo[];
  testing: TestingInfo[];
  database: DatabaseInfo[];
  buildTools: BuildToolInfo[];
  styling: StylingInfo[];
  aiConfig: ExistingAiConfig;
}
