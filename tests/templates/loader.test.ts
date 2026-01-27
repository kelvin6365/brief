/**
 * Tests for template loader
 */

import { describe, test, expect } from "bun:test";
import {
  getTemplatePath,
  templateExists,
  loadTemplate,
  checkCondition,
  checkAllConditions,
  sortTemplatesByPriority,
  resolveTemplateDependencies,
  getTemplatesDirectory,
} from "../../src/templates/loader.js";
import type { TemplateDefinition } from "../../src/templates/types.js";
import type { FullProjectDetection } from "../../src/detectors/types.js";

// Mock detection result
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
    { name: "Next.js", version: "14.0.0", confidence: 0.85, category: "fullstack", source: "package.json" },
  ],
  testing: [
    { name: "jest", confidence: 0.8, source: "package.json" },
  ],
  database: [],
  buildTools: [],
  styling: [],
  aiConfig: {
    cursor: { hasConfig: false, hasRulesDir: false, hasLegacyRules: false },
    claude: { hasConfig: false, hasClaudeMd: false, hasSkills: false },
    copilot: { hasInstructions: false },
  },
};

describe("template loader", () => {
  describe("getTemplatePath", () => {
    test("returns full path to template", () => {
      const path = getTemplatePath("cursor/core.mdc.hbs");
      expect(path).toContain("templates/cursor/core.mdc.hbs");
    });
  });

  describe("getTemplatesDirectory", () => {
    test("returns templates directory path", () => {
      const dir = getTemplatesDirectory();
      expect(dir).toContain("templates");
    });
  });

  describe("templateExists", () => {
    test("returns true for existing template", async () => {
      const exists = await templateExists("cursor/core.mdc.hbs");
      expect(exists).toBe(true);
    });

    test("returns false for non-existing template", async () => {
      const exists = await templateExists("non-existent.hbs");
      expect(exists).toBe(false);
    });
  });

  describe("loadTemplate", () => {
    test("loads template by ID", async () => {
      const template = await loadTemplate("cursor-core");
      expect(template).toBeDefined();
      expect(template?.definition.id).toBe("cursor-core");
      expect(template?.content).toBeDefined();
      expect(template?.body).toBeDefined();
    });

    test("returns null for unknown ID", async () => {
      const template = await loadTemplate("non-existent");
      expect(template).toBeNull();
    });

    test("parses frontmatter correctly", async () => {
      const template = await loadTemplate("cursor-core");
      expect(template?.frontmatter).toBeDefined();
      expect(template?.frontmatter.description).toBeDefined();
    });
  });

  describe("checkCondition", () => {
    test("checks framework condition", () => {
      const reactCondition = { type: "framework" as const, value: "react" };
      expect(checkCondition(reactCondition, mockDetection)).toBe(true);

      const vueCondition = { type: "framework" as const, value: "vue" };
      expect(checkCondition(vueCondition, mockDetection)).toBe(false);
    });

    test("checks language condition", () => {
      const tsCondition = { type: "language" as const, value: "typescript" };
      expect(checkCondition(tsCondition, mockDetection)).toBe(true);

      const pyCondition = { type: "language" as const, value: "python" };
      expect(checkCondition(pyCondition, mockDetection)).toBe(false);
    });

    test("respects negate flag", () => {
      const condition = { type: "framework" as const, value: "react", negate: true };
      expect(checkCondition(condition, mockDetection)).toBe(false);

      const negatedVue = { type: "framework" as const, value: "vue", negate: true };
      expect(checkCondition(negatedVue, mockDetection)).toBe(true);
    });
  });

  describe("checkAllConditions", () => {
    test("returns true when all conditions met", () => {
      const template: TemplateDefinition = {
        id: "test",
        name: "Test",
        description: "Test template",
        target: "cursor",
        category: "framework",
        templatePath: "test.hbs",
        outputPath: "test.mdc",
        conditions: [
          { type: "language", value: "typescript" },
          { type: "framework", value: "react" },
        ],
      };
      expect(checkAllConditions(template, mockDetection)).toBe(true);
    });

    test("returns false when any condition not met", () => {
      const template: TemplateDefinition = {
        id: "test",
        name: "Test",
        description: "Test template",
        target: "cursor",
        category: "framework",
        templatePath: "test.hbs",
        outputPath: "test.mdc",
        conditions: [
          { type: "language", value: "typescript" },
          { type: "framework", value: "vue" }, // Not in mock detection
        ],
      };
      expect(checkAllConditions(template, mockDetection)).toBe(false);
    });

    test("returns true when no conditions defined", () => {
      const template: TemplateDefinition = {
        id: "test",
        name: "Test",
        description: "Test template",
        target: "cursor",
        category: "core",
        templatePath: "test.hbs",
        outputPath: "test.mdc",
      };
      expect(checkAllConditions(template, mockDetection)).toBe(true);
    });
  });

  describe("sortTemplatesByPriority", () => {
    test("sorts templates by priority (highest first)", () => {
      const templates: TemplateDefinition[] = [
        { id: "low", name: "Low", description: "", target: "cursor", category: "core", templatePath: "", outputPath: "", priority: 100 },
        { id: "high", name: "High", description: "", target: "cursor", category: "core", templatePath: "", outputPath: "", priority: 1000 },
        { id: "medium", name: "Medium", description: "", target: "cursor", category: "core", templatePath: "", outputPath: "", priority: 500 },
      ];

      const sorted = sortTemplatesByPriority(templates);
      expect(sorted[0].id).toBe("high");
      expect(sorted[1].id).toBe("medium");
      expect(sorted[2].id).toBe("low");
    });

    test("treats undefined priority as 0", () => {
      const templates: TemplateDefinition[] = [
        { id: "with", name: "With", description: "", target: "cursor", category: "core", templatePath: "", outputPath: "", priority: 100 },
        { id: "without", name: "Without", description: "", target: "cursor", category: "core", templatePath: "", outputPath: "" },
      ];

      const sorted = sortTemplatesByPriority(templates);
      expect(sorted[0].id).toBe("with");
      expect(sorted[1].id).toBe("without");
    });
  });

  describe("resolveTemplateDependencies", () => {
    test("resolves dependencies", () => {
      // nextjs depends on react and typescript
      const resolved = resolveTemplateDependencies(["nextjs"]);
      expect(resolved).toContain("nextjs");
      expect(resolved).toContain("react");
      expect(resolved).toContain("typescript");
    });

    test("handles templates without dependencies", () => {
      const resolved = resolveTemplateDependencies(["cursor-core"]);
      expect(resolved).toContain("cursor-core");
      expect(resolved.length).toBe(1);
    });

    test("deduplicates dependencies", () => {
      const resolved = resolveTemplateDependencies(["react", "nextjs"]);
      const reactCount = resolved.filter((id) => id === "react").length;
      expect(reactCount).toBe(1);
    });

    test("handles unknown template IDs", () => {
      const resolved = resolveTemplateDependencies(["non-existent"]);
      expect(resolved).toEqual([]);
    });
  });
});
