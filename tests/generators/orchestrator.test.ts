/**
 * Tests for generator orchestrator
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs-extra";
import path from "path";
import {
  getGeneratorsForConfig,
  runGenerators,
  runGenerator,
  previewGeneration,
} from "../../src/generators/orchestrator.js";
import type { GeneratorOptions } from "../../src/generators/types.js";
import type { FullProjectDetection } from "../../src/detectors/types.js";
import type { AiInitConfig } from "../../src/types/index.js";

const TEST_DIR = path.join(process.cwd(), ".test-orchestrator-temp");

// Mock detection
const mockDetection: FullProjectDetection = {
  language: {
    primary: "typescript",
    secondary: [],
    confidence: 0.95,
    source: "tsconfig.json",
  },
  packageManager: {
    name: "bun",
    lockFile: "bun.lockb",
    confidence: 1.0,
  },
  frameworks: [
    { name: "React", version: "18.2.0", confidence: 0.9, category: "frontend", source: "package.json" },
  ],
  testing: [],
  database: [],
  buildTools: [],
  styling: [],
  aiConfig: {
    cursor: { hasConfig: false, hasRulesDir: false, hasLegacyRules: false },
    claude: { hasConfig: false, hasClaudeMd: false, hasSkills: false },
    copilot: { hasInstructions: false },
  },
};

describe("generator orchestrator", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe("getGeneratorsForConfig", () => {
    test("returns cursor generator for cursor tool", () => {
      const generators = getGeneratorsForConfig(["cursor"]);
      const targets = generators.map((g) => g.target);

      expect(targets).toContain("cursor");
      expect(targets).not.toContain("claude");
      expect(targets).toContain("shared"); // Always included
    });

    test("returns claude generator for claude tool", () => {
      const generators = getGeneratorsForConfig(["claude"]);
      const targets = generators.map((g) => g.target);

      expect(targets).not.toContain("cursor");
      expect(targets).toContain("claude");
      expect(targets).toContain("shared");
    });

    test("returns both generators for hybrid tool", () => {
      const generators = getGeneratorsForConfig(["hybrid"]);
      const targets = generators.map((g) => g.target);

      expect(targets).toContain("cursor");
      expect(targets).toContain("claude");
      expect(targets).toContain("shared");
    });

    test("returns both generators when both tools specified", () => {
      const generators = getGeneratorsForConfig(["cursor", "claude"]);
      const targets = generators.map((g) => g.target);

      expect(targets).toContain("cursor");
      expect(targets).toContain("claude");
      expect(targets).toContain("shared");
    });
  });

  describe("runGenerators", () => {
    test("runs generators and returns results", async () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["cursor"],
          templates: [],
        },
      };

      const result = await runGenerators(options);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test("includes cursor results when cursor tool selected", async () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["cursor"],
          templates: [],
        },
      };

      const result = await runGenerators(options);

      const cursorResult = result.results.find((r) => r.target === "cursor");
      expect(cursorResult).toBeDefined();
    });

    test("includes claude results when claude tool selected", async () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["claude"],
          templates: [],
        },
      };

      const result = await runGenerators(options);

      const claudeResult = result.results.find((r) => r.target === "claude");
      expect(claudeResult).toBeDefined();
    });
  });

  describe("runGenerator", () => {
    test("runs specific generator by target", async () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["cursor"],
          templates: [],
        },
      };

      const result = await runGenerator("cursor", options);

      expect(result.target).toBe("cursor");
      expect(result.success).toBeDefined();
    });

    test("returns error for unknown target", async () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: [],
          templates: [],
        },
      };

      const result = await runGenerator("unknown" as any, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown generator target");
    });
  });

  describe("previewGeneration", () => {
    test("performs dry run without writing files", async () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["cursor"],
          templates: [],
        },
      };

      const result = await previewGeneration(options);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();

      // Check that no .cursor directory was created
      const cursorDir = path.join(TEST_DIR, ".cursor");
      expect(await fs.pathExists(cursorDir)).toBe(false);
    });
  });
});
