/**
 * Tests for base generator utilities
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs-extra";
import path from "path";
import {
  createGeneratorContext,
  writeGeneratedFile,
  summarizeResults,
} from "../../src/generators/base.js";
import type { GeneratorOptions, GeneratedFile } from "../../src/generators/types.js";
import type { FullProjectDetection } from "../../src/detectors/types.js";
import type { AiInitConfig } from "../../src/types/index.js";

const TEST_DIR = path.join(process.cwd(), ".test-generators-temp");

// Mock detection
const mockDetection: FullProjectDetection = {
  language: {
    primary: "typescript",
    secondary: ["javascript"],
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
    { name: "Next.js", version: "14.0.0", confidence: 0.85, category: "fullstack", source: "package.json" },
  ],
  testing: [{ name: "jest", confidence: 0.8, source: "package.json" }],
  database: [{ name: "PostgreSQL", confidence: 0.7, source: "package.json" }],
  buildTools: [{ name: "Vite", confidence: 0.9, source: "vite.config.ts" }],
  styling: [{ name: "Tailwind", confidence: 0.85, source: "tailwind.config.js" }],
  aiConfig: {
    cursor: { hasConfig: false, hasRulesDir: false, hasLegacyRules: false },
    claude: { hasConfig: false, hasClaudeMd: false, hasSkills: false },
    copilot: { hasInstructions: false },
  },
};

// Mock config
const mockConfig: AiInitConfig = {
  version: "1.0.0",
  projectType: "web",
  language: "typescript",
  tools: ["cursor", "claude"],
  templates: ["react", "testing"],
};

describe("generator base utilities", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe("createGeneratorContext", () => {
    test("creates context with project info", () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: mockConfig,
      };

      const context = createGeneratorContext(options);

      expect(context.project).toBeDefined();
      expect(context.project.type).toBe("web");
      expect(context.project.language).toBe("typescript");
      expect(context.project.framework).toBe("React");
    });

    test("creates context with detection info", () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: mockConfig,
      };

      const context = createGeneratorContext(options);

      expect(context.detection).toBeDefined();
      expect(context.detection.frameworks).toHaveLength(2);
      expect(context.detection.testing).toBe("jest");
      expect(context.detection.database).toBe("PostgreSQL");
      expect(context.detection.buildTool).toBe("Vite");
      expect(context.detection.styling).toBe("Tailwind");
      expect(context.detection.packageManager).toBe("bun");
    });

    test("creates context with config info", () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: mockConfig,
      };

      const context = createGeneratorContext(options);

      expect(context.config).toBeDefined();
      expect(context.config.tools).toContain("cursor");
      expect(context.config.tools).toContain("claude");
      expect(context.config.templates).toContain("react");
    });

    test("creates context with generated metadata", () => {
      const options: GeneratorOptions = {
        projectPath: TEST_DIR,
        detection: mockDetection,
        config: mockConfig,
      };

      const context = createGeneratorContext(options);

      expect(context.generated).toBeDefined();
      expect(context.generated.date).toBeDefined();
      expect(context.generated.version).toBe("1.0.0");
    });
  });

  describe("writeGeneratedFile", () => {
    test("creates new file", async () => {
      const result = await writeGeneratedFile(
        TEST_DIR,
        "test.txt",
        "Hello World",
        { templateId: "test" }
      );

      expect(result.action).toBe("created");
      expect(result.path).toBe("test.txt");
      expect(result.templateId).toBe("test");

      const content = await fs.readFile(path.join(TEST_DIR, "test.txt"), "utf-8");
      expect(content).toBe("Hello World");
    });

    test("skips existing file without overwrite", async () => {
      const filePath = path.join(TEST_DIR, "existing.txt");
      await fs.writeFile(filePath, "Original content");

      const result = await writeGeneratedFile(
        TEST_DIR,
        "existing.txt",
        "New content",
        { overwrite: false }
      );

      expect(result.action).toBe("skipped");

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toBe("Original content");
    });

    test("overwrites existing file with overwrite option", async () => {
      const filePath = path.join(TEST_DIR, "overwrite.txt");
      await fs.writeFile(filePath, "Original content");

      const result = await writeGeneratedFile(
        TEST_DIR,
        "overwrite.txt",
        "New content",
        { overwrite: true }
      );

      expect(result.action).toBe("modified");

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toBe("New content");
    });

    test("creates backup with backup option", async () => {
      const filePath = path.join(TEST_DIR, "backup.txt");
      await fs.writeFile(filePath, "Original content");

      const result = await writeGeneratedFile(
        TEST_DIR,
        "backup.txt",
        "New content",
        { overwrite: true, backup: true }
      );

      expect(result.action).toBe("modified");
      expect(result.backupPath).toBeDefined();

      const backupContent = await fs.readFile(result.backupPath!, "utf-8");
      expect(backupContent).toBe("Original content");
    });

    test("dry run does not write file", async () => {
      const result = await writeGeneratedFile(
        TEST_DIR,
        "dryrun.txt",
        "Content",
        { dryRun: true }
      );

      expect(result.action).toBe("created");
      expect(await fs.pathExists(path.join(TEST_DIR, "dryrun.txt"))).toBe(false);
    });

    test("creates nested directories", async () => {
      const result = await writeGeneratedFile(
        TEST_DIR,
        "nested/deep/file.txt",
        "Content"
      );

      expect(result.action).toBe("created");
      expect(await fs.pathExists(path.join(TEST_DIR, "nested/deep/file.txt"))).toBe(true);
    });
  });

  describe("summarizeResults", () => {
    test("counts results correctly", () => {
      const files: GeneratedFile[] = [
        { path: "a.txt", absolutePath: "/a.txt", action: "created" },
        { path: "b.txt", absolutePath: "/b.txt", action: "created" },
        { path: "c.txt", absolutePath: "/c.txt", action: "modified" },
        { path: "d.txt", absolutePath: "/d.txt", action: "skipped" },
        { path: "e.txt", absolutePath: "/e.txt", action: "skipped" },
        { path: "f.txt", absolutePath: "/f.txt", action: "skipped" },
        { path: "g.txt", absolutePath: "/g.txt", action: "error", error: "Failed" },
      ];

      const summary = summarizeResults(files);

      expect(summary.created).toBe(2);
      expect(summary.modified).toBe(1);
      expect(summary.skipped).toBe(3);
      expect(summary.errors).toBe(1);
    });

    test("handles empty array", () => {
      const summary = summarizeResults([]);

      expect(summary.created).toBe(0);
      expect(summary.modified).toBe(0);
      expect(summary.skipped).toBe(0);
      expect(summary.errors).toBe(0);
    });
  });
});
