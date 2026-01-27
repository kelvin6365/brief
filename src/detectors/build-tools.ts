/**
 * Build tools detection
 */

import type { DetectionContext, BuildToolInfo } from "./types.js";
import { hasDependency, hasFile } from "./utils.js";

interface BuildToolDefinition {
  name: string;
  detect: (context: DetectionContext) => { confidence: number; source: string; configFile?: string } | null;
}

const buildToolDefinitions: BuildToolDefinition[] = [
  {
    name: "Vite",
    detect: (ctx) => {
      if (!hasDependency(ctx, "vite")) return null;
      const hasConfig =
        hasFile(ctx, "vite.config.js") ||
        hasFile(ctx, "vite.config.ts") ||
        hasFile(ctx, "vite.config.mjs");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "vite dependency + config" : "vite dependency",
        configFile: hasConfig ? "vite.config.ts" : undefined,
      };
    },
  },
  {
    name: "Webpack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "webpack")) return null;
      const hasConfig =
        hasFile(ctx, "webpack.config.js") ||
        hasFile(ctx, "webpack.config.ts") ||
        hasFile(ctx, "webpack.config.mjs");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "webpack dependency + config" : "webpack dependency",
        configFile: hasConfig ? "webpack.config.js" : undefined,
      };
    },
  },
  {
    name: "esbuild",
    detect: (ctx) => {
      if (!hasDependency(ctx, "esbuild")) return null;
      return {
        confidence: 80,
        source: "esbuild dependency",
      };
    },
  },
  {
    name: "Rollup",
    detect: (ctx) => {
      if (!hasDependency(ctx, "rollup")) return null;
      const hasConfig =
        hasFile(ctx, "rollup.config.js") ||
        hasFile(ctx, "rollup.config.ts") ||
        hasFile(ctx, "rollup.config.mjs");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "rollup dependency + config" : "rollup dependency",
        configFile: hasConfig ? "rollup.config.js" : undefined,
      };
    },
  },
  {
    name: "Parcel",
    detect: (ctx) => {
      if (!hasDependency(ctx, "parcel")) return null;
      return {
        confidence: 85,
        source: "parcel dependency",
      };
    },
  },
  {
    name: "Turbopack",
    detect: (ctx) => {
      // Turbopack is enabled via Next.js
      if (!hasDependency(ctx, "next")) return null;

      // Check scripts for turbo flag
      const scripts = ctx.packageJson?.scripts ?? {};
      const hasTurboFlag = Object.values(scripts).some(
        (script) => typeof script === "string" && script.includes("--turbo")
      );

      if (!hasTurboFlag) return null;

      return {
        confidence: 90,
        source: "next with --turbo flag",
      };
    },
  },
  {
    name: "Turborepo",
    detect: (ctx) => {
      if (!hasDependency(ctx, "turbo")) return null;
      const hasConfig = hasFile(ctx, "turbo.json");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "turbo dependency + config" : "turbo dependency",
        configFile: hasConfig ? "turbo.json" : undefined,
      };
    },
  },
  {
    name: "tsup",
    detect: (ctx) => {
      if (!hasDependency(ctx, "tsup")) return null;
      const hasConfig = hasFile(ctx, "tsup.config.ts") || hasFile(ctx, "tsup.config.js");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "tsup dependency + config" : "tsup dependency",
        configFile: hasConfig ? "tsup.config.ts" : undefined,
      };
    },
  },
  {
    name: "SWC",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@swc/core") && !hasDependency(ctx, "@swc/cli")) return null;
      const hasConfig = hasFile(ctx, ".swcrc");
      return {
        confidence: hasConfig ? 90 : 75,
        source: hasConfig ? "@swc/core + config" : "@swc/core dependency",
        configFile: hasConfig ? ".swcrc" : undefined,
      };
    },
  },
  {
    name: "Bun Bundler",
    detect: (ctx) => {
      // Detect usage of Bun's built-in bundler
      const scripts = ctx.packageJson?.scripts ?? {};
      const hasBunBuild = Object.values(scripts).some(
        (script) => typeof script === "string" && script.includes("bun build")
      );

      if (!hasBunBuild) return null;

      return {
        confidence: 85,
        source: "bun build in scripts",
      };
    },
  },
  {
    name: "Nx",
    detect: (ctx) => {
      if (!hasDependency(ctx, "nx")) return null;
      const hasConfig = hasFile(ctx, "nx.json");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "nx dependency + config" : "nx dependency",
        configFile: hasConfig ? "nx.json" : undefined,
      };
    },
  },
];

/**
 * Detect build tools used in the project
 */
export function detectBuildTools(context: DetectionContext): BuildToolInfo[] {
  const detected: BuildToolInfo[] = [];

  for (const definition of buildToolDefinitions) {
    const result = definition.detect(context);
    if (result) {
      detected.push({
        name: definition.name,
        confidence: result.confidence,
        source: result.source,
        configFile: result.configFile,
      });
    }
  }

  // Sort by confidence (highest first)
  return detected.sort((a, b) => b.confidence - a.confidence);
}
