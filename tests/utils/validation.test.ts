/**
 * Tests for validation utility
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs-extra";
import path from "path";
import {
  validateConfig,
  validateConfigFile,
  validateTemplate,
  validateProjectDirectory,
  validateGlobPattern,
  formatValidationResult,
} from "../../src/utils/validation.js";

const TEST_DIR = path.join(process.cwd(), ".test-validation-temp");

describe("validation", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe("validateConfig", () => {
    test("validates valid config", () => {
      const config = {
        version: "1.0.0",
        projectType: "web",
        language: "typescript",
        tools: ["cursor", "claude"],
        templates: ["react"],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects non-object config", () => {
      const result = validateConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe("config");
    });

    test("rejects missing version", () => {
      const config = {
        projectType: "web",
        language: "typescript",
        tools: ["cursor"],
        templates: [],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "version")).toBe(true);
    });

    test("rejects invalid language", () => {
      const config = {
        version: "1.0.0",
        projectType: "web",
        language: "invalid",
        tools: ["cursor"],
        templates: [],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "language")).toBe(true);
    });

    test("rejects invalid tool", () => {
      const config = {
        version: "1.0.0",
        projectType: "web",
        language: "typescript",
        tools: ["invalid-tool"],
        templates: [],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "tools")).toBe(true);
    });

    test("warns on empty templates array", () => {
      const config = {
        version: "1.0.0",
        projectType: "web",
        language: "typescript",
        tools: ["cursor"],
        templates: [],
      };
      const result = validateConfig(config);
      expect(result.warnings.some((w) => w.field === "templates")).toBe(true);
    });

    test("warns on unknown project type", () => {
      const config = {
        version: "1.0.0",
        projectType: "unknown-type",
        language: "typescript",
        tools: ["cursor"],
        templates: ["react"],
      };
      const result = validateConfig(config);
      expect(result.warnings.some((w) => w.field === "projectType")).toBe(true);
    });
  });

  describe("validateConfigFile", () => {
    test("validates existing valid config file", async () => {
      const configPath = path.join(TEST_DIR, ".ai-init.json");
      await fs.writeFile(
        configPath,
        JSON.stringify({
          version: "1.0.0",
          projectType: "web",
          language: "typescript",
          tools: ["cursor"],
          templates: ["react"],
        })
      );
      const result = await validateConfigFile(configPath);
      expect(result.valid).toBe(true);
    });

    test("reports error for missing file", async () => {
      const result = await validateConfigFile(path.join(TEST_DIR, "missing.json"));
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe("path");
    });

    test("reports error for invalid JSON", async () => {
      const configPath = path.join(TEST_DIR, "invalid.json");
      await fs.writeFile(configPath, "not valid json");
      const result = await validateConfigFile(configPath);
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe("format");
    });
  });

  describe("validateTemplate", () => {
    test("validates valid template", async () => {
      const template = `---
name: test-rule
globs:
  - "**/*.ts"
---

# Test Rule

This is a test rule.`;
      const result = await validateTemplate(template);
      expect(result.valid).toBe(true);
    });

    test("rejects empty template", async () => {
      const result = await validateTemplate("");
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe("content");
    });

    test("detects unbalanced Handlebars expressions", async () => {
      const template = "Hello {{name} world";
      const result = await validateTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "syntax")).toBe(true);
    });

    test("detects unclosed block helpers", async () => {
      const template = "{{#if condition}}content";
      const result = await validateTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("Unclosed block"))).toBe(true);
    });

    test("warns on frontmatter without globs or name", async () => {
      const template = `---
priority: 100
---

Content`;
      const result = await validateTemplate(template);
      expect(result.warnings.some((w) => w.field === "frontmatter")).toBe(true);
    });
  });

  describe("validateProjectDirectory", () => {
    test("validates existing directory with package.json", async () => {
      await fs.writeFile(path.join(TEST_DIR, "package.json"), "{}");
      const result = await validateProjectDirectory(TEST_DIR);
      expect(result.valid).toBe(true);
    });

    test("reports error for non-existent path", async () => {
      const result = await validateProjectDirectory(path.join(TEST_DIR, "nonexistent"));
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe("path");
    });

    test("reports error for file path instead of directory", async () => {
      const filePath = path.join(TEST_DIR, "file.txt");
      await fs.writeFile(filePath, "content");
      const result = await validateProjectDirectory(filePath);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain("not a directory");
    });

    test("warns on missing project files", async () => {
      const emptyDir = path.join(TEST_DIR, "empty");
      await fs.ensureDir(emptyDir);
      const result = await validateProjectDirectory(emptyDir);
      expect(result.warnings.some((w) => w.field === "project")).toBe(true);
    });
  });

  describe("validateGlobPattern", () => {
    test("validates valid glob pattern", () => {
      const result = validateGlobPattern("**/*.ts");
      expect(result.valid).toBe(true);
    });

    test("rejects empty pattern", () => {
      const result = validateGlobPattern("");
      expect(result.valid).toBe(false);
    });

    test("warns on very broad patterns", () => {
      const result = validateGlobPattern("**/*");
      expect(result.warnings.some((w) => w.message.includes("broad"))).toBe(true);
    });
  });

  describe("formatValidationResult", () => {
    test("formats valid result", () => {
      const result = formatValidationResult({
        valid: true,
        errors: [],
        warnings: [],
      });
      expect(result).toContain("Validation passed");
    });

    test("formats errors", () => {
      const result = formatValidationResult({
        valid: false,
        errors: [{ field: "test", message: "test error" }],
        warnings: [],
      });
      expect(result).toContain("Validation failed");
      expect(result).toContain("test error");
    });

    test("formats warnings", () => {
      const result = formatValidationResult({
        valid: true,
        errors: [],
        warnings: [{ field: "test", message: "test warning", suggestion: "fix it" }],
      });
      expect(result).toContain("test warning");
      expect(result).toContain("fix it");
    });
  });
});
