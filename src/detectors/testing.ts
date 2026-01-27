/**
 * Testing framework detection
 */

import type { DetectionContext, TestingInfo } from "./types.js";
import { hasDependency, hasFile, hasPythonPackage } from "./utils.js";

interface TestingDefinition {
  name: string;
  detect: (context: DetectionContext) => { confidence: number; source: string; configFile?: string } | null;
}

const testingDefinitions: TestingDefinition[] = [
  // JavaScript/TypeScript testing
  {
    name: "Jest",
    detect: (ctx) => {
      if (!hasDependency(ctx, "jest")) return null;
      const hasConfig =
        hasFile(ctx, "jest.config.js") ||
        hasFile(ctx, "jest.config.ts") ||
        hasFile(ctx, "jest.config.mjs") ||
        hasFile(ctx, "jest.config.cjs");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "jest dependency + config" : "jest dependency",
        configFile: hasConfig ? "jest.config.js" : undefined,
      };
    },
  },
  {
    name: "Vitest",
    detect: (ctx) => {
      if (!hasDependency(ctx, "vitest")) return null;
      const hasConfig =
        hasFile(ctx, "vitest.config.js") ||
        hasFile(ctx, "vitest.config.ts") ||
        hasFile(ctx, "vitest.config.mjs");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "vitest dependency + config" : "vitest dependency",
        configFile: hasConfig ? "vitest.config.ts" : undefined,
      };
    },
  },
  {
    name: "Bun Test",
    detect: (ctx) => {
      // Bun test is built-in, detect by presence of bun-types and absence of other test frameworks
      if (!hasDependency(ctx, "bun-types")) return null;

      // Check for test files but no other test runner
      const hasJest = hasDependency(ctx, "jest");
      const hasVitest = hasDependency(ctx, "vitest");
      const hasMocha = hasDependency(ctx, "mocha");

      if (hasJest || hasVitest || hasMocha) return null;

      // Check for test files
      const hasTestFiles = ctx.files.some((f) => /\.(test|spec)\.[jt]sx?$/.test(f));

      if (!hasTestFiles) return null;

      return {
        confidence: 70,
        source: "bun-types with test files",
      };
    },
  },
  {
    name: "Mocha",
    detect: (ctx) => {
      if (!hasDependency(ctx, "mocha")) return null;
      const hasConfig = hasFile(ctx, ".mocharc.js") || hasFile(ctx, ".mocharc.json") || hasFile(ctx, ".mocharc.yml");
      return {
        confidence: hasConfig ? 90 : 75,
        source: hasConfig ? "mocha dependency + config" : "mocha dependency",
        configFile: hasConfig ? ".mocharc.js" : undefined,
      };
    },
  },
  {
    name: "Ava",
    detect: (ctx) => {
      if (!hasDependency(ctx, "ava")) return null;
      return {
        confidence: 80,
        source: "ava dependency",
      };
    },
  },
  {
    name: "Tap",
    detect: (ctx) => {
      if (!hasDependency(ctx, "tap")) return null;
      return {
        confidence: 80,
        source: "tap dependency",
      };
    },
  },

  // E2E testing
  {
    name: "Playwright",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@playwright/test") && !hasDependency(ctx, "playwright")) return null;
      const hasConfig = hasFile(ctx, "playwright.config.ts") || hasFile(ctx, "playwright.config.js");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "playwright dependency + config" : "playwright dependency",
        configFile: hasConfig ? "playwright.config.ts" : undefined,
      };
    },
  },
  {
    name: "Cypress",
    detect: (ctx) => {
      if (!hasDependency(ctx, "cypress")) return null;
      const hasConfig =
        hasFile(ctx, "cypress.config.js") ||
        hasFile(ctx, "cypress.config.ts") ||
        hasFile(ctx, "cypress.json");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "cypress dependency + config" : "cypress dependency",
        configFile: hasConfig ? "cypress.config.ts" : undefined,
      };
    },
  },
  {
    name: "Puppeteer",
    detect: (ctx) => {
      if (!hasDependency(ctx, "puppeteer")) return null;
      return {
        confidence: 70,
        source: "puppeteer dependency",
      };
    },
  },

  // Component testing
  {
    name: "Testing Library",
    detect: (ctx) => {
      const libs = ["@testing-library/react", "@testing-library/vue", "@testing-library/svelte", "@testing-library/dom"];
      const hasLib = libs.some((lib) => hasDependency(ctx, lib));
      if (!hasLib) return null;
      return {
        confidence: 85,
        source: "testing-library dependency",
      };
    },
  },

  // Python testing
  {
    name: "Pytest",
    detect: (ctx) => {
      if (!hasPythonPackage(ctx, "pytest")) return null;
      const hasConfig = hasFile(ctx, "pytest.ini") || hasFile(ctx, "pyproject.toml");
      return {
        confidence: hasConfig ? 90 : 80,
        source: hasConfig ? "pytest in requirements + config" : "pytest in requirements",
        configFile: hasConfig ? "pytest.ini" : undefined,
      };
    },
  },
  {
    name: "unittest",
    detect: (ctx) => {
      // Built-in Python, detect by presence of test files with unittest imports
      const hasTestFiles = ctx.files.some((f) => /test.*\.py$/.test(f) || /_test\.py$/.test(f));
      if (!hasTestFiles) return null;
      // Lower confidence since it's built-in and we can't detect import statements
      return {
        confidence: 40,
        source: "Python test files present",
      };
    },
  },

  // Go testing
  {
    name: "Go Test",
    detect: (ctx) => {
      if (!ctx.goMod) return null;
      const hasTestFiles = ctx.files.some((f) => /_test\.go$/.test(f));
      if (!hasTestFiles) return null;
      return {
        confidence: 90,
        source: "go.mod + _test.go files",
      };
    },
  },

  // Rust testing
  {
    name: "Cargo Test",
    detect: (ctx) => {
      if (!ctx.cargoToml) return null;
      return {
        confidence: 80,
        source: "Cargo.toml (built-in test)",
      };
    },
  },
];

/**
 * Detect testing frameworks used in the project
 */
export function detectTesting(context: DetectionContext): TestingInfo[] {
  const detected: TestingInfo[] = [];

  for (const definition of testingDefinitions) {
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
