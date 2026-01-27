/**
 * Tests for template registry
 */

import { describe, test, expect } from "bun:test";
import {
  ALL_TEMPLATES,
  CORE_TEMPLATES,
  LANGUAGE_TEMPLATES,
  FRAMEWORK_TEMPLATES,
  TEMPLATE_BUNDLES,
  getTemplate,
  getTemplatesByTarget,
  getTemplatesByCategory,
  getTemplatesByTag,
  getBundle,
  resolveBundleTemplates,
} from "../../src/templates/registry.js";

describe("template registry", () => {
  describe("ALL_TEMPLATES", () => {
    test("contains all template categories", () => {
      expect(ALL_TEMPLATES.length).toBeGreaterThan(0);

      const categories = new Set(ALL_TEMPLATES.map((t) => t.category));
      expect(categories.has("core")).toBe(true);
      expect(categories.has("framework")).toBe(true);
      expect(categories.has("pattern")).toBe(true);
    });

    test("all templates have required fields", () => {
      for (const template of ALL_TEMPLATES) {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.target).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.templatePath).toBeDefined();
        expect(template.outputPath).toBeDefined();
      }
    });

    test("all template IDs are unique", () => {
      const ids = ALL_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("getTemplate", () => {
    test("returns template by ID", () => {
      const template = getTemplate("cursor-core");
      expect(template).toBeDefined();
      expect(template?.id).toBe("cursor-core");
      expect(template?.name).toBe("Cursor Core Rules");
    });

    test("returns undefined for unknown ID", () => {
      const template = getTemplate("non-existent");
      expect(template).toBeUndefined();
    });
  });

  describe("getTemplatesByTarget", () => {
    test("returns templates for cursor", () => {
      const templates = getTemplatesByTarget("cursor");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        const targets = Array.isArray(t.target) ? t.target : [t.target];
        expect(targets).toContain("cursor");
      }
    });

    test("returns templates for claude", () => {
      const templates = getTemplatesByTarget("claude");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        const targets = Array.isArray(t.target) ? t.target : [t.target];
        expect(targets).toContain("claude");
      }
    });

    test("returns templates for shared", () => {
      const templates = getTemplatesByTarget("shared");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        expect(t.target).toBe("shared");
      }
    });
  });

  describe("getTemplatesByCategory", () => {
    test("returns core templates", () => {
      const templates = getTemplatesByCategory("core");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        expect(t.category).toBe("core");
      }
    });

    test("returns framework templates", () => {
      const templates = getTemplatesByCategory("framework");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        expect(t.category).toBe("framework");
      }
    });

    test("returns pattern templates", () => {
      const templates = getTemplatesByCategory("pattern");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        expect(t.category).toBe("pattern");
      }
    });
  });

  describe("getTemplatesByTag", () => {
    test("returns templates with tag", () => {
      const templates = getTemplatesByTag("essential");
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        expect(t.tags).toContain("essential");
      }
    });

    test("returns empty array for unknown tag", () => {
      const templates = getTemplatesByTag("non-existent-tag");
      expect(templates).toEqual([]);
    });
  });

  describe("TEMPLATE_BUNDLES", () => {
    test("contains predefined bundles", () => {
      expect(TEMPLATE_BUNDLES.length).toBeGreaterThan(0);

      const bundleIds = TEMPLATE_BUNDLES.map((b) => b.id);
      expect(bundleIds).toContain("minimal");
      expect(bundleIds).toContain("typescript-react");
    });

    test("all bundles have required fields", () => {
      for (const bundle of TEMPLATE_BUNDLES) {
        expect(bundle.id).toBeDefined();
        expect(bundle.name).toBeDefined();
        expect(bundle.description).toBeDefined();
        expect(bundle.templates).toBeDefined();
        expect(bundle.templates.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getBundle", () => {
    test("returns bundle by ID", () => {
      const bundle = getBundle("minimal");
      expect(bundle).toBeDefined();
      expect(bundle?.id).toBe("minimal");
    });

    test("returns undefined for unknown ID", () => {
      const bundle = getBundle("non-existent");
      expect(bundle).toBeUndefined();
    });
  });

  describe("resolveBundleTemplates", () => {
    test("resolves bundle templates", () => {
      const templates = resolveBundleTemplates("minimal");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some((t) => t.id === "cursor-core")).toBe(true);
      expect(templates.some((t) => t.id === "claude-core")).toBe(true);
    });

    test("returns empty array for unknown bundle", () => {
      const templates = resolveBundleTemplates("non-existent");
      expect(templates).toEqual([]);
    });
  });
});
