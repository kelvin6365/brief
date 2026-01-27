/**
 * Tests for Cursor generator
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs-extra";
import path from "path";
import { cursorGenerator, getCursorTemplates } from "../../src/generators/cursor/index.js";
import type { GeneratorOptions } from "../../src/generators/types.js";
import type { FullProjectDetection } from "../../src/detectors/types.js";

const TEST_DIR = path.join(process.cwd(), ".test-cursor-gen-temp");

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
  testing: [{ name: "jest", confidence: 0.8, source: "package.json" }],
  database: [],
  buildTools: [],
  styling: [],
  aiConfig: {
    cursor: { hasConfig: false, hasRulesDir: false, hasLegacyRules: false },
    claude: { hasConfig: false, hasClaudeMd: false, hasSkills: false },
    copilot: { hasInstructions: false },
  },
};

describe("Cursor generator", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe("getCursorTemplates", () => {
    test("returns templates matching detection", () => {
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

      const templates = getCursorTemplates(options);

      expect(templates.length).toBeGreaterThan(0);

      // Should include core
      expect(templates.some((t) => t.id === "cursor-core")).toBe(true);

      // Should include TypeScript (matches language)
      expect(templates.some((t) => t.id === "typescript")).toBe(true);

      // Should include React (matches framework)
      expect(templates.some((t) => t.id === "react")).toBe(true);
    });

    test("filters by user-specified templates", () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: {
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["cursor"],
          templates: ["testing"], // Only testing
        },
      };

      const templates = getCursorTemplates(options);

      // Should include core (always)
      expect(templates.some((t) => t.id === "cursor-core")).toBe(true);

      // Should include testing
      expect(templates.some((t) => t.id === "testing")).toBe(true);
    });

    test("sorts templates by priority", () => {
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

      const templates = getCursorTemplates(options);

      // Core should be first (highest priority)
      expect(templates[0].id).toBe("cursor-core");

      // Check that templates are sorted by priority
      for (let i = 1; i < templates.length; i++) {
        const prevPriority = templates[i - 1].priority ?? 0;
        const currPriority = templates[i].priority ?? 0;
        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
    });
  });

  describe("cursorGenerator.generate", () => {
    test("has correct name and target", () => {
      expect(cursorGenerator.name).toBe("Cursor Rules Generator");
      expect(cursorGenerator.target).toBe("cursor");
    });

    test("generates files successfully", async () => {
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

      const result = await cursorGenerator.generate(options);

      expect(result.success).toBe(true);
      expect(result.target).toBe("cursor");
      expect(result.files.length).toBeGreaterThan(0);

      // Check that core.mdc was created
      const coreFile = result.files.find((f) => f.path.includes("core.mdc"));
      expect(coreFile).toBeDefined();
      expect(coreFile?.action).toBe("created");
    });

    test("creates .cursor/rules directory", async () => {
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

      await cursorGenerator.generate(options);

      const rulesDir = path.join(TEST_DIR, ".cursor", "rules");
      expect(await fs.pathExists(rulesDir)).toBe(true);
    });

    test("dry run does not create files", async () => {
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
        dryRun: true,
      };

      const result = await cursorGenerator.generate(options);

      expect(result.success).toBe(true);

      const cursorDir = path.join(TEST_DIR, ".cursor");
      expect(await fs.pathExists(cursorDir)).toBe(false);
    });
  });
});
