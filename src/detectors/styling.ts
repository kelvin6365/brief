/**
 * Styling solution detection
 */

import type { DetectionContext, StylingInfo } from "./types.js";
import { hasDependency, hasFile, countFiles } from "./utils.js";

interface StylingDefinition {
  name: string;
  detect: (context: DetectionContext) => { confidence: number; source: string; configFile?: string } | null;
}

const stylingDefinitions: StylingDefinition[] = [
  {
    name: "Tailwind CSS",
    detect: (ctx) => {
      if (!hasDependency(ctx, "tailwindcss")) return null;
      const hasConfig =
        hasFile(ctx, "tailwind.config.js") ||
        hasFile(ctx, "tailwind.config.ts") ||
        hasFile(ctx, "tailwind.config.mjs") ||
        hasFile(ctx, "tailwind.config.cjs");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "tailwindcss + config" : "tailwindcss dependency",
        configFile: hasConfig ? "tailwind.config.js" : undefined,
      };
    },
  },
  {
    name: "CSS Modules",
    detect: (ctx) => {
      const moduleCount = countFiles(ctx, /\.module\.(css|scss|sass|less)$/);
      if (moduleCount === 0) return null;
      return {
        confidence: Math.min(95, 60 + moduleCount * 5),
        source: `${moduleCount} .module.css files`,
      };
    },
  },
  {
    name: "Styled Components",
    detect: (ctx) => {
      if (!hasDependency(ctx, "styled-components")) return null;
      return {
        confidence: 90,
        source: "styled-components dependency",
      };
    },
  },
  {
    name: "Emotion",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@emotion/react") && !hasDependency(ctx, "@emotion/styled")) return null;
      return {
        confidence: 90,
        source: "@emotion/react dependency",
      };
    },
  },
  {
    name: "Sass/SCSS",
    detect: (ctx) => {
      if (!hasDependency(ctx, "sass") && !hasDependency(ctx, "node-sass")) return null;
      const scssCount = countFiles(ctx, /\.(scss|sass)$/);
      return {
        confidence: scssCount > 0 ? 90 : 75,
        source: scssCount > 0 ? `sass dependency + ${scssCount} files` : "sass dependency",
      };
    },
  },
  {
    name: "Less",
    detect: (ctx) => {
      if (!hasDependency(ctx, "less")) return null;
      const lessCount = countFiles(ctx, /\.less$/);
      return {
        confidence: lessCount > 0 ? 90 : 75,
        source: lessCount > 0 ? `less dependency + ${lessCount} files` : "less dependency",
      };
    },
  },
  {
    name: "PostCSS",
    detect: (ctx) => {
      if (!hasDependency(ctx, "postcss")) return null;
      const hasConfig =
        hasFile(ctx, "postcss.config.js") ||
        hasFile(ctx, "postcss.config.mjs") ||
        hasFile(ctx, "postcss.config.cjs") ||
        hasFile(ctx, ".postcssrc") ||
        hasFile(ctx, ".postcssrc.json");
      return {
        confidence: hasConfig ? 90 : 70,
        source: hasConfig ? "postcss + config" : "postcss dependency",
        configFile: hasConfig ? "postcss.config.js" : undefined,
      };
    },
  },
  {
    name: "vanilla-extract",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@vanilla-extract/css")) return null;
      return {
        confidence: 90,
        source: "@vanilla-extract/css dependency",
      };
    },
  },
  {
    name: "Panda CSS",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@pandacss/dev")) return null;
      const hasConfig = hasFile(ctx, "panda.config.ts") || hasFile(ctx, "panda.config.js");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "@pandacss/dev + config" : "@pandacss/dev dependency",
        configFile: hasConfig ? "panda.config.ts" : undefined,
      };
    },
  },
  {
    name: "UnoCSS",
    detect: (ctx) => {
      if (!hasDependency(ctx, "unocss")) return null;
      const hasConfig = hasFile(ctx, "uno.config.ts") || hasFile(ctx, "uno.config.js");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "unocss + config" : "unocss dependency",
        configFile: hasConfig ? "uno.config.ts" : undefined,
      };
    },
  },
  {
    name: "Styled JSX",
    detect: (ctx) => {
      if (!hasDependency(ctx, "styled-jsx")) return null;
      return {
        confidence: 85,
        source: "styled-jsx dependency",
      };
    },
  },
  {
    name: "Stitches",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@stitches/react") && !hasDependency(ctx, "@stitches/core")) return null;
      return {
        confidence: 90,
        source: "@stitches/react dependency",
      };
    },
  },
  {
    name: "CSS (Plain)",
    detect: (ctx) => {
      // Detect plain CSS usage when no other CSS framework is present
      const cssCount = countFiles(ctx, /(?<!\.module)\.css$/);
      if (cssCount === 0) return null;

      // Lower priority if other CSS solutions are present
      const hasCssFramework =
        hasDependency(ctx, "tailwindcss") ||
        hasDependency(ctx, "styled-components") ||
        hasDependency(ctx, "@emotion/react") ||
        hasDependency(ctx, "sass");

      if (hasCssFramework) return null;

      return {
        confidence: Math.min(70, 40 + cssCount * 3),
        source: `${cssCount} .css files`,
      };
    },
  },
];

/**
 * Detect styling solutions used in the project
 */
export function detectStyling(context: DetectionContext): StylingInfo[] {
  const detected: StylingInfo[] = [];

  for (const definition of stylingDefinitions) {
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
